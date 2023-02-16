const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("globalEnv - OK ", async () => {
  expect(checkLib.globalEnv(document)).toBe(true);
});
test("globalEnv - OK - global.env is empty ", async () => {
  expect(checkLib.globalEnv({})).toBe(true);
});
test("globalEnv - OK - global.env is empty ", async () => {
  expect(checkLib.globalEnv({ global: {} })).toBe(true);
});
test("globalEnv - OK - global.env is empty ", async () => {
  expect(checkLib.globalEnv({ global: { env: null } })).toBe(true);
});
test("globalEnv - OK - global.env is empty ", async () => {
  expect(checkLib.globalEnv({ global: { env: [] } })).toBe(true);
});
test("globalEnv - KO - global.env is string ", async () => {
  expect(checkLib.globalEnv({ global: { env: "null" } }, displayalert)).toBe(
    false
  );
});
test("globalEnv - KO - global.env - item malformed - test", async () => {
  expect(checkLib.globalEnv({ global: { env: ["test"] } }, displayalert)).toBe(
    false
  );
});
test("globalEnv - KO - global.env - item malformed- test=1=1", async () => {
  expect(
    checkLib.globalEnv({ global: { env: ["test=1=1"] } }, displayalert)
  ).toBe(false);
});
test("globalEnv - KO - global.env - item malformed- 1", async () => {
  expect(checkLib.globalEnv({ global: { env: [1] } }, displayalert)).toBe(
    false
  );
});
test("globalEnv - KO - global.env - item malformed - {}", async () => {
  expect(checkLib.globalEnv({ global: { env: [{}] } }, displayalert)).toBe(
    false
  );
});
