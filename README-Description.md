## Attributs de la description d'un projet

Pour comprendre le fonctionnement de génération, analyser les templates : /templates/*

```yaml
namespace: (string) Namespace du projet (voir https://kubernetes.io/fr/docs/concepts/overview/working-with-objects/namespaces/)
glusterfsipaddr: (string) Addresse IP du serveur GlusterFs provisionné manuellement (spécifique Mytinydc)
secrets: (array) (voir https://kubernetes.io/docs/concepts/configuration/secret/)
  - name: "dockerregistry"
    registry: "docker.private.local" (registry : hostname de la registry docker, indique qu'il s'agit d'un secret d'accès à une registry)
    value: "login:password" (clé:valeur)

global: (object) paramètres globaux de l'application
  revision: (integer) revisionHistoryLimit (voir https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#clean-up-policy)
  strategy: (string) stratégie de déploiement (voir https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy) 
  env: (Array) Variable d'environnement pour les containers (voir https://kubernetes.io/docs/concepts/containers/container-environment/)
    - "PGUSER=postgreslogin"
    - "PGHOST=database.postgres.server.local"
    - "PGPASSWORD=password"
    - "PGDATABASE=databasename"
    - "PGPORT=5432"
    - "APPLICATION_RUNNINGMODE=production"
    - "APPLICATION_SESSIONSECRET=xxxxx"
    # Le container doit sortir et utilisera le proxy central, la valeur de la clé dépend surtout du langage de programmation.
    - "http_proxy=http://mycorporateproxy.local:3128"
    - "https_proxy=http://mycorporateproxy.local:3128"
  persistentvolumes: (array) voir https://kubernetes.io/docs/concepts/storage/persistent-volumes/
    - name: "files"
      capacity: "80Gi"
      access: "RWO"
      mount: "/tracks"
      useexistingglustervolume: "glustervolumesfiles" (spécifique à mon cas, certaines application font appel a des volumes gluster déjà existants)
    - name: "resourcesobjects"
      capacity: "1Gi"
      access: "RWO"
      mount: "/resourcesobjects"
  temporaryvolumes: (array) Volumes créé sur le noeud d'éxécution (emptyDir : voir https://kubernetes.io/docs/concepts/storage/volumes/#emptydir)
    - name: "temp"
      mount: "/tmpfileupload"
    - name: "logs"
      mount: "/applicationlogs"
  nodeaffinity: (array) voir https://kubernetes.io/docs/tasks/configure-pod-container/assign-pods-nodes-using-node-affinity/
    - key: "serialport"
      value: "yes"
  limitrange: (object) voir https://kubernetes.io/docs/concepts/policy/limit-range/
    max:
      cpu: "500m"
      memory: "150Mi"
    request:
      cpu: "100m"
      memory: "50Mi"
  securitycontext: (object) voir https://kubernetes.io/docs/tasks/configure-pod-container/security-context/
    runasuser: 21000
    runasgroup: 21000
    fsgroup: 21000
  scale: (object) description arbitraire de la mise à l'échelle, voir https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#creating-a-deployment et https://kubernetes.io/fr/docs/concepts/workloads/controllers/replicaset/
    scalable: false
    replicas: 1
containers: (array) voir https://kubernetes.io/fr/docs/concepts/workloads/controllers/deployment/ et https://kubernetes.io/docs/concepts/containers/
  - name: "monpremiercontainer"
    image: "docker.private.local/exemplemonpremiercontainer"
    dockerregistrysecret: (array) secrets à utiliser pour s'authentifier auprès de la registry
      - "dockerregistry"
    tag: "beta"
    readonly: true (le container sera utilisé en read-only)
    probes: (object) voir https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
      readiness:
        method: "http"
        path: "/api/healthz"
        port: 3115
        initdelay: 3
        period: 2
        timeout: 3
      startup:
        method: "http"
        path: "/api/healthz"
        port: 3115
        initdelay: 3
        period: 120
        timeout: 3
      liveness:
        method: "http"
        path: "/api/healthz"
        port: 3115
        initdelay: 3
        period: 120
        timeout: 3
    services: (array) voir https://kubernetes.io/docs/concepts/services-networking/service/
      - targetport: 3115
        ingress: (object) voir https://kubernetes.io/fr/docs/concepts/services-networking/ingress/
          host: "monservice.music.local"
          path: "/"
          # Annotations (type "object") sont spécifié par votre controller ingress (voir la documentation de votre controller ingress)
          # si la valeur d'un attribut est une valeur de ce document indiquer sa valeur en respectant la syntaxe object xxx.xxx....
          annotations:
            mytinydchaproxy_protocol: "https"
            # ex : j'utilise la valeur service.ingress.host dans l'attribut : mytinydchaproxy_host
            # à ce niveau il s'agit d'une array, et chaque item de cette array est attribué à l'attribut service du schéma de données (dans ce cas précis)
            # Il s'agit ici me montrer les possibilté du process, vous pouvez tout simplement copier la valeur de cette attribut directement :
            # mytinydchaproxy_host: "monservice.music.local" services : [{host:"monservice.music.local"...}].
            mytinydchaproxy_host: "<%= service.ingress.host %>"
            mytinydchaproxy_balance: "roundrobin"
            mytinydchaproxy_internetexposed: true
            mytinydchaproxy_finaltls: false
            mytinydchaproxy_maxconnserver: 10
```