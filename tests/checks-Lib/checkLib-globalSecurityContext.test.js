const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("globalSecurityContext - OK - with contants", async () => {
  expect(checkLib.globalSecurityContext(document)).toBe(true);
});
test("globalSecurityContext - OK - document empty", async () => {
  expect(checkLib.globalSecurityContext({})).toBe(true);
});
test("globalSecurityContext - OK - global empty", async () => {
  expect(checkLib.globalSecurityContext({ global: {} })).toBe(true);
});
test("globalSecurityContext - OK - global.securitycontext empty ", async () => {
  expect(
    checkLib.globalSecurityContext({ global: { securitycontext: {} } })
  ).toBe(true);
});
test("globalSecurityContext - KO - securitycontext is not object ", async () => {
  expect(
    checkLib.globalSecurityContext(
      { global: { securitycontext: "xx" } },
      displayalert
    )
  ).toBe(false);
});
test("globalSecurityContext - KO - securitycontext.runasuser is not number", async () => {
  expect(
    checkLib.globalSecurityContext(
      {
        global: {
          securitycontext: {
            runasuser: "1000",
            runasgroup: 1000,
            fsgroup: 1000,
          },
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("globalSecurityContext - KO - securitycontext.runasgroup is not number", async () => {
  expect(
    checkLib.globalSecurityContext(
      {
        global: {
          securitycontext: {
            runasuser: 1000,
            runasgroup: "1000",
            fsgroup: 1000,
          },
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("globalSecurityContext - KO - securitycontext.fsgroup is not number", async () => {
  expect(
    checkLib.globalSecurityContext(
      {
        global: {
          securitycontext: {
            runasuser: 1000,
            runasgroup: 1000,
            fsgroup: "1000",
          },
        },
      },
      displayalert
    )
  ).toBe(false);
});
