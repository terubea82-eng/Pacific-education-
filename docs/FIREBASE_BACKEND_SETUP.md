# Pacific Education — Firebase backend setup

This connects the existing Pacific Education app to a backend owned and controlled through the owner's Google account.

## What is stored where

- Google/Firebase Authentication: user identities and sign-in sessions.
- Cloud Firestore: accounts, profiles, learning progress, assessments, feedback and audit events.
- Cloud Functions: server-side authorization and protected reads/writes.
- GitHub: source code only; no passwords, service-account keys or App Check debug tokens.

The Gmail account is the Google account that owns/administers the Firebase project. Gmail itself is not used as a database.

## 1. Create the Firebase project

Using the owner's Google account, create a Firebase project for Pacific Education.

Add a Web app and copy its Firebase web configuration.

Edit:
src/js/pacificEducationFirebaseConfig.js

using:
src/js/pacificEducationFirebaseConfig.js.example

The Firebase web configuration is intended for client initialization. Never put a service-account private key in the repository.

## 2. Enable Authentication

In Firebase Console:
- Authentication
- Sign-in providers
- Enable Google

## 3. Create Cloud Firestore

Create Cloud Firestore in production mode.

The repository rules deliberately deny direct browser database access. The application talks through Cloud Functions.

## 4. Install Firebase CLI

On the development device:

npm install -g firebase-tools
firebase login

Use the owner's Google account.

## 5. Select the project

Copy .firebaserc.example to .firebaserc and replace the project ID.

Then run:

firebase use YOUR_PROJECT_ID

## 6. Set the owner identity as a server secret

Run:

firebase functions:secrets:set OWNER_EMAIL

Enter the owner's Gmail address when prompted.

The owner email is therefore kept in Google Secret Manager rather than public GitHub source.

## 7. Install backend dependencies

From the repository root:

cd functions
npm install
cd ..

## 8. Deploy backend

firebase deploy --only firestore:rules,functions

## 9. First owner login

1. Open the Pacific Education web app.
2. Sign in with the same Google account used for OWNER_EMAIL.
3. Press Activate Owner Control once.
4. Sign out.
5. Sign in again so the refreshed ID token contains the owner claim.

Owner authorization is set server-side. Browser localStorage cannot create owner access.

## 10. App Check

Before public production launch, register the web and Android apps in Firebase App Check and enable enforcement after monitoring legitimate traffic.

Web App Check currently supports reCAPTCHA Enterprise. Android can use Play Integrity.

Never commit an App Check debug token.

## 11. Current backend data model

accounts/{uid}
profiles/{uid}
progress/{uid_lessonId}
assessments/{uid_assessmentId}
feedback/{autoId}
audit_events/{autoId}

Protected server writes include server timestamps and an audit record.

## 12. Production gate

This backend foundation is implementation work, not proof that the whole education service is production-approved. Curriculum verification, privacy, safeguarding, accessibility, security testing, payment verification, backup/restore testing and independent review remain release requirements.

## 13. Owner control

Funding, pilot participation or use of the backend does not transfer Pacific Education ownership, equity, shares or control.
