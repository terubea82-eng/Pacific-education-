import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc } from "firebase/firestore";

const PROJECT_ID = "demo-pacedu-staging";
const REGION = "asia-southeast1";
const APP_NAME = "pacedu-callable-integration-test";
const PASSWORD = "Fictional-Only-Password-123!";
let app, auth, functions, testEnv;
const users = {};

const basePayload = {
  eventId: "550e8400-e29b-41d4-a716-446655440001",
  classId: "fictional-class-a",
  activityId: "fictional-english-day-1",
  queuedAt: "2026-11-10T04:00:00.000Z",
  response: { completed: true, answerText: "A fictional learner response" }
};

async function signIn(email) {
  await signInWithEmailAndPassword(auth, email, PASSWORD);
}

function submitCallable() {
  return httpsCallable(functions, "submitLearnerProgress");
}

async function expectCallableCode(promise, expectedCode) {
  await assert.rejects(promise, error => {
    assert.equal(error.code, "functions/" + expectedCode);
    return true;
  });
}

before(async () => {
  app = initializeApp({ apiKey: "fake-api-key", authDomain: "localhost", projectId: PROJECT_ID }, APP_NAME);
  auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  functions = getFunctions(app, REGION);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID });

  for (const [key, email] of [
    ["learnerA", "fictional.learner.a@example.test"],
    ["suspendedLearner", "fictional.suspended.learner@example.test"],
    ["unassignedLearner", "fictional.unassigned.learner@example.test"]
  ]) {
    const credential = await createUserWithEmailAndPassword(auth, email, PASSWORD);
    users[key] = { uid: credential.user.uid, email };
  }

  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, "accountControl", users.learnerA.uid), { role: "student", status: "active" });
    await setDoc(doc(db, "accountControl", users.suspendedLearner.uid), { role: "student", status: "suspended" });
    await setDoc(doc(db, "accountControl", users.unassignedLearner.uid), { role: "student", status: "active" });

    await setDoc(doc(db, "classes", "fictional-class-a", "members", users.learnerA.uid), {
      role: "student", active: true, classLevel: "Class 1", curriculumVersion: "FJ-NCF-test"
    });
    // Suspended account has a membership too, proving account status is independently enforced.
    await setDoc(doc(db, "classes", "fictional-class-a", "members", users.suspendedLearner.uid), {
      role: "student", active: true, classLevel: "Class 1", curriculumVersion: "FJ-NCF-test"
    });
    await setDoc(doc(db, "approvedActivities", "fictional-english-day-1"), {
      status: "approved", published: true, classLevel: "Class 1",
      curriculumVersion: "FJ-NCF-test", subjectId: "English", term: "Term 1", week: 1, day: 1
    });
  });

  // Verify trusted fixtures exist in the same Firestore emulator used by the Functions emulator.
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    for (const key of ["learnerA", "suspendedLearner", "unassignedLearner"]) {
      const account = await getDoc(doc(db, "accountControl", users[key].uid));
      assert.equal(account.exists(), true, key + " account fixture must exist");
    }
    const membership = await getDoc(doc(db, "classes", "fictional-class-a", "members", users.learnerA.uid));
    const activity = await getDoc(doc(db, "approvedActivities", "fictional-english-day-1"));
    assert.equal(membership.exists(), true, "learner A membership fixture must exist");
    assert.equal(activity.exists(), true, "approved activity fixture must exist");
  });

  await signIn(users.learnerA.email);
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
  if (app) await deleteApp(app);
});

describe("submitLearnerProgress callable — Firebase Emulator integration", () => {
  it("authenticates a fictional learner and stores an exactly acknowledged event", async () => {
    const submit = submitCallable();
    const first = (await submit(basePayload)).data;
    assert.equal(first.acknowledged, true);
    assert.equal(first.duplicate, false);
    assert.equal(first.eventId, basePayload.eventId);

    const second = (await submit(basePayload)).data;
    assert.equal(second.acknowledged, true);
    assert.equal(second.duplicate, true);

    await testEnv.withSecurityRulesDisabled(async context => {
      const stored = await getDoc(doc(context.firestore(), "progressEvents", users.learnerA.uid + "_" + basePayload.eventId));
      assert.equal(stored.exists(), true);
      assert.equal(stored.data().recordType, "learner-progress-submission");
      assert.equal(stored.data().uid, users.learnerA.uid);
    });
  });

  it("rejects reuse of an event ID with altered submission content", async () => {
    await expectCallableCode(submitCallable()({
      ...basePayload,
      response: { completed: true, answerText: "A different answer using the same event ID" }
    }), "already-exists");
  });

  it("rejects a suspended learner even when a class membership exists", async () => {
    await signIn(users.suspendedLearner.email);
    await expectCallableCode(submitCallable()({
      ...basePayload,
      eventId: "550e8400-e29b-41d4-a716-446655440003"
    }), "permission-denied");
    await signIn(users.learnerA.email);
  });

  it("rejects an active learner with no membership in the requested class", async () => {
    await signIn(users.unassignedLearner.email);
    await expectCallableCode(submitCallable()({
      ...basePayload,
      eventId: "550e8400-e29b-41d4-a716-446655440004"
    }), "permission-denied");
    await signIn(users.learnerA.email);
  });

  it("rejects a learner attempting to submit against another class", async () => {
    await expectCallableCode(submitCallable()({
      ...basePayload,
      eventId: "550e8400-e29b-41d4-a716-446655440005",
      classId: "fictional-class-b"
    }), "permission-denied");
  });

  it("rejects forged authoritative fields at the callable boundary", async () => {
    for (const field of ["teacherConfirmed", "score", "rank", "studentUid", "role", "schoolId"]) {
      await expectCallableCode(submitCallable()({
        ...basePayload,
        eventId: "550e8400-e29b-41d4-a716-446655440006",
        [field]: "forged"
      }), "invalid-argument");
    }
  });
});
