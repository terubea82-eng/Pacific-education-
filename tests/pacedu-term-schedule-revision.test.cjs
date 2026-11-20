const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const termSource = fs.readFileSync("src/js/paceduTermLearningPlan.js", "utf8");
const worksheetSource = fs.readFileSync("src/js/paceduDailyWorksheetContent.js", "utf8");
const examSource = fs.readFileSync("src/js/paceduPracticeExamPaper.js", "utf8");

function load() {
  const window = {};
  vm.runInNewContext(termSource, { window, Object, Array, String, Number, Math });
  vm.runInNewContext(examSource, { window, Object, Array, String, Number, Math });
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

test("revision papers remain blocked until approved daily indicators are available", () => {
  const window=load();
  const subjects=["English","Mathematics","Science","Social Studies","Healthy Living","Physical Education","Arts and Crafts","Music","Digital Literacy","iTaukei Language","Hindi"];
  for(const subject of subjects){
    const paper=window.PacEduTermLearningPlan.getRevisionPaper({level:"Class 4",subject,term:"T2",ability:"support"});
    assert.equal(paper.subject,subject);
    assert.equal(paper.term,"Term 2");
    assert.equal(paper.ability,"support");
    assert.equal(paper.officialExamPaper,false);
    assert.equal(paper.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
    assert.equal(paper.questions.length,0);
    assert.equal(paper.answerKey.length,0);
    assert.equal(paper.learnerReleaseEligible,false);
  }
});

test("practice examination paper remains blocked without validated curriculum indicators", () => {
  const window=load();
  const paper=window.PacEduPracticeExamPaper.getPaper({level:"Form 5",subject:"Science",term:"T3",ability:"expected"});
  assert.match(paper.title,/Practice Examination/);
  assert.equal(paper.paperType,"practice-exam");
  assert.equal(paper.officialExamPaper,false);
  assert.equal(paper.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(paper.questions.length,0);
  assert.equal(paper.answerKey.length,0);
  assert.equal(paper.learnerReleaseEligible,false);
});

test("learner subject workspace provides term/week navigation and holds revision until the final teaching week", () => {
  const renderer = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
  assert.match(renderer, /Choose term and teaching week/);
  assert.match(renderer, /Open selected week/);
  assert.match(renderer, /lessonWeek === \(lesson\.termLearningPlan \? lesson\.termLearningPlan\.weeks/);
  assert.match(renderer, /End of term practice examination/);
  assert.match(renderer, /not an official or past examination paper/i);
});
