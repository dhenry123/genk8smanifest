const mainLib = require("./mainLib");
const path = require("path");

module.exports = {
  /**
   * get global.env from input document
   * @param {object} data
   * @returns {array}
   */
  getGlobalEnv: (data) => {
    if (data.global && data.global.env && data.global.env.length > 0) {
      return data.global.env;
    }
    return [];
  },
  /**
   *
   * @param {object} data
   * @returns {boolean}
   */
  setGlobalStrategy: (data) => {
    if (data.global.strategy) {
      const capacities = mainLib.getAvailableStrategy();
      data.global.strategy =
        capacities[
          capacities.findIndex((item) => {
            return data.global.strategy.toLowerCase() === item.toLowerCase();
          })
        ];
    }
  },
  /**
   * convert xxx=yyy as {key:"xxx",value="yyy"}
   * @param {object} data
   * @returns {array}
   */
  setEnvVarsAsKeyValue: (data) => {
    return module.exports.getGlobalEnv(data).map((x) => {
      const split = x.split("=");
      const key = split[0];
      // value is the rest
      split.shift();
      return { key: key, value: split.join("=") };
    });
  },
  /**
   * get secrets from input document
   * secret is uniq - must be checked before running this method
   * @param {object} document
   * @returns {array}
   */
  getSecrets: (document) => {
    if (document && document.secrets && Array.isArray(document.secrets)) {
      return document.secrets;
    }
    return [];
  },
  /**
   * get only secrets for registry
   * @param {object} document
   * @returns {array}
   */
  getRegistrySecrets: (document) => {
    return module.exports.getSecrets(document).filter((x) => x.registry);
  },
  /**
   * build array with only name of registry secrets
   * @param {object} document
   * @returns {array}
   */
  getRegistrySecretNames: (document) => {
    return module.exports.getRegistrySecrets(document).map((x) => x.name);
  },
  /**
   * convert abv accessmode from input document
   * @param {string} abv - see  https://kubernetes.io/docs/concepts/storage/persistent-volumes/#access-modes
   * @param {object} scale - information about application scaling
   * @returns
   */
  getaccessModes: (abv, scale) => {
    // application is scalable and accessmode unset (see kubernetes documentation about accessmode https://kubernetes.io/docs/concepts/storage/persistent-volumes/ )
    if (scale && scale.scalable && !abv) abv = "RWX";
    switch (abv) {
      case "RWX":
        return "ReadWriteMany";
      case "ROX":
        return "ReadOnlyMany";
      case "RWOP":
        return "ReadWriteOncePod";
      default:
        return "ReadWriteOnce";
    }
  },
  /**
   * get Persisten Volume Name for manifest (uniformity)
   * @param {string} volumename
   * @param {string} namespace
   * @returns {string}
   */
  getPersistenVolumeManifestName: (volumename, namespace) => {
    return `gluster-pv-${namespace}-${volumename}`;
  },
  /**
   * get Temporary Volume Name for manifest (uniformity)
   * @param {string} volumename
   * @returns {string}
   */
  getTemporaryVolumeManifestName: (volumename) => {
    return `tmpvol-${volumename}`;
  },
  /**
   * get configmap Volume Name for manifest (uniformity)
   * @param {string} volumename
   * @returns {string}
   */
  getConfigMapAsVolumeManifestName: (volumename) => {
    return `configmapvolume-${volumename}`;
  },
  /**
   * get Volume Persisten Volume Claimref Name for manifest (uniformity)
   * @param {string} volumename
   * @param {string} namespace
   * @returns {string}
   */
  getPersistenVolumeClaimRefManifestName: (volumename, namespace) => {
    return `claimref-${module.exports.getPersistenVolumeManifestName(
      volumename,
      namespace
    )}`;
  },
  /**
   * get limitrange for namespace if input is empty set default values
   * @param {object} data
   * @returns {object}
   */
  getLimitRange: (data) => {
    if (!data) data = module.exports.getDefaultLimitRange();
    if (!data.max) data.max = defaultLimitRange.max;
    if (!data.max.cpu) data.max.cpu = defaultLimitRange.max.cpu;
    if (!data.max.memory) data.max.memory = defaultLimitRange.max.memory;
    if (!data.request) data.request = defaultLimitRange.request;
    if (!data.request.cpu) data.request.cpu = defaultLimitRange.request.cpu;
    if (!data.request.memory)
      data.request.memory = defaultLimitRange.request.memory;
    return data;
  },
  /**
   * defaults limitrange
   * @returns {object}
   */
  getDefaultLimitRange: () => {
    return {
      max: {
        cpu: "500m",
        memory: "100Mi",
      },
      request: {
        cpu: "100m",
        memory: "50Mi",
      },
    };
  },
  /**
   * get containers from input document
   * @param {object} document
   * @returns {array}
   */
  getContainers: (document) => {
    if (
      document.containers &&
      Array.isArray(document.containers) &&
      document.containers.length > 0
    )
      return document.containers;
    return [];
  },
  /**
   * get global.persistentvolumes
   * @param {objec} document
   * @returns {array}
   */
  getDocumentPersistentVolumes: (document) => {
    if (document.global && document.global.persistentvolumes)
      return document.global.persistentvolumes;
    return [];
  },
  /**
   * scale mode {scalable:boolean,replicas:integer}
   * @param {object} document
   * @returns {object} Json
   */
  getScale: (document) => {
    if (document.global && document.global.scale) return document.global.scale;
    return { scalable: false };
  },
  /**
   * get global.temporaryvolumes
   * @param {objec} document
   * @returns {array}
   */
  getDocumentTemporaryVolumes: (document) => {
    if (document.global && document.global.temporaryvolumes) {
      return document.global.temporaryvolumes;
    }
    return [];
  },
  getDocumentConfigMapAsVolumes: (document) => {
    if (document.global && document.global.configmaps) {
      return document.global.configmaps;
    }
    return [];
  },
  /**
   * at this level, volume syntax has allready been checked
   *
   * @param {object} document
   * @param {object} container - by ref !!!
   */
  setContainerVolumes: (document, container) => {
    const globalvolumes = [];

    // Persistent volumes
    for (let item of module.exports.getDocumentPersistentVolumes(document)) {
      item.manifestvolumename = module.exports.getPersistenVolumeManifestName(
        item.name,
        document.namespace
      );
      globalvolumes.push(item);
    }

    // Temporary volumes
    for (let item of module.exports.getDocumentTemporaryVolumes(document)) {
      item.tempfs = true;
      item.manifestvolumename = module.exports.getTemporaryVolumeManifestName(
        item.name
      );
      globalvolumes.push(item);
    }

    // configmaps as volume
    for (let item of module.exports.getDocumentConfigMapAsVolumes(document)) {
      item.tempfs = true;
      item.manifestvolumename = module.exports.getConfigMapAsVolumeManifestName(
        item.name
      );
      // manifest subpath attr is basename(mount)
      item.subpath = path.basename(item.mount);

      // get configmap name associated
      item.configmapname = module.exports.getConfigMapName(document, item);

      globalvolumes.push(item);
    }

    let newvolumes = [];
    if (container.volumes) {
      for (let item of container.volumes) {
        const volume = globalvolumes.filter((x) => x.name === item);
        if (volume.length === 1) newvolumes.push(volume[0]);
      }
      container.volumes = newvolumes;
    } else {
      container.volumes = globalvolumes;
    }
  },
  /**
   * global deployment volumes, each volumes of container, and uniq
   * @param {array} containers
   * @returns {array}
   */
  setDeploymentVolumes: (containers) => {
    let uniq = [];
    for (let item of containers) {
      if (item.volumes) {
        for (let vol of item.volumes) {
          if (uniq.filter((x) => x.name === vol.name).length === 0)
            uniq.push(vol);
        }
      }
    }
    return uniq;
  },
  /**
   * convert description securitycontext as kubernetes key expected
   * @param {string} key
   * @returns {string||null}
   */
  convertSecurityContextKeyToKubernetes: (key) => {
    // does not take into account keys which contains comment, usefull to comment json data
    if (key.match(/comment/i)) return null;
    const hashtable = {
      runasuser: "runAsUser",
      runasgroup: "runAsGroup",
      fsgroup: "fsGroup",
      readonly: "readOnlyRootFilesystem",
      runasnonroot: "runAsNonRoot",
    };
    if (hashtable[key]) return hashtable[key];
    return key;
  },
  /**
   *
   * @param {object} document
   * @returns {array}
   */
  setContainersSettings: (document) => {
    let newcontainers = [];
    for (let item of module.exports.getContainers(
      JSON.parse(JSON.stringify(document))
    )) {
      // no a good practise
      if (!item.tag) {
        item.tag = "latest";
      }
      // security container - always read only
      if (typeof item.readonly !== "boolean") {
        item.readonly = false;
      }
      // pulling rule is always if not set
      if (!item.imagepullpolicy) item.imagepullpolicy = "Always";
      if (!item.services) item.services = [];
      module.exports.setContainerVolumes(
        // copy of document
        JSON.parse(JSON.stringify(document)),
        item
      );
      // override global.securitycontext
      if (item.securitycontext) {
        let newsecuritcontext = {};
        console.log("xxxxxx", item.securitycontext);
        Object.keys(item.securitycontext).forEach((key) => {
          const kuberneteskey =
            module.exports.convertSecurityContextKeyToKubernetes(key);
          console.log("key", key, "kuberneteskey", kuberneteskey);
          if (kuberneteskey)
            newsecuritcontext[kuberneteskey] = item.securitycontext[key];
        });
        item.securitycontext = newsecuritcontext;
      }

      newcontainers.push(item);
    }
    return newcontainers;
  },
  /**
   * convert securitycontext from input document
   * @param {object} securitycontext
   * @returns {object}
   */
  convSecurityContextAttrName: (securitycontext) => {
    let final = {};
    if (securitycontext) {
      Object.keys(securitycontext).forEach((key) => {
        const kuberneteskey =
          module.exports.convertSecurityContextKeyToKubernetes(key);
        if (kuberneteskey) final[kuberneteskey] = securitycontext[key];
      });
      // integer
      if (final.runAsUser && final.runAsUser !== 0) {
        final.runAsNonRoot = true;
      }
    }
    return final;
  },
  /**
   * Return normalized service name
   * @param {object} document
   * @param {object} service
   * @returns {string}
   */
  getServiceName: (document, service) => {
    return `${document.namespace}-app-port-${service.targetport}`;
  },
  /**
   * Return normalized config map name
   * @param {object} document
   * @param {object} map
   * @returns
   */
  getConfigMapName: (document, map) => {
    return `${map.name}-${document.namespace}-configmap`;
  },
  /**
   *
   * @param {object} data
   * @param {object} service
   * @returns {string}
   */
  getServicePortName: (data, service) => {
    return `port-${data.namespace}-${service.targetport}`;
  },
  /**
   * set service by ref !!!
   * @param {object} data
   * @param {object} serv
   */
  setServiceDefaultValue: (data, serv) => {
    if (!serv.ingress.path && !serv.ingress.path.trim())
      serv.ingress.path = "/"; // @default
    // Service name
    serv.name = module.exports.getServiceName(data, serv);
    // Service port name
    serv.portname = module.exports.getServicePortName(data, serv);
    // type default is NodePort
    if (!serv.type || !serv.type.trim()) serv.type = "NodePort";
    // protocol default is TCP
    if (!serv.protocol || !serv.protocol.trim()) serv.protocol = "TCP";
  },
  /**
   * get template fullpath
   * @param {string} dir
   * @param {string} template
   * @returns {string}
   */
  getTemplate: (dir, template) => {
    if (dir && !dir.match(/^[./]/)) dir = `./${dir}`;
    template = `${dir ? dir : ""}${dir ? "/" : ""}${template}`;
    return template;
  },
};
