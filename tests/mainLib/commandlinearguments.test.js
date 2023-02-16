const mainLib = require("../../lib/mainLib");
const displayalert = false;

const yamlext = ".yml";

test("mainLib.assocationInputOutput - OK - Command line arguments - -i -o -tplcustomdir -e must be followed by value (mandatory) ", async () => {
  const args = [
    "-i",
    "input",
    "-o",
    "output",
    "-tplcustomdir",
    "test",
    "-e",
    "test1",
  ];
  const optswithmandatoryvalue = mainLib.assocationInputOutput(
    args,
    displayalert
  );
  expect(optswithmandatoryvalue[args[0]]).toEqual(args[1] + yamlext);
  expect(optswithmandatoryvalue[args[2]]).toEqual(args[3] + yamlext);
  expect(optswithmandatoryvalue[args[4]]).toEqual(args[5]);
  expect(optswithmandatoryvalue[args[6]]).toEqual(args[7]);
});

test("mainLib.assocationInputOutput - KO - Command line arguments - -i not followed by value ", async () => {
  const args = ["-i", "-o", "output", "-tplcustomdir", "test"];
  const optswithmandatoryvalue = mainLib.assocationInputOutput(
    args,
    displayalert
  );
  expect(optswithmandatoryvalue[args[0]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[1]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[3]]).toEqual(undefined);
});

test("mainLib.assocationInputOutput - KO - Command line arguments - -o not followed by value ", async () => {
  const args = ["-i", "input", "-o", "-tplcustomdir", "test"];
  const optswithmandatoryvalue = mainLib.assocationInputOutput(
    args,
    displayalert
  );
  expect(optswithmandatoryvalue[args[0]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[2]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[3]]).toEqual(undefined);
});

test("mainLib.assocationInputOutput - KO - Command line arguments - -tplcustomdir not followed by value ", async () => {
  const args = ["-i", "input", "-o", "output", "-tplcustomdir"];
  const optswithmandatoryvalue = mainLib.assocationInputOutput(
    args,
    displayalert
  );
  expect(optswithmandatoryvalue[args[0]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[2]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[4]]).toEqual(undefined);
});

test("mainLib.assocationInputOutput - KO - Command line arguments - -e not followed by value ", async () => {
  const args = ["-i", "input", "-o", "output", "-tplcustomdir", "test", "-e"];
  const optswithmandatoryvalue = mainLib.assocationInputOutput(
    args,
    displayalert
  );
  expect(optswithmandatoryvalue[args[0]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[2]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[4]]).toEqual(undefined);
  expect(optswithmandatoryvalue[args[6]]).toEqual(undefined);
});

test("mainLib.getCommandLineArguments - OK - full options", async () => {
  const args = [
    "/usr/bin/node",
    "/home/dhenry/git/genk8smanifest/index",
    "-i",
    "input",
    "-o",
    "output",
    "-tplcustomdir",
    "test",
    "-e",
    "test1",
    "-d",
  ];
  process.argv = args;
  const optswithmandatoryvalue = mainLib.getCommandLineArguments();
  expect(optswithmandatoryvalue.inputfile).toEqual(args[3] + yamlext);
  expect(optswithmandatoryvalue.outputfile).toEqual(args[5] + yamlext);
  expect(optswithmandatoryvalue.customtpldir).toEqual(args[7]);
  expect(optswithmandatoryvalue.templatesexportdir).toEqual(args[9]);
  expect(optswithmandatoryvalue.generationoptions).toEqual([args[10]]);
});

test("mainLib.getCommandLineArguments - OK - full options", async () => {
  const args = [
    "/usr/bin/node",
    "/home/dhenry/git/genk8smanifest/index",
    "-i",
    "input",
    "-o",
    "-tplcustomdir",
    "test",
    "-e",
    "test1",
    "-d",
  ];
  process.argv = args;
  const optswithmandatoryvalue = mainLib.getCommandLineArguments(displayalert);
  expect(optswithmandatoryvalue.inputfile).toEqual(undefined);
  expect(optswithmandatoryvalue.outputfile).toEqual(undefined);
  expect(optswithmandatoryvalue.customtpldir).toEqual(undefined);
  expect(optswithmandatoryvalue.templatesexportdir).toEqual(undefined);
  expect(optswithmandatoryvalue.generationoptions).toEqual([args[9]]);
});
