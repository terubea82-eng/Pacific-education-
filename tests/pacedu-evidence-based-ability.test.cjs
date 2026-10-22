const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

const source = fs.readFileSync("src/js/pacificEducationEvidenceBasedAbility.js", "utf8");

function harness() {
  const values = new Map();
  const storage = {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); }
  };
  const document = {
    addEventListener() {},
    dispatchEvent() {},
    getElementById() { return null; },
    querySelector() { return null; }
  };
  function CustomEvent(type, options) { this.type = type; this.detail = options && options.detail; }
  const window = {
    localStorage: storage,
    sessionStorage: storage,
    addEventListener() {},
    PacificEducationTeacherClassRosterContext: null
  };
  vm.runInNewContext(source, { window, document, localStorage: storage, sessionStorage: storage, CustomEvent });
  return { api: window.PacificEducationEvidenceBasedAbility, storage };
}

function activity(studentId, day, reviewStatus, term = "Term 1", subject = "English") {
  return {
    studentId, classId: "CLASS-REF-1", day, term, subject,
    reviewStatus, type: "daily-activity", responseId: "response-" + day
  };
}

test("recommendation waits for five teacher-marked daily activities and a teacher-marked term examination", () => {
  const { api, storage } = harness();
  storage.setItem("pacificEducationActivityResponses", JSON.stringify([
    activity("STU-001", 1, "teacher-approved"),
    activity("STU-001", 2, "teacher-approved"),
    activity("STU-001", 3, "teacher-approved"),
    activity("STU-001", 4, "teacher-approved")
  ]));
  assert.equal(api.evaluate({ studentId: "STU-001", classId: "CLASS-REF-1", term: "Term 1", subject: "English" }).status, "awaiting-evidence");
  storage.setItem("pacificEducationActivityResponses", JSON.stringify([
    activity("STU-001", 1, "teacher-approved"),
    activity("STU-001", 2, "teacher-approved"),
    activity("STU-001", 3, "teacher-approved"),
    activity("STU-001", 4, "teacher-approved"),
    activity("STU-001", 5, "teacher-approved")
  ]));
  assert.equal(api.evaluate({ studentId: "STU-001", classId: "CLASS-REF-1", term: "Term 1", subject: "English" }).status, "awaiting-evidence");
  const saved = api.recordTermMark({ studentId: "STU-001", classId: "CLASS-REF-1", term: "Term 1", subject: "English", mark: 45, maximum: 50 });
  assert.equal(saved.success, true);
  const result = api.evaluate({ studentId: "STU-001", classId: "CLASS-REF-1", term: "Term 1", subject: "English" });
  assert.equal(result.status, "recommendation-ready");
  assert.equal(result.recommendation, "extension");
  assert.equal(result.reviewStatus, "pending-teacher-review");
});

test("unmarked, another student's, or another term's work cannot count as evidence", () => {
  const { api, storage } = harness();
  storage.setItem("pacificEducationActivityResponses", JSON.stringify([
    activity("STU-001", 1, "pending-teacher-review"),
    activity("STU-002", 2, "teacher-approved"),
    activity("STU-001", 3, "teacher-approved", "Term 2"),
    activity("STU-001", 4, "teacher-approved", "Term 1", "Mathematics")
  ]));
  const result = api.evaluate({ studentId: "STU-001", classId: "CLASS-REF-1", term: "Term 1", subject: "English" });
  assert.equal(result.status, "awaiting-evidence");
  assert.equal(result.markedActivities, 0);
});

test("teacher adjustments require a reason and are recorded against the same learner/class/term/subject", () => {
  const { api, storage } = harness();
  storage.setItem("pacificEducationActivityResponses", JSON.stringify([
    activity("STU-001", 1, "teacher-approved"),
    activity("STU-001", 2, "teacher-approved"),
    activity("STU-001", 3, "teacher-approved"),
    activity("STU-001", 4, "teacher-approved"),
    activity("STU-001", 5, "teacher-approved")
  ]));
  api.recordTermMark({ studentId: "STU-001", classId: "CLASS-REF-1", term: "Term 1", subject: "English", mark: 35, maximum: 50 });
  const input = { studentId: "STU-001", classId: "CLASS-REF-1", term: "Term 1", subject: "English", finalLevel: "developing" };
  assert.equal(api.reviewRecommendation(input).success, false);
  const reviewed = api.reviewRecommendation({ ...input, reason: "Teacher observed successful independent work after reassessment." });
  assert.equal(reviewed.success, true);
  assert.equal(reviewed.review.status, "adjusted");
  assert.equal(reviewed.review.finalLevel, "developing");
});
