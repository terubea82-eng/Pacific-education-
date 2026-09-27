/*
 * Pacific Education Firebase Web Integration
 * Firebase Web SDK 12.19.0
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyC8vXzLwsKMfr5MUmXEm2GflW7c-l6a06E",
    authDomain: "pacedu-fe868.firebaseapp.com",
    projectId: "pacedu-fe868",
    storageBucket: "pacedu-fe868.firebasestorage.app",
    messagingSenderId: "749310796890",
    appId: "1:749310796890:web:754e612e1f40275759a463",
    measurementId: "G-6JHLG5SN1Y"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);

async function registerWithEmail(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

async function loginWithEmail(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

async function logoutFirebase() {
    return signOut(auth);
}

function observeAuthState(callback) {
    return onAuthStateChanged(auth, callback);
}

console.info("Pacific Education Firebase initialized");

window.PacificEducationFirebase = {
    app,
    analytics,
    auth,
    registerWithEmail,
    loginWithEmail,
    logoutFirebase,
    observeAuthState
};

document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("firebaseAuthEmail");
    const passwordInput = document.getElementById("firebaseAuthPassword");
    const loginButton = document.getElementById("firebaseLoginButton");
    const registerButton = document.getElementById("firebaseRegisterButton");
    const logoutButton = document.getElementById("firebaseLogoutButton");
    const status = document.getElementById("firebaseAuthStatus");

    if (!emailInput || !passwordInput || !loginButton ||
        !registerButton || !logoutButton || !status) {
        return;
    }

    function showStatus(message) {
        status.textContent = message;
    }

    function getCredentials() {
        return {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };
    }

    registerButton.addEventListener("click", async function () {
        const credentials = getCredentials();

        if (!credentials.email || !credentials.password) {
            showStatus("Enter an email address and password.");
            return;
        }

        showStatus("Creating account...");

        try {
            await registerWithEmail(credentials.email, credentials.password);
            await createOrUpdateUserProfile(auth.currentUser);
            showStatus("Account created and signed in.");
        } catch (error) {
            showStatus("Account creation failed: " + (error.code || error.message));
        }
    });

    loginButton.addEventListener("click", async function () {
        const credentials = getCredentials();

        if (!credentials.email || !credentials.password) {
            showStatus("Enter an email address and password.");
            return;
        }

        showStatus("Signing in...");

        try {
            await loginWithEmail(credentials.email, credentials.password);
            await createOrUpdateUserProfile(auth.currentUser);
            showStatus("Signed in successfully.");
        } catch (error) {
            showStatus("Sign-in failed: " + (error.code || error.message));
        }
    });

    logoutButton.addEventListener("click", async function () {
        showStatus("Signing out...");

        try {
            await logoutFirebase();
            showStatus("Signed out.");
        } catch (error) {
            showStatus("Sign-out failed: " + (error.code || error.message));
        }
    });

    observeAuthState(function (user) {
        if (user) {
            emailInput.value = user.email || "";
            passwordInput.value = "";
            loginButton.hidden = true;
            registerButton.hidden = true;
            logoutButton.hidden = false;
            showStatus("Signed in: " + (user.email || "account"));
        } else {
            loginButton.hidden = false;
            registerButton.hidden = false;
            logoutButton.hidden = true;
            showStatus("Not signed in.");
        }
    });
});

document.addEventListener("DOMContentLoaded", function () {
    const emailInput = document.getElementById("firebaseAuthEmail");
    const passwordInput = document.getElementById("firebaseAuthPassword");
    const loginButton = document.getElementById("firebaseLoginButton");
    const registerButton = document.getElementById("firebaseRegisterButton");
    const logoutButton = document.getElementById("firebaseLogoutButton");
    const status = document.getElementById("firebaseAuthStatus");

    if (!emailInput || !passwordInput || !loginButton ||
        !registerButton || !logoutButton || !status) {
        return;
    }

    function showStatus(message) {
        status.textContent = message;
    }

    function getCredentials() {
        return {
            email: emailInput.value.trim(),
            password: passwordInput.value
        };
    }

    registerButton.addEventListener("click", async function () {
        const credentials = getCredentials();

        if (!credentials.email || !credentials.password) {
            showStatus("Enter an email address and password.");
            return;
        }

        showStatus("Creating account...");

        try {
            await registerWithEmail(credentials.email, credentials.password);
            await createOrUpdateUserProfile(auth.currentUser);
            showStatus("Account created and signed in.");
        } catch (error) {
            showStatus("Account creation failed: " + (error.code || error.message));
        }
    });

    loginButton.addEventListener("click", async function () {
        const credentials = getCredentials();

        if (!credentials.email || !credentials.password) {
            showStatus("Enter an email address and password.");
            return;
        }

        showStatus("Signing in...");

        try {
            await loginWithEmail(credentials.email, credentials.password);
            await createOrUpdateUserProfile(auth.currentUser);
            showStatus("Signed in successfully.");
        } catch (error) {
            showStatus("Sign-in failed: " + (error.code || error.message));
        }
    });

    logoutButton.addEventListener("click", async function () {
        showStatus("Signing out...");

        try {
            await logoutFirebase();
            showStatus("Signed out.");
        } catch (error) {
            showStatus("Sign-out failed: " + (error.code || error.message));
        }
    });

    observeAuthState(function (user) {
        if (user) {
            emailInput.value = user.email || "";
            passwordInput.value = "";
            loginButton.hidden = true;
            registerButton.hidden = true;
            logoutButton.hidden = false;
            showStatus("Signed in: " + (user.email || "account"));
        } else {
            loginButton.hidden = false;
            registerButton.hidden = false;
            logoutButton.hidden = true;
            showStatus("Not signed in.");
        }
    });
});

import {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-firestore.js";

const db = getFirestore(app);

async function createOrUpdateUserProfile(user) {
    if (!user || !user.uid) {
        throw new Error("Authenticated user is required.");
    }

    const userRef = doc(db, "users", user.uid);

    await setDoc(userRef, {
        uid: user.uid,
        email: user.email || "",
        lastSignInAt: serverTimestamp()
    }, { merge: true });

    return userRef;
}

async function getUserProfile(user) {
    if (!user || !user.uid) {
        throw new Error("Authenticated user is required.");
    }

    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    return snapshot.exists() ? snapshot.data() : null;
}

window.PacificEducationFirebase.createOrUpdateUserProfile =
    createOrUpdateUserProfile;

window.PacificEducationFirebase.getUserProfile =
    getUserProfile;
