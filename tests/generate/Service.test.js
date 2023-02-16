const genLib = require("../../lib/genLib");
const YAML = require("yaml");
const testLib = require("../testLib");
const { document } = require("../constants");

const manifest = "Service";

test(`${manifest} - OK - `, async () => {
  await genLib
    .genService(document, { generationoptions: [] })
    .then((result) => {
      // !!!you ve changed specifications, so you must generate the final Manifest and check that content is ok on kubernets cluster
      // testLib.saveDocument(result, manifest);
      YAML.parseAllDocuments(result);
      // compare to expected result
      expect(testLib.compareExpectedResult(manifest, result)).toBe(true);
    })
    .catch((error) => {
      console.error(error.toString(), error.stack);
      expect(true).toBe(false);
    });
});
