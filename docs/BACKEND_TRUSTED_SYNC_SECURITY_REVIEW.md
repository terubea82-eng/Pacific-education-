# PacEdu trusted backend staging review — 2026-11-10

## Scope and safety boundary

This branch is isolated from `main`. It is a development/staging branch only. No Firebase project has been connected or modified by this review. No production data, real learner account, real assessment result, secret, or service-account key may be used in development tests.

The existing production authorization record remains fail-closed: `productionApproved=false`, `productionEligible=false`, and `release_status=BLOCKED`.

## Verified starting state on current main

- `src/js/pacificEducationFirebase.js` is an intentional placeholder. It reports `PRODUCTION_BACKEND_NOT_ACTIVATED`; it does not provide a server persistence API.
- `src/js/pacificEducationDailyProgressRecorder.js` records local curriculum coverage and is explicitly prototype-only. Local recording must not be described as Firebase persistence.
- `firebase.json` configures Firestore in `asia-southeast1` and Storage rules, but has no Cloud Functions source configuration.
- `firestore.rules` currently permits a signed-in user to create/update progress documents when the document UID matches their own UID. This is not a trusted server progress workflow and must not be confused with verified progress or assessment marks.
- `release/production-authorization.json` blocks production release and all listed evidence gates are false.

## Existing backend branch rejected

The older `backend/firebase-production-foundation` branch is 15 commits ahead and 2,452 commits behind the current shared base. Its functions use `australia-southeast1`, not PacEdu's Firestore region. Its `recordProgress` accepts client-selected lesson/day/status and has no event-level idempotency or school/class relationship check. Its `recordAssessment` accepts a score supplied by the caller. Its profile upsert writes account status as active. Its test script only performs `node --check`. Do not merge or deploy that branch.

## Required staging architecture

1. Use a dedicated Firebase Emulator Suite project ID such as `pacedu-staging-test`; never point automated tests at `pacedu-fe868`.
2. Use fictional identities only: learner A, learner B in a different class/school, assigned teacher A, unassigned teacher B, parent A with a verified relationship, and an unauthenticated caller. These are emulator identities, not real Firebase users.
3. Store authoritative roles, account status, school/class membership, and verified parent/teacher relationships in server-controlled documents. Never accept role, school, class, learner UID, teacher confirmation, score, or approval state from the client as authority.
4. Use a callable function for learner progress submission. Derive actor UID from the verified Firebase Auth context; validate account status, class membership, approved activity/indicator, payload schema and size on the server.
5. Use a random unique event ID per queued operation. Use a Firestore transaction for idempotency. A retry of the same event must return the same logical acknowledgement without creating a second progress event.
6. Separate learner work submission from teacher verification and official assessment/marks. Learners may submit answers/evidence, but must never set official score, rank, teacherConfirmed, verifiedBy, or final assessment status.
7. Return exact acknowledged event IDs and queue timestamps. The client may remove only the exact server-confirmed queue entries. Partial, stale, duplicate, malformed, or mismatched acknowledgements must preserve unconfirmed queue entries.
8. Keep Firebase Admin credentials and secrets outside Git. Admin SDK bypasses Firestore Security Rules, so every server function must perform its own authorization and validation.

## Fictional-account security test matrix

- Unauthenticated caller cannot submit or read protected records.
- Learner A can submit only for their authenticated identity and approved activity in their assigned class.
- Learner A cannot submit for learner B, change school/class IDs to another class, or read learner B's records.
- Learner cannot create or alter role, active status, membership, teacher confirmation, official marks, score, rank, or verification fields.
- Teacher A can review only learners in classes where the server-controlled membership is active and assigned.
- Teacher B cannot review a class they are not assigned to.
- Parent A can read only the learner linked by a currently verified relationship; revoked relationship denies access.
- Suspended/disabled account and revoked membership are denied even if a previous token/session exists; sensitive operations must re-check server-side status.
- Duplicate event ID is idempotent; different event IDs are distinct events.
- Invalid, oversized, malformed, stale, or unknown curriculum/activity references are rejected.
- Partial acknowledgement clears only exact acknowledged items; stale or forged acknowledgements clear nothing.
- Timeout, offline retry, reconnect, duplicate request, and server outage preserve queued work until server confirmation.
- Client-supplied score/mark/rank/teacherConfirmed fields are rejected or ignored and never become authoritative.
- Audit events record actor, operation, target reference, outcome and server timestamp without unnecessary child personal data.

## Required evidence before deployment is even considered

- Emulator tests for Authentication, Firestore Rules, callable Functions, and Storage rules pass.
- Negative authorization tests above pass; test coverage is reviewed for every protected operation.
- Functions use `asia-southeast1` consistently with the configured Firestore location unless a documented architecture decision justifies otherwise.
- No production project ID, production secrets, real learner data, or deployment credentials are available to CI.
- Dependency, static analysis, secret scanning, and rules coverage checks pass.
- Independent security/privacy/safeguarding review and backup/restore evidence are completed.
- Owner explicitly approves a deployment plan after reviewing evidence.

## Current status

This document records the inspection and acceptance criteria only. It does not claim that backend functions, emulator tests, Firebase integration, or deployment have been implemented. No deployment is authorized by this branch.
