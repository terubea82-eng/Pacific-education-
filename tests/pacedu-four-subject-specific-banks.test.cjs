const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function load() {
  const window = {};
  const document = {};
  for (const path of [
    "src/js/paceduFijiCurriculumWeeklyActivities.js",
    "src/js/paceduDailyWorksheetContent.js",
    "src/js/paceduFijiNineSubjectMapping.js",
    "src/js/paceduDownloadableClassPacks.js"
  ]) {
    vm.runInNewContext(fs.readFileSync(path, "utf8"), {
      window, document, Object, Array, String, Number, Math, RegExp, Date, Blob: function () {}
    }, { filename: path });
  }
  return window;
}

const newSubjects = ["Phonics", "Agriculture", "Home Economics", "Computer Studies"];

test("four subjects have separate banks but no learner release before curriculum validation", () => {
  const window=load();
  const api=window.PacEduDailyWorksheetContent;
  for(const subject of newSubjects){
    assert.ok(api.subjects.includes(subject),subject);
    for(const ability of ["support","developing","expected","extension"]){
      const w=api.getWorksheet("Class 4",subject,2,ability);
      assert.equal(w.subject,subject);
      assert.equal(w.level,"Class 4");
      assert.equal(w.ability,ability);
      assert.equal(w.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
      assert.equal(w.questions.length,0);
      assert.equal(w.answerKey.length,0);
      assert.equal(w.learnerReleaseEligible,false);
    }
  }
});

test("each new subject box resolves only to its own worksheet bank", () => {
  const window = load();
  for (const subject of newSubjects) {
    const resolved = window.PacEduFijiSubjectMapping.resolve(subject, "Class 4");
    assert.equal(resolved.status, "partial");
    assert.equal(resolved.contentStatus, "CONTENT_PARTIAL");
    assert.deepEqual(Array.from(resolved.worksheetSourceSubjects), [subject]);
    const download = window.PacEduDownloadableClassPacks.resolveSubject(subject, "Class 4");
    assert.equal(download.available, true);
    assert.equal(download.sourceSubject, subject);
  }
});

test("ability bands cannot expose an unverified subject concept", () => {
  const window=load();
  for(const subject of newSubjects){
    const worksheets=["support","developing","expected","extension"].map(ability=>
      window.PacEduDailyWorksheetContent.getWorksheet("Class 5",subject,3,ability));
    assert.ok(worksheets.every(w=>w.status==="BLOCKED_CURRICULUM_SOURCE_REQUIRED"),subject);
    assert.ok(worksheets.every(w=>w.questions.length===0),subject);
  }
});

test("weekly learning activity registry includes the four new subjects", () => {
  const window = load();
  for (const subject of newSubjects) {
    assert.ok(window.PacEduFijiCurriculumActivities.subjects.includes(subject));
  }
});

test("Form 5–7 generic Science restriction and language safeguards remain intact", () => {
  const window = load();
  for (const level of ["Form 5", "Form 6", "Form 7"]) {
    assert.equal(window.PacEduDownloadableClassPacks.resolveSubject("Science", level).available, false);
  }
  for (const subject of ["Vosa Vakaviti (iTaukei)", "Fiji Hindi", "Urdu", "Rotuman"]) {
    assert.equal(window.PacEduDownloadableClassPacks.resolveSubject(subject, "Class 4").available, false);
  }
});

test("new subject worksheet remains blocked until its official concept and indicator are validated", () => {
  const window=load();
  const sheet=window.PacEduDailyWorksheetContent.getCurriculumWorksheet({
    level:"Class 4",subject:"Agriculture",term:"T1",week:1,day:2,ability:"developing",skipTermPlan:true
  });
  assert.equal(sheet.subject,"Agriculture");
  assert.equal(sheet.curriculumSchedule.verificationStatus,"NOT_YET_MAPPED");
  assert.equal(sheet.status,"BLOCKED_CURRICULUM_SOURCE_REQUIRED");
  assert.equal(sheet.questions.length,0);
  assert.equal(sheet.answerKey.length,0);
});
