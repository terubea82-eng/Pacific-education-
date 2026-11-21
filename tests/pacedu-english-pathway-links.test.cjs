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
  assert.ok(workspace.includes('"pacedu-' + key + '-english-printable-worksheets.html"'), label + " must have four pathway links in the English Subject Box");
  const viewerPath = path.join(root, "src", "pacedu-" + key + "-english-printable-worksheets.html");
  const viewer = fs.readFileSync(viewerPath, "utf8");
  assert.match(viewer, /requestedAbility=.*ability=/, label + " viewer must accept a pathway deep link");
  assert.ok(viewer.includes("md.split(/(?=^#{1,2} Day"), label + " viewer must split both Day heading styles");
  assert.ok(viewer.includes("part.match(/^#{1,2} Day"), label + " viewer must recognise pathway worksheet headings");
}
assert.match(workspace, /\["Copper","Bronze","Silver","Gold"\]/, "Each level must expose all four pathways");

for (const key of ["class3", "class4", "class5", "class6", "class7", "class8"]) {
  const worksheetPath = path.join(root, "docs/curriculum/english-" + key + "-printable-worksheets-days-1-115.md");
  const source = fs.readFileSync(worksheetPath, "utf8");
  const firstWeek = source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day ([1-5]) —/.test(part));
  assert.equal(firstWeek.length, 20, key + " must have 20 standalone worksheets for Days 1–5");
  for (const part of firstWeek) {
    assert.match(part, /^## Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
    for (const field of ["Learning intention", "PacEdu working achievement indicator", "Worked example", "Your task", "My answer / working", "Evidence for teacher"]) {
      assert.match(part, new RegExp("^\\*\\*" + field + ":\\*\\*", "m"), key + " worksheet needs " + field + " label");
    }
  }
}


const form2Source = fs.readFileSync(path.join(root, "docs/curriculum/english-form2-printable-worksheets-days-1-115.md"), "utf8");
const form2Week1 = form2Source.split(/(?=^# Day \d+ —)/m).filter(part => /^# Day ([1-5]) —/.test(part));
assert.equal(form2Week1.length, 20, "Form 2 (Year 8) must have 20 standalone worksheets for Days 1–5");
for (const part of form2Week1) {
  assert.match(part, /^# Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Ability pathway", "Today's learning goal", "Read this complete passage", "Worked example", "Your questions", "My answer", "Final check", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 2 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form2-teacher-guide-days-1-5.md"), "Form 2 Year 8 teacher guide must be linked from the English Subject Box");


const form3Source = fs.readFileSync(path.join(root, "docs/curriculum/english-form3-printable-worksheets-days-1-115.md"), "utf8");
const form3Week1 = form3Source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day ([1-5]) —/.test(part));
assert.equal(form3Week1.length, 20, "Form 3 must have 20 standalone worksheets for Days 1–5");
for (const part of form3Week1) {
  assert.match(part, /^## Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Learning intention", "PacEdu working achievement indicator", "complete stimulus", "Worked example", "Your task", "My analysis / response", "Accessible response", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 3 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form3-teacher-guide-days-1-5.md"), "Form 3 teacher guide must be linked from the English Subject Box");


const form4Source = fs.readFileSync(path.join(root, "docs/curriculum/english-form4-printable-worksheets-days-1-115.md"), "utf8");
const form4Week1 = form4Source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day ([1-5]) —/.test(part));
assert.equal(form4Week1.length, 20, "Form 4 must have 20 standalone worksheets for Days 1–5");
for (const part of form4Week1) {
  assert.match(part, /^## Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Learning intention", "PacEdu working achievement indicator", "complete stimulus", "Worked example", "Your task", "My analysis / response", "Accessible response", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 4 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form4-teacher-guide-days-1-5.md"), "Form 4 teacher guide must be linked from the English Subject Box");


const form5Source = fs.readFileSync(path.join(root, "docs/curriculum/english-form5-printable-worksheets-days-1-115.md"), "utf8");
const form5Week1 = form5Source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day ([1-5]) —/.test(part));
assert.equal(form5Week1.length, 20, "Form 5 must have 20 standalone worksheets for Days 1–5");
for (const part of form5Week1) {
  assert.match(part, /^## Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Learning intention", "PacEdu working achievement indicator", "complete practice stimulus", "Worked example", "Your task", "My analysis / response", "Accessible response", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 5 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form5-teacher-guide-days-1-5.md"), "Form 5 teacher guide must be linked from the English Subject Box");


const form6Source = fs.readFileSync(path.join(root, "docs/curriculum/english-form6-printable-worksheets-days-1-115.md"), "utf8");
const form6Week1 = form6Source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day ([1-5]) —/.test(part));
assert.equal(form6Week1.length, 20, "Form 6 must have 20 standalone worksheets for Days 1–5");
for (const part of form6Week1) {
  assert.match(part, /^## Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Learning intention", "PacEdu working achievement indicator", "complete linked practice sources", "Worked example", "Your task", "My analysis / response", "Accessible response", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 6 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form6-teacher-guide-days-1-5.md"), "Form 6 teacher guide must be linked from the English Subject Box");


const form7Source = fs.readFileSync(path.join(root, "docs/curriculum/english-form7-printable-worksheets-days-1-115.md"), "utf8");
const form7Week1 = form7Source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day ([1-5]) —/.test(part));
assert.equal(form7Week1.length, 20, "Form 7 must have 20 standalone worksheets for Days 1–5");
for (const part of form7Week1) {
  assert.match(part, /^## Day [1-5] —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Learning intention", "PacEdu working achievement indicator", "complete practice sources", "Worked example", "Your task", "My critical analysis / synthesis", "Accessible response", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 7 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form7-teacher-guide-days-1-5.md"), "Form 7 teacher guide must be linked from the English Subject Box");


const form7Week2 = form7Source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day (6|7|8|9|10) —/.test(part));
assert.equal(form7Week2.length, 20, "Form 7 must have 20 standalone worksheets for Days 6–10");
for (const part of form7Week2) {
  assert.match(part, /^## Day (6|7|8|9|10) —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Learning intention", "PacEdu working achievement indicator", "complete practice source", "Worked example", "Your task", "My analysis / response", "Accessible response", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 7 Week 2 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form7-teacher-guide-days-6-10.md"), "Form 7 Week 2 teacher guide must be linked from the English Subject Box");


const form6Week2 = form6Source.split(/(?=^## Day \d+ —)/m).filter(part => /^## Day (6|7|8|9|10) —/.test(part));
assert.equal(form6Week2.length, 20, "Form 6 must have 20 standalone worksheets for Days 6–10");
for (const part of form6Week2) {
  assert.match(part, /^## Day (6|7|8|9|10) —.*— (Copper|Bronze|Silver|Gold) Worksheet/m);
  for (const field of ["Learner name", "Class/Form", "Learning intention", "PacEdu working achievement indicator", "complete practice sources", "Worked example", "Your task", "My comparative analysis / response", "Accessible response", "PENDING_TEACHER_REVIEW"]) {
    assert.ok(part.includes(field), "Form 6 Week 2 worksheet needs " + field);
  }
}
assert.ok(workspace.includes("english-form6-teacher-guide-days-6-10.md"), "Form 6 Week 2 teacher guide must be linked from the English Subject Box");

console.log("PASS: all 16 English levels expose four pathway links; Classes 3–8 and Forms 2–7 Week 1 and Week 2 worksheets have complete standalone content.");
