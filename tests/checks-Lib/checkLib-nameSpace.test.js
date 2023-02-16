const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("nameSpace - OK ", async () => {
  expect(checkLib.nameSpace(document, displayalert)).toBe(true);
});
test("nameSpace - KO - no namespace (mandatory) ", async () => {
  expect(checkLib.nameSpace({}, displayalert)).toBe(false);
});
test("nameSpace - KO - namespace must be string", async () => {
  expect(checkLib.nameSpace({ namespace: 123 }, displayalert)).toBe(false);
});
test("nameSpace - KO - namespace must be string", async () => {
  expect(checkLib.nameSpace({ namespace: [] }, displayalert)).toBe(false);
});
test("nameSpace - KO - namespace must be string", async () => {
  expect(checkLib.nameSpace({ namespace: {} }, displayalert)).toBe(false);
});
