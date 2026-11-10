# PacEdu trusted backend — next-stage data contract proposal

Date: 2026-11-10
Status: PROPOSED — design only; not implemented or deployed.

## Findings from the first emulator run

The emulator workflow completed. Six of seven Firestore tests passed. The direct-client progress creation test failed because the current rules accepted a signed-in learner writing a progress document whose `uid` matched their own UID. This confirms the existing rule is not a trusted progress-submission boundary.

The failure is intentional. Do not change the test to accept the unsafe write.

## Additional inspected boundaries

- The current client Firebase adapter is a disabled placeholder and exposes no server save API.
- The daily progress recorder writes to local curriculum coverage first and reports local recording success; that must not be described as server persistence.
- The recorder can receive a client score and teacher-confirmation flag and uses them in local records. These values are not trustworthy evidence and must never be promoted to official backend marks.
- `learnerSubmissions` currently permits a learner to create a pending photo-evidence submission when the learner has an active student membership for the class. This can remain a limited evidence-intake path only if its metadata is verified server-side before it is used for official coverage.
- Teacher review updates are permitted only for an active teacher membership in the submission's class. This remains a separate teacher-authorized review path and must not be confused with learner progress submission.
- Storage photo evidence is constrained to a learner's own class-specific path, JPEG, maximum 8 MiB, and denies list/update/delete. Emulator tests still need to verify these rules end-to-end.

## Proposed authoritative data model

These are proposed paths and fields, not existing production schema. Confirm them against registration, roster, school and teacher approval flows before implementation.

### 1. Public/self-service profile

`users/{uid}`
- User-editable display and accessibility preferences only.
- No authoritative role, account status, school approval, class membership, parent relationship, assessment mark or teacher assignment.
- Client may read/write only the explicitly allowlisted profile fields.

### 2. Server-controlled account control

`accountControl/{uid}`
- `role`: student, teacher, parent, owner, or other explicitly approved role.
- `status`: pending, active, suspended, revoked.
- `createdAt`, `updatedAt`, `approvedBy`, `approvedAt`.
- Writes only by a trusted administrative process, never by the account holder.
- Sensitive callable operations re-read this record so suspended/revoked accounts are denied even when an old token remains valid.

### 3. Membership and relationship authority

Continue using `classes/{classId}/members/{uid}` as the class-membership lookup only after its schema and provisioning process are verified. It must be written by trusted administration only.
- Verify both account status and membership status.
- Teacher must be actively assigned to the class.
- Learner must be actively enrolled in the class.
- Parent access requires a separate verified relationship record and revocation check.
- Client-supplied classId is a requested target, not proof of membership.

### 4. Approved curriculum/activity catalogue

Use a server-controlled catalogue for valid lesson/activity references:
- country/curriculum version;
- level/class;
- subject;
- term, week, day;
- approved learning outcome/indicator;
- activity ID and publication/review status.

Only approved activities may receive official progress events. Pending or unreviewed material must not be accepted as approved curriculum.

### 5. Learner progress event

Proposed immutable path: `progressEvents/{uid}_{eventId}`, or a nested `users/{uid}/progressEvents/{eventId}` path after index/query needs are reviewed.

Accept only:
- a random UUID event ID;
- an allowlisted activity reference;
- learner response/completion evidence fields that are safe for learner submission;
- a client queue timestamp only as diagnostic metadata, never as authoritative event time.

Derive actor UID, server received timestamp, class/school relationship and role from verified server context/data. Do not accept client authority for:
- student UID, school ID, class membership or role;
- teacher confirmation, reviewedBy or approval;
- official score, grade, rank, pass/fail or final assessment state;
- server timestamps or acknowledgement status.

Use a Firestore transaction for event idempotency. A retry of the same UID + event UUID returns the same logical acknowledgement without creating a duplicate. Different event UUIDs represent distinct submissions.

### 6. Teacher assessment and review

Store teacher-reviewed assessment results separately from learner submissions.
- Re-check active teacher account and current class assignment at write time.
- Bind review to the original learner submission and approved activity.
- Record server-derived reviewer UID and server timestamp.
- Preserve audit history; do not allow learners or teachers to overwrite historical review events.
- Class ranking is a derived report from authorized, finalized assessment records, never a client-supplied field.

## Callable function acceptance contract

The first server operation should be a narrow `submitLearnerProgress` callable:
1. Require Firebase Auth context and non-empty verified UID.
2. Read server-controlled account status and require active learner role.
3. Verify active membership in the requested class; do not trust client identity fields.
4. Verify the activity exists and is approved for the learner's curriculum/level/subject/term/day.
5. Reject unknown keys and enforce payload size, type and value bounds.
6. Explicitly reject authority fields such as score, rank, teacherConfirmed, reviewedBy, approval, schoolId, studentUid and role.
7. Generate or validate a high-entropy UUID event ID; bind idempotency to authenticated UID.
8. Write only allowlisted learner submission fields and server timestamps in a transaction.
9. Return exact event ID and server acknowledgement data; never acknowledge an event before commit.
10. Log minimal audit metadata without unnecessary child personal information.

## Required tests before client integration

- unauthenticated call rejected;
- inactive, suspended and revoked accounts rejected;
- learner A cannot submit as learner B;
- learner A cannot submit for a class they do not belong to;
- learner cannot submit an activity outside their approved curriculum;
- teacher cannot use learner submission endpoint;
- forged score, rank, teacher approval, UID, role and school fields rejected;
- duplicate UUID retry is idempotent;
- different UUID produces a distinct event;
- server error/timeout returns no acknowledgement;
- offline queue is preserved until exact committed acknowledgement;
- stale, forged, partial and duplicate acknowledgements do not clear unrelated queue items;
- teacher review requires current assignment;
- parent access requires verified, unrevoked relationship;
- Storage tests verify ownership, content type, size, and denied overwrite/delete/list.

## Implementation order and release gates

1. Confirm authoritative account, school, class, roster, teacher-approval and parent-link data flows.
2. Implement the callable function in a dedicated `functions/` source folder with Admin SDK authorization.
3. Add emulator fixtures and callable-function negative/positive tests.
4. Tighten Firestore progress writes only after callable submission is working in emulator.
5. Add Storage and teacher-review emulator tests.
6. Connect a staging-only app configuration and test on an Android phone with fictional accounts.
7. Independent security, privacy, child-safeguarding, accessibility and backup/restore review.
8. Owner reviews the complete evidence packet and separately authorizes any production deployment.

## Explicit non-goals

- No production Firebase project access or deployment.
- No change to current `main` rules or application behavior.
- No real learner records or credentials.
- No automatic account activation, role assignment, teacher approval or payment activation.
- No claim of production readiness or security certification.
