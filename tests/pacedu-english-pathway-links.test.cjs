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
  assert.match(viewer, /md\.split\(/, label + " viewer must split the daily worksheet source");
  assert.match(viewer, /\^#\{1,2\} Day/, label + " viewer must parse one- or two-level Day headings");
  assert.match(viewer, /\^#\{1,2\} Day \(\\d\+\).*Copper\|Bronze\|Silver\|Gold/, label + " viewer must recognise each ability worksheet");
}
assert.match(workspace, /\["Copper","Bronze","Silver","Gold"\]/, "Each level must expose all four pathways");
console.log("PASS: all 16 English levels expose Copper, Bronze, Silver and Gold pathway links with compatible printable viewers.");
