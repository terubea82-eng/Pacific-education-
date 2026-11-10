# Backend emulator test foundation

## Purpose

This is a staging-only test harness. It uses the Firebase Emulator Suite and fictional identifiers. It must never be pointed at `pacedu-fe868` or any other production project.

## Run locally

From the repository root:

```sh
cd backend-tests
npm install
npx firebase emulators:exec --config ../firebase.staging.json --project demo-pacedu-staging --only auth,firestore,storage "npm test"
```

The project ID starts with `demo-` intentionally. Firebase CLI treats it as an emulator-only project and does not connect to a live Firebase project.

## What is tested now

- Unauthenticated progress reads are denied.
- A fictional learner cannot read another learner's progress.
- A learner cannot write progress claiming another UID.
- A learner cannot create or alter class membership.
- A learner cannot delete progress.
- A learner can read their own profile but not another learner's profile.
- Direct client progress creation is expected to be denied.

## Known expected failure

Current `main` Firestore rules still allow an authenticated user to create or update a progress document with their own UID. Therefore the direct-client-write acceptance test is expected to fail against the current rules. This is an intentional security finding, not a test to weaken or skip. Keep this branch's test failing until the trusted server write path exists and the rules are safely revised.

## Not implemented yet

- Callable Cloud Functions and their authorization tests.
- Teacher assignment and teacher-confirmation tests.
- Verified parent/child relationship tests.
- Account suspension and membership revocation tests.
- Storage upload ownership and content-type/size tests.
- Event UUID idempotency and transaction tests.
- Partial acknowledgement and offline queue preservation tests.
- Assessment integrity tests proving learners cannot set official marks/ranks.
- App Check enforcement tests.

Do not report the backend as implemented or secure until these missing test areas are implemented and pass. No production deployment is authorized.
