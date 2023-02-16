const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("globalStrategie - Recreate - OK ", async () => {
  expect(checkLib.globalStrategie(document, displayalert)).toBe(true);
});
test("globalStrategie - RollingUpdate - OK ", async () => {
  expect(
    checkLib.globalStrategie(
      {
        ...document,
        global: { strategy: "RollingUpdate" },
      },
      displayalert
    )
  ).toBe(true);
});
test("globalStrategie - xxxxx - KO ", async () => {
  expect(
    checkLib.globalStrategie(
      {
        ...document,
        global: { strategy: "xxxxx" },
      },
      displayalert
    )
  ).toBe(false);
});
