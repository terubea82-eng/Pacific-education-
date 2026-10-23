# PacEdu secure teacher-review sync (controlled pilot design)

## Purpose

This change prepares authorization rules and emulator regression tests for moving learner photo evidence from browser-local storage to a shared, authenticated service. It does **not** enable Firebase in the app or send existing local photos anywhere.

## Data flow intended for a later, separately reviewed integration

1. An authenticated learner is assigned to a class by a trusted administrator/server in `classes/{classId}/members/{uid}`. The membership record contains `role` (`student` or `teacher`) and `active: true`. Client rules deny all writes to membership records; do not use learner-editable profile fields as authority.
2. The learner uploads a compressed JPEG (maximum 8 MiB) to `learnerWork/{classId}/{studentUid}/{submissionId}/photo.jpg`.
3. The learner creates matching `learnerSubmissions/{submissionId}` metadata. It stores a Storage path, not a base64 image. New submissions must be pending teacher review and match the authenticated UID and active class membership.
4. Only the learner who owns the submission and an active teacher assigned to that same class can read its metadata/photo. An assigned teacher can change only review status, feedback, reviewer UID, and review timestamp.
5. Clients cannot delete evidence, change learner identity/class after submission, self-assign roles, approve their own work, or mark work automatically.

## Required before activating app sync

- Implement and review Firebase Authentication in the app; never trust the current local pilot identity alone.
- Provision class membership records through a trusted, owner-authorized admin/server process.
- Add the Firebase Storage + Firestore client adapter behind an explicit feature flag. Keep local/offline evidence working when offline; queue sync and show clear upload/review status.
- Upload the photo first, then create metadata; clean up orphaned uploads through a trusted server process if metadata creation fails.
- Never place image base64 in Firestore. Keep the existing 8 MiB maximum and validate actual image decoding client-side; the rules validate declared content type/size, not image pixels.
- Deploy rules to the correct Firebase project only after review. The repo's `.firebaserc` points at `pacedu-fe868`, but these tests use a local demo project and do not contact or deploy to production.
- Run the emulator tests and a real two-device acceptance test with learner, assigned teacher, unassigned teacher, and unrelated learner accounts. Verify teacher feedback, denied access, offline recovery, and deletion/retention expectations.

## Current status

Firestore and Storage rules plus local-emulator tests are proposed in this PR. The Firebase client boundary remains disabled. No production rules have been deployed, no live account permissions have been configured, and cross-device delivery must not be described as working until the client adapter is implemented, the rules are deployed, CI passes, and the two-device test succeeds.
