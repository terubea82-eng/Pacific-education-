# PacEdu callable progress submission — staging implementation

Status: IMPLEMENTED IN ISOLATED BRANCH; UNIT TESTS ADDED; NOT YET EXECUTED OR DEPLOYED.

## Function

`submitLearnerProgress` is a Firebase callable function in `functions/index.js`, pinned to the existing Firestore region `asia-southeast1`.

It derives the learner UID from Firebase Authentication and reads server-controlled:
- `accountControl/{uid}` (active student account);
- `classes/{classId}/members/{uid}` (active student membership);
- `approvedActivities/{activityId}` (published, approved curriculum activity).

It rejects unknown fields, including client-supplied score, rank, teacher approval, student UID, role and school ID. It stores learner evidence separately under `progressEvents/{uid}_{eventId}` using a Firestore transaction and exact event ID acknowledgement.

## Important prerequisites

The account-control and approved-activity collections are proposed contracts, not verified existing PacEdu data flows. They must be provisioned only by trusted administrative processes. Until the registration, class-roster, school approval and curriculum publishing pipelines create and validate these records, the callable must deny submissions.

The function currently sets `enforceAppCheck: false` because Android/Web App Check provider integration has not been verified. Do not expose this as a production endpoint. Before deployment, integrate and test App Check, rate limits, abuse monitoring, audit retention, and independent security review.

## Tests

`backend-tests/submit-progress-core.test.mjs` covers unauthenticated calls, active learner authorization, membership, activity approval, curriculum match, forbidden authority fields, UUID validation and response size limits. The tests use fictional in-memory fixtures. They do not yet exercise the Firebase Functions emulator or Firestore transaction behavior.

Run from repository root:
```sh
cd backend-tests
npm install --no-audit --no-fund
npm test
```

## Not yet done

- No Firestore rules change.
- No migration of existing client recorder or offline queue.
- No account-control or activity catalogue provisioning flow.
- No emulator integration test for the callable or transaction.
- No App Check enforcement.
- No deployment or production approval.
