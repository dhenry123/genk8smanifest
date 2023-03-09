const helperGenLib = require("../../lib/helperGenLib");

test("convertSecurityContextKeyToKubernetes - OK - getTemplate relative path ", async () => {
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
