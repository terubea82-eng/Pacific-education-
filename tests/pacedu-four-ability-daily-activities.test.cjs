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
      assert.match(activity.task, /Day 2:/);
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
  assert.equal(advanced.verificationStatus, "PENDING_TEACHER_REVIEW");
});
