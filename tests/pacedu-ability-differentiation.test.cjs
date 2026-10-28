const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function load(ability, subject) {
  const window = {
    PacEduDailyWorksheetContent: Object.freeze({
      levels:["ECE","Class 1","Form 7"],
      subjects:["English","Mathematics","Science","Social Studies","Healthy Living","Physical Education","Arts and Crafts","Music","Digital Literacy","iTaukei Language","Hindi"],
      getCurriculumWorksheet(options) {
        return {status:"DRAFT_REQUIRES_OFFICIAL_OUTCOME_MAPPING",level:options.level,subject:options.subject,ability:options.ability,day:options.day,dailyLesson:{classLevelObjective:"class target",steps:[]},questions:[{prompt:"sample"}]};
      },
      getWorksheet(level, ability, day, subject) { return {level,ability,day,subject,questions:[]}; }
    }),
    document: null
  };
  vm.runInNewContext(fs.readFileSync("src/js/paceduAbilityDifferentiation.js","utf8"), {window, Object, String, Number, Math});
  return window.PacEduDailyWorksheetContent.getCurriculumWorksheet({level:"Class 3",subject:subject||"English",term:"T1",week:1,day:2,ability:ability});
}

test("all four ability groups receive distinct daily, drill, revision and exam-practice guidance",()=>{
  const ids=["support","developing","expected","extension"];
  const results=ids.map(id=>load(id));
  for(const r of results){
    assert.ok(r.abilityActivities);
    assert.equal(r.abilityActivities.bandId,r.ability);
    assert.ok(r.abilityActivities.daily.steps.length>=3);
    assert.ok(r.abilityActivities.drill.instructions);
    assert.ok(r.abilityActivities.revision.instructions);
    assert.ok(r.abilityActivities.examPractice.instructions);
    assert.ok(r.abilityActivities.evidence.rule.includes("missing"));
  }
  assert.equal(new Set(results.map(r=>r.abilityActivities.daily.steps[0])).size,4);
});

test("subject-specific daily tasks are supplied across supported subjects",()=>{
  const subjects=["English","Mathematics","Science","Social Studies","Healthy Living","Physical Education","Arts and Crafts","Music","Digital Literacy","iTaukei Language","Hindi"];
  for(const subject of subjects){
    const r=load("developing",subject);
    assert.equal(r.abilityActivities.subject,subject);
    assert.ok(r.abilityActivities.daily.subjectTask.length>20,subject);
  }
});

test("class and ability context is preserved and no missing-evidence ability inference is allowed",()=>{
  const r=load("support","Mathematics");
  assert.equal(r.level,"Class 3");
  assert.equal(r.abilityBand,"support");
  assert.match(r.differentiationNote,/not permanent labels/i);
  assert.match(r.abilityActivities.evidence.rule,/Do not assign a lower ability group from missing/i);
});
