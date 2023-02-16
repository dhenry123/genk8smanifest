const checkLib = require("../../lib/checkLib");
const { document } = require("../constants");
const displayalert = false;

test("containers - OK ", async () => {
  expect(checkLib.containers(document, displayalert)).toBe(true);
});

test("containers - OK - container dont need secret for registry ", async () => {
  expect(
    checkLib.containers({
      containers: [
        {
          name: "container1",
          image: "app/app1",
          tag: "1.0.0",
          imagepullpolicy: "IfNotPresent",
          readonly: true,
          services: [{ targetport: 3000 }],
        },
      ],
    })
  ).toBe(true);
});
test("containers - KO - secrets not provided - needed for registry", async () => {
  expect(checkLib.containers({ ...document, secrets: [] }, displayalert)).toBe(
    false
  );
});
test("containers - KO - container need name", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            image: "app/app1",
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});
test("containers - KO - container need name - provided empty", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "",
            image: "app/app1",
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});

test("containers - KO - container need image", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "app/app1",
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});

test("containers - KO - container need image - provided empty", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "app/app1",
            image: "",
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});

test("containers - KO - services targetport is not number", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "container1",
            image: "app/app1",
            services: [{ targetport: "3000" }],
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});

// probes
test("containers - KO - container with probe readiness action no set", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "container1",
            image: "app/app1",
            tag: "1.0.0",
            probes: {
              readiness: [],
            },
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});

test("containers - KO - container with probe readiness method not supported", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "container1",
            image: "app/app1",
            tag: "1.0.0",
            probes: {
              readiness: {
                method: "execute",
                action: "cat /tmp/healthy",
                initdelay: 5,
                period: 5,
                timeout: 5,
                success: 2,
                failure: 2,
              },
            },
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});

test("containers - KO - container with probe readiness number value as string", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "container1",
            image: "app/app1",
            tag: "1.0.0",
            probes: {
              readiness: {
                method: "exec",
                action: "cat /tmp/healthy",
                initdelay: "5",
                period: 5,
                timeout: 5,
                success: 2,
                failure: 2,
              },
            },
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});

test("containers - KO - container with probe liveness action no set", async () => {
  expect(
    checkLib.containers(
      {
        containers: [
          {
            name: "container1",
            image: "app/app1",
            tag: "1.0.0",
            probes: {
              liveness: [],
            },
          },
        ],
      },
      displayalert
    )
  ).toBe(false);
});
