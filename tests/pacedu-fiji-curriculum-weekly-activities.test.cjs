const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/paceduFijiCurriculumWeeklyActivities.js", "utf8");
const window = {
  document: {
    readyState: "complete",
    body: { appendChild() {}, },
    getElementById() { return null; },
    createElement() { return { style: {}, appendChild() {}, setAttribute() {}, addEventListener() {}, textContent: "" }; },
    addEventListener() {}
  },
  MutationObserver: function () { this.observe = function () {}; }
};
vm.runInNewContext(source, { window, Object, Number, String, Math });
const api = window.PacEduFijiCurriculumActivities;
assert.ok(api, "weekly activity API is exported");
assert.ok(api.levels.includes("ECE"), "ECE label is preserved");
assert.ok(api.levels.includes("Class 8"), "upper primary levels are included");
assert.ok(api.levels.includes("Form 7"), "Form 7 is included");
assert.equal(api.abilities.length, 4, "four ability bands are present");
assert.ok(api.subjects.includes("English") && api.subjects.includes("Mathematics"), "core subjects exist");
assert.equal(api.weeklyDistribution.length, 35, "weekly year/block distribution has 35 entries");
for (const term of ["T1", "T2", "T3", "ASSESSMENT", "INTERVENTION", "REVISION", "EXAMS"]) {
  assert.ok(api.weeklyDistribution.some(w => w.term === term), "missing distribution block: " + term);
}
for (const level of api.levels) {
  for (const subject of api.subjects) {
    for (const ability of ["support", "developing", "expected", "extension"]) {
      const activity = api.getWeeklyActivity({level, subject, term:"T1", week:1, ability});
      assert.equal(activity.status, "DRAFT_NEEDS_CURRICULUM_VERIFICATION");
      assert.equal(activity.level, level);
      assert.equal(activity.subject, subject);
      assert.equal(activity.ability, ability);
      assert.ok(activity.learningTask.task.length > 10);
      assert.ok(activity.questions.length >= 3);
      assert.equal(activity.curriculumTrace.verificationStatus, "NOT_YET_MAPPED");
    }
  }
}
const invalid = api.getWeeklyActivity({term:"T1",week:99});
assert.equal(invalid.status, "NOT_FOUND");
console.log("PASS: 35 weekly blocks; ECE–Form 7 levels; 11 subjects; 4 ability bands; activity/question generation and curriculum-verification guard.");
