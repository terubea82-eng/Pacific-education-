const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");
const source = fs.readFileSync("src/js/paceduAssessmentBlueprints.js","utf8");
const window = {document:{readyState:"complete",getElementById(){return null;},body:{},addEventListener(){}},MutationObserver:function(){this.observe=function(){};}};
vm.runInNewContext(source,{window,Object,Number,String,Math});
const api=window.PacEduAssessmentBlueprints;
assert.ok(api,"assessment planner exported");
assert.ok(api.levels.includes("ECE"));
assert.ok(api.levels.includes("Class 8"));
assert.ok(api.levels.includes("Form 7"));
for(const level of api.levels){
 for(const ability of ["support","developing","expected","extension"]){
  for(const subject of ["English","Mathematics","Science"]){
   const q=api.buildQuestionSet({level,ability,subject,topic:"verified sample outcome"});
   assert.equal(q.status,"DRAFT_REQUIRES_OUTCOME_MAPPING");
   assert.ok(q.questions.length>=3);
   assert.ok(q.questions.some(x=>x.type==="MCQ"||x.type==="Picture / object choice"));
   assert.ok(q.questions.every(x=>x.prompt.length>10));
  }
 }
}
for(const type of ["Revision paper","Term-end examination","Weekly practice"]){
 const b=api.buildBlueprint({level:"Class 5",subject:"English",paperType:type});
 assert.equal(b.status,"DRAFT_BLUEPRINT_REQUIRES_SCHOOL_AND_SYLLABUS_APPROVAL");
 assert.equal(b.blueprint.reduce((n,x)=>n+x.weightPercent,0),100);
 assert.ok(b.controls.length>=5);
}
const ece=api.buildBlueprint({level:"ECE",paperType:"Term-end examination"});
assert.match(ece.durationGuidance,/play-based observation/);
console.log("PASS: ECE–Form 7, four ability bands, question types, revision/term-end blueprint, 100% suggested weighting and approval guards.");
