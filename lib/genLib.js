const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const helperGenLib = require("./helperGenLib");
const mainLib = require("./mainLib");

const ARGNAMESPACE = "-n";
const ARGSECRETS = "-sec";
const ARGDEPLOYMENT = "-d";
const ARGPV = "-pv";
const ARGPVC = "-pvc";
const ARGLIMITRANGE = "-l";
const ARGSERVICE = "-serv";
const ARGNOINFOS = "-s";

module.exports = {
  /**
   *
   * @param {string} document
   * @param {object} cmdarguments
   * @returns {string}
   */
  genNameSpace: async (document, cmdarguments) => {
    if (
      cmdarguments.generationoptions.length === 0 ||
      cmdarguments.generationoptions.includes(ARGNAMESPACE)
    ) {
      let template = helperGenLib.getTemplate(
        cmdarguments ? cmdarguments.customtpldir : "",
        "tpl_namespace"
      );
      return module.exports.genManifest(template, document);
    }
  },
  /**
   * ------ Secrets see https://kubernetes.io/docs/concepts/configuration/secret/
   * 3 cases :
   * - As container environment variable.
   * - secret registry for the kubelet when pulling images for the Pod.
   * - As files - (@todo)
   */
  /**
   * Generate secrets for private registry and env vars
   * @param {object} document
   * @param {object} cmdarguments
   * @returns {Promise}
   */
  genSecrets: (document, cmdarguments) => {
    return new Promise(async (resolv, reject) => {
      if (
        !cmdarguments ||
        cmdarguments.generationoptions.length === 0 ||
        cmdarguments.generationoptions.includes(ARGSECRETS)
      ) {
        let yamldocument = [];
        await module.exports
          .genSecretsForPrivateRegistry(document, cmdarguments)
          .then((result) => {
            yamldocument.push(result);
          })
          .catch((error) => {
            reject(error);
          });
        await module.exports
          .genSecretsGlobalEnv(document, cmdarguments)
          .then((result) => {
            yamldocument.push(result);
          })
          .catch((error) => {
            reject(error);
          });
        resolv(yamldocument.join("\n"));
      } else {
        resolv(null);
      }
    });
  },
  /**
   * generate secrets for private registry
   * @param {object} document
   * @param {object} cmdarguments
   * @returns {Promise}
   */
  genSecretsForPrivateRegistry: async (document, cmdarguments) => {
    let manifest = [];
    return new Promise(async (resolv, reject) => {
      let template = helperGenLib.getTemplate(
        cmdarguments ? cmdarguments.customtpldir : "",
        "tpl_secrets-private-registry"
      );
      // Generate one manifest per secret
      for (let item of helperGenLib.getRegistrySecrets(document)) {
        if (!item.registry) continue;
        item.namespace = document.namespace;
        // building authdockerjson base64 encoded
        let buff = Buffer.from(`${item.value}`);
        const jsonauthdocker = `{"auths":{"${
          item.registry
        }":{"auth":"${buff.toString("base64")}"}}}`;
        buff = Buffer.from(jsonauthdocker);
        item.base64str = buff.toString("base64");
        // await because loop with for
        await module.exports
          .genManifest(template, item)
          .then((result) => {
            manifest.push(result);
          })
          .catch((error) => {
            reject(error);
          });
      }
      resolv(manifest.length === 0 ? null : manifest.join("\n"));
    });
  },
  /**
   * get secrets from global.env (all env var are secrets)
   * @param {object} document
   * @param {object} cmdarguments
   * @returns {Promise}
   */
  genSecretsGlobalEnv: async (document, cmdarguments) => {
    return new Promise((resolv, reject) => {
      let template = helperGenLib.getTemplate(
        cmdarguments ? cmdarguments.customtpldir : "",
        "tpl_secrets-envvars"
      );
      // work on copy
      document = JSON.parse(JSON.stringify(document));
      document.global.env = helperGenLib.setEnvVarsAsKeyValue(document);
      if (document.global.env.length > 0) {
        module.exports
          .genManifest(template, document)
          .then((result) => {
            resolv(result);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolv(null);
      }
    });
  },
  /**
   * generate service and endpoint for glusterfs connection
   * @param {object} document
   * @param {boolean} cmdarguments
   * @returns {Promise}
   */
  genGlusterFsStorageEndPoint: async (document, cmdarguments) => {
    return new Promise((resolv, reject) => {
      if (
        cmdarguments.generationoptions.length === 0 ||
        cmdarguments.generationoptions.includes(ARGPV)
      ) {
        let template = helperGenLib.getTemplate(
          cmdarguments ? cmdarguments.customtpldir : "",
          "tpl_glusterfsstorageendpoint"
        );
        // could also set by env var MYTINYDCGLUSTERSERVERIPADDRESS ||
        if (process.env.MYTINYDCGLUSTERSERVERIPADDRESS)
          document.glusterfsipaddr = process.env.MYTINYDCGLUSTERSERVERIPADDRESS;
        if (document.glusterfsipaddr && document.glusterfsipaddr.trim()) {
          return module.exports
            .genManifest(template, document)
            .then((result) => {
              resolv(result);
            })
            .catch((error) => {
              reject(error);
            });
        } else {
          resolv(null);
        }
      } else {
        resolv(null);
      }
    });
  },
  /**
   * get PersistentVolumes (PVs) and PersistentVolumesClaim (PVCs) :
   * - https://kubernetes.io/docs/concepts/storage/persistent-volumes/
   * @param {object} document
   * @param {object} ispvc - is PVC to generate default is PV
   * @param {object} cmdarguments
   * @returns {Promise}
   */
  genPersitentVolume: async (document, ispvc, cmdarguments) => {
    return new Promise(async (resolv, reject) => {
      if (
        cmdarguments.generationoptions.length === 0 ||
        (cmdarguments.generationoptions.includes(ARGPV) && !ispvc) ||
        (cmdarguments.generationoptions.includes(ARGPVC) && ispvc)
      ) {
        let template = "";
        if (ispvc) {
          template = helperGenLib.getTemplate(
            cmdarguments ? cmdarguments.customtpldir : "",
            "tpl_persistentvolumeclaim"
          );
        } else {
          template = helperGenLib.getTemplate(
            cmdarguments ? cmdarguments.customtpldir : "",
            "tpl_persistentvolume"
          );
        }
        const persistentvolumes = helperGenLib.getPersistentVolumes(document);
        const scale = helperGenLib.getScale(document);
        // @todo
        const unconsumedvolumes = [];
        // build for only consumed volumes
        const finalpersistenvolumes = persistentvolumes.filter(
          (x) => !unconsumedvolumes.includes(x.name)
        );
        if (finalpersistenvolumes.length > 0) {
          let manifest = [];
          // each volume has allready been checked at the starting process
          for (let item of finalpersistenvolumes) {
            item.readOnly = false;
            item.accessmode = helperGenLib.getaccessModes(
              item.accessmode,
              scale
            );
            if (item.accessmode && item.accessmode.match(/^ReadOnly/))
              item.readOnly = true;
            const volumedata = {
              namespace: document.namespace,
              volume: item,
              namemanifest: helperGenLib.getPersistenVolumeManifestName(
                item.name,
                document.namespace
              ),
              nameclaimrefmanifest:
                helperGenLib.getPersistenVolumeClaimRefManifestName(
                  item.name,
                  document.namespace
                ),
            };
            await module.exports
              .genManifest(template, volumedata)
              .then((result) => {
                manifest.push(result);
              })
              .catch((error) => {
                reject(error);
              });
          }
          resolv(manifest.length === 0 ? null : manifest.join("\n"));
        } else {
          resolv(null);
        }
      } else {
        resolv(null);
      }
    });
  },
  /**
   * LimitRange namespace level
   * see : https://kubernetes.io/docs/tasks/administer-cluster/manage-resources/cpu-constraint-namespace/
   * @param {object} document
   * @param {object} cmdarguments
   * @returns {Promise}
   */
  genLimitRange: async (document, cmdarguments) => {
    return new Promise(async (resolv, reject) => {
      if (
        cmdarguments.generationoptions.length === 0 ||
        cmdarguments.generationoptions.includes(ARGLIMITRANGE)
      ) {
        let template = helperGenLib.getTemplate(
          cmdarguments ? cmdarguments.customtpldir : "",
          "tpl_limitrange"
        );
        if (!document.global) resolv(null);
        document.global.limitrange = helperGenLib.getLimitRange(
          document.global.limitrange
        );
        await module.exports
          .genManifest(template, document)
          .then((result) => {
            resolv(result);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolv(null);
      }
    });
  },
  /**
   * generate Deployment manifest, containers must have been checked before
   * as the kubernetes documentation explain the replicaset must be managed by deployment
   * all attributs associated with replicaset are set with deployment
   * @param {object} document
   * @param {object} cmdarguments
   * @returns {Promise}
   */
  genDeployment: async (document, cmdarguments) => {
    return new Promise(async (resolv, reject) => {
      if (
        cmdarguments.generationoptions.length === 0 ||
        cmdarguments.generationoptions.includes(ARGDEPLOYMENT)
      ) {
        let template = helperGenLib.getTemplate(
          cmdarguments ? cmdarguments.customtpldir : "",
          "tpl_deployment"
        );
        // has been mentioned to user before
        if (!document.global.scale || !document.global.scale.replicas) {
          if (!document.global.scale) document.global.scale = {};
          document.global.scale.replicas = 0;
        }
        // convert env vars
        document.global.env = helperGenLib.setEnvVarsAsKeyValue(document);

        // strategy
        helperGenLib.setGlobalStrategy(document);
        // set container context
        document.containers = helperGenLib.setContainersSettings(document);
        // secrets used for registry
        document.registrysecrets =
          helperGenLib.getRegistrySecretNames(document);
        // security Context
        if (document.global && document.global.securitycontext)
          document.global.securitycontext =
            helperGenLib.convSecurityContextAttrName(
              document.global.securitycontext
            );
        document.deploymentvolumes = helperGenLib.setDeploymentVolumes(
          document.containers
        );
        await module.exports
          .genManifest(template, document)
          .then((result) => {
            resolv(result);
          })
          .catch((error) => {
            reject(error);
          });
      } else {
        resolv(null);
      }
    });
  },
  /**
   *
   * @param {object} document
   * @param {string} customtpldir
   * @returns {Promise}
   */
  genIngress: async (document, customtpldir) => {
    return new Promise(async (resolv, reject) => {
      if (
        !document.service ||
        !document.service.ingress ||
        !document.service.ingress.host
      ) {
        resolv(null);
      }
      let template = helperGenLib.getTemplate(customtpldir, "tpl_ingress");
      await module.exports
        .genManifest(template, document)
        .then((result) => {
          resolv(result);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  /**
   *
   * @param {object} document
   * @param {object} cmdarguments
   * @returns {Promise}
   */
  genService: async (document, cmdarguments) => {
    return new Promise(async (resolv, reject) => {
      if (
        cmdarguments.generationoptions.length === 0 ||
        cmdarguments.generationoptions.includes(ARGSERVICE)
      ) {
        let template = helperGenLib.getTemplate(
          cmdarguments ? cmdarguments.customtpldir : "",
          "tpl_service"
        );
        // 1 service by containers services
        let manifest = [];
        for (let cont of helperGenLib.getContainers(document)) {
          if (cont.services)
            for (let serv of cont.services) {
              if (serv.ingress && serv.ingress.host) {
                helperGenLib.setServiceDefaultValue(document, serv);
              }
              await module.exports
                .genManifest(template, {
                  namespace: document.namespace,
                  service: serv,
                })
                .then(async (result) => {
                  manifest.push(result);
                  await module.exports
                    .genIngress(
                      { namespace: document.namespace, service: serv },
                      cmdarguments ? cmdarguments.customtpldir : ""
                    )
                    .then(async (result) => {
                      if (result) manifest.push(result);
                    })
                    .catch((error) => {
                      throw error;
                    });
                })
                .catch((error) => {
                  reject(error);
                });
            }
        }
        resolv(manifest.length === 0 ? null : manifest.join("\n"));
      } else {
        resolv(null);
      }
    });
  },
  /**
   * generate manifest with template/data
   * @param {string} tpl - array of string (template paths)
   * @param {object} data  - Json
   * @returns {string}
   */
  genManifest: async (tpl, data) => {
    return new Promise((resolv, reject) => {
      let manifest = "";
      if (typeof tpl !== "string")
        throw new Error(`tpl value must be string type`);
      try {
        const tplpath = mainLib.getDefaultTemplatePath();
        // template default
        const templatedefault = `${tplpath}/${path.basename(tpl)}${
          path.extname(tpl) !== ".ejs" ? ".ejs" : ""
        }`;
        let template = templatedefault;
        // use template custom if exists
        if (tpl.match(/^[.\/]/)) {
          template = `${!tpl.match(/^[.\/]/) ? tplpath + "/" : ""}${tpl}${
            path.extname(tpl) !== ".ejs" ? ".ejs" : ""
          }`;
          if (!fs.existsSync(template)) template = templatedefault;
        }
        if (!fs.existsSync(template))
          // error string impact tests
          throw new Error(`Template file ${template} is not present`);

        // get template content
        let rendered = fs.readFileSync(template, "utf-8");

        while (rendered.match(/\<%.*%>/)) {
          rendered = ejs.render(rendered, data);
        }
        manifest += rendered
          .replace(/(\r?\n)\s*\1+/g, "$1")
          .replace(/\n+$/g, "");
        resolv(manifest);
      } catch (error) {
        reject(error);
      }
    });
  },
  /**
   * use with executable which includes default templates
   * allow user to extract default default to create custom templates...
   * @param {string} pathtemplateextract
   * @param {boolean} displayalert
   * @return {boolean}
   */
  extractDefaultTemplates: (pathtemplateextract, displayalert) => {
    if (!fs.existsSync(pathtemplateextract)) fs.mkdirSync(pathtemplateextract);
    // check is empty ?
    if (fs.readdirSync(pathtemplateextract).length > 0) {
      if (displayalert)
        console.error(
          `[ERROR] Warn the non empty output directory allready exist: ${pathtemplateextract}`
        );
      return false;
    }
    console.info(`[*] extract templates to ${pathtemplateextract}`);
    // copy default templates content dir to pathtemplateextract
    for (let file of fs.readdirSync(mainLib.getDefaultTemplatePath())) {
      const src = `${mainLib.getDefaultTemplatePath()}/${file}`;
      const dest = `${pathtemplateextract}/${file}`;
      console.info(`  -> extracting ${file}`);
      if (fs.lstatSync(src).isFile()) fs.copyFileSync(src, dest);
    }
    return true;
  },
  /**
   * create description file initialized (yaml document)
   */
  buildDecriptionInit: () => {
    const filename = "description.yml";
    const tpl = __dirname + "/../templatedescription/description-init.yml";
    if (fs.existsSync(filename))
      throw new Error(`[ERROR] Description ${filename} allready exists`);
    if (fs.existsSync(tpl)) {
      fs.copyFileSync(tpl, filename);
      console.info(`Description initialized file is : ./${filename}`);
    } else {
      throw new Error(
        `[ERROR] Template description initialized doesn't exist : ${tpl}`
      );
    }
  },
  /**
   *
   * @param {number} t0
   * @param {object} cmdarguments
   */
  showProcessInfos: (t0, cmdarguments) => {
    if (!cmdarguments.silent) {
      console.info("Process informations:");
      console.info("arguments:", cmdarguments);
      console.info(`execution time: ${(performance.now() - t0).toFixed(2)}ms`);
    }
  },
};
