const fs = require("fs");

module.exports = {
  /**
   *
   * @param {boolean} displayalert
   * @param {any} message
   */
  displayError: (displayalert, message) => {
    if (displayalert) console.error(message);
  },
  /**
   * is item is value => true else parameter (-xxx) || empty false
   * @param {string} item
   * @returns {boolean}
   */
  checkassociatedvalue: (item) => {
    return !item.match(/^-/) && item.trim();
  },
  /**
   * Build Array key/value for parameters which must be followed by value (-i -o -e -tplcustomdir ...)
   * @param {array} cmdargs
   * @returns {object} Json
   */
  assocationInputOutput: (cmdargs, displayalert) => {
    const optswithmandatoryvalue = ["-i", "-o", "-tplcustomdir", "-e"];
    const yamlfileextenstion = ".yml";
    let jsonresponse = {};
    for (let opt of optswithmandatoryvalue) {
      const idx = cmdargs.indexOf(opt);
      if (idx > -1) {
        const nextvalue = cmdargs[idx + 1] || "";
        if (nextvalue && module.exports.checkassociatedvalue(nextvalue)) {
          jsonresponse[opt] = nextvalue;
        } else {
          module.exports.displayError(
            displayalert,
            `you have to provide value for the command line argument: ${cmdargs[idx]}`
          );
          return {};
        }
      }
      // sanitize ' && "
      if (jsonresponse[opt])
        jsonresponse[opt] = jsonresponse[opt].replace(/['"]/g, "");
      // extension for input & output wich is file
      if (
        jsonresponse[opt] &&
        ["-i", "-o"].includes(opt) &&
        !jsonresponse[opt].match(new RegExp(yamlfileextenstion + "$"))
      )
        jsonresponse[opt] += yamlfileextenstion;
    }
    return jsonresponse;
  },
  /**
   *
   * @param {boolean} displayalert
   * @returns {object} Json
   */
  getCommandLineArguments: (displayalert) => {
    let cmdargs = process.argv.slice(2);
    // input document file (application description) set with -i or env var
    const argswithmandatoryvalue = module.exports.assocationInputOutput(
      cmdargs,
      displayalert
    );
    // execution options
    const optionsexection = cmdargs.filter(
      (x) => x.match(/^-/) && !x.match(/^-([ioe]|tplcustomdir)/)
    );
    return {
      inputfile: argswithmandatoryvalue["-i"],
      outputfile: argswithmandatoryvalue["-o"],
      customtpldir: argswithmandatoryvalue["-tplcustomdir"],
      templatesexportdir: argswithmandatoryvalue["-e"],
      generationoptions: optionsexection,
    };
  },
  /**
   * get Yaml documents separator
   * @returns {string}
   */
  getYamlSeparatorDocument: () => {
    return "---\n";
  },
  /**
   * get default template fullpath
   * @returns {string}
   */
  getDefaultTemplatePath: () => {
    return `${__dirname}/../templates`;
  },
  /**
   * get available deployment stategies
   * @returns array
   */
  getAvailableStrategy: () => {
    return ["Recreate", "rollingUpdate"];
  },
};
