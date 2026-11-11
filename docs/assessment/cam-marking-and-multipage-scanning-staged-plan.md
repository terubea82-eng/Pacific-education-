# PacEdu CAM Marking and Multi-Page Scanning — Staged Delivery Plan

**Status:** Requirements and phased delivery specification only; no scanner, OCR, marking engine, student report or live upload has been implemented.
**Date:** 12 November 2026
**Build dependency:** PacEdu locked delivery sequence, especially Stage 1 curriculum inventory, Stage 2 indicator distribution and Stage 3 student worksheets/teacher guides.
**Release boundary:** Staging only. No production, Firebase, learner-record, payment, examiner-workspace or APK changes are authorised by this document.

## 1. Goal

Provide teachers with a fast and dependable workflow to digitise, mark and review multi-page student work in batches. PacEdu should support:
- Camera capture on Android and upload of existing PDF/image files.
- Multi-page scanning from compatible document scanners, including duplex feeders where supported.
- Batch separation and page ordering.
- Secure matching of each script to the correct learner, class, subject, activity and assessment.
- Computer-assisted marking (CAM) for suitable objective and structured responses.
- Teacher review for uncertain handwriting, subjective answers, practical work and exceptions.
- Individual performance reports in the teacher workspace and teacher-approved feedback in each learner's student platform.

“Seconds” is a performance target for supported batch ingestion and objectively markable items, not a guarantee for every handwritten script, scanner, network or question type. Accuracy and safe review take priority over speed.

## 2. Recommended product design

Build a PacEdu CAM Marking service with two ingestion paths and one common marking pipeline.

### Path A — Phone camera / uploaded scan
- Teacher captures pages using an in-app guided camera or selects PDF/JPEG/PNG files.
- Detect page edges, orientation, blur, shadows, missing corners and duplicate pages.
- Allow crop, rotate, retake and page reorder before submission.
- Assemble a multi-page PDF or page set with a batch manifest.
- Support offline capture queue where feasible; upload resumes safely when connectivity returns.

### Path B — Compatible document scanner
- Support multi-page PDF and image uploads from school scanners, including automatic document feeders and duplex scanning where the device supports them.
- First release: teacher uploads the scanner's finished PDF from Android or a school computer into the PacEdu teacher workspace.
- Later release: add a secure scanner connector/gateway for selected scanner models and supported protocols after compatibility testing. Do not assume a browser on Android can directly control every USB/network scanner.
- Never require a particular scanner brand for the core workflow.

### Common pipeline
1. Validate file type, size, page count and malware safety.
2. Create a batch ID and record uploader, school/class, subject, assessment and timestamp.
3. Detect page order and script boundaries.
4. Read a printed learner code, QR/barcode or teacher-selected roster identity; do not rely on handwriting recognition alone to identify a child.
5. Match each script to the correct learner and assessment; quarantine ambiguous or unmatched pages.
6. Enhance scan quality without altering the student's actual response.
7. Detect question regions and response regions using the approved worksheet layout where available.
8. Apply the correct answer key/rubric version.
9. Mark only question types approved for automated marking.
10. Calculate confidence and route uncertain responses to teacher review.
11. Produce an item-level report and class overview.
12. Release feedback only after the teacher's approval and any required moderation.

## 3. Question-type marking policy

### Suitable for automated marking after validation
- A/B/C/D multiple choice with exactly four validated options and a versioned answer key.
- True/false where explicitly part of the approved assessment.
- Matching, ordering and simple numeric answers with defined accepted formats/tolerances.
- Short responses only where a strict, transparent answer rule has been approved and tested.

### Human review required
- Essays, compositions and extended explanations.
- Open-ended reasoning, proof, creative work and multiple valid solution methods.
- Handwriting the OCR cannot confidently read.
- Diagrams, maps, graphs, drawings and annotated work unless a validated rubric-assisted workflow is used.
- Oral, voice, practical, experimental, performance and project evidence.
- Any answer with low confidence, uncertain page identity, damaged scan or unclear question alignment.

AI may suggest rubric-aligned comments or identify evidence for a teacher, but it must not silently award final marks for subjective work. A teacher remains accountable for final marks and feedback under the school's assessment policy.

## 4. Answer sheets and identity matching

For the most reliable high-volume marking, PacEdu should provide optional printable answer sheets with:
- A unique non-guessable assessment/script code and QR or barcode.
- Stable question numbers and answer regions.
- Candidate instructions and page numbering (for example, page 1 of 4).
- A clear separation between candidate identity data and answer data.

The code identifies the assessment script, not a public student profile. The server resolves it only within the authorised school/class/assessment scope. If a school uses ordinary handwritten worksheets, teachers can manually assign or confirm the learner and page group.

Do not print unnecessary personal data on answer sheets. Never expose another student's work or report when a code is mistyped or a scan is misassigned.

## 5. Marking engine and transparency

Every marked response must retain:
- Learner, assessment, activity, question and curriculum indicator references.
- Original scan page and response-region reference.
- Answer-key/rubric ID and immutable version.
- Mark awarded, maximum mark and marking method.
- Confidence or reason for human review.
- Automated decision explanation or matched rule.
- Reviewer identity, edits, reason and timestamp.
- Final approval and release state.

Use transparent statuses such as:
- SCAN_UPLOADED
- PAGE_CHECK_REQUIRED
- IDENTITY_MATCH_PENDING
- READY_FOR_OBJECTIVE_MARKING
- AUTO_MARKED_PROVISIONAL
- TEACHER_REVIEW_REQUIRED
- TEACHER_APPROVED
- FEEDBACK_RELEASED
- REOPENED_FOR_CORRECTION

Do not present provisional machine marks as final grades. Keep the original scan and marking history so a teacher can correct errors and audit changes.

## 6. Teacher workspace

The teacher sees:
- Batch upload/capture and page-quality warnings.
- Number of scripts received, matched, unmatched and needing review.
- Progress by class, subject, assessment and question.
- A side-by-side view of the original page, detected response and suggested mark.
- Correct answer/rubric, marking explanation and confidence indicator.
- Controls to accept, amend, reject or escalate a suggested mark.
- Individual student performance across indicators and skills.
- Class-level patterns and misconceptions without exposing one student's private details to other families.
- Feedback draft controls and final release.

Teacher comments should be constructive, specific, age-appropriate and linked to the learning objective. AI-generated comments are drafts; teachers can edit or remove them.

## 7. Student platform

Each learner can see only their own released assessment:
- Result and marks by question/indicator where school policy permits.
- Teacher-approved comments and corrections.
- Strengths, concepts to revise and next learning steps.
- Accessible text and optional audio reading of feedback.
- A permitted copy of their marked work, with other learners' information removed.
- Clear status if marking is still pending.

Do not show examiner-only notes, answer keys for unreleased examinations, internal teacher comments, other students' results or provisional AI judgements.

## 8. Curriculum and 9/9/5 integration

The CAM system must use the same verified indicator IDs and exact daily activity links established by the curriculum distribution work. Every eligible question should link to:
- Jurisdiction and curriculum version.
- Class/year/form and subject.
- Indicator/outcome ID and source location.
- Term/week/day and activity ID.
- Question ID, marks and rubric version.
- Revision or practical-learning classification where applicable.

Term 3 reports should help teachers identify indicators needing further revision before national examinations. The scanner does not create curriculum coverage: it records evidence against indicators already verified and taught.

Practical learning must be assessed using appropriate observation, demonstration, investigation or project evidence. A scan of a written worksheet alone cannot prove a student's hands-on competence.

## 9. Privacy, child safety and security

- Enforce teacher access by verified server-side school, class and learner permissions.
- Encrypt scans and reports in transit and at rest; use private storage and short-lived access links.
- Keep scan storage separate from public library media and examiner confidential materials.
- Minimise identifiers in filenames, QR payloads, logs and analytics.
- Apply school/jurisdiction retention rules, access logs, correction history, export and deletion controls.
- Require teacher confirmation for uncertain identity matches and prevent cross-student assignment.
- Do not use student scans to train general AI models without a separate lawful basis, appropriate notice and required consent/authority.
- Restrict batch exports and bulk downloads to authorised roles.
- Test malicious uploads, oversized files, duplicate pages, QR tampering, IDOR, cross-school access and revoked teacher accounts.

## 10. Staged implementation aligned with the locked build order

### Stage 1 — Curriculum inventory (current priority)
- Finish verified official indicators and source records for every class and subject.
- Identify which outcomes are assessed by written response, objective question, oral response or practical evidence.
- Record jurisdiction-specific marking requirements and assessment permissions.
- No CAM marks or question-to-indicator claims until source mapping is verified.

### Stage 2 — 115-day distributions
- Complete Term 1 45 days, Term 2 45 days and Term 3 25 days.
- Link each indicator to teaching, practice, revision and appropriate assessment evidence.
- Mark Term 3 revision priorities and practical assessment opportunities.
- Do not create a scan workflow that bypasses missing or unapproved indicator mappings.

### Stage 3 — Student worksheets and teacher guides
Build the worksheet and marking foundation in this order:
1. Stable learner/task/question IDs and exact indicator references.
2. Versioned answer keys and teacher marking guides.
3. A/B/C/D validation and objective marking rules.
4. Accepted equivalent wording and numeric tolerances where approved.
5. Student and teacher copies, audio/transcripts, accessible response options and offline save/resume.
6. Teacher review queue for subjective, practical, voice and uncertain responses.
7. Multi-page scan intake prototype using synthetic scripts.
8. Batch matching, page ordering, scan-quality checks and duplicate detection.
9. Provisional auto-marking for validated objective items.
10. Teacher approval and student feedback release.
11. Pilot accuracy, speed, fairness, privacy and Android usability tests.

**Stage 3 acceptance gate:** First demonstrate reliable marking of synthetic, clearly printed objective answer sheets. Then test real handwritten work with teacher verification. Only expand automated marking to additional answer types when measured accuracy and fairness meet authority-approved thresholds.

### Stage 4 — Separate Global Library
- Begin only after student worksheets and teacher guides pass their acceptance gates.
- Keep library development separate from scan intake and assessment records.
- Do not use scanned student work as library content.

### Stage 5 — Capacity and personal information space
- Add private object storage, scalable processing queues, batch workers and per-school quotas.
- Use resumable uploads, pagination, retention limits, monitoring and cost controls.
- Load-test simultaneous class batches, scanner uploads, marking queues and report generation.
- Verify backups, restore, duplicate processing prevention and offline reconnection.

## 11. Performance and accuracy targets to validate

Do not promise a fixed “seconds per batch” before tests on real devices, page counts, file sizes, handwriting samples and network conditions. Measure separately:
- Time to upload and validate a batch.
- Pages processed per minute.
- Percentage of pages correctly ordered and matched.
- Objective-item marking accuracy and false-mark rate.
- Percentage routed to teacher review.
- Teacher time saved per script.
- Feedback generation and release time.
- Performance on low-cost Android devices and limited mobile data.

Set thresholds with pilot schools and the relevant assessment authority. If confidence is below threshold, the system must abstain and request review rather than guess.

## 12. Pilot and release gates

Use synthetic scripts first, then teacher-supervised non-high-stakes pilot work with authority approval. Include clean prints, varied handwriting, multiple languages/scripts, faint pencil, crossed-out answers, skewed pages, double-sided scans, missing pages, duplicate pages and poor connectivity.

Require independent checks of marking accuracy, subgroup fairness, privacy, accessibility, security, data recovery and teacher usability. National examination use requires separate formal approval and stricter validation.

## 13. Current implementation boundary

This document is a staging specification only. No scanner integration, camera capture flow, OCR service, marking model, batch upload endpoint, Firebase change, student result write, teacher report, production deployment or APK replacement has been implemented or activated. No real student scans should be used during development.


## Addendum — Mandatory Student ID and Script Matching

**Requirement status:** Mandatory design requirement for the CAM/scanner workflow. Staging specification only; not implemented.

### 1. Student identity is the required destination key
- Every enrolled learner must have a unique, stable PacEdu Student ID (UID-backed identity), scoped to the authorised jurisdiction/school and active enrolment.
- The Student ID is the destination identity for assessment marks and approved feedback. Names, class labels, handwritten names and seat numbers are not sufficient identity keys.
- Do not expose raw internal database UIDs in printed documents or QR payloads. Use an opaque, random, assessment-specific script token that resolves server-side to the student and assessment within the authorised school/assessment scope.
- A script token must not allow a person who scans it to view a student's profile or results.

### 2. Assessment-specific script identification
When a teacher assigns an assessment, PacEdu creates a unique script record linked to:
- Student ID;
- school/jurisdiction and class;
- subject and curriculum version;
- activity/assessment ID and date/session;
- question IDs and indicator IDs;
- expected page count and script version.

PacEdu prints a QR code or barcode and human-readable fallback code on each page, together with page number and total pages (for example, 2 of 5). The token is unique to that learner's particular assessment attempt, not a permanent public student identifier.

### 3. Multi-page scan matching
For every scanned page:
1. Read the script token and page number.
2. Resolve the token using a trusted server-side lookup.
3. Confirm the scanner/teacher is authorised for that school, class and assessment.
4. Confirm the script is active and belongs to the expected assessment.
5. Group pages by script token and order them by page number.
6. Detect duplicate, missing, damaged, unreadable or out-of-range pages.
7. Compare the resolved Student ID, class, subject, assessment and expected page count.
8. Quarantine any ambiguous or mismatched script for teacher correction.

Never guess a student identity from handwriting or OCR. If a code is absent, damaged, duplicated or conflicts with the roster, stop automatic marking and require the teacher to select and confirm the correct learner and assessment before any marks are written.

### 4. Safe mark and feedback routing
- Store provisional marks against the exact Student ID + assessment attempt + question ID + rubric version.
- Store the source scan page/response region and marking method with each result.
- Prevent duplicate batch uploads from creating duplicate attempts or marks through idempotent script and question keys.
- Keep automated marks provisional until applicable confidence checks pass and required teacher approval is recorded.
- After approval, publish only that learner's own marks, corrections and teacher-approved comments to that learner's private student platform.
- A teacher's class overview is permission-scoped; one learner/parent account must never see another learner's results.
- Corrections create an auditable new version; never silently overwrite the original mark history.

### 5. Required teacher review screen
Show the original page, detected script code, resolved learner identity, class/subject/assessment, page count, question response, suggested mark and confidence together. Require explicit confirmation for unmatched scripts, identity corrections, missing pages and any low-confidence recognition. Provide a clear “hold — do not publish” state.

### 6. Mandatory security and acceptance tests
Before pilot release, prove:
- Every page is routed to the correct Student ID under valid enrolment and assessment permissions.
- A forged, copied, expired, revoked or wrong-assessment token is rejected or quarantined.
- Similar student names do not cause cross-assignment.
- Missing, duplicate, mixed-student and out-of-order pages are detected.
- A teacher cannot scan or publish results outside their authorised school/class scope.
- Students can retrieve only their own released marks and comments.
- Parents/guardians, if enabled, see only records explicitly authorised for their linked child.
- Duplicate uploads do not duplicate marks.
- Teacher corrections and publication events are fully audited.
- Ambiguous identity always fails closed: no mark or comment is written to any student's platform.

### 7. Delivery placement
This is part of Stage 3 CAM implementation, after verified Student IDs, learner/task/question links, curriculum indicator IDs and versioned answer keys exist. Build identity and script-token matching before automated marking. Then add scan ingestion, page grouping, provisional marking, teacher approval and student feedback release. The Global Library and user-capacity stages remain in their already locked order.

**Current boundary:** This addendum is a staging requirement only. No student IDs, scripts, marks, comments, Firebase records or production systems were changed.
