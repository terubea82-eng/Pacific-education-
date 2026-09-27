/*
 * Pacific Education Firebase Web Integration
 * Firebase Web SDK 12.19.0
 */

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.19.0/firebase-analytics.js";

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

console.info("Pacific Education Firebase initialized");

window.PacificEducationFirebase = {
    app,
    analytics
};
