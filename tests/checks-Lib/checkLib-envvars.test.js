const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("envvars - OK - with correct data ", async () => {
  expect(
    checkLib.envvars(document.global.env, "global.env", displayalert)
  ).toBe(true);
});

test("envvars - K0 - value is not key=value ", async () => {
  expect(checkLib.envvars(["test"], "global.env", displayalert)).toBe(false);
});
