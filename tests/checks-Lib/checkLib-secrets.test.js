const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("secrets - OK - with correct data ", async () => {
  expect(checkLib.secrets(document, displayalert)).toBe(true);
});
test("secrets - OK - secrets is null", async () => {
  expect(checkLib.secrets({ secrets: null }, displayalert)).toBe(true);
});
test("secrets - OK - secrets empty", async () => {
  expect(checkLib.secrets({ secrets: [] }, displayalert)).toBe(true);
});
test("secrets - OK - document empty", async () => {
  expect(checkLib.secrets({}, displayalert)).toBe(true);
});
test("secrets - KO - secret type is object", async () => {
  expect(checkLib.secrets({ secrets: {} }, displayalert)).toBe(false);
});
test("secrets - KO - secret type is string ", async () => {
  expect(checkLib.secrets({ secrets: "test" }, displayalert)).toBe(false);
});
test("secrets - KO - secrets - item : name is missing", async () => {
  expect(checkLib.secrets({ secrets: [{ value: "xxx" }] }, displayalert)).toBe(
    false
  );
});
test("secrets - KO - secrets - item : value is missing", async () => {
  expect(checkLib.secrets({ secrets: [{ name: "xxx" }] }, displayalert)).toBe(
    false
  );
});
test("secrets - KO - secrets - secret is not unique", async () => {
  expect(
    checkLib.secrets(
      {
        secrets: [
          { name: "xxx", value: "xxxx" },
          { name: "xxx", value: "xxxx" },
        ],
      },
      displayalert
    )
  ).toBe(false);
});
