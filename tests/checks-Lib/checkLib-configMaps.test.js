const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("configmaps - OK ", async () => {
  expect(checkLib.configMaps(document)).toBe(true);
});

test("configmaps - KO - The file mentioned in a configmap (srcpath) does not exist, the file must exist and contain values", async () => {
  expect(
    checkLib.configMaps(
      {
        global: {
          configmaps: [
            {
              name: "local-settings-py",
              mount: "/opt/healthchecks/hc/local-settings.py",
              srctype: "file",
              srcpath: "tests/local_settingsxxxxx.py",
            },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});

test("configmaps - KO - configmaps is not array ", async () => {
  expect(
    checkLib.configMaps({ global: { configmaps: {} } }, displayalert)
  ).toBe(false);
});

test("configmaps - KO - containers is not array", async () => {
  expect(
    checkLib.configMaps({ global: { configmaps: {} } }, displayalert)
  ).toBe(false);
  expect(
    checkLib.configMaps({ global: { configmaps: "" } }, displayalert)
  ).toBe(false);
  expect(checkLib.configMaps({ global: { configmaps: 1 } }, displayalert)).toBe(
    false
  );
});

test("configmaps - KO - one container has srctype=file and srcpath is missing", async () => {
  expect(
    checkLib.configMaps(
      {
        global: {
          configmaps: [
            {
              name: "local-settings-py",
              mount: "/opt/healthchecks/hc/local-settings.py",
              srctype: "file",
            },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});

test("configmaps - KO - one container has srctype=file and mount is missing", async () => {
  expect(
    checkLib.configMaps(
      {
        global: {
          configmaps: [
            {
              name: "local-settings-py",
              srctype: "file",
              srcpath: "resources/local_settings.py",
            },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});
