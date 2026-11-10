import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { initializeTestEnvironment, assertFails, assertSucceeds } from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

const PROJECT_ID = "demo-pacedu-staging";
const rules = await readFile(new URL("../firestore.staging.rules", import.meta.url), "utf8");
let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({ projectId: PROJECT_ID, firestore: { rules } });
});
beforeEach(async () => { await testEnv.clearFirestore(); });
after(async () => { await testEnv.cleanup(); });

describe("PacEdu staging Firestore authorization — fictional identities only", () => {
  it("denies unauthenticated access to learner progress", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "progress", "fictional-learner-a-day-1")));
  });
  it("denies learner A reading learner B's progress", async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), "progress", "fictional-learner-b-day-1"), { uid: "fictional-learner-b" });
    });
    const db = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(getDoc(doc(db, "progress", "fictional-learner-b-day-1")));
  });
  it("denies learner A writing a record claiming learner B", async () => {
    const db = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(setDoc(doc(db, "progress", "forged-owner"), { uid: "fictional-learner-b" }));
  });
  it("denies direct client creation of progress", async () => {
    const db = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(setDoc(doc(db, "progress", "direct-client-write"), { uid: "fictional-learner-a" }));
  });
  it("denies client creation or modification of class membership", async () => {
    const db = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(setDoc(doc(db, "classes", "fictional-class-a", "members", "fictional-learner-a"), { role: "teacher", active: true }));
  });
  it("denies client deletion of progress", async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), "progress", "fictional-learner-a-day-1"), { uid: "fictional-learner-a" });
    });
    const db = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(deleteDoc(doc(db, "progress", "fictional-learner-a-day-1")));
  });
  it("allows learners to read only their own profile", async () => {
    await testEnv.withSecurityRulesDisabled(async context => {
      await setDoc(doc(context.firestore(), "users", "fictional-learner-a"), { displayName: "Fictional Learner A" });
    });
    const db = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertSucceeds(getDoc(doc(db, "users", "fictional-learner-a")));
    await assertFails(getDoc(doc(db, "users", "fictional-learner-b")));
  });
});
