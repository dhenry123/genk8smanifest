const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("temporayVolumes - OK ", async () => {
  expect(checkLib.temporayVolumes(document)).toBe(true);
});
test("temporayVolumes - OK - document is empty ", async () => {
  expect(checkLib.temporayVolumes({ global: {} })).toBe(true);
});
test("temporayVolumes - OK - temporaryvolumes not set ", async () => {
  expect(checkLib.temporayVolumes({ global: { temporaryvolumes: null } })).toBe(
    true
  );
});
test("temporayVolumes - OK - temporaryvolumes is empty array ", async () => {
  expect(checkLib.temporayVolumes({ global: { temporaryvolumes: [] } })).toBe(
    true
  );
});
test("temporayVolumes - KO - temporaryvolumes not array ", async () => {
  expect(
    checkLib.temporayVolumes(
      { global: { temporaryvolumes: "xxx" } },
      displayalert
    )
  ).toBe(false);
});
test("temporayVolumes - KO - temporaryvolumes item has not name attr ", async () => {
  expect(
    checkLib.temporayVolumes(
      {
        global: {
          temporaryvolumes: [{ mount: "/temp" }],
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("temporayVolumes - KO - temporaryvolumes item has name attr empty", async () => {
  expect(
    checkLib.temporayVolumes(
      {
        global: {
          temporaryvolumes: [{ name: "", mount: "/temp" }],
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("temporayVolumes - KO - temporaryvolumes item not start with / ", async () => {
  expect(
    checkLib.temporayVolumes(
      { global: { temporaryvolumes: [{ name: "xxx", mount: "xxxx" }] } },
      displayalert
    )
  ).toBe(false);
});
