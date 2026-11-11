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


## Addendum — Separate Daily Teacher Marking from National Examination Marking

**Requirement status:** Mandatory staged design requirement. The daily CAM page is part of the authorised Teacher Workspace. It is not restricted to national examiners. The National Examiners Workspace remains separately restricted.

### A. Daily classroom CAM and multi-page marking — Teacher Workspace

Authorised teachers can use the CAM/scanner page for routine classroom assessment, including daily activities, worksheets, homework, class exercises, topic tests and Term 3 revision.

Daily workflow:
1. Teacher selects the authorised school, class, subject, date and assigned activity/assessment.
2. PacEdu loads the relevant class roster and Student IDs; only enrolled learners for that class and assessment are eligible.
3. Teacher scans with a phone camera, uploads a multi-page PDF/image batch, or uploads files from a compatible document scanner.
4. PacEdu reads each assessment-specific script token, matches it to the correct Student ID and assessment attempt, groups and orders pages, and flags missing, duplicate, mixed, damaged or unreadable pages.
5. PacEdu suggests marks only where a valid answer key/rubric and supported response type exist. It links each response to its question ID and curriculum indicator ID.
6. Teacher reviews the original response beside the suggested mark, marking rationale, answer key/rubric and confidence. Subjective, practical, creative, oral and low-confidence responses require human judgement.
7. Teacher amends, accepts or rejects suggestions and approves the daily result.
8. Approved marks and teacher comments are routed to the matching student's private platform. No result is published for unresolved identity or page mismatches.
9. PacEdu updates the learner's assessment history and indicator progress, identifying strengths, misconceptions and revision needs for the teacher. Recommendations remain advisory and do not silently change the curriculum plan or ability placement.

Teachers may mark only learners, classes and assessments within their permissions. Teacher approval is required before daily marks/comments are released to students. Where school policy requires a second check, keep the result pending until that check is completed.

### B. National examination marking — restricted National Examiners Workspace

National examinations use a separate assessment type, separate access roles, separate script allocation and confidential marking records:
1. Scripts are scanned and matched to assessment-specific tokens and Student IDs; identity details should be masked from markers where feasible.
2. Allocated national examiners mark against the authorised national scheme and rubric.
3. Senior examiners/moderators perform required second marking, sampling and discrepancy resolution.
4. The chief examiner or authorised examination authority certifies the official result.
5. Only certified, versioned results transfer to the authorised teacher platform for identity, subject, session and completeness verification.
6. Teachers cannot alter certified national marks. Any suspected error is referred through the formal examination authority review/appeal process.
7. Results are released to student platforms only under the examination authority's release instruction and applicable school verification requirements.

### C. Shared technical foundations, separate authority boundaries

Both pathways may reuse the secure scanning engine, page-quality checks, script-token resolution, page ordering, Student ID matching, audit logging and private result-routing service. They must not share permissions or approval authority:
- Daily classroom results: teacher-controlled marking and teacher approval.
- National examination results: examiner marking, moderation and examination-authority certification; teacher verification is limited to correct record routing and discrepancy reporting.
- National examiner-only scripts, draft marks, examiner comments, confidential answer keys and unreleased results must never become visible in ordinary Teacher or Student Workspaces.
- Daily classroom marks must never be represented as certified national examination results.

### D. Acceptance tests before implementation/pilot

- An authorised teacher can open the daily CAM page and mark a permitted class batch.
- A teacher cannot access another school's or unauthorised class's scripts.
- A multi-page daily batch correctly routes every script to its Student ID and assessment attempt.
- Missing, duplicate, mixed, out-of-order and ambiguous pages are held for correction.
- Suggested marks remain provisional until teacher approval; student platforms show only approved daily results.
- National examiner workspace is inaccessible to ordinary teachers and students.
- National marks cannot be changed by teacher accounts after certification.
- Only the authorised examination release process publishes national results.
- Daily and national assessment records remain visibly and technically distinguishable.
- Every scan, amendment, approval, transfer, verification, hold and release is auditable.

### E. Locked delivery sequence

This distinction is a requirements addition to the existing CAM phase within Stage 3 (student worksheets and teacher guides). Do not start the scanner implementation before the relevant verified indicators, question IDs, answer keys/rubrics, Student IDs, enrolments and permission model are ready. Build daily teacher marking first as the ordinary classroom workflow; build the restricted national marking pathway as a separate authorised workflow using shared safe infrastructure only. Global Library (Stage 4) and user-capacity/personal-information space (Stage 5) remain in the locked order.

**Current boundary:** Documentation only. No teacher accounts, examiner accounts, scans, learner records, marks, comments, Firebase data, production systems or APKs were changed.


## Addendum — Parent/Student Home Revision CAM and Separate Parent Records

**Requirement status:** Mandatory staged design requirement. Parents and students may use a home/self-study marking pathway for revision papers and practice work. These records must remain distinct from teacher classroom assessment records and from certified national examination results.

### A. Parent Platform home-revision pathway

Parents and students may, subject to account permissions and age-appropriate safeguards:
- Open assigned or approved revision papers, practice worksheets and permitted past-paper resources.
- Attempt questions at home or another location using paper, camera scan, PDF/image upload or accessible response methods supported by PacEdu.
- Scan multi-page work and have PacEdu group pages using assessment-specific script tokens or a parent/student-confirmed home-practice record.
- Use an approved answer key or marking guide for supported objective questions, where the resource licence and assessment rules permit it.
- Receive suggested marks, worked explanations, correction prompts and revision guidance.
- Have the student or parent confirm/enter self-marked results and comments.
- View progress over time within the linked Parent Platform, including completed practice, strengths, topics needing revision and next suggested practice.

The platform must label these as HOME PRACTICE / SELF-ASSESSMENT — NOT TEACHER-VERIFIED. AI-generated suggestions are guidance, not official marks. If the student or parent changes an auto-suggested mark, retain the suggested value and the confirmed value separately with their source.

### B. Student identity and parent-child access

- Every home-practice record is linked to the correct PacEdu Student ID and a distinct practice attempt ID.
- A parent can access only a child whose account is securely linked and authorised through PacEdu's guardian relationship and applicable consent/age rules.
- A parent with multiple linked children must choose the child before starting a scan; the chosen child and Student ID are shown for confirmation before saving.
- Never infer the child from a handwritten name, device, location or previous scan.
- Students may access their own permitted practice records. Parent visibility and student visibility follow age-appropriate privacy rules and the configured guardian permissions.
- A parent cannot view another family's learner data or access teacher-only notes, confidential national scripts, examiner comments or unreleased results.

### C. Keep records separate and clearly labelled

Maintain separate record types and storage/access policies:
1. TEACHER_ASSESSMENT: teacher-assigned classroom activity, teacher-marked/approved, part of the authorised school learning record.
2. HOME_PRACTICE: parent/student-started revision, self-assessment or assisted practice, stored in the Parent Platform and never silently copied into official teacher marks.
3. NATIONAL_EXAMINATION: confidential examiner-marked script and certified result, governed by the national examination authority.

Each record stores its source, creator, Student ID, attempt ID, date, assessment/resource ID, question/indicator links where available, marking-guide version, suggested mark, confirmed mark, comments, and approval/verification status. Home-practice progress may be shared with the teacher only through an explicit, permission-controlled sharing action or school-approved policy, and must retain its HOME_PRACTICE label and provenance. It must not alter official teacher marks, ability placement, attendance or national results automatically.

### D. Safe home marking behaviour

- Auto-mark only supported objective or reliably structured responses using the exact approved key/rubric version.
- For essays, creative writing, practical work, oral work, ambiguous handwriting and uncertain OCR, provide explanations or a draft suggestion but label it unverified; invite teacher review only if the parent/student explicitly shares it or school policy permits.
- Show answer explanations after the attempt or according to the resource's release rules; protect restricted examination materials and embargoed keys.
- Provide accessible text/audio instructions and support permitted text/voice response modes without forcing voice recording.
- Save progress safely across disconnection and resume the same home-practice attempt without duplicating marks.
- Let parents add observations or comments, but label them as parent observations rather than teacher judgements.
- Do not claim that home self-marking proves mastery or replaces teacher assessment.

### E. Acceptance tests

- Parent can access only securely linked child accounts and can confirm the selected child before saving a home scan.
- Student can access only their own permitted home-practice records.
- A home scan is always saved as HOME_PRACTICE, never as TEACHER_ASSESSMENT or NATIONAL_EXAMINATION.
- Self-marked and AI-suggested marks remain visibly distinct from teacher-approved marks.
- Home records cannot overwrite, edit or approve teacher records or certified national results.
- Sharing a home record with a teacher is explicit, auditable and does not change its origin or label.
- Uncertain student identity, missing pages or mismatched assessment tokens cause a hold, not a guessed match.
- Parent comments and observations remain attributed to the parent.
- Offline/resume and duplicate-upload tests prove that practice attempts are not lost or duplicated.
- Restricted past papers, answer keys and national examination materials respect their licence, access and release controls.

### F. Locked delivery sequence

This home-revision pathway is included within Stage 3, after the verified curriculum indicator, worksheet, Student ID, question and answer-key foundations are ready. Build and test teacher daily CAM and home revision as separate role-based flows over shared safe scanning infrastructure. Do not merge their record types or approval authority. National examination marking remains separate and restricted. Stage 4 Global Library and Stage 5 capacity/personal-information space remain in the locked order.

**Current boundary:** Documentation only. No parent/student account permissions, scans, practice attempts, marks, comments, school records, Firebase data, production systems or APKs were changed.


## Addendum — Mandatory Approved Marking Criteria for All Legal CAM Users

**Requirement status:** Mandatory design rule for every CAM/scanner marking pathway. Only legally authorised PacEdu users may initiate or access marking functions, and every mark must be grounded in the applicable approved marking criteria.

### A. Approved criteria are required before marking

- Every markable activity, worksheet, revision paper or assessment must have an identified marking guide, answer key or rubric appropriate to its subject, level, curriculum/jurisdiction and assessment version.
- The criteria must define question IDs, maximum marks, correct responses, accepted alternative wording, keyword/similar-word credit where appropriate, partial-credit rules, method/working marks where appropriate, and treatment of blank, illegible or out-of-scope responses.
- Extended writing, oral, creative, investigative and practical tasks require suitable subject-specific rubrics and human judgement where automated recognition cannot reliably apply the criteria.
- Link each criterion to the relevant curriculum indicator/concept and retain its source, approval authority, version, effective date and permitted use.
- Bloom taxonomy may classify the cognitive demand of questions; it does not replace subject-specific marking criteria. Where an official syllabus uses another framework such as SOLO, preserve that framework and use Bloom as an additional design aid only where appropriate.
- Criteria must be reviewed and approved by the authorised subject/assessment authority before CAM uses them for scored marking. A teacher-created guide may be used for that teacher's authorised classroom assessment only after the required school approval. It must not be represented as an official national marking scheme.
- If no approved or appropriately authorised criteria exist, CAM may scan, organise and save the work, but must not issue a scored mark. Route it to the authorised teacher/assessment owner to create or approve criteria first.

### B. Legal-user access and permissions

- Marking functions require an authenticated PacEdu account and a server-side role/permission check on every relevant action; merely having a valid account is not sufficient.
- Teachers may mark only their assigned/authorised classes, subjects and classroom assessments.
- Parents/guardians may use home-practice marking only for a child securely linked to their account and only with resources and criteria permitted for home use.
- Students may attempt work and view permitted self-assessment feedback; student access does not grant authority to approve teacher or national marks.
- National examiners and moderators require separate, individually granted examination-authority appointments and permissions in the restricted National Examiners Workspace.
- Users must not share accounts or credentials. Access is logged and can be revoked. Apply least privilege, guardian-link verification, age-appropriate consent and privacy requirements.
- No parent, teacher or student gains national examiner authority merely by being a legal PacEdu user.

### C. Same standards where authorised, distinct assessment status

- Where the same approved marking guide is licensed and authorised for both classroom and home practice, CAM should apply the same answer criteria and mark allocation consistently.
- A home-practice mark remains HOME_PRACTICE / SELF-ASSESSMENT, attributed to the parent/student and not teacher-verified.
- A teacher-approved classroom mark remains TEACHER_ASSESSMENT.
- A national examination mark remains NATIONAL_EXAMINATION, under examination-authority control.
- A shared rubric does not make the three record types interchangeable and does not give home users access to confidential, embargoed or restricted national answer keys.
- Preserve the exact criteria/rubric version used for every suggested and confirmed mark, including any later correction.

### D. CAM marking and approval behaviour

1. Confirm the user's role, school/guardian relationship and access to the selected child, class, activity and marking guide.
2. Confirm that the marking guide is approved, in force and authorised for that use.
3. Scan/upload and securely match pages to the correct learner and assessment attempt.
4. Compare each response with the criteria. Display the source response, criterion, suggested mark, rationale and confidence.
5. Hold uncertain handwriting, OCR, identity, missing pages, unsupported question types and disputed answers for human review.
6. Attribute every manual amendment to the person making it and preserve the original suggestion.
7. Apply the correct approval path: parent/student confirmation for home practice; teacher approval for classroom records; examiner/moderator/chief examiner authority for national examinations.
8. Publish or share only according to that record type's permissions and release rules.

### E. Mandatory fail-safe rules and acceptance tests

- No applicable approved/authorised marking guide: no scored auto-marking.
- Expired, withdrawn, superseded or wrong-version guide: block scoring until the correct version is selected.
- Unauthorised user, class, child, assessment or answer key: deny access and log the attempt.
- No guessed identity or guessed mark where confidence is inadequate.
- Alternative answers receive credit only when included in the approved criteria or accepted by an authorised human reviewer under the relevant policy.
- A CAM suggestion never becomes an official teacher or national result without the required approval.
- Home self-assessment never becomes teacher-verified merely because a parent confirms it.
- National examination criteria and unreleased keys remain restricted to authorised examination personnel.
- Test that the same response and same criteria version produce consistent suggested marks, and that criteria version changes are auditable.
- Test that corrections, overrides, approvals, access denials and publication events are recorded with actor, time and reason.

### F. Locked delivery placement

This requirement applies across Stage 3 CAM pathways: daily teacher marking, parent/student home revision and restricted national examination marking. Build the criteria register, approval/version controls and legal-user permission checks before enabling scored CAM. Complete verified curriculum indicators, question IDs, Student IDs and worksheet/answer-key foundations first. Keep the Global Library (Stage 4) and user capacity/personal-information space (Stage 5) in their existing locked order.

**Current boundary:** Documentation only. No marking guides were approved, no user permissions or accounts changed, and no scans, marks, student records, Firebase data, production systems or APKs were modified.


## Addendum — Student and Parent Visibility of Approved Daily Progress

**Requirement status:** Mandatory staged design requirement. Students see their own released daily learning results in the Student Platform. They do not enter or receive access to the Teacher Workspace. Parents see only the information permitted for their securely linked child.

### A. Student Platform — private personal progress

After the teacher approves a daily classroom result, PacEdu should publish the approved result to that learner's own Student Platform, subject to school policy and any required release setting. The student view should include:
- Daily activity status and approved marks, with marks by question or indicator where appropriate.
- Teacher-approved comments, corrections, worked explanations and next steps.
- Concepts/indicators achieved, still developing or needing revision, with evidence and date.
- Subject-by-subject learning history and progress across the 9/9/5 terms.
- Term 3 revision priorities, practice completion and improvement over time.
- Practical-learning evidence and teacher feedback where the activity requires demonstration, investigation, observation or project work.
- A clear pending status when work is scanned, awaiting teacher review, moderated or not yet released.

Use clear, age-appropriate language and simple visual progress displays. Avoid public rankings, shaming labels, comparisons that expose classmates, or implying that one mark defines a learner. Students can see only their own permitted records.

### B. Distinguish record origins and approval states

The Student Platform must never make unlike records look equivalent:
- TEACHER_ASSESSMENT: show as teacher-marked/teacher-approved classroom work.
- HOME_PRACTICE: show separately as home practice or self-assessment, not teacher-verified; retain the parent/student source.
- NATIONAL_EXAMINATION: show only the official certified result after the examination authority's release instruction; do not show draft marks or confidential examiner comments.

A teacher-approved daily mark may update the student's learning history and indicator progress. A home-practice result must not silently change official attainment, ability placement or teacher assessment records. National examination results must not be released early or modified through ordinary teacher/student workflows.

### C. Parent Platform

A parent/guardian may see the linked child's teacher-approved daily progress and feedback only where guardian permissions, age rules and school policy permit. The parent view should distinguish teacher-approved classroom results from the parent's own HOME_PRACTICE records. Parent observations remain attributed to the parent. A parent cannot see another child's records unless that child is separately and validly linked and authorised.

### D. Teacher Workspace remains separate

Teachers retain their authorised class-level view: individual learner records, assessment history, indicator coverage, class patterns and intervention needs. Students and parents must not access this workspace, class rosters, other learners' marks, internal teacher notes, draft comments or confidential assessment material. Role checks must be enforced server-side, not merely by hiding a menu or page.

### E. Corrections, accessibility and safe release

- Publish only after the required teacher approval; unresolved identity/page mismatches and provisional CAM marks remain hidden from the student's official daily-results view.
- Record every correction, approval, reopening and release with actor, timestamp, reason and prior value; never silently overwrite history.
- Keep text readable and navigation simple, with optional audio reading and accessible controls. Integrate with PacEdu's existing single-narrator voice/navigation design; do not introduce a second automatic narrator.
- Preserve offline progress safely and resume the same attempt without duplicate results.
- Do not display an estimated grade or mastery claim as final where evidence is incomplete.

### F. Acceptance tests

- A student account can see its own released daily marks/comments and cannot retrieve another student's records by changing an ID or URL.
- Student and parent accounts cannot access Teacher Workspace APIs, class rosters, internal notes or examiner-only content.
- A daily result is invisible to the student until the required teacher approval/release state is reached.
- HOME_PRACTICE remains separately labelled and cannot overwrite TEACHER_ASSESSMENT.
- NATIONAL_EXAMINATION remains hidden until the authority's official release instruction.
- Parent visibility is limited to securely linked and authorised children.
- A correction updates the displayed current result while preserving an auditable history.
- Audio/text accessibility works without creating a second automatic narrator or disrupting Next/Back navigation.
- No public class ranking or disclosure of another learner's marks is shown.

### G. Locked delivery placement

Implement this as part of Stage 3, after verified indicators, student worksheets, question IDs, approved marking criteria, Student ID matching and teacher approval workflows are ready. First validate the teacher-approved daily result pipeline; then connect the Student Platform personal view and permission-scoped Parent Platform view. Keep HOME_PRACTICE and NATIONAL_EXAMINATION states separate. Do not move the Global Library (Stage 4) or capacity/personal-information space (Stage 5) ahead of the locked sequence.

**Current boundary:** Documentation only. No student or parent views, result APIs, account permissions, learner records, marks, Firebase data, production systems or APKs were changed.
