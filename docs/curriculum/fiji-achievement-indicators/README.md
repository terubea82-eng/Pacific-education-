# Fiji Curriculum Achievement Indicators — Teacher Reference Folder

**Status:** staging source register + blank distribution template. Partial source-backed records are documented in `official-source-findings-and-pilot-sequence.md` and `year6-year8-2015-guide-source-backed-indicator-register.md`, `financial-education-years1-8-outcome-candidates.md`, `financial-education-years9-12-outcome-candidates.md`, and `ministry-year6-year8-financial-education-achievement-candidates.md`. The NFIT registers include 28 internal, paraphrased FinEd learning-outcome candidates for Years 1–8 and 24 secondary outcome clusters for Years 9–12. The Ministry Term 3 guide register adds Year 6/8 achievement evidence. These are not unique Ministry-coded indicators; current applicability and educator validation remain pending. This is not a complete ECE–Form 7 indicator bank; no complete class/subject distribution is claimed.

## Purpose

Provide one controlled reference folder for teachers and authorised curriculum personnel to see the Fiji curriculum achievement indicators assigned to each teaching day, and to verify that the daily activity, worksheet, lesson plan and assessment evidence all point to the same indicator.

## Framework baseline

- Country: Fiji (FJ)
- Working framework baseline: Fiji National Curriculum Framework 2013, pending formal confirmation of any officially effective replacement.
- Curriculum coverage target: ECE, Class 1–8 and Form 3–7, with subjects shown only where they apply to the level.
- School-year distribution: Term 1 = 9 weeks; Term 2 = 9 weeks; Term 3 = 5 weeks; five teaching days per week.
- Total: 45 + 45 + 25 = **115 teaching-day slots per selected class and subject**.

The framework baseline is not a substitute for the current official subject syllabus, scope-and-sequence or achievement-indicator document. Do not populate or publish an indicator until its exact wording and source location are verified. The initial source findings file records what has been verified so far and explicitly lists the missing levels and subjects.

## Folder contents

| File | Purpose |
|---|---|
| `README.md` | Governance, visibility and daily-activity linking rules |\n| `official-source-findings-and-pilot-sequence.md` | Partial official-source register, source-status findings, a labelled teacher-designed 25-day safety sequence, and missing-source coverage list |\n| `year6-year8-2015-guide-source-backed-indicator-register.md` | 11 coded Year 6/8 PE indicator candidates plus un-coded English and other achievement evidence from the Ministry's 2015 Term 3 guide; current status and educator review pending |\n| `financial-education-years1-8-outcome-candidates.md` | 28 internal paraphrased FinEd learning-outcome candidates across Years 1–8 from the 2015 NFIT learning-outcomes document; not Ministry-coded indicators; current status pending |\n| `financial-education-years9-12-outcome-candidates.md` | 24 internal paraphrased secondary FinEd outcome clusters for Years 9–12 from the 2015 NFIT document; includes source allocations and legal/currentness safeguards; not Ministry-coded indicators |\n| `ministry-year6-year8-financial-education-achievement-candidates.md` | Year 6/8 achievement evidence from pages 11–12 of the historical Ministry Term 3 teacher guide; extraction/layout and current-status checks pending |
| `fiji-achievement-indicator-day-slots.csv` | Blank 115-day distribution template for one class + subject |
| `achievement-indicator-record.schema.json` | Machine-readable required-field contract for each indicator record |

## How to prepare a class/subject distribution

1. Select the country and framework version.
2. Select the exact class/level and a curriculum subject valid for that level.
3. Create a separate copy of the 115-slot CSV for that class and subject.
4. Import exact indicators from the applicable official Fiji syllabus/teacher guide. Preserve the source wording; do not paraphrase the official indicator in the source-text field.
5. Record source title, issuing authority, publication/version, effective status, page/section and source URL.
6. Have an authorised curriculum reviewer verify the indicator and approve its placement in a term/week/day.
7. Link each daily activity to one or more approved `indicatorId` values. Store the link on the activity record, not only in a teacher note.
8. Validate that every activity's class, subject, term, week and day match its indicator assignment.
9. If an indicator is not verified, leave its slot visible as **Awaiting official source** and block it from being described as curriculum-aligned or used to authorise a formal assessment.

## Teacher Workspace visibility — recommended layout

Place one compact **Fiji Curriculum Achievement Indicators** panel inside Teacher Workspace Step 2, after the teacher chooses a subject and class. Keep the existing subject boxes as the main navigation; do not add another top-level menu or duplicate dashboard.

The panel should show:

- **Class + subject:** inherited from the selected teacher class and subject; read-only in this panel.
- **Term / week / day:** simple selectors, defaulting to the current teacher-planned day.
- **Indicator card:** exact approved indicator text, strand/sub-strand, source title and page/section.
- **Daily activity link:** activity title/ID and a direct “Open linked activity” action.
- **Alignment status:** Verified and linked; Awaiting source verification; Missing link; or Review required.
- **Coverage strip:** 115 day positions grouped as T1 (45), T2 (45), T3 (25), with counts for verified, linked, missing and pending.
- **Authorised personnel view:** full mapping, source evidence, approval history and controlled import/review actions.
- **Teacher view:** read-only approved indicator and linked activity details; teachers can flag a mismatch for review but cannot silently edit official indicator text.

On a daily activity, show a small **Curriculum link** line near the learning objective:
`Fiji indicator [ID] · Term [n] · Week [n] · Day [n] · [alignment status]`.
Selecting it opens the exact indicator card. The same indicator ID must appear in the teacher plan, worksheet metadata, question bank/assessment metadata and marking report.

## Required activity-to-indicator relationship

Each daily activity should carry:
- `jurisdiction = Fiji`
- `curriculumVersion`
- `level`, `subjectId`, `term`, `week`, `day`
- `indicatorIds[]` (one or more verified indicator IDs)
- `learningObjective` (teacher-friendly wording derived from, and consistent with, the approved indicator)
- `sourceStatus`, `reviewStatus`, `approvedBy`, `approvedAt`
- `activityId` and stable question IDs

Copper, Bronze, Silver and Gold may change scaffolding, reading load, prompts or challenge, but must retain the same daily indicator and core learning objective. A group must never receive an unrelated objective merely because of its ability label.

## Status rules

- `PENDING_SOURCE_VERIFICATION`: source not yet checked; visible only as pending; no curriculum-alignment claim.
- `SOURCE_VERIFIED_PENDING_EDUCATOR_REVIEW`: source located and exact wording checked; awaiting qualified educator mapping review.
- `VALIDATED`: source and level/subject/term mapping reviewed and approved by authorised personnel.
- `RETIRED`: no longer current; retained for audit, not assigned to new activities.

Never infer approval from a file existing, a CI check passing, or an activity being generated. Keep a versioned audit trail when an indicator or mapping changes.

## Daily activity and assessment linkage

The distribution CSV is the controlled planning source for the exact class + subject + term + week + day slot. The runtime bridge in `src/js/paceduAchievementDistributionRuntime.js` imports a completed CSV and performs exact-slot matching; it does not round-robin or guess an indicator.

When a matching row is imported, the daily worksheet receives:
- `indicatorIds[]` and the exact indicator text/source/review status;
- the same indicator ID on every question in that daily worksheet;
- an assessment mapping record with the expected evidence types and mapping status;
- the activity ID and stable question IDs so response evidence can be traced back to the activity and indicator.

The assessment evidence builder carries the activity ID, question-sequence ID, indicator IDs and response records into a draft assessment-evidence record. This is evidence linkage only; it does not itself mark a learner as achieving an indicator or authorise a formal examination.

### Import and release rules

- The CSV importer checks the exact template headers, Fiji jurisdiction, class, subject, term, week/day range, indicator ID/text and duplicate daily slots.
- Empty planning slots are skipped and remain unassigned. The importer never fills them with invented indicators.
- A row is considered mapped/validated for the prototype only when source status is `SOURCE_VERIFIED`, educator review is `VALIDATED`, source title/authority/version/page-or-section/URL are present, and reviewer plus approval timestamp are recorded.
- All other imported rows remain `PENDING_TEACHER_REVIEW`; they may be shown as candidates but must not be presented as verified curriculum alignment.
- A duplicate or malformed slot is reported for correction and must not be treated as a valid daily assignment.
- The current importer is a staging runtime API, not yet a teacher-facing upload screen or trusted server import. Do not claim the blank CSV is automatically loaded into the app.
- Formal assessment eligibility remains false in the browser prototype. Trusted server-side curriculum approval, teacher authorization, assessment scope and audit checks are required before any result can count as an official school assessment.

### Assessment use

For a formative daily activity, record evidence against the linked indicator: correct response, method/working, explanation, practical demonstration, oral/sign/point/draw response, or teacher observation as appropriate to the task. Record whether support or accommodation was used, but do not treat disability accommodations as a lower achievement level.

A term test or examination must explicitly list its covered indicator IDs and may assess only outcomes that were taught, approved and included in the school's assessment scope. Unmapped indicators, unapproved questions, and unreviewed subjective/practical evidence remain pending teacher review. Keep the learner response, marking decision, teacher/reviewer, date, rubric/key version and any moderation history traceable.

## Important safeguards

- This folder is a template, not a completed Fiji curriculum database.
- Do not evenly or round-robin distribute indicators unless a qualified reviewer has approved the sequence. Distribution must respect prerequisite learning, scope and sequence, term requirements and assessment timing.
- Do not assume every subject applies to every level.
- Do not count weekends, holidays, examination days or school-specific closures as teaching days. The 115 slots are the curriculum planning pattern; the school's calendar determines actual dates.
- No production activation, Firebase write, learner-facing curriculum claim or APK release is authorised by adding these files.
