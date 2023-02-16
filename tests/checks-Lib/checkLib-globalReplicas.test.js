const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("globalReplicas - OK ", async () => {
  expect(checkLib.globalReplicas(document)).toBe(true);
});
test("globalReplicas - OK - document is empty", async () => {
  expect(checkLib.globalReplicas({})).toBe(true);
});

test("globalReplicas - KO - global.scale.replicas is not number - 'xxxx'", async () => {
  expect(
    checkLib.globalReplicas(
      { global: { scale: { replicas: "xxx" } } },
      displayalert
    )
  ).toBe(false);
});
test("globalReplicas - KO - global.scale.replicas is not number - {}", async () => {
  expect(
    checkLib.globalReplicas(
      { global: { scale: { replicas: {} } } },
      displayalert
    )
  ).toBe(false);
});
test("globalReplicas - KO - global.scale.replicas is not number - []", async () => {
  expect(
    checkLib.globalReplicas(
      { global: { scale: { replicas: [] } } },
      displayalert
    )
  ).toBe(false);
});
test("globalReplicas - KO - global.scale.replicas > 1 and global.scale.scalable = false", async () => {
  expect(
    checkLib.globalReplicas(
      { global: { scale: { scalable: false, replicas: 2 } } },
      displayalert
    )
  ).toBe(false);
});
