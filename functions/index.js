const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const { logger } = require("firebase-functions");
const { initializeApp } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();
const auth = getAuth();
const OWNER_EMAIL = defineSecret("OWNER_EMAIL");
const REGION = "australia-southeast1";

function requireAuth(request) {
  if (!request.auth || !request.auth.uid) {
    throw new HttpsError("unauthenticated", "Sign in is required.");
  }
  return request.auth;
}

function requireOwner(request) {
  const user = requireAuth(request);
  if (user.token && user.token.owner === true) return user;
  throw new HttpsError("permission-denied", "Owner authorization is required.");
}

function cleanText(value, max) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function audit(uid, action, resourceType, resourceId, outcome, metadata = {}) {
  return db.collection("audit_events").add({
    uid, action, resourceType, resourceId: resourceId || null,
    outcome, metadata, createdAt: FieldValue.serverTimestamp()
  });
}

exports.health = onCall(
  { region: REGION, enforceAppCheck: true },
  async () => ({
    service: "pacific-education-backend",
    status: "ok",
    serverTime: new Date().toISOString()
  })
);

exports.bootstrapOwner = onCall(
  { region: REGION, enforceAppCheck: true, secrets: [OWNER_EMAIL] },
  async (request) => {
    const user = requireAuth(request);
    const email = String(user.token.email || "").trim().toLowerCase();
    const configuredOwner = String(OWNER_EMAIL.value() || "").trim().toLowerCase();

    if (!configuredOwner || email !== configuredOwner) {
      await audit(user.uid, "OWNER_BOOTSTRAP_DENIED", "account", user.uid, "denied");
      throw new HttpsError("permission-denied", "This account is not the configured owner account.");
    }

    await auth.setCustomUserClaims(user.uid, { owner: true, role: "owner" });

    await db.collection("accounts").doc(user.uid).set({
      uid: user.uid, email, role: "owner", status: "active",
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });

    await audit(user.uid, "OWNER_BOOTSTRAP", "account", user.uid, "success");
    return { success: true, role: "owner" };
  }
);

exports.getMyData = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    const user = requireAuth(request);
    const uid = user.uid;
    const [accountSnap, progressSnap, assessmentsSnap] = await Promise.all([
      db.collection("accounts").doc(uid).get(),
      db.collection("progress").where("uid", "==", uid).limit(200).get(),
      db.collection("assessments").where("uid", "==", uid).limit(100).get()
    ]);
    await audit(uid, "GET_MY_DATA", "account", uid, "success");
    return {
      account: accountSnap.exists ? accountSnap.data() : null,
      progress: progressSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() })),
      assessments: assessmentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    };
  }
);

exports.upsertProfile = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    const user = requireAuth(request);
    const data = request.data && typeof request.data === "object" ? request.data : {};
    const displayName = cleanText(data.displayName, 120);
    const country = cleanText(data.country, 80);
    await db.collection("profiles").doc(user.uid).set({
      uid: user.uid, displayName, country, updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    await db.collection("accounts").doc(user.uid).set({
      uid: user.uid,
      email: String(user.token.email || "").trim().toLowerCase(),
      status: "active",
      role: user.token.owner === true ? "owner" : (user.token.role || "student"),
      updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    await audit(user.uid, "PROFILE_UPSERT", "profile", user.uid, "success");
    return { success: true };
  }
);

exports.recordProgress = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    const user = requireAuth(request);
    const data = request.data && typeof request.data === "object" ? request.data : {};
    const lessonId = cleanText(data.lessonId, 160);
    const day = Number(data.day);
    const status = cleanText(data.status, 40);
    if (!lessonId || !Number.isInteger(day) || day < 1 || day > 365 || !status) {
      throw new HttpsError("invalid-argument", "Valid lessonId, day and status are required.");
    }
    const docId = user.uid + "_" + lessonId.replace(/[^A-Za-z0-9_-]/g, "_");
    await db.collection("progress").doc(docId).set({
      uid: user.uid, lessonId, day, status, updatedAt: FieldValue.serverTimestamp()
    }, { merge: true });
    await audit(user.uid, "PROGRESS_UPSERT", "progress", docId, "success");
    return { success: true, id: docId };
  }
);

exports.recordAssessment = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    const user = requireAuth(request);
    const data = request.data && typeof request.data === "object" ? request.data : {};
    const assessmentId = cleanText(data.assessmentId, 160);
    const assessmentType = cleanText(data.assessmentType, 80);
    const score = Number(data.score);
    if (!assessmentId || !assessmentType || !Number.isFinite(score) || score < 0) {
      throw new HttpsError("invalid-argument", "Valid assessment data is required.");
    }
    const ref = db.collection("assessments").doc(
      user.uid + "_" + assessmentId.replace(/[^A-Za-z0-9_-]/g, "_")
    );
    await ref.set({
      uid: user.uid, assessmentId, assessmentType, score, status: "recorded",
      updatedAt: FieldValue.serverTimestamp(), verifiedBy: null
    }, { merge: true });
    await audit(user.uid, "ASSESSMENT_RECORD", "assessment", ref.id, "success");
    return { success: true, id: ref.id };
  }
);

exports.submitFeedback = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    const user = requireAuth(request);
    const data = request.data && typeof request.data === "object" ? request.data : {};
    const message = cleanText(data.message, 2000);
    if (!message) throw new HttpsError("invalid-argument", "Feedback message is required.");
    const ref = await db.collection("feedback").add({
      uid: user.uid,
      role: user.token.owner === true ? "owner" : (user.token.role || "student"),
      message, page: cleanText(data.page, 300), level: cleanText(data.level, 80),
      status: "new", createdAt: FieldValue.serverTimestamp()
    });
    await audit(user.uid, "FEEDBACK_SUBMIT", "feedback", ref.id, "success");
    return { success: true, id: ref.id };
  }
);

exports.ownerDashboard = onCall(
  { region: REGION, enforceAppCheck: true },
  async (request) => {
    const user = requireOwner(request);
    const [accounts, feedback] = await Promise.all([
      db.collection("accounts").limit(5000).get(),
      db.collection("feedback").limit(100).get()
    ]);
    await audit(user.uid, "OWNER_DASHBOARD_READ", "dashboard", "owner", "success");
    return {
      accountCount: accounts.size,
      feedback: feedback.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
    };
  }
);

logger.info("Pacific Education backend loaded.");
