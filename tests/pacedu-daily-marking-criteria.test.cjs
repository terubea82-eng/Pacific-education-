const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduDailyMarkingCriteria.js", "utf8");
const window = {
  PacEduDailyWorksheetContent: {
    getWorksheet() { return {level:"Class 3",subject:"Mathematics",term:"T1",week:1,day:2,ability:"support",questions:[{number:1,prompt:"What is 2 + 2?",type:"MCQ",options:["3","4"],maxMarks:1}],answerKey:[{answer:"4"}]}; },
    getCurriculumWorksheet() { return {level:"Class 3",subject:"Mathematics",term:"T1",week:1,day:2,ability:"support",questions:[{number:1,prompt:"What is 2 + 2?",type:"MCQ",options:["3","4"],maxMarks:1}],answerKey:[{answer:"4"}],curriculumSchedule:{verificationStatus:"NOT_YET_MAPPED"}}; }
  },
  PacEduTermLearningPlan: {
    getRevisionPaper() { return {level:"Class 3",subject:"Mathematics",term:"Term 1",ability:"support",questions:[{number:1,prompt:"What is 2 + 2?",type:"Multiple choice",options:["3","4"]}],answerKey:[{answer:"4"}]}; },
    getTermPlan() { return {level:"Class 3",subject:"Mathematics",term:"Term 1",ability:"support"}; }
  },
  PacEduPracticeExamPaper: {
    getPaper() { return {level:"Class 3",subject:"Mathematics",term:"Term 1",ability:"support",questions:[{number:1,prompt:"What is 2 + 2?",type:"Multiple choice",options:["3","4"]}],answerKey:[{answer:"4"}]}; }
  }
};
vm.runInNewContext(source, {window, String, Number, Array, Object, Math, RegExp});

const engine = window.PacEduDailyMarkingCriteria;
assert.ok(engine, "engine exports API");
const subjects = ["English","Mathematics","Science","Social Studies","Healthy Living","Physical Education","Arts and Crafts","Music","Digital Literacy","iTaukei Language","Hindi"];
for (const subject of subjects) {
  for (const ability of ["support","developing","expected","extension"]) {
    const rubric = engine.build({level:"Class 4",subject,term:"T2",week:2,day:3,ability,questions:[]});
    assert.equal(rubric.subject, subject);
    assert.equal(rubric.ability, ability);
    assert.equal(rubric.criteria.reduce((sum, c) => sum + c.weightPercent, 0), 100);
    assert.equal(rubric.status, "DRAFT_REQUIRES_TEACHER_REVIEW");
  }
}
const daily = window.PacEduDailyWorksheetContent.getCurriculumWorksheet();
assert.ok(daily.markingCriteriaId);
assert.equal(daily.markingCriteria.curriculumMappingStatus, "NOT_YET_MAPPED");
const suggested = engine.scoreObjective({questionNumber:1,answer:"4"}, daily);
assert.equal(suggested.status, "SUGGESTED_OBJECTIVE_MARK");
assert.equal(suggested.marks, 1);
assert.equal(suggested.requiresTeacherApproval, true);
const rejected = engine.scoreObjective({questionNumber:1,answer:"4"}, {markingCriteria:engine.build({questions:[{number:1,prompt:"Explain your answer",type:"Short answer"}],answerKey:[{answer:"4"}]}),answerKey:[{answer:"4"}]});
assert.equal(rejected.status, "TEACHER_REVIEW_REQUIRED");
const revision = window.PacEduTermLearningPlan.getRevisionPaper();
const exam = window.PacEduPracticeExamPaper.getPaper();
assert.ok(revision.markingCriteriaId);
assert.ok(exam.markingCriteriaId);
assert.equal(revision.markingCriteria.links.dailyWorksheet.criteriaId, revision.markingCriteriaId);
console.log("PacEdu daily marking criteria regression tests passed.");
