# PacEdu Student Transfer Between Schools

**Status:** implementation specification for PR #306; not yet merged or active in the deployed app.

## Goal

Allow a learner to move from one school to another without losing their identity, attendance, assessments, worksheets, learning pathway, or academic history. A transfer changes the learner's current school enrolment and access; it must not create a new student just because the school changed.

## Recommended transfer workflow

1. **Start a transfer request.** An authorised staff member at the current school, receiving school, or authorised guardian submits the request. Capture the student's stable PacEdu internal ID, current school, receiving school, intended class/level, academic year, proposed effective date, requester and reason/category where needed. Do not require sensitive details beyond what is necessary.
2. **Verify the learner.** Match the existing student identity using the stable internal student ID and a verified school-scoped identifier such as FEMIS ID where applicable and authorised. A name match or school registration code alone is not sufficient. If there are duplicate or conflicting identities, send the request to an authorised review queue; never auto-merge records.
3. **Confirm the receiving school.** Verify the receiving school through the trusted school registry where available, then require approval by an authorised receiving-school staff member. If the official registry or integration is unavailable, mark the school/transfer as pending verification instead of pretending it is verified.
4. **Set an effective date and handover.** Keep the current enrolment active until the approved transfer's effective date. On that date, close the old active roster entry and activate the receiving school's approved roster entry according to the school's local calendar/timezone. Avoid two active school enrolments for the same learner at the same time, except a specifically authorised temporary dual-enrolment arrangement recorded with scope and end date.
5. **Place the learner in the receiving class.** The receiving school confirms class/level, academic year, and authorised teacher/class group. Until this is approved, show transfer status as pending and do not expose the receiving school's roster or learning records to unauthorised users.
6. **Carry the learning record forward.** Keep the same internal student ID. Preserve prior school enrolments, attendance, subject-specific ability/pathway history, worksheets, submissions, marking rubrics, feedback, teacher approvals, and audit history with their original school, class, date, and authorship. The receiving teacher sees only the history permitted by school policy and their role; do not rewrite old records as if they were created at the new school.
7. **Change access at the right time.** At the effective date, remove the former school's routine access to current records, while retaining only authorised historical access required for legitimate school duties. Grant the receiving school's authorised staff access only after approval. Revoke stale class assignments and sessions where appropriate.
8. **Handle pending, cancelled, or reversed transfers.** Show clear states such as requested, identity review, awaiting receiving-school approval, approved/scheduled, completed, declined, cancelled, or correction required. A declined or cancelled request must not move the student or erase history. A reversal requires an audited authorised correction, not deletion of the original transfer.
9. **Resolve attendance on the transfer date.** Each school records attendance only for the dates and roster periods for which it is responsible. Use the approved effective date and local school date to determine which register includes the learner. If the effective date or attendance responsibility is disputed, flag it for staff review rather than silently counting the learner in both schools or neither.
10. **Notify only authorised people.** Send status updates to the relevant authorised current/receiving school staff and, where configured, the learner's verified parent/guardian. Do not include full student identifiers or sensitive records in public links or ordinary notifications.

## Data and audit requirements

Use the existing canonical student identity and enrolment/roster model after auditing the current application. These are logical requirements, not a claim that matching database collections already exist:

- One stable student identity record shared across schools.
- Separate dated school-enrolment records for each school period, with status, start/end dates, class/level, academic year, verification and approval metadata.
- A transfer record containing source and destination school, proposed and approved effective dates, status, authorised approvers, timestamps, and links to the affected enrolments.
- Dated roster entries and teacher/class access grants that can be activated or ended without deleting historical links.
- Immutable or audit-trailed history for attendance, assessment, worksheet, marking and access changes.
- Idempotent transfer processing so retries cannot create duplicate active enrolments or duplicate transfer events.

Every important action must record the actor, timestamp, prior state, new state, and reason where appropriate. Correcting a mistaken transfer must preserve the original audit trail.

## Privacy and security

- Enforce school and role access in Firebase/backend security rules, not only in the user interface.
- A school code, FEMIS ID, student name, or transfer request number is not a password or access token.
- Do not reveal whether another learner exists through unauthenticated lookup or error messages.
- The old school must not gain access to unrelated records at the receiving school; the receiving school must not be able to alter historical records from the old school.
- Minimise identity data and mask identifiers in exports by default.
- If official FEMIS or another government system integration is not authorised and available, support verified manual processing; do not scrape or claim live synchronisation.

## Acceptance tests

1. An approved transfer reuses the same internal student ID and does not create a second unrelated learner profile.
2. A transfer cannot complete based only on a name, school code, or unverified identifier.
3. The receiving school must be verified and an authorised receiving-school staff member must approve enrolment before normal access is granted.
4. The old roster entry ends and the receiving roster entry starts on the approved effective date, using the correct school-local date.
5. There is no accidental overlapping active enrolment across schools; explicitly approved exceptions have a scope and end date.
6. Past attendance, assessments, worksheets, evidence, marks, feedback and audit history remain intact and linked to their original school/date/author.
7. Attendance on the effective date is assigned to the correct school's register; disputed cases are flagged for review.
8. Former-school and receiving-school permissions change at the right time and users cannot access records outside their authorised scope.
9. Pending, declined, cancelled and reversed transfers do not silently move the learner or delete records.
10. Duplicate requests, retries, offline sync and concurrent approvals do not create duplicate active enrolments or lose audit history.
11. A typo correction or duplicate-identity dispute requires authorised review and never silently merges two children.
12. The transfer workflow works on mobile and low bandwidth and preserves existing working registration, teacher attendance, voice/accessibility controls and learning workspaces.

## Implementation order

1. Audit the current registration, canonical student identity, enrolment, class roster, attendance, assessment, Firebase rules and offline-sync logic.
2. Reuse the existing student record and roster structures; document any migration before changing stored data.
3. Add a transfer request/status flow and tests without changing current attendance or registration behaviour.
4. Add receiving-school approval, effective-date roster transitions, and audit events.
5. Test historical access and security rules for both schools, including attendance on the transfer date.
6. Only release after automated tests and a controlled pilot verify that transfer, cancellation, and duplicate-request cases behave safely.