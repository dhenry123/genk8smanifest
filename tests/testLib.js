const fs = require("fs");
module.exports = {
  /**
   * get uniform filename
   * @param {string} manifestype
   * @returns {string}
   */
  setManifestFile: (manifestype) => {
    return __dirname + "/expected-manifests/" + manifestype + ".manifest";
  },
  /**
   * save content to document
   * @param {string} data
   * @param {string} manifestype
   * @returns {string}
   */
  saveDocument: (data, manifestype) => {
    fs.writeFileSync(
      module.exports.setManifestFile(manifestype),
      data,
      "utf-8"
    );
  },
  /**
   * get content from document
   * @param {string} manifestype
   * @returns {string}
   */
  getExpectedResultContent: (manifestype) => {
    return fs.readFileSync(
      module.exports.setManifestFile(manifestype),
      "utf-8"
    );
  },
  /**
   *
   * @param {string} filepath
   * @returns {string}
   */
  getFileContent: (filepath) => {
    if (fs.existsSync(filepath)) return fs.readFileSync(filepath, "utf-8");
  },
  /**
   * compare content
   * @param {string} manifestype
   * @param {string} resulttocompare
   * @returns {boolean}
   */
  compareExpectedResult: (manifestype, resulttocompare) => {
    return (
      (resulttocompare ? resulttocompare.trim() : "") ===
      module.exports.getExpectedResultContent(manifestype).trim()
    );
  },
};
