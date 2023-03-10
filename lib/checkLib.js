const mainLib = require("./mainLib");
const YAML = require("yaml");
const fs = require("fs");

module.exports = {
  /**
   * check -i provided and existing input file
   * @param {object} cmdarguments
   *
   */
  checkInputFile: (cmdarguments) => {
    // no input file
    if (!cmdarguments.inputfile) {
      console.error("You have to provide the Yaml description input file");
      process.exit(1);
    }

    if (!fs.existsSync(cmdarguments.inputfile)) {
      console.error(
        `[ERROR] the input description file "${cmdarguments.inputfile}" doesn't exist`
      );
      process.exit(1);
    }
  },
  /**
   *
   * @param {string} yamlcontent
   * @returns {string}
   */
  checkInputYamlSyntaxAndGetDocument: (yamlcontent) => {
    const content = YAML.parseDocument(yamlcontent);
    if (content.errors && content.errors.length > 0)
      throw new Error(content.errors);
    return content;
  },
  /**
   *
   * @param {string} yamlcontent
   * @returns {string} || throw error
   */
  checkK8sManifestYamlSyntaxAndGetDocuments: (yamlcontent) => {
    const content = YAML.parseAllDocuments(yamlcontent);
    for (let item of content) {
      if (item.errors && item.errors.length > 0) throw new Error(item.errors);
    }
    return content;
  },
  /**
   * check yaml syntax - Error will be intercepted by global ErrorHandler
   * @param {string} yamlcontent
   * @returns {object} Json
   */
  getInputYamlAsJson: (yamlcontent) => {
    const content =
      module.exports.checkInputYamlSyntaxAndGetDocument(yamlcontent);
    return content.toJSON();
  },
  /**
   * if document empty end process
   * @param {string} document
   *
   */
  isDocumentEmpty: (document) => {
    if (!document) {
      console.error("Input document is empty, end of process");
      process.exit(1);
    }
  },
  /**
   *
   * @param {object} element - object to scan
   * @param {array} mandatoryattrs - array of mandatory attributs name
   * @param {string} model - represents attribut of input model (description), used to display alert
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  isMandatoryAttributs: (element, mandatoryattrs, model, displayalert) => {
    for (let item of mandatoryattrs) {
      if (
        !element[item] ||
        (element[item] &&
          typeof element[item] === "string" &&
          !element[item].trim())
      ) {
        mainLib.displayError(
          displayalert,
          `${model} attribut ${item} is mandatory - element provided: ${JSON.stringify(
            element
          )}`
        );
        return false;
      }
    }
    return true;
  },
  /**
   * namespace is mandatory
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  nameSpace: (document, displayalert = true) => {
    if (
      !document.namespace ||
      (document.namespace &&
        typeof document === "string" &&
        !document.namespace.trim())
    ) {
      mainLib.displayError(displayalert, "namespace is mandatory");
      return false;
    }
    if (typeof document.namespace !== "string") {
      mainLib.displayError(
        displayalert,
        `namespace must be string, provided: ${JSON.stringify(
          document.namespace
        )}`
      );
      return false;
    }
    return true;
  },
  /**
   * secrets is array
   * each item must have mandatory attributs
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  secrets: (document, displayalert = true) => {
    let uniqname = [];
    if (document.secrets) {
      if (Array.isArray(document.secrets)) {
        for (let item of document.secrets) {
          if (
            !module.exports.isMandatoryAttributs(
              item,
              ["name", "value"],
              "secrets",
              displayalert
            )
          )
            return false;
          if (uniqname.includes(item.name)) {
            mainLib.displayError(
              displayalert,
              `secret must be uniq - ${item.name} name has allready been declared`
            );
            return false;
          }
          uniqname.push(item.name);
        }
      } else {
        mainLib.displayError(displayalert, "secrets must be an array");
        return false;
      }
    }
    return true;
  },
  /**
   * check syntax of environment variable setting (key=value)
   * @param {array} envvars
   * @param {string} model
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  envvars: (envvars, model, displayalert) => {
    for (let item of envvars) {
      // each item must key=value
      if (typeof item !== "string") {
        mainLib.displayError(
          displayalert,
          `global.env item must be string, provided: ${JSON.stringify(item)}`
        );
        return false;
      }
      if (item.trim().split("=").length < 2) {
        mainLib.displayError(
          displayalert,
          `${model} - item ${item} is malformed (key=value)`
        );
        return false;
      }
    }
    return true;
  },
  /**
   * global.env
   * not mandatory - if set  must be array and each item must wellformed key=value
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  globalEnv: (document, displayalert = true) => {
    // check is containers.env
    let errorincontainer = false;
    if (document.containers && Array.isArray(document.containers)) {
      document.containers.forEach((container, idx) => {
        if (container.env && !Array.isArray(container.env)) {
          mainLib.displayError(
            displayalert,
            `container[ index ==> ${idx} ].env must be an array`
          );
          errorincontainer = true;
          return false;
        }
      });
    }
    if (errorincontainer) return false;
    // check global
    if (!document.global || !document.global.env) return true;
    if (!Array.isArray(document.global.env)) {
      mainLib.displayError(displayalert, "global.env must be an array");
      return false;
    } else {
      return module.exports.envvars(
        document.global.env,
        "global.env",
        displayalert
      );
    }
  },
  /**
   * not mandatory - must be an object
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  globalSecurityContext: (document, displayalert = true) => {
    if (!document.global || !document.global.securitycontext) return true;
    if (typeof document.global.securitycontext !== "object") {
      mainLib.displayError(
        displayalert,
        "global.securitycontext is not object"
      );
      return false;
    }
    const attrs = ["runasuser", "runasgroup", "fsgroup"];
    for (let item of attrs) {
      if (
        document.global.securitycontext[item] &&
        typeof document.global.securitycontext[item] !== "number"
      ) {
        mainLib.displayError(
          displayalert,
          `global.securitycontext.${item} must be number`
        );
        return false;
      }
    }
    return true;
  },
  /**
   * global.nodeaffinity
   * not mandatory - if set  must be array and each item of nodeaffinity must be {key:"value",value:"value"} (value is non empty)
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  globalNodeaffinity: (document, displayalert = true) => {
    if (!document.global || !document.global.nodeaffinity) return true;
    if (!Array.isArray(document.global.nodeaffinity)) {
      mainLib.displayError(displayalert, "global.nodeaffinity is not array");
      return false;
    }
    for (let item of document.global.nodeaffinity) {
      if (
        !module.exports.isMandatoryAttributs(
          item,
          ["key", "value"],
          "global.nodeaffinity",
          displayalert
        )
      )
        return false;
    }
    return true;
  },
  /**
   * Check deployment strategy see documentation : https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
   * if not specified default is "RollingUpdate"
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  globalStrategie: (document, displayalert = true) => {
    const capacities = mainLib.getAvailableStrategy();
    if (
      document.global &&
      document.global.strategy &&
      typeof document.global.strategy === "string" &&
      capacities.findIndex((item) => {
        return document.global.strategy.toLowerCase() === item.toLowerCase();
      }) === -1
    ) {
      mainLib.displayError(
        displayalert,
        `global.strategy (${document.global.strategy.toLowerCase()}) is not included in ${capacities.join(
          " | "
        )}`
      );
      return false;
    }
    return true;
  },
  /**
   * global.persistentvolumes
   * must be array, each item must have required attrs
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  persistentVolumes: (document, displayalert = true) => {
    if (document.global && document.global.persistentvolumes) {
      if (!Array.isArray(document.global.persistentvolumes)) {
        mainLib.displayError(
          displayalert,
          "global.persistentvolumes is not an array"
        );
        return false;
      } else {
        // check mandatories fields
        for (let volume of document.global.persistentvolumes) {
          if (
            !module.exports.isMandatoryAttributs(
              volume,
              ["name", "capacity", "mount"],
              "global.persistentvolumes",
              displayalert
            )
          )
            return false;
          // accessMode and scalability
          if (document.global.scale && document.global.scale.scalable) {
            // here application is scalable so accessMode must be RWX (see kubernetes documentation https://kubernetes.io/fr/docs/concepts/storage/persistent-volumes/#modes-d-acc%C3%A8s)
            if (volume.access !== "RWX") {
              mainLib.displayError(
                displayalert,
                `global.scale.scalable is true and this volume has accessmode (access attr) ${JSON.stringify(
                  volume
                )} different from RWX`
              );
              return false;
            }
          }
        }
      }
    }
    return true;
  },
  /**
   * global.temporaryvolumes
   * must be array, each item must have required attrs
   * attr mount value must start with / (mountpoint)
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  temporayVolumes: (document, displayalert = true) => {
    if (document.global && document.global.temporaryvolumes) {
      if (!Array.isArray(document.global.temporaryvolumes)) {
        mainLib.displayError(
          displayalert,
          "global.temporaryvolumes is not an array"
        );
        return false;
      } else {
        for (let item of document.global.temporaryvolumes) {
          if (
            !module.exports.isMandatoryAttributs(
              item,
              ["name", "mount"],
              "global.temporaryvolumes",
              displayalert
            )
          )
            return false;
          if (!item.mount.match(/^\//)) {
            mainLib.displayError(
              displayalert,
              `global.temporaryvolumes - item.mount doesn't start with / ${item}`
            );
            return false;
          }
        }
      }
    }
    return true;
  },
  /**
   * global.replicas
   * not mandatory - must be number
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  globalReplicas: (document, displayalert = true) => {
    if (
      document.global &&
      document.global.scale &&
      document.global.scale.replicas
    ) {
      if (typeof document.global.scale.replicas !== "number") {
        mainLib.displayError(
          displayalert,
          "global.scale.replicas must be integer"
        );
        return false;
      }
      if (
        !document.global.scale.scalable &&
        document.global.scale.replicas > 1
      ) {
        mainLib.displayError(
          displayalert,
          "global.scale.replicas is greater than 1 and global.scale.scalable is false !!!"
        );
        return false;
      }
    } else {
      console.info("you've certainly a good reason to set global.replica to 0");
    }
    return true;
  },
  /**
   * Check if container registry secret exists in document
   * @param {object} container
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  checkContainerRegistrySecret: (container, document, displayalert = true) => {
    if (container.dockerregistrysecret) {
      if (!Array.isArray(container.dockerregistrysecret)) {
        mainLib.displayError(
          displayalert,
          `container.dockerregistrysecret must be array, provided: ${JSON.stringify(
            container.dockerregistrysecret
          )}`
        );
        return false;
      }
      // a secret name with registry attr must exist
      if (
        !document.secrets ||
        (document.secrets && !Array.isArray(document.secrets))
      ) {
        mainLib.displayError(
          displayalert,
          "container.dockerregistrysecret ask secret, but secrets are not supplied"
        );
        return false;
      }
      // get registry secrets
      const secretsregistry = document.secrets
        .filter((x) => x.registry)
        .map((x) => x.name);

      // no registry secret
      if (!secretsregistry.length) return false;
      // secrets registry must include container.dockerregistrysecret
      // check
      for (let item of container.dockerregistrysecret) {
        if (!secretsregistry.includes(item)) {
          mainLib.displayError(
            displayalert,
            `container.dockerregistrysecret secret name ${item} doesn't exist in secrets`
          );
          return false;
        }
      }
    }
    return true;
  },
  /**
   * Liveness and Readiness have same specifications
   * see https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
   * @todo not full support
   * @param {string} probe
   * @param {object} probesdata
   * @param {array} probemethodssupported
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  chechProbeNess: (
    probe,
    probesdata,
    probemethodssupported,
    displayalert = true
  ) => {
    // not mandatory
    if (!probesdata) return true;
    // Type object
    if (Array.isArray(probesdata) || typeof probesdata !== "object") {
      mainLib.displayError(
        displayalert,
        `probes.${probe}  must be an object, provided : ${JSON.stringify(
          probesdata
        )}`
      );
      return false;
    }
    // is method supported ?
    if (
      !probesdata.method ||
      (probesdata.method && !probemethodssupported.includes(probesdata.method))
    ) {
      mainLib.displayError(
        displayalert,
        `probe method is not supported, provided: ${
          probesdata.method
        } methods supported ${JSON.stringify(probemethodssupported)} `
      );
      return false;
    } else {
      const mandatoriesattrmethod = {
        exec: [{ key: "action", type: "string" }],
        http: [
          { key: "path", type: "string" },
          { key: "port", type: "number" },
        ],
        grpc: [{ key: "port", type: "number" }],
      };

      let syntaxerror = false;
      // inspect mandatory attrs and type of probesdata

      for (attr of mandatoriesattrmethod[probesdata.method]) {
        if (
          !probesdata[attr.key] ||
          (probesdata[attr.key] && typeof probesdata[attr.key] !== attr.type)
        ) {
          syntaxerror = true;
          mainLib.displayError(
            displayalert,
            `attr ${
              attr.key
            } for probe ${probe} must be provided or type is not ${
              attr.type
            } - provided :${JSON.stringify(probesdata)}`
          );
          return false;
        }
      }

      //end if error
      if (syntaxerror) return false;

      const attrsnumber = [
        "initdelay",
        "period",
        "timeout",
        "success",
        "failure",
      ];
      for (let item of attrsnumber) {
        if (probesdata[item] && typeof probesdata[item] !== "number") {
          mainLib.displayError(
            displayalert,
            `probe ${item} must be number - provided : ${JSON.stringify(
              probesdata
            )}`
          );
          return false;
        }
      }
    }
    return true;
  },
  /**
   *
   * @param {object} container
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  checkProbes: (container, displayalert = true) => {
    const probes = ["readiness", "liveness", "startup"];
    const probemethodssupported = ["http", "exec", "grpc"];
    if (!container.probes) return true;
    if (
      Array.isArray(container.probes) ||
      typeof container.probes !== "object"
    ) {
      mainLib.displayError(
        displayalert,
        `containers[x].probes must be object, provided: ${JSON.stringify(
          container
        )}`
      );
      return false;
    } else {
      let checkprobenesserror = false;
      for (probe of probes) {
        if (
          !module.exports.chechProbeNess(
            probe,
            container.probes[probe],
            probemethodssupported,
            displayalert
          )
        ) {
          checkprobenesserror = true;
          return false;
        }
      }
      if (checkprobenesserror) return false;
    }
    return true;
  },
  /**
   * check container services
   * @param {object} container
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  checkServices: (container, displayalert = true) => {
    if (!container.services) return true;
    if (!Array.isArray(container.services)) {
      mainLib.displayError(
        displayalert,
        `containers[x].services must be array, provided: ${JSON.stringify(
          container
        )}`
      );
      return false;
    }
    for (let item of container.services) {
      if (
        !module.exports.isMandatoryAttributs(
          item,
          ["targetport"],
          "containers[x].services",
          displayalert
        )
      )
        return false;
      if (typeof item.targetport !== "number") {
        mainLib.displayError(
          displayalert,
          `containers[x].services.targetport must be number, provided: ${JSON.stringify(
            item
          )}`
        );
        return false;
      }
    }
    return true;
  },
  /**
   * containers
   * mandatory, must be an array
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  containers: (document, displayalert = true) => {
    if (document.containers) {
      if (!Array.isArray(document.containers)) {
        mainLib.displayError(
          displayalert,
          `containers must be array - element provided: ${JSON.stringify(
            document.containers
          )}`
        );
        return false;
      }
      for (let container of document.containers) {
        if (
          !module.exports.isMandatoryAttributs(
            container,
            ["name", "image"],
            "containers",
            displayalert
          )
        )
          return false;

        // tag is missing, mention user : Warning
        mainLib.displayError(
          !container.tag && displayalert,
          `Container ${container} of containers array has not tag, tag will be set with latest, this is not a good practise !!!`
        );

        // the secret must exist if provided
        if (
          !module.exports.checkContainerRegistrySecret(
            container,
            document,
            displayalert
          )
        )
          return false;
        if (!module.exports.checkProbes(container, displayalert)) return false;
        if (!module.exports.checkServices(container, displayalert))
          return false;
      }
      return true;
    }
    return false;
  },
  configMaps: (document, displayalert = true) => {
    if (document.global && document.global.configmaps) {
      if (!Array.isArray(document.global.configmaps)) {
        mainLib.displayError(
          displayalert,
          `global.configmaps must be array - element provided: ${JSON.stringify(
            document.configmaps
          )}`
        );
        return false;
      }
      for (let map of document.global.configmaps) {
        if (
          !module.exports.isMandatoryAttributs(
            map,
            ["name", "srctype"],
            "configmaps",
            displayalert
          )
        )
          return false;
        if (
          map.srctype === "file" &&
          !module.exports.isMandatoryAttributs(
            map,
            ["mount", "srcpath"],
            "configmaps",
            displayalert
          )
        )
          return false;

        if (!fs.existsSync(map.srcpath)) {
          mainLib.displayError(
            displayalert,
            `global.configmaps, the configmap specify srcpath ${
              map.srcpath
            }, this file is not present on the filesystem  - element provided: ${JSON.stringify(
              map
            )}`
          );
          return false;
        }
      }
      return true;
    }
    return true;
  },
  cronJob: (document, displayalert = true) => {
    if (document.global && document.global.cronjob) {
      if (!Array.isArray(document.global.cronjob)) {
        mainLib.displayError(
          displayalert,
          `global.cronjob must be array - element provided: ${JSON.stringify(
            document.cronjob
          )}`
        );
        return false;
      }
      for (let cron of document.global.cronjob) {
        if (
          !module.exports.isMandatoryAttributs(
            cron,
            ["name", "type", "url", "cron"],
            "cronjob",
            displayalert
          )
        )
          return false;
        if (cron.type !== "curl") {
          mainLib.displayError(
            displayalert,
            `global.cronjob, the cronjob specify type ${
              cron.type
            }, only type curl is supported at this moment - element provided: ${JSON.stringify(
              cron
            )}`
          );
          return false;
        }

        if (cron.cron.replace(/ +/g, " ").split(" ").length !== 5) {
          mainLib.displayError(
            displayalert,
            `global.cronjob, the cronjob specify cron ${
              cron.cron
            }, this type is not supported, you must get 5 distinct groups (* * * * *) - see kubernetes documentation about cronjob - element provided: ${JSON.stringify(
              cron
            )}`
          );
          return false;
        }
      }
      return true;
    }
    return true;
  },
  /**
   * checking global input document
   * @param {object} document
   * @param {boolean} displayalert
   * @returns {boolean}
   */
  checkDocument: (document, displayalert) => {
    return (
      module.exports.nameSpace(document, displayalert) &&
      module.exports.secrets(document, displayalert) &&
      module.exports.globalEnv(document, displayalert) &&
      module.exports.globalNodeaffinity(document, displayalert) &&
      module.exports.globalSecurityContext(document, displayalert) &&
      module.exports.persistentVolumes(document, displayalert) &&
      module.exports.temporayVolumes(document, displayalert) &&
      module.exports.globalReplicas(document, displayalert) &&
      module.exports.containers(document, displayalert) &&
      module.exports.globalStrategie(document, displayalert) &&
      module.exports.configMaps(document, displayalert) &&
      module.exports.cronJob(document, displayalert)
    );
  },
};
