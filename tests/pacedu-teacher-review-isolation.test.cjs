const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationTeacherReviewQueue.js", "utf8");

function createHarness(initialResponses) {
  const values = new Map([
    ["pacificEducationActivityResponses", JSON.stringify(initialResponses)],
    ["pacificEducationCapability", "existing-learner-capability"],
    ["pacificEducationAdaptiveLearningStatus", "existing-learner-status"],
    ["pacificEducationAdaptiveNextActivity", "existing-next-activity"],
    ["pacificEducationAdaptiveLastReview", JSON.stringify({ responseId: "existing-review" })]
  ]);
  const events = [];
  let progressCalls = 0;
  const localStorage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); }
  };
  const document = {
    addEventListener() {},
    getElementById() { return null; },
    dispatchEvent(event) { events.push(event); }
  };
  class FakeCustomEvent {
    constructor(type, options) { this.type = type; this.detail = options && options.detail; }
  }
  const window = {
    localStorage,
    addEventListener() {},
    PacificEducationDailyProgressRecorder: {
      recordPractised() { progressCalls += 1; }
    }
  };
  vm.runInNewContext(source, {
    window, document, localStorage, CustomEvent: FakeCustomEvent,
    Date, Number, String, JSON, Math, Array, Object
  });
  return {
    api: window.PacificEducationTeacherReview,
    values, events,
    getProgressCalls() { return progressCalls; }
  };
}

test("reviewing a teacher-entered answer records the individual decision without changing shared adaptive state", () => {
  const harness = createHarness([{
    responseId: "teacher-manual-123",
    teacherEnteredAnswer: true,
    learnerNameOrReference: "Learner A",
    classId: "Class 1",
    subject: "English",
    term: "Term 1",
    day: 2,
    questionText: "Say a greeting",
    response: "Good morning",
    reviewStatus: "pending-teacher-review"
  }]);

  harness.api.review(0, "approved");

  const responses = JSON.parse(harness.values.get("pacificEducationActivityResponses"));
  assert.equal(responses[0].reviewStatus, "teacher-approved");
  assert.equal(responses[0].teacherReviewedAt !== undefined, true);
  assert.equal(harness.values.get("pacificEducationCapability"), "existing-learner-capability");
  assert.equal(harness.values.get("pacificEducationAdaptiveLearningStatus"), "existing-learner-status");
  assert.equal(harness.values.get("pacificEducationAdaptiveNextActivity"), "existing-next-activity");
  assert.deepEqual(JSON.parse(harness.values.get("pacificEducationAdaptiveLastReview")), { responseId: "existing-review" });
  assert.equal(harness.getProgressCalls(), 0);

  const manualEvent = harness.events.find((event) => event.type === "pacificEducationTeacherManualAnswerReviewed");
  assert.ok(manualEvent);
  assert.equal(manualEvent.detail.responseId, "teacher-manual-123");
  assert.equal(manualEvent.detail.learnerNameOrReference, "Learner A");
  assert.equal(manualEvent.detail.classId, "Class 1");
  assert.equal(manualEvent.detail.status, "approved");
});

test("reviewing a normal learner response retains the existing adaptive-review behaviour", () => {
  const harness = createHarness([{
    type: "short_answer",
    day: 3,
    questionText: "What did you learn?",
    response: "I learned to greet people.",
    reviewStatus: "pending-teacher-review"
  }]);

  harness.api.review(0, "needs-practice");

  assert.equal(harness.values.get("pacificEducationCapability"), "remedial");
  assert.equal(harness.values.get("pacificEducationAdaptiveLearningStatus"), "Teacher review recommends targeted re-teaching before progressing");
  assert.equal(harness.values.get("pacificEducationAdaptiveNextActivity"), "Remedial / Re-teaching");
  const lastReview = JSON.parse(harness.values.get("pacificEducationAdaptiveLastReview"));
  assert.equal(lastReview.status, "needs-practice");
});
