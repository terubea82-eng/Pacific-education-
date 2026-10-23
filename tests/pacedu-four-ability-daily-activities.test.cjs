const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");

function loadPacks() {
  const store = new Map();
  const localStorage = {
    getItem(key) { return store.has(key) ? store.get(key) : null; },
    setItem(key, value) { store.set(key, String(value)); }
  };
  const window = { localStorage };
  vm.runInNewContext(source, {
    window,
    document: {},
    localStorage,
    Date,
    Math,
    JSON,
    String,
    Number,
    Array,
    Object,
    RegExp
  });
  return window.PacificEducationRoleActivityPacks;
}

test("student activities are differentiated into four groups for all supported class bands", () => {
  const packs = loadPacks();
  const cases = [
    ["Kindergarten", "English"],
    ["Year 1", "Mathematics"],
    ["Year 4", "Science"],
    ["Year 8", "Social Science"],
    ["Year 9", "Health"],
    ["Year 11", "Agriculture"],
    ["Year 13", "Arts"]
  ];
  for (const [level, subject] of cases) {
    const activities = ["foundation", "developing", "expected", "advanced"].map(capability =>
      packs.getActivity("student", "dailyLesson", 2, { level, subject, capability })
    );
    for (const activity of activities) {
      assert.ok(activity, level + " " + subject + " activity exists");
      assert.match(activity.curriculumStatus, /PENDING_TEACHER_REVIEW/);
      assert.match(activity.task, /Day 2:/);\n      assert.ok(activity.nextLevelPractice, "next-step practice is provided");\n      assert.ok(activity.progressionSuccessCriteria, "next-step success check is provided");\n      assert.match(activity.promotionRule, /teacher reviews the evidence/);
      assert.ok(activity.learningPhilosophy, "educational philosophy is stated");
      assert.ok(activity.priorKnowledgePrompt, "prior knowledge is checked");
      assert.ok(activity.teachingExample, "explicit teaching is included");
      assert.ok(activity.guidedPractice, "supported practice is included");
      assert.ok(activity.independentPractice, "learner attempt is included");
      assert.ok(activity.feedbackPrompt, "feedback and another try are included");
      assert.ok(activity.reteachRule, "reteaching is planned if the learner is not ready");
      assert.ok(activity.masteryRule, "mastery uses more than one piece of evidence");
    }
    assert.equal(new Set(activities.map(activity => activity.task)).size, 4,
      level + " " + subject + " tasks differ by ability");
  }
});

test("ability labels map to four task groups without presenting them as official scores", () => {
  const packs = loadPacks();
  const foundation = packs.getActivity("student", "dailyLesson", 1, {
    level: "Year 3", subject: "English", capability: "foundation"
  });
  const advanced = packs.getActivity("student", "dailyLesson", 1, {
    level: "Year 3", subject: "English", capability: "advanced"
  });
  assert.match(foundation.task, /with prompts|with support/i);
  assert.match(advanced.task, /compare|justify|support/i);
  assert.equal(foundation.verificationStatus, "PENDING_TEACHER_REVIEW");
  assert.equal(advanced.verificationStatus, "PENDING_TEACHER_REVIEW");\n  assert.equal(foundation.nextAbility, "Developing");\n  assert.equal(advanced.nextAbility, "Advanced transfer");\n  assert.notEqual(foundation.nextLevelPractice, foundation.task);
});
