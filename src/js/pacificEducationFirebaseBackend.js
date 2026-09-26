/*
 * Pacific Education — Firebase backend client bridge
 * Firebase JS SDK 12.19.0
 */
(function (window, document) {
  "use strict";
  const FIREBASE_VERSION = "12.19.0";
  let readyPromise = null;
  let modules = null;

  function loadFirebase() {
    if (readyPromise) return readyPromise;
    readyPromise = Promise.all([
      import("https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/firebase-app.js"),
      import("https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/firebase-auth.js"),
      import("https://www.gstatic.com/firebasejs/" + FIREBASE_VERSION + "/firebase-functions.js")
    ]).then(([app, auth, functions]) => {
      const config = window.PacificEducationFirebaseConfig;
      if (!config || !config.projectId || String(config.projectId).indexOf("REPLACE_ME") === 0) {
        throw new Error("Firebase web configuration is not installed.");
      }
      const firebaseApp = app.initializeApp(config);
      const authClient = auth.getAuth(firebaseApp);
      const functionsClient = functions.getFunctions(firebaseApp, "australia-southeast1");
      modules = { app, auth, functions, firebaseApp, authClient, functionsClient };
      return modules;
    });
    return readyPromise;
  }

  async function signInWithGoogle() {
    const m = await loadFirebase();
    const provider = new m.auth.GoogleAuthProvider();
    const result = await m.auth.signInWithPopup(m.authClient, provider);
    return result.user;
  }

  async function signOut() {
    const m = await loadFirebase();
    await m.auth.signOut(m.authClient);
  }

  async function call(name, data) {
    const m = await loadFirebase();
    const callable = m.functions.httpsCallable(m.functionsClient, name);
    const result = await callable(data || {});
    return result.data;
  }

  function onAuthStateChanged(callback) {
    return loadFirebase().then((m) => m.auth.onAuthStateChanged(m.authClient, callback));
  }

  window.PacificEducationFirebaseBackend = Object.freeze({
    load: loadFirebase,
    signInWithGoogle,
    signOut,
    onAuthStateChanged,
    bootstrapOwner: () => call("bootstrapOwner", {}),
    getMyData: () => call("getMyData", {}),
    upsertProfile: (profile) => call("upsertProfile", profile),
    recordProgress: (progress) => call("recordProgress", progress),
    recordAssessment: (assessment) => call("recordAssessment", assessment),
    submitFeedback: (feedback) => call("submitFeedback", feedback),
    ownerDashboard: () => call("ownerDashboard", {})
  });
})(window, document);
