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
const { ref, uploadBytes, getBytes } = require("firebase/storage");

const projectId = "demo-pacedu-firestore-rules";
const rules = fs.readFileSync(path.join(__dirname, "..", "firestore.rules"), "utf8");
const storageRules = fs.readFileSync(path.join(__dirname, "..", "storage.rules"), "utf8");
let testEnv;

before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId,
    firestore: { rules },
    storage: { rules: storageRules },
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
  await assertFails(setDoc(doc(selfAssigningDb, "users/learner-c"), {
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


async function seedClassMembership(classId, uid, role, active = true) {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "classes", classId, "members", uid), {
      role,
      active,
    });
  });
}

function validPhotoSubmission(overrides = {}) {
  return {
    studentUid: "student-a",
    studentReference: "FJ-001",
    studentName: "Learner A",
    classId: "class-1",
    classLevel: "Year 4",
    subject: "English",
    term: "Term 1",
    activityId: "english-day-1",
    day: 1,
    responseMode: "photo-evidence",
    reviewStatus: "pending-teacher-review",
    storagePath: "learnerWork/class-1/student-a/submission-a/photo.jpg",
    photoContentType: "image/jpeg",
    photoSizeBytes: 204800,
    createdAt: new Date(),
    ...overrides,
  };
}

test("learner can create and read their own pending photo-review metadata", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  const db = testEnv.authenticatedContext("student-a").firestore();
  await assertSucceeds(setDoc(
    doc(db, "learnerSubmissions/submission-a"),
    validPhotoSubmission(),
  ));
  await assertSucceeds(getDoc(doc(db, "learnerSubmissions/submission-a")));
});

test("learner can submit photo evidence without a display name", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  const db = testEnv.authenticatedContext("student-a").firestore();
  const submission = validPhotoSubmission();
  delete submission.studentName;
  await assertSucceeds(setDoc(doc(db, "learnerSubmissions/submission-no-name"), submission));
});

test("learner cannot submit as another student or use an unassigned class", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  const db = testEnv.authenticatedContext("student-a").firestore();
  await assertFails(setDoc(
    doc(db, "learnerSubmissions/impersonation"),
    validPhotoSubmission({ studentUid: "student-b" }),
  ));
  await assertFails(setDoc(
    doc(db, "learnerSubmissions/unassigned"),
    validPhotoSubmission({ classId: "class-unknown" }),
  ));
});

test("photo metadata rejects unsafe paths, oversized images, and client-chosen review status", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  const db = testEnv.authenticatedContext("student-a").firestore();
  await assertFails(setDoc(
    doc(db, "learnerSubmissions/wrong-path"),
    validPhotoSubmission({ storagePath: "learnerWork/class-1/student-b/private.jpg" }),
  ));
  await assertFails(setDoc(
    doc(db, "learnerSubmissions/oversized"),
    validPhotoSubmission({ photoSizeBytes: 9 * 1024 * 1024 }),
  ));
  await assertFails(setDoc(
    doc(db, "learnerSubmissions/self-approved"),
    validPhotoSubmission({ reviewStatus: "approved" }),
  ));
  await assertFails(setDoc(
    doc(db, "learnerSubmissions/base64"),
    validPhotoSubmission({ photoContentType: "text/plain" }),
  ));
});

test("assigned teacher can read and review a submission but cannot change learner identity", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  await seedClassMembership("class-1", "teacher-a", "teacher");
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "learnerSubmissions/submission-a"), validPhotoSubmission());
  });
  const teacherDb = testEnv.authenticatedContext("teacher-a").firestore();
  await assertSucceeds(getDoc(doc(teacherDb, "learnerSubmissions/submission-a")));
  await assertSucceeds(updateDoc(doc(teacherDb, "learnerSubmissions/submission-a"), {
    reviewStatus: "approved",
    teacherFeedback: "Clear work. Well done.",
    reviewedBy: "teacher-a",
    reviewedAt: new Date(),
  }));
  await assertFails(updateDoc(doc(teacherDb, "learnerSubmissions/submission-a"), {
    studentUid: "teacher-a",
  }));
});

test("unassigned teacher and another learner cannot read the submission", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  await seedClassMembership("class-2", "teacher-outsider", "teacher");
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "learnerSubmissions/submission-a"), validPhotoSubmission());
  });
  const outsiderDb = testEnv.authenticatedContext("teacher-outsider").firestore();
  const otherLearnerDb = testEnv.authenticatedContext("student-b").firestore();
  await assertFails(getDoc(doc(outsiderDb, "learnerSubmissions/submission-a")));
  await assertFails(getDoc(doc(otherLearnerDb, "learnerSubmissions/submission-a")));
});

test("only an assigned teacher can write a valid review and clients cannot delete submissions", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  await seedClassMembership("class-1", "teacher-a", "teacher");
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "learnerSubmissions/submission-a"), validPhotoSubmission());
  });
  const studentDb = testEnv.authenticatedContext("student-a").firestore();
  const teacherDb = testEnv.authenticatedContext("teacher-a").firestore();
  await assertFails(updateDoc(doc(studentDb, "learnerSubmissions/submission-a"), {
    reviewStatus: "approved",
    teacherFeedback: "Self-approved",
    reviewedBy: "student-a",
    reviewedAt: new Date(),
  }));
  await assertFails(updateDoc(doc(teacherDb, "learnerSubmissions/submission-a"), {
    reviewStatus: "approved",
    teacherFeedback: "Wrong reviewer",
    reviewedBy: "teacher-b",
    reviewedAt: new Date(),
  }));
  await assertFails(updateDoc(doc(teacherDb, "learnerSubmissions/submission-a"), {
    reviewStatus: "auto-marked",
    teacherFeedback: "Not allowed",
    reviewedBy: "teacher-a",
    reviewedAt: new Date(),
  }));
});


test("private photo storage permits assigned learner upload and assigned teacher read only", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  await seedClassMembership("class-1", "teacher-a", "teacher");
  await seedClassMembership("class-2", "teacher-outsider", "teacher");

  const objectPath = "learnerWork/class-1/student-a/submission-storage-a/photo.jpg";
  const studentStorage = testEnv.authenticatedContext("student-a").storage();
  const teacherStorage = testEnv.authenticatedContext("teacher-a").storage();
  const outsiderStorage = testEnv.authenticatedContext("teacher-outsider").storage();
  const studentObject = ref(studentStorage, objectPath);
  const imageBytes = new Uint8Array([255, 216, 255, 217]);

  await assertSucceeds(uploadBytes(studentObject, imageBytes, { contentType: "image/jpeg" }));
  await assertSucceeds(getBytes(ref(teacherStorage, objectPath)));
  await assertFails(getBytes(ref(outsiderStorage, objectPath)));
});

test("private photo storage rejects cross-learner upload, oversized file, and unsupported content type", async () => {
  await seedClassMembership("class-1", "student-a", "student");
  const studentStorage = testEnv.authenticatedContext("student-a").storage();

  await assertFails(uploadBytes(
    ref(studentStorage, "learnerWork/class-1/student-b/foreign/photo.jpg"),
    new Uint8Array([255, 216, 255, 217]),
    { contentType: "image/jpeg" },
  ));
  await assertFails(uploadBytes(
    ref(studentStorage, "learnerWork/class-1/student-a/too-large/photo.jpg"),
    new Uint8Array(8 * 1024 * 1024 + 1),
    { contentType: "image/jpeg" },
  ));
  await assertFails(uploadBytes(
    ref(studentStorage, "learnerWork/class-1/student-a/not-jpeg/photo.jpg"),
    new Uint8Array([1, 2, 3]),
    { contentType: "text/plain" },
  ));
});
