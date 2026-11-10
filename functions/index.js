"use strict";

const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");
const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const { createSubmitLearnerProgress } = require("./src/submitLearnerProgressCore");

initializeApp();
setGlobalOptions({ region: "asia-southeast1", maxInstances: 5 });

const db = getFirestore();

const submitCore = createSubmitLearnerProgress({
  getAccount: async uid => {
    const snap = await db.doc("accountControl/" + uid).get();
    return snap.exists ? snap.data() : null;
  },
  getMembership: async (classId, uid) => {
    const snap = await db.doc("classes/" + classId + "/members/" + uid).get();
    return snap.exists ? snap.data() : null;
  },
  getActivity: async activityId => {
    const snap = await db.doc("approvedActivities/" + activityId).get();
    return snap.exists ? snap.data() : null;
  },
  commitEvent: async event => {
    const ref = db.doc("progressEvents/" + event.uid + "_" + event.eventId);
    return db.runTransaction(async transaction => {
      const existing = await transaction.get(ref);
      if (existing.exists) {
        const prior = existing.data();
        const same = prior.activityId === event.activityId &&
          prior.classId === event.classId &&
          JSON.stringify(prior.response) === JSON.stringify(event.response);
        if (!same) throw new HttpsError("already-exists", "This event ID was already used for a different submission.");
        return { duplicate: true };
      }
      transaction.create(ref, {
        ...event,
        receivedAt: FieldValue.serverTimestamp(),
        recordType: "learner-progress-submission"
      });
      return { duplicate: false };
    });
  }
});

exports.submitLearnerProgress = onCall({ enforceAppCheck: false }, async request => {
  try {
    return await submitCore({ auth: request.auth, data: request.data });
  } catch (error) {
    if (error instanceof HttpsError) throw error;
    const allowed = new Set(["invalid-argument", "unauthenticated", "permission-denied", "failed-precondition", "already-exists"]);
    if (allowed.has(error.code)) throw new HttpsError(error.code, error.message);
    console.error("submitLearnerProgress failed", { code: error.code || "internal" });
    throw new HttpsError("internal", "Progress submission could not be saved. Keep the item in the offline queue and retry.");
  }
});
