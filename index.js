const genLib = require("./lib/genLib");
const checkLib = require("./lib/checkLib");
const mainLib = require("./lib/mainLib");
const fs = require("fs");

const productname = "GenK8sManifest [@mytinydc.com]";
const version = "v0.1.0-beta.7";

/**
 * sync main process
 */
(async () => {
  try {
    // Nodejs 16 min is require
    const t0 = performance.now();

    // create init description file
    if (process.argv.includes("-init")) {
      genLib.buildDecriptionInit();
      process.exit(0);
    }
    // display Version & exit
    if (process.argv.includes("-v")) {
      console.info(`${productname} - Version: ${version}`);
      process.exit(0);
    }
    // get command line arguments
    const cmdarguments = mainLib.getCommandLineArguments(true);

    // extract default templates (prior)
    if (process.argv.includes("-e")) {
      if (cmdarguments.templatesexportdir) {
        if (!genLib.extractDefaultTemplates(cmdarguments.templatesexportdir))
          process.exit(1);
      }
      process.exit(0);
    }

    // check input file
    checkLib.checkInputFile(cmdarguments);

    // description file is YAML
    const inputfilecontent = fs.readFileSync(cmdarguments.inputfile, "utf8");

    // check input file yaml syntax & get content as JSON
    const document = checkLib.getInputYamlAsJson(inputfilecontent, true);

    // is document non empty
    checkLib.isDocumentEmpty(document);

    // Check input description file
    if (!checkLib.checkDocument(document, true)) process.exit(1);

    // generate manifest
    let yamldocument = [];

    // Namespace
    await genLib
      .genNameSpace(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Secrets
    await genLib
      .genSecrets(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Glusterfs Persistent volumes Endpoint
    await genLib
      .genGlusterFsStorageEndPoint(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Persistent volumes
    await genLib
      .genPersitentVolume(document, false, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Persistent volumes claim
    await genLib
      .genPersitentVolume(document, true, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Persistent volumes claim
    await genLib
      .genConfigMaps(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // LimitRanges
    await genLib
      .genLimitRange(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Deployment
    await genLib
      .genDeployment(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Service - including ingress if specified in description
    await genLib
      .genService(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Cronjob
    await genLib
      .genCronJob(document, cmdarguments)
      .then((result) => {
        yamldocument.push(result);
      })
      .catch((error) => {
        throw error;
      });

    // Genération du Manifest K8s
    let manifestK8s = "";
    // If non empty
    if (yamldocument.length > 0) {
      //test final document
      manifestK8s = yamldocument.filter((x) => x !== null).join("\n");
    } else {
      // empty
      console.error("[ERROR] something went wrong, the manifest is empty");
      process.exit(2);
    }

    // check manifest yaml syntax
    checkLib.checkK8sManifestYamlSyntaxAndGetDocuments(manifestK8s);

    // What's the output option ? (screen | file)
    if (cmdarguments.outputfile) {
      fs.writeFileSync(cmdarguments.outputfile, manifestK8s, "utf-8");
      console.info(`Manifest was well written to ${cmdarguments.outputfile}`);
    } else {
      // default output is STDERR
      console.info(manifestK8s);
    }

    // End display infos
    genLib.showProcessInfos(t0, cmdarguments);
  } catch (error) {
    console.error(error.toString(), error.stack);
  }
})();
