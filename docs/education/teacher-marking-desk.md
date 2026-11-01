# PacEdu Teacher Marking Desk — class list, individual evidence, and daily worksheet links

**Status:** implementation specification for PR #306; not yet merged or active in the deployed app. This document defines the safest data flow before connecting it to the existing teacher workspace.

## Recommendation

Create one **Teacher Marking Desk** inside Teacher Workspace, with a printable teacher desk-book view. The class list is the navigation/index for the workflow; the student ID is the stable matching key; subject-level evidence drives subject-level pathway recommendations; and the approved pathway determines which daily worksheet is linked. Keep the existing teacher workflow and working navigation intact.

## Teacher workflow

1. **Open class list.** Filter by school year, class/level, and class group. Show student display name, FEMIS/student ID (masked where practical), enrolment/identity status, and a compact subject-status summary. Do not expose student IDs in public URLs, analytics, shared links, or filenames.
2. **Confirm identity.** Match work by a normalized, school-scoped student ID, not by name alone. If the ID is missing, duplicated, or mismatched, put the item in an identity-review queue; do not attach it to a guessed learner. Allow an authorised teacher to correct a record and retain an audit trail.
3. **Open an individual student record.** From the class list, open that learner's dated evidence timeline. Each evidence item records class, country/curriculum version, term/week/day, subject, worksheet/version, answer or photo reference, marking rubric/version, marks, confidence, review status, feedback, and who approved it.
4. **Mark work.** Provide a teacher desk-book marking grid and per-student view. Objective answers may be auto-marked only when the answer key and capture confidence are reliable. Handwriting/OCR uncertainty, open-ended answers, poor images, and disputed marks must be flagged for teacher review. Preserve the original evidence and every correction.
5. **Analyse each subject separately.** Show evidence and the provisional pathway for each subject. Do not combine all subjects into one score or assume one ability level applies to every subject.
6. **Recommend and approve a pathway.** Use the four pathways: Supported Start, Developing, Working at Class Goal, and Extension. A short Day 1 check is a provisional baseline; when evidence is insufficient, schedule a short follow-up instead of forcing a placement. Teacher approval is required before new differentiated student work is released.
7. **Link daily work automatically.** For each student and subject, link the current date's approved worksheet matching country, framework version, class/level, term, week, day, subject, language/accessibility options, and approved ability pathway. If no matching approved worksheet exists, show a clear teacher-only content-needed status; never substitute another country, class, subject, or framework.
8. **Review and follow up.** Mark assigned / submitted / needs review / marked / teacher-approved / absent / follow-up required. Absence does not erase the day's record. A learner may complete approved work at home when permitted, and evidence still passes through identity and review checks.

## Teacher desk-book layout

The digital desk book should be compact and printable, with date and class at the top. Recommended columns:

- Roll / student name / student ID status
- Attendance
- Subject
- Daily worksheet or activity ID
- Submitted / evidence quality
- Mark / maximum mark / marking confidence
- Subject pathway and reason/evidence
- Feedback or next step
- Teacher review/approval status

Offer two print modes: (A) class summary for the teacher's desk book and (B) individual student evidence/worksheet record. Avoid printing unnecessary personal information; make student ID masking configurable for printed summaries. Printed pages must state the class, date, curriculum/worksheet version, and page number.

## Minimum data relationship

Use stable internal IDs and explicit references; never rely on names or array position.

- **classRoster:** rosterEntryId, school/tenant ID, school year, class level, student internal ID, normalized student ID/FEMIS ID reference, display name, enrolment/identity status.
- **studentEvidence:** evidenceId, student internal ID, roster entry ID, date, subject ID, worksheet ID/version, curriculum country/framework version, response/evidence reference, rubric version, raw marks, confidence, review status, reviewer, approval timestamp.
- **subjectAbilityProfile:** student internal ID, subject ID, pathway, evidence window, supporting evidence IDs, confidence/insufficient-evidence flag, provisional/current status, reviewed-by and reviewed-at, history/version.
- **dailyWorksheetAssignment:** assignment ID, student internal ID, roster entry ID, subject ID, date, class/level, term/week/day, curriculum country/framework version, worksheet ID/version, pathway used, assigned-by/approval reference, status.
- **markingAudit:** append-only event ID, actor/role, action, affected record ID, timestamp, reason, before/after references where appropriate.

Store photo/file content in a protected storage location and keep only access-controlled references in records. Enforce school/class access in backend security rules; hiding a button in the UI is not authorization. Teachers should access only their permitted classes, and students should access only their own approved assignments and feedback. Do not put FEMIS IDs, student names, or sensitive evidence in public document paths or logs.

## Marking and ability safeguards

- Keep original student evidence, auto-mark output, teacher corrections, and approval history distinct.
- Do not silently overwrite marks. Any correction must record the reviewer, reason, timestamp, and previous value.
- Use rubric/answer-key versions and retain the version used for each mark.
- Display per-subject marks and the evidence supporting each pathway; avoid unsupported universal percentage cut-offs.
- If a score is incomplete, the image is unreadable, or confidence is low, use **Needs teacher review** rather than fabricating a mark.
- Teacher approval releases differentiated work. Teacher review must not be bypassed by a background ability calculation.
- Do not label learners permanently or rank students publicly. Update pathways as new daily, checkpoint, and term evidence arrives while preserving the baseline/history.
- Provide an accessible manual-marking fallback if camera capture, connectivity, or automatic marking is unavailable.

## Acceptance criteria

1. A teacher can open a class list and open the correct individual record from a row.
2. A student's submitted work is matched by a verified ID and class roster entry; ambiguous identity is quarantined for review.
3. Every marking item is linked to a dated worksheet, subject, rubric/answer-key version, and evidence record.
4. Subject pathways are stored and displayed separately; a learner may have different pathways in different subjects.
5. The current date's worksheet link is generated only from an approved, matching country/framework/class/subject/day/pathway pack.
6. Student-facing assignments remain hidden until required teacher approval.
7. Low-confidence capture, missing answer keys, missing curriculum packs, and insufficient evidence result in explicit review states, not guessed marks or content.
8. Teacher desk-book summary and individual record can be printed without exposing IDs unnecessarily.
9. Access checks prevent one student or teacher from viewing another student's protected records outside their authorization.
10. Automated tests cover duplicate/missing IDs, wrong-class submissions, per-subject pathway selection, missing worksheet packs, teacher approval gates, audit history, and printable summaries.
11. Existing registration, guided navigation, voice/accessibility controls, and current teacher workspace remain unchanged unless a separate tested change explicitly requires otherwise.

## Delivery boundary

This specification does not itself add a live marking interface, database schema, security rules, or camera-marking engine. Implement those in small, tested increments against the current code and data model. First inspect and reuse existing roster, identity, worksheet, Firebase, and teacher-workspace services; do not introduce a parallel student database or replace working navigation. No production/official curriculum claim should be made without verified curriculum mappings and approved content packs.
