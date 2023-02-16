const checkLib = require("../../lib/checkLib");
const testLib = require("../testLib");

test("checkLib.checkInputYamlSyntaxAndGetDocument - OK -Yaml wellmalformed ", async () => {
  const document = testLib.getFileContent(
    __dirname + "/../constants-OneDocument.yml"
  );
  expect(typeof checkLib.checkInputYamlSyntaxAndGetDocument(document)).toEqual(
    "object"
  );
});

test("checkLib.checkInputYamlSyntaxAndGetDocument - KO - Yaml malformed ", async () => {
  try {
    const document =
      testLib.getFileContent(__dirname + "/../constants-OneDocument.yml") +
      "\nxxxxx:\nxxxxxx";
    checkLib.checkInputYamlSyntaxAndGetDocument(document);
    // this call must throw an error, yaml document is malformed - to be sure this test must be wrong force unexpected if no error thrown
    expect(true).toBe(false);
  } catch (error) {
    expect(error.message).toMatch(/YAMLParseError/);
  }
});

test("checkLib.checkK8sManifestYamlSyntaxAndGetDocuments - OK - Yaml wellformed ", async () => {
  const document = testLib.getFileContent(
    __dirname + "/../constants-MultiDocuments.yml"
  );
  expect(
    typeof checkLib.checkK8sManifestYamlSyntaxAndGetDocuments(document)
  ).toEqual("object");
});

test("checkLib.checkK8sManifestYamlSyntaxAndGetDocuments - K0 - Yaml malformed ", async () => {
  try {
    const document =
      testLib.getFileContent(__dirname + "/../constants-MultiDocuments.yml") +
      "\nxxxxx:\nxxxxxx";
    checkLib.checkK8sManifestYamlSyntaxAndGetDocuments(document);
    // this call must throw an error, yaml document is malformed - to be sure this test must be wrong force unexpected if no error thrown
    expect(true).toBe(false);
  } catch (error) {
    expect(error.message).toMatch(/YAMLParseError/);
  }
});
