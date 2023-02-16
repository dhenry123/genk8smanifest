const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("persistentVolumes - OK ", async () => {
  expect(checkLib.persistentVolumes(document)).toBe(true);
});
test("persistentVolumes - OK - document is empty ", async () => {
  expect(checkLib.persistentVolumes({ global: {} })).toBe(true);
});
test("persistentVolumes - OK - persistentvolumes not set ", async () => {
  expect(
    checkLib.persistentVolumes(
      { global: { persistentvolumes: null } },
      displayalert
    )
  ).toBe(true);
});
test("persistentVolumes - OK - persistentvolumes empty array ", async () => {
  expect(
    checkLib.persistentVolumes(
      { global: { persistentvolumes: [] } },
      displayalert
    )
  ).toBe(true);
});
test("persistentVolumes - KO - persistentvolumes not array ", async () => {
  expect(
    checkLib.persistentVolumes(
      { global: { persistentvolumes: "xxx" } },
      displayalert
    )
  ).toBe(false);
});
test("persistentVolumes - KO - persistentvolumes item has not name attr ", async () => {
  expect(
    checkLib.persistentVolumes(
      {
        global: {
          persistentvolumes: [
            { accessmode: "RWO", mount: "/data", capacity: "4Gi" },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("persistentVolumes - KO - persistentvolumes item has a mandatory attr value empty", async () => {
  expect(
    checkLib.persistentVolumes(
      {
        global: {
          persistentvolumes: [
            { name: "", accessmode: "RWO", mount: "/data", capacity: "4Gi" },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("persistentVolumes - KO - persistentvolumes item has an other mandatory attr value empty (mount)", async () => {
  expect(
    checkLib.persistentVolumes(
      {
        global: {
          persistentvolumes: [
            { name: "data", accessmode: "RWO", mount: "", capacity: "4Gi" },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("persistentVolumes - KO - persistentvolumes item has an other mandatory attr not set (mount)", async () => {
  expect(
    checkLib.persistentVolumes(
      {
        global: {
          persistentvolumes: [
            { name: "data", accessmode: "RWO", capacity: "4Gi" },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});
test("persistentVolumes - KO - application is scalable and volume accessmode is <> RMW", async () => {
  expect(
    checkLib.persistentVolumes(
      {
        global: {
          persistentvolumes: [
            {
              name: "data",
              accessmode: "RWO",
              capacity: "4Gi",
              mount: "/test",
            },
          ],
          scale: { scalable: true },
        },
      },
      displayalert
    )
  ).toBe(false);
});
