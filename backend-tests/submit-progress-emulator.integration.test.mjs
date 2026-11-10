import { after, before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, connectAuthEmulator, createUserWithEmailAndPassword } from "firebase/auth";
import { getFunctions, connectFunctionsEmulator, httpsCallable } from "firebase/functions";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import { doc, setDoc, getDoc } from "firebase/firestore";

const PROJECT_ID = "demo-pacedu-staging";
const REGION = "asia-southeast1";
const APP_NAME = "pacedu-callable-integration-test";
let app, auth, functions, testEnv, uid;

before(async () => {
  app = initializeApp({ apiKey: "fake-api-key", authDomain: "localhost", projectId: PROJECT_ID }, APP_NAME);
  auth = getAuth(app);
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  functions = getFunctions(app, REGION);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);

  testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID });
  const credential = await createUserWithEmailAndPassword(auth, "fictional.learner.a@example.test", "Fictional-Only-Password-123!");
  uid = credential.user.uid;

  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    await setDoc(doc(db, "accountControl", uid), { role: "student", status: "active" });
    await setDoc(doc(db, "classes", "fictional-class-a", "members", uid), {
      role: "student", active: true, classLevel: "Class 1", curriculumVersion: "FJ-NCF-test"
    });
    await setDoc(doc(db, "approvedActivities", "fictional-english-day-1"), {
      status: "approved", published: true, classLevel: "Class 1",
      curriculumVersion: "FJ-NCF-test", subjectId: "English", term: "Term 1", week: 1, day: 1
    });
  });

  // Verify fixture provisioning against the same Firestore emulator before invoking Functions.
  await testEnv.withSecurityRulesDisabled(async context => {
    const db = context.firestore();
    const account = await getDoc(doc(db, "accountControl", uid));
    const membership = await getDoc(doc(db, "classes", "fictional-class-a", "members", uid));
    const activity = await getDoc(doc(db, "approvedActivities", "fictional-english-day-1"));
    assert.equal(account.exists(), true, "fictional account fixture must exist in emulator");
    assert.deepEqual(account.data(), { role: "student", status: "active" });
    assert.equal(membership.exists(), true, "fictional membership fixture must exist in emulator");
    assert.equal(activity.exists(), true, "fictional approved activity fixture must exist in emulator");
  });
});

after(async () => {
  if (testEnv) await testEnv.cleanup();
  if (app) await deleteApp(app);
});

describe("submitLearnerProgress callable — Firebase Emulator integration", () => {
  it("authenticates fictional learner and stores a server-acknowledged event", async () => {
    const submit = httpsCallable(functions, "submitLearnerProgress");
    const payload = {
      eventId: "550e8400-e29b-41d4-a716-446655440001",
      classId: "fictional-class-a",
      activityId: "fictional-english-day-1",
      queuedAt: "2026-11-10T04:00:00.000Z",
      response: { completed: true, answerText: "A fictional learner response" }
    };
    const first = (await submit(payload)).data;
    assert.equal(first.acknowledged, true);
    assert.equal(first.duplicate, false);
    assert.equal(first.eventId, payload.eventId);

    const second = (await submit(payload)).data;
    assert.equal(second.acknowledged, true);
    assert.equal(second.duplicate, true);

    await testEnv.withSecurityRulesDisabled(async context => {
      const stored = await getDoc(doc(context.firestore(), "progressEvents", uid + "_" + payload.eventId));
      assert.equal(stored.exists(), true);
      assert.equal(stored.data().recordType, "learner-progress-submission");
      assert.equal(stored.data().uid, uid);
    });
  });

  it("rejects forged authoritative fields at the callable boundary", async () => {
    const submit = httpsCallable(functions, "submitLearnerProgress");
    await assert.rejects(submit({
      eventId: "550e8400-e29b-41d4-a716-446655440002",
      classId: "fictional-class-a",
      activityId: "fictional-english-day-1",
      queuedAt: "2026-11-10T04:00:00.000Z",
      response: { completed: true },
      teacherConfirmed: true
    }));
  });
});
