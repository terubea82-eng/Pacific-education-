const { after, before, test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");
const {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
} = require("firebase/firestore");

const projectId = "demo-pacedu-firestore-rules";
const rules = fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8");
let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
  });
});

after(async () => {
  await testEnv?.cleanup();
});

test("unauthenticated users cannot read or write protected collections", async () => {
  const db = testEnv.unauthenticatedContext().firestore();
  await assertFails(getDoc(doc(db, "users/learner-a")));
  await assertFails(setDoc(doc(db, "progress/progress-a"), {
    uid: "learner-a",
    activityId: "day-1",
  }));
  await assertFails(setDoc(doc(db, "feedback/feedback-a"), {
    uid: "learner-a",
    message: "Hello",
    category: "general",
  }));
});

test("a learner can create and read their own progress", async () => {
  const db = testEnv.authenticatedContext("learner-a").firestore();
  await assertSucceeds(setDoc(doc(db, "progress/learner-a-day-1"), {
    uid: "learner-a",
    activityId: "day-1",
    completed: false,
  }));
  await assertSucceeds(getDoc(doc(db, "progress/learner-a-day-1")));
});

test("a learner cannot read another learner's progress", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "progress/victim-record"), {
      uid: "learner-b",
      activityId: "day-2",
    });
  });

  const attackerDb = testEnv.authenticatedContext("learner-a").firestore();
  await assertFails(getDoc(doc(attackerDb, "progress/victim-record")));
});

test("a learner cannot take over another learner's progress by changing uid", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "progress/victim-record"), {
      uid: "learner-b",
      activityId: "day-2",
      completed: false,
    });
  });

  const attackerDb = testEnv.authenticatedContext("learner-a").firestore();
  await assertFails(updateDoc(doc(attackerDb, "progress/victim-record"), {
    uid: "learner-a",
    completed: true,
  }));
});

test("a learner can update their own progress but cannot transfer ownership", async () => {
  const db = testEnv.authenticatedContext("learner-a").firestore();
  await assertSucceeds(setDoc(doc(db, "progress/owned-record"), {
    uid: "learner-a",
    completed: false,
  }));
  await assertSucceeds(updateDoc(doc(db, "progress/owned-record"), {
    completed: true,
  }));
  await assertFails(updateDoc(doc(db, "progress/owned-record"), {
    uid: "learner-b",
  }));
});

test("users can create ordinary profile data but cannot self-assign a role", async () => {
  const db = testEnv.authenticatedContext("learner-a").firestore();
  await assertSucceeds(setDoc(doc(db, "users/learner-a"), {
    displayName: "Learner A",
    preferredLanguage: "English",
  }));
  await assertFails(setDoc(doc(db, "users/learner-b"), {
    displayName: "Learner B",
  }));
  const selfAssigningDb = testEnv.authenticatedContext("learner-c").firestore();
  await assertFails(setDoc(doc(selfAssigningDb, "users/learner-c"), {
    displayName: "Learner C",
    role: "owner",
  }));
  await assertFails(setDoc(doc(selfAssigningDb, "users/learner-c-custom"), {
    displayName: "Learner C",
    customRole: "owner",
  }));
});

test("users can update ordinary profile fields but cannot change role fields", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "users/learner-a"), {
      displayName: "Learner A",
      role: "student",
    });
  });

  const db = testEnv.authenticatedContext("learner-a").firestore();
  await assertSucceeds(updateDoc(doc(db, "users/learner-a"), {
    displayName: "Learner A Updated",
  }));
  await assertFails(updateDoc(doc(db, "users/learner-a"), {
    role: "owner",
  }));
  await assertFails(updateDoc(doc(db, "users/learner-a"), {
    customRole: "owner",
  }));
});

test("feedback is owner-bound, validated, and not client-readable", async () => {
  const db = testEnv.authenticatedContext("learner-a").firestore();
  await assertSucceeds(setDoc(doc(db, "feedback/valid"), {
    uid: "learner-a",
    message: "Pilot feedback",
    category: "general",
    createdAt: new Date(),
  }));
  await assertFails(setDoc(doc(db, "feedback/wrong-owner"), {
    uid: "learner-b",
    message: "Pilot feedback",
    category: "general",
  }));
  await assertFails(setDoc(doc(db, "feedback/invalid-category"), {
    uid: "learner-a",
    message: "Pilot feedback",
    category: "privileged",
  }));
  await assertFails(getDoc(doc(db, "feedback/valid")));
});

test("unlisted collections remain denied by default", async () => {
  const db = testEnv.authenticatedContext("learner-a").firestore();
  await assertFails(getDocs(collection(db, "privateExamPapers")));
  await assertFails(setDoc(doc(db, "privateExamPapers/paper-1"), {
    uid: "learner-a",
    title: "Should not be writable",
  }));
});
