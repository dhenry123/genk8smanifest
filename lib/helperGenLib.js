const mainLib = require("./mainLib");

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
   * get Temporary Volume Name for manifest (uniformity
   * @param {string} volumename
   * @returns {string}
   */
  getTemporaryVolumeManifestName: (volumename) => {
    return `tmpvol-${volumename}`;
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
  getPersistentVolumes: (document) => {
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
  /**
   * at this level, volume syntax has allready been checked
   *
   * @param {object} data
   * @param {object} container - by ref !!!
   */
  setContainerVolumes: (data, container) => {
    const globalvolumes = [];
    for (let item of module.exports.getPersistentVolumes(data)) {
      // set volume as temp type (will be created and mount from node)
      item.manifestvolumename = module.exports.getPersistenVolumeManifestName(
        item.name,
        data.namespace
      );
      globalvolumes.push(item);
    }

    for (let item of module.exports.getDocumentTemporaryVolumes(data)) {
      // set volume as temp type (will be created and mount from node)
      item.tempfs = true;
      item.manifestvolumename = module.exports.getTemporaryVolumeManifestName(
        item.name
      );
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
   *
   * @param {object} data
   * @returns {array}
   */
  setContainersSettings: (data) => {
    let newcontainers = [];
    for (let item of module.exports.getContainers(
      JSON.parse(JSON.stringify(data))
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
        JSON.parse(JSON.stringify(data)),
        item
      );

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
      // integer
      if (securitycontext.runasuser && securitycontext.runasuser !== 0) {
        final.runAsUser = securitycontext.runasuser;
        final.runAsNonRoot = true;
      }
      if (securitycontext.runasgroup)
        final.runAsGroup = securitycontext.runasgroup;
      if (securitycontext.fsgroup) final.fsGroup = securitycontext.fsgroup;
    }
    return final;
  },
  /**
   *
   * @param {object} data
   * @param {object} service
   * @returns {string}
   */
  getServiceName: (data, service) => {
    return `${data.namespace}-app-port-${service.targetport}`;
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
