const helperGenLib = require("../../lib/helperGenLib");

test("convertSecurityContextKeyToKubernetes - OK  ", async () => {
  expect(
    helperGenLib.convertSecurityContextKeyToKubernetes("runasuser")
  ).toEqual("runAsUser");
  expect(
    helperGenLib.convertSecurityContextKeyToKubernetes("runasgroup")
  ).toEqual("runAsGroup");
  expect(helperGenLib.convertSecurityContextKeyToKubernetes("fsgroup")).toEqual(
    "fsGroup"
  );
  expect(
    helperGenLib.convertSecurityContextKeyToKubernetes("commentinjson")
  ).toBeNull();
});

test("setEnvVarAsObject - OK  ", async () => {
  expect(helperGenLib.setEnvVarAsObject("runasuser=1")).toEqual({
    key: "runasuser",
    value: "1",
  });
  expect(helperGenLib.setEnvVarAsObject("runasuser='1'")).toEqual({
    key: "runasuser",
    value: "'1'",
  });
  expect(helperGenLib.setEnvVarAsObject("runasuser")).toEqual({
    key: "runasuser",
    value: "",
  });
});
