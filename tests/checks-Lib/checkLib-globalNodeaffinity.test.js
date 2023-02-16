const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("globalNodeaffinity - OK ", async () => {
  expect(checkLib.globalNodeaffinity(document)).toBe(true);
});
test("globalNodeaffinity - OK - document is empty", async () => {
  expect(checkLib.globalNodeaffinity({})).toBe(true);
});
test("globalNodeaffinity - OK - global is empty", async () => {
  expect(checkLib.globalNodeaffinity({ global: {} })).toBe(true);
});
test("globalNodeaffinity - OK - global.nodeaffinity is empty", async () => {
  expect(checkLib.globalNodeaffinity({ global: { nodeaffinity: [] } })).toBe(
    true
  );
});
test("globalNodeaffinity - KO - global.nodeaffinity is string ", async () => {
  expect(
    checkLib.globalNodeaffinity(
      { global: { nodeaffinity: "string" } },
      displayalert
    )
  ).toBe(false);
});
test("globalNodeaffinity - KO - one item of nodeaffinity has attr value : empty ", async () => {
  expect(
    checkLib.globalNodeaffinity(
      {
        global: { nodeaffinity: [{ key: "key", value: "" }] },
      },
      displayalert
    )
  ).toBe(false);
});
test("globalNodeaffinity - KO - one item of nodeaffinity has key attr : unset ", async () => {
  expect(
    checkLib.globalNodeaffinity(
      {
        global: { nodeaffinity: [{ value: "value" }] },
      },
      displayalert
    )
  ).toBe(false);
});
test("globalNodeaffinity - KO - one item of nodeaffinity has key attr is empty", async () => {
  expect(
    checkLib.globalNodeaffinity(
      {
        global: { nodeaffinity: [{ key: "", value: "value" }] },
      },
      displayalert
    )
  ).toBe(false);
});
test("globalNodeaffinity - KO - one item of nodeaffinity has value attr value : empty ", async () => {
  expect(
    checkLib.globalNodeaffinity(
      {
        global: { nodeaffinity: [{ key: "key" }] },
      },
      displayalert
    )
  ).toBe(false);
});
