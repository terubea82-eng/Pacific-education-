"use strict";

const UUID_V4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ID = /^[A-Za-z0-9_-]{1,128}$/;
const ALLOWED_KEYS = new Set(["eventId", "classId", "activityId", "response", "queuedAt"]);
const RESPONSE_KEYS = new Set(["completed", "answerText"]);

function fail(code, message) {
  const error = new Error(message);
  error.code = code;
  throw error;
}

function validatePayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) fail("invalid-argument", "A progress submission object is required.");
  for (const key of Object.keys(data)) {
    if (!ALLOWED_KEYS.has(key)) fail("invalid-argument", "Unsupported field: " + key);
  }
  if (!UUID_V4.test(data.eventId || "")) fail("invalid-argument", "eventId must be a random UUID v4.");
  if (!SAFE_ID.test(data.classId || "") || !SAFE_ID.test(data.activityId || "")) fail("invalid-argument", "Invalid class or activity reference.");
  if (typeof data.queuedAt !== "string" || Number.isNaN(Date.parse(data.queuedAt)) || data.queuedAt.length > 40) {
    fail("invalid-argument", "queuedAt must be an ISO-compatible client queue timestamp.");
  }
  const response = data.response;
  if (!response || typeof response !== "object" || Array.isArray(response)) fail("invalid-argument", "A learner response object is required.");
  for (const key of Object.keys(response)) {
    if (!RESPONSE_KEYS.has(key)) fail("invalid-argument", "Unsupported response field: " + key);
  }
  if (typeof response.completed !== "boolean") fail("invalid-argument", "response.completed must be boolean.");
  if (response.answerText !== undefined && (typeof response.answerText !== "string" || response.answerText.length > 4000)) {
    fail("invalid-argument", "answerText must be text of at most 4000 characters.");
  }
  return {
    eventId: data.eventId.toLowerCase(),
    classId: data.classId,
    activityId: data.activityId,
    queuedAt: new Date(data.queuedAt).toISOString(),
    response: {
      completed: response.completed,
      ...(response.answerText === undefined ? {} : { answerText: response.answerText })
    }
  };
}

function createSubmitLearnerProgress({ getAccount, getMembership, getActivity, commitEvent }) {
  if (![getAccount, getMembership, getActivity, commitEvent].every(fn => typeof fn === "function")) {
    throw new TypeError("All trusted repository functions are required.");
  }

  return async function submitLearnerProgress({ auth, data }) {
    if (!auth || typeof auth.uid !== "string" || !auth.uid) fail("unauthenticated", "Sign-in is required.");
    const payload = validatePayload(data);

    const [account, membership, activity] = await Promise.all([
      getAccount(auth.uid),
      getMembership(payload.classId, auth.uid),
      getActivity(payload.activityId)
    ]);

    if (!account || account.role !== "student" || account.status !== "active") {
      fail("permission-denied", "An active learner account is required.");
    }
    if (!membership || membership.role !== "student" || membership.active !== true) {
      fail("permission-denied", "Active learner membership in this class is required.");
    }
    if (!activity || activity.status !== "approved" || activity.published !== true) {
      fail("failed-precondition", "The activity is not approved for learner progress.");
    }
    if (!membership.classLevel || activity.classLevel !== membership.classLevel ||
        !membership.curriculumVersion || activity.curriculumVersion !== membership.curriculumVersion) {
      fail("permission-denied", "The activity does not match the learner's approved class curriculum.");
    }

    const committed = await commitEvent({
      uid: auth.uid,
      eventId: payload.eventId,
      classId: payload.classId,
      activityId: payload.activityId,
      curriculumVersion: activity.curriculumVersion,
      classLevel: activity.classLevel,
      subjectId: activity.subjectId,
      term: activity.term,
      week: activity.week,
      day: activity.day,
      response: payload.response,
      queuedAt: payload.queuedAt
    });

    return {
      acknowledged: true,
      eventId: payload.eventId,
      queuedAt: payload.queuedAt,
      duplicate: committed.duplicate === true
    };
  };
}

module.exports = { createSubmitLearnerProgress, validatePayload };
