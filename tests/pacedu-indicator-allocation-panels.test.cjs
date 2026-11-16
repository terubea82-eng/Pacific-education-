const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function buildPack(withAllocation) {
  const window = {
    PacEduIndicatorMasterRecords: withAllocation ? [{
      indicatorId:"TEST-INDICATOR-001",
      officialWording:"Verified test wording — not an official Fiji indicator.",
      sourceTitle:"Automated test source",
      sourceEdition:"Test edition",
      sourcePage:"1",
      verificationStatus:"SOURCE_VERIFIED"
    }] : [],
    PacEduTeachingAllocationRecords: withAllocation ? [{
      allocationId:"TEST-ALLOCATION-001", level:"Class 1", subject:"English",
      term:"T1", week:1, day:1, indicatorIds:["TEST-INDICATOR-001"],
      verificationStatus:"ALLOCATION_VERIFIED",
      learnerGoal:"Read and explain a short sentence.",
      evidenceOfLearning:"Learner reads and answers a comprehension question.",
      teacherReviewStatus:"PENDING_TEACHER_REVIEW"
    }] : [],
    PacEduDailyWorksheetContent: {
      getCurriculumWorksheet(options) {
        return {
          status:"OK", topic:"Sample daily topic",
          dailyLesson:{classLevelObjective:"Practise the daily learning task.", concept:"Sample concept"},
          questions:[{prompt:"What did you learn?",options:["A","B","C","D"]}],
          answerKey:[{answer:"A",explanation:"Test explanation."}]
        };
      }
    }
  };
  vm.runInNewContext(fs.readFileSync("src/js/paceduIndicatorAllocationRegistry.js","utf8"), {window,Object,Array,Number,String});
  vm.runInNewContext(fs.readFileSync("src/js/paceduDownloadableClassPacks.js","utf8"), {
    window, document:{}, Date, Math, String, Number, Array, Object, RegExp, Error
  });
  return window.PacEduDownloadableClassPacks.build({level:"Class 1",subject:"English",term:"T1",ability:"support"});
}

const pending = buildPack(false);
assert.equal(pending.dailyActivities,45);
assert.match(pending.html,/Curriculum indicator/);
assert.match(pending.html,/PENDING_SUBJECT_SPECIFIC_INDICATOR/);
assert.match(pending.html,/PENDING_TEACHER_REVIEW/);
assert.match(pending.html,/No verified class-and-subject indicator is linked/);

const verified = buildPack(true);
assert.match(verified.html,/TEST-INDICATOR-001/);
assert.match(verified.html,/Verified test wording/);
assert.match(verified.html,/Automated test source/);
assert.match(verified.html,/Read and explain a short sentence/);
assert.match(verified.html,/Evidence of learning/);
assert.match(verified.html,/break-before:page/);
console.log("PASS: 45 daily worksheet sections; first-page indicator panel; pending fail-closed state; verified indicator/source rendering; print page breaks.");
