const document = {
  namespace: "monnamespacetest",
  glusterfsipaddr: "192.168.10.25",
  global: {
    revision: 2,
    strategy: "Recreate",
    env: [
      "MONNAMESPACETEST__database__DB_TYPE=postgres",
      "MONNAMESPACETEST1__database__DB_TYPE=postgres",
      "CONNECT_DATABASE_STRING=postgres://xxxx:password@xxx.xxx.xxx.xxx:5432/app?sslmode=disable",
    ],
    nodeaffinity: [{ key: "serialport", value: "yes" }],
    securitycontext: {
      runasuser: 1000,
      runasgroup: 1001,
      fsgroup: 1002,
    },
    persistentvolumes: [
      { name: "data", accessmode: "RWO", mount: "/data", capacity: "4Gi" },
      {
        name: "data1",
        accessmode: "ROX",
        mount: "/data1",
        capacity: "2Gi",
        useexistingglustervolume: "useanexistingglustervolume",
      },
    ],
    temporaryvolumes: [
      { name: "temp", mount: "/temp" },
      { name: "logs", mount: "/logs" },
    ],
    configmaps: [
      {
        name: "uwsgi-ini",
        mount: "/opt/healthchecks/docker/uwsgi.ini",
        srctype: "file",
        srcpath: "tests/uwsgi.ini",
        existingdir: true,
      },
      {
        name: "local-settings-py",
        mount: "/opt/healthchecks/hc/local_settings.py",
        srctype: "file",
        srcpath: "tests/local_settings.py",
        existingdir: true,
      },
    ],
    scale: { scalable: false, replicas: 1 },
  },

  secrets: [
    {
      name: "dockerregistry",
      registry: "myprivate.registry.local",
      value: "docker:docker",
    },
    {
      name: "dockerregistry1",
      registry: "myprivate1.registry.local",
      value: "docker:docker",
    },
  ],
  containers: [
    {
      name: "container1",
      image: "app/app1",
      tag: "1.0.0",
      imagepullpolicy: "IfNotPresent",
      readonly: true,
      dockerregistrysecret: ["dockerregistry"],
      probes: {
        liveness: {
          method: "exec",
          action: "cat /tmp/healthy",
        },
        readiness: {
          method: "http",
          path: "/",
          port: 8080,
          scheme: "https",
          initdelay: 5,
          period: 5,
          timeout: 5,
          success: 2,
          failure: 2,
        },
      },
      services: [
        {
          targetport: 3000,
          type: "NodePort",
          protocol: "TCP",
          ingress: {
            path: "/",
            host: "test.mondomain.local",
            annotations: {
              mytinydchaproxy_protocol: "https",
              mytinydchaproxy_balance: "roundrobin",
              mytinydchaproxy_internetexposed: true,
              mytinydchaproxy_finaltls: false,
              mytinydchaproxy_maxconnserver: 10,
              hostfromdata: "<%= service.ingress.host %>",
            },
          },
        },
      ],
    },
    {
      name: "container2",
      image: "app/app2",
      tag: "1.0.1",
      readonly: true,
      dockerregistrysecret: ["dockerregistry"],
      volumes: ["data", "temp"],
      probes: {
        readiness: {
          method: "http",
          path: "/healthy",
          port: 3000,
          initdelay: 3,
          period: 3,
          timeout: 5,
          success: 2,
          failure: 2,
        },
        startup: {
          method: "http",
          path: "/healthy",
          port: 3000,
          initdelay: 3,
          period: 3,
          timeout: 5,
          success: 2,
          failure: 2,
        },
        liveness: {
          method: "http",
          path: "/healthy",
          port: 3000,
          header: [{ name: "custom-Header", value: "awesome" }],
        },
      },
    },
  ],
};

// document the same and no ingress
const document1 = {
  namespace: "monnamespacetest",
  glusterfsipaddr: "192.168.10.25",
  global: {
    strategy: "Recreate",
    env: [
      "MONNAMESPACETEST__database__DB_TYPE=postgres",
      "MONNAMESPACETEST1__database__DB_TYPE=postgres",
    ],
    nodeaffinity: [{ key: "serialport", value: "yes" }],
    securitycontext: {
      runasuser: 1000,
      runasgroup: 1001,
      fsgroup: 1002,
    },
    persistentvolumes: [
      { name: "data", accessmode: "RWO", mount: "/data", capacity: "4Gi" },
      {
        name: "data1",
        accessmode: "ROX",
        mount: "/data1",
        capacity: "2Gi",
        useexistingglustervolume: "useanexistingglustervolume",
      },
    ],
    temporaryvolumes: [
      { name: "temp", mount: "/temp" },
      { name: "logs", mount: "/logs" },
    ],
    scale: { scalable: false, replicas: 1 },
  },
  secrets: [
    {
      name: "dockerregistry",
      registry: "myprivate.registry.local",
      value: "docker:docker",
    },
    {
      name: "dockerregistry1",
      registry: "myprivate1.registry.local",
      value: "docker:docker",
    },
  ],
  containers: [
    {
      name: "container1",
      image: "app/app1",
      tag: "1.0.0",
      imagepullpolicy: "IfNotPresent",
      readonly: true,
      dockerregistrysecret: ["dockerregistry"],
      probes: {
        readiness: {
          method: "exec",
          action: "cat /tmp/healthy",
          initdelay: 5,
          period: 5,
          timeout: 5,
          success: 2,
          failure: 2,
        },
        liveness: {
          method: "exec",
          action: "cat /tmp/healthy",
        },
      },
      services: [
        {
          targetport: 3000,
          type: "NodePort",
          protocol: "TCP",
        },
      ],
    },
    {
      name: "container2",
      image: "app/app2",
      tag: "1.0.1",
      readonly: true,
      dockerregistrysecret: ["dockerregistry"],
      volumes: ["data", "temp"],
      probes: {
        readiness: {
          method: "http",
          path: "/healthy",
          port: 3000,
          initdelay: 3,
          period: 3,
          timeout: 5,
          success: 2,
          failure: 2,
        },
        startup: {
          method: "http",
          path: "/healthy",
          port: 3000,
          initdelay: 3,
          period: 3,
          timeout: 5,
          success: 2,
          failure: 2,
        },
        liveness: {
          method: "http",
          path: "/healthy",
          port: 3000,
          header: [{ name: "custom-Header", value: "awesome" }],
        },
      },
    },
  ],
};
module.exports = { document, document1 };
