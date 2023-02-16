const helperGenLib = require("../../lib/helperGenLib");

test("helperGenLib - OK - getTemplate relative path ", async () => {
  const relpath = "./tests/helperGenLib/customtpl";
  const tpl = helperGenLib.getTemplate(relpath, "tpl_namespace");
  expect(tpl).toEqual(`${relpath}/tpl_namespace`);
});

test("helperGenLib - OK - getTemplate absolute path ", async () => {
  const abspath = process.cwd() + "/tests/helperGenLib/customtpl";
  const tpl = helperGenLib.getTemplate(abspath, "tpl_namespace");
  expect(tpl).toEqual(`${abspath}/tpl_namespace`);
});
