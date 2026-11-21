"use strict";
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname, "..");
const workspace = fs.readFileSync(path.join(root, "src/js/pacificEducationTeacherDailyOnlyWorkspace.js"), "utf8");
const levels = [
  ["ECE", "ece"], ["Class 1", "class1"], ["Class 2", "class2"],
  ["Class 3", "class3"], ["Class 4", "class4"], ["Class 5", "class5"],
  ["Class 6", "class6"], ["Class 7", "class7"], ["Class 8", "class8"],
  ["Form 1 — Year 7", "form1"], ["Form 2 — Year 8", "form2"],
  ["Form 3", "form3"], ["Form 4", "form4"], ["Form 5", "form5"],
  ["Form 6", "form6"], ["Form 7", "form7"]
];
for (const [label, key] of levels) {
  const link = new RegExp('addEnglishAbilityLinks\\([^;]*"' + key + '-english-printable-worksheets\\.html"\\);');
  assert.match(workspace, link, label + " must have four pathway links in the English Subject Box");
  const viewerPath = path.join(root, "src", "pacedu-" + key + "-english-printable-worksheets.html");
  const viewer = fs.readFileSync(viewerPath, "utf8");
  assert.match(viewer, /requestedAbility=.*ability=/, label + " viewer must accept a pathway deep link");
  assert.ok(viewer.includes("md.split(/(?=^#{1,2} Day"), label + " viewer must split both Day heading styles");
  assert.ok(viewer.includes("part.match(/^#{1,2} Day"), label + " viewer must recognise pathway worksheet headings");
}
assert.match(workspace, /\["Copper","Bronze","Silver","Gold"\]/, "Each level must expose all four pathways");

for (const key of ["class3", "class4", "class5", "class6"]) {
  const worksheetPath = path.join(root, "docs/curriculum/english-" + key + "-printable-worksheets-days-1-115.md");
  const source = fs.readFileSync(worksheetPath, "utf8");
  const firstWeek = source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day ([1-5]) —/.test(part));
  assert.equal(firstWeek.length, 20, key + " must have 20 standalone worksheets for Days 1–5");
  for (const part of firstWeek) {
    assert.match(part, /^## Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
    for (const field of ["Learning intention", "PacEdu working achievement indicator", "Worked example", "Your task", "My answer / working", "Evidence for teacher"]) {
      assert.match(part, new RegExp("^\\*\\*" + field + ":\\*\\* .+", "m"), key + " worksheet needs non-empty " + field);
    }
  }
}

console.log("PASS: all 16 English levels expose four pathway links; Class 3 and 4 Week 1 worksheets have complete standalone content.");
