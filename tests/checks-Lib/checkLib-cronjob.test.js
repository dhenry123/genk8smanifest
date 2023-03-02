const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("cronJob - OK ", async () => {
  expect(checkLib.cronJob(document, displayalert)).toBe(true);
});

test("cronJob - OK - no cronjob", async () => {
  expect(checkLib.cronJob({}, displayalert)).toBe(true);
  expect(checkLib.cronJob({ global: {} }, displayalert)).toBe(true);
  expect(checkLib.cronJob({ global: { cronjob: null } }, displayalert)).toBe(
    true
  );
  expect(checkLib.cronJob({ global: { cronjob: [] } }, displayalert)).toBe(
    true
  );
  // je check par if global.cronjob ici vide donc true
  expect(checkLib.cronJob({ global: { cronjob: "" } }, displayalert)).toBe(
    true
  );
});

test("cronJob - OK - wrong type", async () => {
  expect(checkLib.cronJob({ global: { cronjob: "xxx" } }, displayalert)).toBe(
    false
  );
  expect(checkLib.cronJob({ global: { cronjob: 2 } }, displayalert)).toBe(
    false
  );
  expect(checkLib.cronJob({ global: { cronjob: {} } }, displayalert)).toBe(
    false
  );
});

test("cronJob - OK - type for cronjob not provided", async () => {
  expect(
    checkLib.cronJob(
      {
        global: {
          cronjob: [
            {
              name: "backgroundjob",
              url: "https://server/api/v1/cron",
              cron: "0 0,6,12,18 * * *",
            },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});

test("cronJob - OK - name for cronjob not provided", async () => {
  expect(
    checkLib.cronJob(
      {
        global: {
          cronjob: [
            {
              type: "curl",
              // name: "backgroundjob",
              url: "https://server/api/v1/cron",
              cron: "0 0,6,12,18 * * *",
            },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});

test("cronJob - OK - url for cronjob not provided", async () => {
  expect(
    checkLib.cronJob(
      {
        global: {
          cronjob: [
            {
              type: "curl",
              name: "backgroundjob",
              //url: "https://server/api/v1/cron",
              cron: "0 0,6,12,18 * * *",
            },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});

test("cronJob - OK - cron for cronjob not provided", async () => {
  expect(
    checkLib.cronJob(
      {
        global: {
          cronjob: [
            {
              type: "curl",
              name: "backgroundjob",
              url: "https://server/api/v1/cron",
              //cron: "0 0,6,12,18 * * *",
            },
          ],
        },
      },
      displayalert
    )
  ).toBe(false);
});
