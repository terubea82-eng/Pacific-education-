import { readFile } from "node:fs/promises";
import { after, before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc
} from "firebase/firestore";

const PROJECT_ID = "demo-pacedu-staging";
const rules = await readFile(new URL("../firestore.rules", import.meta.url), "utf8");
let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules }
  });
});

beforeEach(async () => {
  await testEnv.clearFirestore();
});

after(async () => {
  await testEnv.cleanup();
});

describe("PacEdu Firestore authorization — fictional identities only", () => {
  it("denies unauthenticated access to a learner progress record", async () => {
    const db = testEnv.unauthenticatedContext().firestore();
    await assertFails(getDoc(doc(db, "progress", "fictional-learner-a-day-1")));
  });

  it("denies learner A reading learner B's progress", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "progress", "fictional-learner-b-day-1"), {
        uid: "fictional-learner-b",
        status: "submitted"
      });
    });

    const learnerA = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(getDoc(doc(learnerA, "progress", "fictional-learner-b-day-1")));
  });

  it("denies learner A writing a record that claims learner B as its owner", async () => {
    const learnerA = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(setDoc(doc(learnerA, "progress", "forged-owner-record"), {
      uid: "fictional-learner-b",
      status: "submitted"
    }));
  });

  it("denies direct client creation of authoritative progress", async () => {
    const learnerA = testEnv.authenticatedContext("fictional-learner-a").firestore();
    // This is an intentional acceptance test. Current main permits own-UID
    // client writes, so this test should fail until trusted server submission
    // is implemented and Firestore rules are tightened.
    await assertFails(setDoc(doc(learnerA, "progress", "direct-client-write"), {
      uid: "fictional-learner-a",
      status: "completed"
    }));
  });

  it("denies client creation or modification of class membership", async () => {
    const learnerA = testEnv.authenticatedContext("fictional-learner-a").firestore();
    const membership = doc(learnerA, "classes", "fictional-class-a", "members", "fictional-learner-a");
    await assertFails(setDoc(membership, {
      role: "teacher",
      active: true
    }));
  });

  it("denies client deletion of a progress record", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "progress", "fictional-learner-a-day-1"), {
        uid: "fictional-learner-a",
        status: "submitted"
      });
    });

    const learnerA = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertFails(deleteDoc(doc(learnerA, "progress", "fictional-learner-a-day-1")));
  });

  it("allows a learner to read only their own user profile", async () => {
    await testEnv.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), "users", "fictional-learner-a"), {
        displayName: "Fictional Learner A"
      });
    });

    const learnerA = testEnv.authenticatedContext("fictional-learner-a").firestore();
    await assertSucceeds(getDoc(doc(learnerA, "users", "fictional-learner-a")));
    await assertFails(getDoc(doc(learnerA, "users", "fictional-learner-b")));
  });
});
