const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationLearnerActivityRuntime.js", "utf8");

function loadRuntime() {
  const window = {};
  const localStorage = { getItem() { return null; }, setItem() {} };
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
    Object
  });
  return window.PacificEducationActivity;
}

test("only keyed multiple-choice and true/false answers can be auto-scored", () => {
  const activity = loadRuntime();
  const ctx = { answerKey: "B" };
  assert.deepEqual(
    JSON.parse(JSON.stringify(activity.assessmentPolicy("multiple_choice", "b", ctx, false))),
    { status: "auto-scored", evidenceType: "daily-assessment", score: 100, assessed: true }
  );
  assert.equal(activity.assessmentPolicy("multiple_choice", "A", ctx, false).score, 0);
  assert.equal(activity.assessmentPolicy("true_false", "True", { answerKey: "true" }, false).score, 100);
});

test("matching and free-response answers remain pending teacher review even when a key exists", () => {
  const activity = loadRuntime();
  for (const type of ["matching", "short_answer", "long_answer"]) {
    const result = activity.assessmentPolicy(type, "learner response", { answerKey: "learner response" }, false);
    assert.equal(result.status, "pending-teacher-review", type);
    assert.equal(result.evidenceType, "daily-practice", type);
    assert.equal(result.score, null, type);
    assert.equal(result.assessed, false, type);
  }
});

test("verified voice responses always remain pending teacher review", () => {
  const activity = loadRuntime();
  const result = activity.assessmentPolicy("multiple_choice", "B", { answerKey: "B" }, true);
  assert.equal(result.status, "pending-teacher-review");
  assert.equal(result.score, null);
  assert.equal(result.assessed, false);
});
