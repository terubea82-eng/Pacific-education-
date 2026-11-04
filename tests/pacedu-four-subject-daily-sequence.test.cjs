const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

test("four-subject sequence plans 45, 45 and 25 school days", () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync("src/js/paceduFourSubjectDailySequence.js", "utf8"), {window,Object,Array,String,Number,Math,RegExp});
  const api = window.PacEduFourSubjectDailySequence;
  for (const subject of api.subjects) {
    for (const [term, count] of [["T1",45],["T2",45],["T3",25]]) {
      const plan = api.getTermPlan({subject,level:"Class 4",ability:"expected",term});
      assert.equal(plan.days.length,count);
      assert.ok(plan.days.every(day => day.subject === subject && day.curriculumAlignment === "NOT_YET_MAPPED"));
      assert.equal(new Set(plan.days.map(day => day.dayNumber)).size,count);
    }
  }
});

test("daily sequence preserves concept across ability bands and changes support", () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync("src/js/paceduFourSubjectDailySequence.js", "utf8"), {window,Object,Array,String,Number,Math,RegExp});
  const api = window.PacEduFourSubjectDailySequence;
  for (const subject of api.subjects) {
    const sheets = ["support","developing","expected","extension"].map(ability =>
      api.getDailyPlan({subject,level:"Class 3",ability,term:"T1",week:1,day:2}));
    assert.equal(new Set(sheets.map(x => x.concept)).size,1);
    assert.equal(new Set(sheets.map(x => x.abilitySupport)).size,4);
  }
});

test("all supported levels and accessibility alternatives are represented", () => {
  const window = {};
  vm.runInNewContext(fs.readFileSync("src/js/paceduFourSubjectDailySequence.js", "utf8"), {window,Object,Array,String,Number,Math,RegExp});
  for (const level of ["ECE","Class 1","Class 8","Form 3","Form 7"]) {
    const plan = window.PacEduFourSubjectDailySequence.getDailyPlan({
      subject:"Agriculture",level,ability:"developing",term:"T3",week:5,day:5
    });
    assert.equal(plan.status,"DRAFT_REQUIRES_TEACHER_AND_CURRICULUM_REVIEW");
    assert.match(plan.accessibility,/spoken, signed, tactile/);
  }
});
