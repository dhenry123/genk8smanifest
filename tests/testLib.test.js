const testLib = require("./testLib");
const fs = require("fs");

const manifest = "test";
test("setManifestFile - KO ", async () => {
  expect(testLib.setManifestFile(manifest)).not.toBeNull();
});

test("saveDocument - getExpectedResultContent - KO ", async () => {
  const value = "xxxx";
  if (fs.existsSync(testLib.setManifestFile(manifest)))
    fs.unlinkSync(testLib.setManifestFile(manifest));
  testLib.saveDocument(value, manifest);
  expect(fs.existsSync(testLib.setManifestFile(manifest))).toBe(true);
  const result = testLib.getExpectedResultContent(manifest);
  expect(testLib.compareExpectedResult(manifest, result)).toBe(true);
  fs.unlinkSync(testLib.setManifestFile(manifest));
});
