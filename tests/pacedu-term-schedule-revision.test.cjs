const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const termSource = fs.readFileSync("src/js/paceduTermLearningPlan.js", "utf8");
const worksheetSource = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");

function load() {
  const window = {};
  vm.runInNewContext(termSource, { window, Object, Array, String, Number, Math });
  vm.runInNewContext(worksheetSource, { window, Object, Array, String, Number, Math, RegExp });
  return window;
}

test("Fiji pilot term schedule has nine weeks in Terms 1 and 2 and five in Term 3", () => {
  const api = load().PacEduTermLearningPlan;
  assert.equal(api.getTermPlan({term:"T1"}).weeks, 9);
  assert.equal(api.getTermPlan({term:"T2"}).weeks, 9);
  assert.equal(api.getTermPlan({term:"T3"}).weeks, 5);
  assert.equal(api.getTermPlan({term:"T1"}).teachingDays, 45);
  assert.equal(api.getTermPlan({term:"T2"}).weeksPlan.length, 9);
  assert.equal(api.getTermPlan({term:"T3"}).weeksPlan.length, 5);
  assert.match(api.getTermPlan({term:"T1"}).note, /current authorised Fiji syllabus/i);
});

test("revision papers are subject-, class- and ability-specific practice papers", () => {
  const window = load();
  const subjects = ["English","Mathematics","Science","Social Studies","Healthy Living","Physical Education","Arts and Crafts","Music","Digital Literacy","iTaukei Language","Hindi"];
  for (const subject of subjects) {
    const paper = window.PacEduTermLearningPlan.getRevisionPaper({level:"Class 4",subject,term:"T2",ability:"support"});
    assert.equal(paper.subject, subject);
    assert.equal(paper.term, "Term 2");
    assert.equal(paper.ability, "support");
    assert.equal(paper.officialExamPaper, false);
    assert.equal(paper.status, "PRACTICE_PAPER_REQUIRES_TEACHER_REVIEW");
    assert.ok(paper.questions.length > 0, subject);
    assert.equal(paper.questions.length, paper.answerKey.length, subject);
  }
  const form7 = window.PacEduTermLearningPlan.getRevisionPaper({level:"Form 7",subject:"Mathematics",term:"T3",ability:"extension"});
  assert.equal(form7.level, "Form 7");
  assert.equal(form7.ability, "extension");
  assert.ok(form7.questions.length > 0);
});
