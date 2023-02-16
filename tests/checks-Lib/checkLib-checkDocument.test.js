const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("checkDocument - OK ", async () => {
  expect(checkLib.checkDocument(document, displayalert)).toBe(true);
});

test("checkDocument - KO - namespace not provided ", async () => {
  expect(checkLib.checkDocument({}, displayalert)).toBe(false);
});

test("checkDocument - KO - secret type is object", async () => {
  expect(
    checkLib.checkDocument({ namespace: "xxx", secrets: {} }, displayalert)
  ).toBe(false);
});

test("checkDocument - KO - global.env - item malformed - test", async () => {
  expect(
    checkLib.checkDocument(
      { namespace: "xxx", global: { env: ["test"] } },
      displayalert
    )
  ).toBe(false);
});

test("checkDocument - KO - securitycontext is not object", async () => {
  expect(
    checkLib.checkDocument(
      { namespace: "xxx", global: { securitycontext: "xx" } },
      displayalert
    )
  ).toBe(false);
});

test("checkDocument - KO - global.nodeaffinity is string", async () => {
  expect(
    checkLib.checkDocument(
      { namespace: "xxx", global: { nodeaffinity: "string" } },
      displayalert
    )
  ).toBe(false);
});

test("checkDocument - KO - persistentvolumes not array", async () => {
  expect(
    checkLib.checkDocument(
      { namespace: "xxx", global: { persistentvolumes: "xxx" } },
      displayalert
    )
  ).toBe(false);
});

test("checkDocument - KO - temporaryvolumes not array", async () => {
  expect(
    checkLib.checkDocument(
      { namespace: "xxx", global: { temporaryvolumes: "xxx" } },
      displayalert
    )
  ).toBe(false);
});

test("checkDocument - KO - global.scale.replicas is not number - 'xxxx'", async () => {
  expect(
    checkLib.checkDocument(
      { namespace: "xxx", global: { scale: { replicas: "xxx" } } },
      displayalert
    )
  ).toBe(false);
});

test("checkDocument - KO - secrets not provided - needed for container/registry", async () => {
  expect(
    checkLib.checkDocument({ ...document, secrets: [] }, displayalert)
  ).toBe(false);
});
