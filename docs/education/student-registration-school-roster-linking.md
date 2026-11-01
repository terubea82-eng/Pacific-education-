# PacEdu Student Registration and Verified School-to-Class-List Linking

**Status:** implementation specification for PR #306; not yet merged or active in the deployed app.

## Goal

A student can register online in Pacific Education with help from a parent or guardian when needed. After the student's school and enrolment are verified, PacEdu connects the student to the correct school, academic year, class, and authorised teacher roster. The teacher can then open the student's full authorised learning record and link approved daily worksheets to that record.

## Recommended end-to-end flow

1. **Student / parent / guardian registration.** Collect only the information required for school enrolment and learning: student name as recorded by the school, country, school name, official school registration code, class/level, academic year, and the applicable student identifier (for Fiji, FEMIS ID where available and appropriate). Record who assisted with registration only when needed. Provide a manual path for learners who do not yet have an official ID or whose family needs help.
2. **Resolve the school using a trusted register.** Match the school registration code against an authoritative, versioned school registry where one is available. Treat the typed school name as a display/search value, not proof of school identity. If no trusted registry integration exists, mark the school as pending verification rather than pretending it was verified.
3. **Verify the student's enrolment.** Use a school administrator or authorised staff member, an approved one-time enrolment code, or another school-approved verification process. Do not let knowledge of a public school registration number alone reveal a roster or grant school access. Duplicate IDs, mismatched names, missing IDs, and uncertain class placement enter a review queue.
4. **Create a pending enrolment record.** Keep the submitted details separated from the verified student profile until checks are complete. Give the family a clear status: submitted, needs correction, awaiting school confirmation, approved, or declined with an appropriate explanation. Avoid displaying sensitive information in public URLs, notifications, or logs.
5. **Link to the correct roster after approval.** Match on stable internal student ID and verified school-scoped identifier, not name alone. Attach the student to school ID + academic year + class/level + roster entry. Link only the teachers and school staff authorised for that class. If the student changes class or school, preserve history and use an authorised transfer workflow rather than creating a second unrelated identity.
6. **Show the authorised teacher record.** The class list should show student name, student identifier/status, class placement, enrolment status, and a compact per-subject work/assessment summary. Opening a row should show the student's authorised profile, evidence timeline, subject pathways, worksheet assignments, submissions, marks, feedback, attendance where enabled, and review history. Use role-based views: a teacher sees only permitted classes; a school administrator sees only the scope they manage.
7. **Connect assessment and daily work.** After enrolment and roster placement, PacEdu links Day 1 baseline evidence and subsequent worksheet submissions to the same student record. Analyse ability separately per subject. Release differentiated daily worksheets only after the required teacher approval and only when a matching approved curriculum/worksheet pack exists.
8. **Support corrections and withdrawals.** Authorised staff can correct a typo, confirm an ID, move a student between classes, or process a withdrawal. Record who made the change, when, why, and what changed. Do not silently merge records based only on similar names.

## Teacher dashboard fields

**Class-list row:** roll number; student name; school-scoped student ID or masked identifier; enrolment/identity status; class/level; registration date/status; subject pathway summary; today's assigned/submitted/needs-review status.

**Individual student record:** verified school and class; student identity and enrolment status; applicable student ID; registration/verification history; attendance if enabled; each subject's current/provisional pathway and evidence; dated worksheet assignments; submissions and protected photo/file references; marks and rubric version; teacher review/approval; feedback; revision history; and transfer history when relevant.

Display the full identifier only to roles that need it for their work. Avoid printing or exporting full IDs by default. Never expose FEMIS IDs, names, or student evidence in public URLs or filenames.

## Minimum record relationships

Use stable internal IDs and school-scoped access controls:

- `schoolRegistry`: internal school ID, official registration code, official name, country, authoritative source/version, verification status, last checked.
- `studentIdentity`: internal student ID, name fields, country, relevant external student identifier reference, identity status, duplicate-review state.
- `enrolmentRequest`: request ID, student internal ID or pending identity reference, school ID candidate, class/year requested, submitted-by role, status, verification evidence reference, timestamps.
- `schoolEnrolment`: enrolment ID, student internal ID, verified school ID, academic year, class/level, roster status, approval actor/time, transfer/withdrawal history.
- `classRosterEntry`: roster entry ID, school enrolment ID, class ID, assigned teacher/class group, active dates, status.
- `teacherClassAccess`: staff internal ID, school ID, class ID, role, access status and audit timestamps.
- `studentEvidence` and `dailyWorksheetAssignment`: reference the same stable student internal ID and the appropriate school enrolment/roster entry; preserve the worksheet, curriculum and marking versions as defined in `teacher-marking-desk.md`.

These names are proposed logical entities, not a claim that this exact schema already exists in Firebase. Inspect the current application and Firebase structure first; reuse and migrate existing records carefully rather than creating a parallel student database.

## Security, privacy, and accessibility requirements

- Enforce authorisation in Firebase/backend security rules, not only in front-end visibility logic.
- A student may view only their own approved assignments, results, and feedback; parents/guardians may view only the learner records they are authorised to support; teachers see only their assigned classes; school administrators are restricted to their school.
- School registration codes identify a school; they are not passwords or access tokens.
- Use least-privilege roles, secure authentication, audit logs, rate limiting for registration/verification attempts, and a safe account-recovery process.
- Minimise collection of guardian contact and sensitive identity details. Explain why each required field is needed and how it is used.
- Provide manual verification when official registries are unavailable, plus low-bandwidth and accessible registration for families using mobile phones.
- Do not reveal whether another child is registered in response to an unauthenticated ID lookup.
- Do not automatically approve a student solely because the typed school name/code resembles an existing school.

## Acceptance tests

1. Valid school code plus approved enrolment links the student to exactly one correct school/class roster entry.
2. Unknown school code remains pending review and does not grant access to any school roster.
3. A school code alone cannot expose student names, IDs, or class lists.
4. Duplicate/missing student IDs and conflicting names go to review rather than guessed matching.
5. A student registered with guardian assistance follows the same verification and authorisation requirements.
6. Approved students appear in the authorised teacher's class list without manual retyping of their name and ID.
7. Teachers cannot access students outside their assigned class; students cannot access other students' records; administrators cannot access other schools without explicit authority.
8. Class/school transfers preserve prior assessment and worksheet history while changing current access correctly.
9. Daily assignments and marking evidence remain linked to the same internal student ID and correct roster/enrolment.
10. Registration works with incomplete optional information and has a clear manual-support path without falsely approving identity.
11. Existing working registration, guided navigation, voice/accessibility controls, and teacher workspace are preserved through small tested changes.

## Implementation order

1. Audit current registration form, authentication, Firebase collections, security rules, class-list rendering, and any existing FEMIS/student ID logic.
2. Document the current data model and identify the single canonical student identity record.
3. Implement school-code validation and pending enrolment status with tests; do not require an unavailable external registry integration to pretend to succeed.
4. Implement school-authorised enrolment approval and role-scoped class-list query.
5. Link the roster row to the existing student record and marking desk.
6. Connect subject ability profiles and daily worksheets only after identity, enrolment, and class placement are verified.
7. Test security rules and duplicate/transfer cases before release. Do not merge or deploy until CI passes and the pilot's approval requirements are met.
