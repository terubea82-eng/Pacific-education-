const test = require("node:test");
const assert = require("node:assert/strict");
const vm = require("node:vm");

const source = require("node:fs").readFileSync("src/js/pacificEducationRoleActivityPacks.js", "utf8");
const STORAGE_KEY = "pacificEducationRoleActivityEvidenceV1";
const BANDS = ["Foundation", "Developing", "Expected", "Advanced"];

function evidenceFor(level, subject, ability, prefix) {
  return {
    [prefix + "-one"]: {
      role: "student",
      subject,
      level,
      classReference: "CLASS-REF-1",
      reviewStatus: "TEACHER_APPROVED",
      teacherReviewedAbility: ability,
      reviewedAt: "2026-10-20T10:00:00.000Z"
    },
    [prefix + "-two"]: {
      role: "student",
      subject,
      level,
      classReference: "CLASS-REF-1",
      reviewStatus: "TEACHER_APPROVED",
      teacherReviewedAbility: ability,
      reviewedAt: "2026-10-21T10:00:00.000Z"
    }
  };
}

function loadPacks(records = {}) {
  const store = new Map([[STORAGE_KEY, JSON.stringify(records)]]);
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

test("teacher-reviewed evidence creates four differentiated tasks across Fiji class bands", () => {
  const cases = [
    ["ECE", "English"],
    ["Year 1", "Mathematics"],
    ["Year 4", "Science"],
    ["Year 8", "Social Science"],
    ["Year 9", "Health"],
    ["Year 11", "Agriculture"],
    ["Year 13", "Arts"]
  ];

  for (const [level, subject] of cases) {
    const activities = BANDS.map((ability, index) => {
      const records = evidenceFor(level, subject, ability, level + "-" + subject + "-" + index);
      const packs = loadPacks(records);
      return packs.getActivity("student", "dailyLesson", 2, {
        level,
        subject,
        classReference: "CLASS-REF-1"
      });
    });

    activities.forEach((activity, index) => {
      assert.ok(activity, level + " " + subject + " activity exists");
      assert.equal(activity.currentAbility, BANDS[index]);
      assert.equal(activity.abilityEvidenceStatus, "DEMONSTRATED");
      assert.equal(activity.abilityEvidenceCount, 2);
      assert.match(activity.curriculumStatus, /PENDING_TEACHER_REVIEW/);
      assert.ok(activity.nextLevelPractice, "next-step practice is provided");
      assert.ok(activity.progressionSuccessCriteria, "next-step success check is provided");
      assert.match(activity.promotionRule, /teacher reviews the evidence/);
      assert.ok(activity.learningPhilosophy, "educational philosophy is stated");
      assert.ok(activity.priorKnowledgePrompt, "prior knowledge is checked");
      assert.ok(activity.teachingExample, "explicit teaching is included");
      assert.ok(activity.guidedPractice, "supported practice is included");
      assert.ok(activity.independentPractice, "learner attempt is included");
      assert.ok(activity.feedbackPrompt, "feedback and another try are included");
      assert.ok(activity.reteachRule, "reteaching is planned if the learner is not ready");
      assert.ok(activity.masteryRule, "mastery uses more than one piece of evidence");
    });

    assert.equal(new Set(activities.map(activity => activity.task)).size, 4,
      level + " " + subject + " tasks differ by evidence-based ability");
  }
});

test("ability progression uses reviewed evidence, not a manually supplied capability label", () => {
  const foundationPacks = loadPacks(evidenceFor("Year 3", "English", "Foundation", "foundation"));
  const advancedPacks = loadPacks(evidenceFor("Year 3", "English", "Advanced", "advanced"));

  const foundation = foundationPacks.getActivity("student", "dailyLesson", 1, {
    level: "Year 3",
    subject: "English",
    classReference: "CLASS-REF-1",
    capability: "advanced"
  });
  const advanced = advancedPacks.getActivity("student", "dailyLesson", 1, {
    level: "Year 3",
    subject: "English",
    classReference: "CLASS-REF-1"
  });

  assert.equal(foundation.currentAbility, "Foundation");
  assert.equal(foundation.nextAbility, "Developing");
  assert.equal(advanced.currentAbility, "Advanced");
  assert.equal(advanced.nextAbility, "Advanced transfer");
  assert.match(foundation.task, /Ability-level practice \(Foundation\)/);
  assert.match(advanced.task, /Ability-level practice \(Advanced\)/);
  assert.notEqual(foundation.nextLevelPractice, foundation.task);
});

test("missing class evidence prevents an ability label from assigning a learner to a band", () => {
  const packs = loadPacks(evidenceFor("Year 3", "English", "Advanced", "advanced"));
  const activity = packs.getActivity("student", "dailyLesson", 1, {
    level: "Year 3",
    subject: "English",
    capability: "advanced"
  });

  assert.equal(activity.currentAbility, "Insufficient evidence");
  assert.equal(activity.abilityEvidenceStatus, "INSUFFICIENT_EVIDENCE");
  assert.equal(activity.nextAbility, "Determine after subject-specific evidence is reviewed");
});
