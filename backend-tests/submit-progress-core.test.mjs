import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { createSubmitLearnerProgress } = require("../functions/src/submitLearnerProgressCore.js");

const base = {
  eventId: "550e8400-e29b-41d4-a716-446655440000",
  classId: "fictional-class-a",
  activityId: "fictional-english-day-1",
  queuedAt: "2026-11-10T04:00:00.000Z",
  response: { completed: true, answerText: "A fictional answer" }
};
const account = { role: "student", status: "active" };
const membership = { role: "student", active: true, classLevel: "Class 1", curriculumVersion: "FJ-NCF-test" };
const activity = { status: "approved", published: true, classLevel: "Class 1", curriculumVersion: "FJ-NCF-test", subjectId: "English", term: "Term 1", week: 1, day: 1 };

function service(overrides = {}) {
  const committed = [];
  const handler = createSubmitLearnerProgress({
    getAccount: async () => account,
    getMembership: async () => membership,
    getActivity: async () => activity,
    commitEvent: async event => { committed.push(event); return { duplicate: false }; },
    ...overrides
  });
  return { handler, committed };
}

describe("submitLearnerProgress authorization core — fictional data", () => {
  it("rejects unauthenticated calls", async () => {
    const { handler } = service();
    await assert.rejects(handler({ auth: null, data: base }), { code: "unauthenticated" });
  });
  it("accepts an active learner in the approved class and curriculum", async () => {
    const { handler, committed } = service();
    const result = await handler({ auth: { uid: "fictional-learner-a" }, data: base });
    assert.equal(result.acknowledged, true);
    assert.equal(result.eventId, base.eventId);
    assert.equal(committed.length, 1);
    assert.equal(committed[0].uid, "fictional-learner-a");
  });
  it("rejects inactive or non-learner accounts", async () => {
    const { handler } = service({ getAccount: async () => ({ role: "teacher", status: "active" }) });
    await assert.rejects(handler({ auth: { uid: "fictional-teacher-a" }, data: base }), { code: "permission-denied" });
  });
  it("rejects missing or inactive class membership", async () => {
    const { handler } = service({ getMembership: async () => ({ role: "student", active: false }) });
    await assert.rejects(handler({ auth: { uid: "fictional-learner-a" }, data: base }), { code: "permission-denied" });
  });
  it("rejects unapproved activities", async () => {
    const { handler } = service({ getActivity: async () => ({ ...activity, status: "pending" }) });
    await assert.rejects(handler({ auth: { uid: "fictional-learner-a" }, data: base }), { code: "failed-precondition" });
  });
  it("rejects activities outside the learner's curriculum", async () => {
    const { handler } = service({ getActivity: async () => ({ ...activity, classLevel: "Class 2" }) });
    await assert.rejects(handler({ auth: { uid: "fictional-learner-a" }, data: base }), { code: "permission-denied" });
  });
  it("rejects client-supplied score, rank, approval, role and identity fields", async () => {
    const { handler } = service();
    for (const key of ["score", "rank", "teacherConfirmed", "reviewedBy", "studentUid", "role", "schoolId"]) {
      await assert.rejects(handler({ auth: { uid: "fictional-learner-a" }, data: { ...base, [key]: "forged" } }), { code: "invalid-argument" });
    }
  });
  it("rejects malformed event IDs and oversized answers", async () => {
    const { handler } = service();
    await assert.rejects(handler({ auth: { uid: "fictional-learner-a" }, data: { ...base, eventId: "not-a-uuid" } }), { code: "invalid-argument" });
    await assert.rejects(handler({ auth: { uid: "fictional-learner-a" }, data: { ...base, response: { completed: true, answerText: "x".repeat(4001) } } }), { code: "invalid-argument" });
  });
});
