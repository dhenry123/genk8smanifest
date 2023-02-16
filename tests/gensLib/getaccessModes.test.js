const helperGenLib = require("../../lib/helperGenLib");

test("getaccessModes.test - full", async () => {
  expect(helperGenLib.getaccessModes("RWO")).toEqual("ReadWriteOnce");
  expect(helperGenLib.getaccessModes("ROX")).toEqual("ReadOnlyMany");
  expect(helperGenLib.getaccessModes("RWX")).toEqual("ReadWriteMany");
  expect(helperGenLib.getaccessModes("RWOP")).toEqual("ReadWriteOncePod");
  // default
  expect(helperGenLib.getaccessModes("RWOWW")).toEqual("ReadWriteOnce");
  expect(helperGenLib.getaccessModes("")).toEqual("ReadWriteOnce");
  expect(helperGenLib.getaccessModes("", { scalable: true })).toEqual(
    "ReadWriteMany"
  );
});
