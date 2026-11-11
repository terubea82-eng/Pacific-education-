# PacEdu National Examiners Workspace — Question Bank and Intelligent Paper Development Specification

**Status:** Staging requirements specification only — not implemented or activated.
**Date:** 12 November 2026
**Security classification:** Restricted examination-authority workspace.
**Dependencies:** Verified curriculum inventory, exact 45/45/25-day distributions, and student worksheet/teacher-guide quality gates.
**Release rule:** No production access, live examination content, national assessment use or public launch without formal authority approval and independent security review.

## 1. Purpose

Provide a separate secure workspace where formally authorised national examiners can:
1. Search, select and combine approved PacEdu question-bank items.
2. Write and manage their own original questions.
3. Request AI-proposed questions grounded in verified curriculum concepts and indicators.
4. Combine selected, examiner-authored and AI-proposed items into examination-paper drafts.
5. Prepare marking guides, practical assessment instructions and moderation records.
6. Approve and export papers only through the examination authority's approved process.

PacEdu supports examiner work; it does not replace the national examination authority, examiner judgement, curriculum approval, moderation or statutory procedures.

## 2. Strict access boundary

Access is limited to individually identified people whose current appointment or written authorisation has been verified with the relevant national examination authority.

Students, parents, guardians, ordinary learners, teachers, school administrators, ordinary paid subscribers, library users, general PacEdu staff, unverified accounts and shared accounts are denied. Teachers or administrators may enter only if separately appointed and authorised for a defined examination duty.

A hidden menu, unlisted URL or client-side role flag is not a security control.

### Authorisation and account lifecycle
- The authority confirms identity, appointment, jurisdiction, subject/level scope, duties, start date and expiry/review date.
- Each examiner receives an individual account with strong authentication and multi-factor authentication.
- A trusted server-side process grants access only after authority verification and identity proofing.
- No user can grant themselves examiner privileges. PacEdu Owner/admin technical access does not itself confer examiner appointment or permission to read confidential papers.
- Permissions are least-privilege and scoped by jurisdiction, examination session, subject, level, paper and assigned task.
- Expiry, authority request, suspected compromise or role change triggers prompt suspension/revocation and session/token invalidation.
- Emergency access, if required, is time-limited, separately approved and fully audited.

## 3. Three question-development methods

### A. Approved PacEdu question banks
Examiners can search, filter, preview and select questions by:
- Country/jurisdiction and curriculum edition/status.
- Class/year/form and subject.
- Exact indicator/outcome IDs and source references.
- Topic and prerequisite links.
- Cognitive demand using Bloom's taxonomy and, where suitable, SOLO.
- Question format, marks, estimated time and practical/theory classification.
- Reviewed difficulty, accessibility features, approval state, version and permitted use.

Each bank item must carry provenance, author/source, rights or licence status, curriculum mapping, review history, answer/marking guidance and permitted-use restrictions. Practice-only, copyrighted, unverified or retired items must not be silently treated as approved national examination items.

### B. Examiner-authored questions
Authorised examiners can create original items and record:
- Question stem, stimulus, diagram/data and candidate instructions.
- Jurisdiction, level, subject, curriculum indicator(s) and source.
- Intended thinking skill, marks, time and response format.
- Model answer, marking points, accepted equivalent responses and common misconceptions.
- Practical materials, safety controls, setup and observation criteria where relevant.
- Author, reviewer, version, status and confidentiality classification.

Examiner-created content remains a draft until required peer review and formal approval are recorded.

### C. PacEdu AI-proposed questions
AI may propose draft questions only from the approved curriculum source and indicator records selected for the paper. Each proposal must include:
- Exact indicator/source references and curriculum version.
- Intended learning evidence and thinking skill.
- Suggested question, model answer and marking rationale.
- Estimated marks and time.
- Language/readability and accessibility review prompts.
- Potential ambiguity, bias, cultural-context and answerability warnings.
- Clear status: AI DRAFT — NOT APPROVED.

AI must not invent curriculum indicators, cite sources it has not been given, assert unverified national standards, or automatically promote output into an approved bank or paper. AI-generated answers and marking schemes require examiner verification.

## 4. Curriculum-to-paper blueprint

Before drafting questions, examiners create or select an authority-approved blueprint defining:
- Jurisdiction, session, qualification/level, subject and paper.
- Applicable curriculum and assessment version.
- Indicators/outcomes and approved weighting.
- Permitted content coverage and exclusions.
- Question formats, marks, duration and section structure.
- Cognitive-demand distribution and practical/theory balance.
- Approved accommodations and accessible formats.
- Moderation and approval requirements.

Coverage reports identify missing, overrepresented or unassessed indicators. A paper cannot pass validation if required blueprint coverage is absent or an item maps only to an unverified or wrong-jurisdiction indicator.

The 9/9/5 teaching timetable and Term 3 revision plan may inform coverage and readiness reports, but cannot override the examination authority's approved syllabus, blueprint or assessment regulations.

## 5. Intelligent but fair question design

Questions should invite students to recall, explain, apply, compare, analyse, evaluate, investigate and create using knowledge they have been taught. Higher-order thinking must come from meaningful reasoning and application, not trick wording, obscure vocabulary or hidden curriculum.

- Use Bloom's taxonomy as a design lens; use SOLO where it is part of the applicable subject prescription.
- Match reading load, language and context to the assessed subject and level. Do not accidentally test advanced English when English comprehension is not the intended construct.
- Use locally meaningful contexts without disadvantaging students unfamiliar with a particular household, technology, location or cultural experience.
- Ensure each question has a defensible answer or clearly defined acceptable range.
- Include marking points for valid equivalent wording, methods and justified alternatives where appropriate.
- Balance difficulty and marks against available time and taught content.
- Do not claim subject papers measure overall intelligence or IQ. Assess curriculum learning and develop reasoning through ordinary, clearly explained assessment.
- Do not deceive students about whether an activity is an assessment. Describe it accurately as curriculum learning or examination practice; there is no need to label each thinking skill as an intelligence test.

## 6. Practical assessment

For subjects requiring hands-on learning, the workspace supports practical task briefs, equipment/material lists, safe setup, candidate instructions, observation schedules, evidence records, marking rubrics and contingency arrangements.

Practical assessments must assess outcomes in the authorised prescription, be feasible with available school resources, include safety and reasonable accommodation requirements, distinguish individual performance from group work, protect confidential task materials where required, and use human observation for evidence that cannot reliably be auto-marked.

PacEdu must not replace a required practical examination with a multiple-choice quiz or infer practical competence from written answers alone.

## 7. Review, moderation and approval states

Suggested lifecycle:
DRAFT → SOURCE CHECK PENDING → EXAMINER REVIEW → MODERATION PENDING → AUTHORITY APPROVAL PENDING → APPROVED FOR DEFINED USE → SEALED FOR SESSION → RETIRED.

Rejected or superseded content is retained in a restricted audit history and cannot be selected for current use. AI-generated content starts as AI DRAFT — NOT APPROVED. Approval is specific to jurisdiction, session, level, subject, paper and version; it is not general approval for reuse.

Require independent review for answerability, marking consistency, bias, accessibility, source mapping, security classification and blueprint coverage. Record conflicts of interest and recusal where required.

## 8. Confidentiality and technical security

- Isolate examiner data and services from student, teacher, public library and ordinary account environments.
- Enforce every read, write, search, export and approval permission on trusted server-side services and database policies.
- Deny by default; use short-lived sessions, MFA, secure recovery and re-authentication for sensitive actions.
- Encrypt data in transit and at rest; protect keys and secrets outside client code.
- Apply jurisdiction/session/paper-level tenant and row/object scoping.
- Keep confidential paper content out of public search indexes, public URLs, ordinary AI chat, student recommendations, analytics payloads and notification previews.
- Log access, views, edits, imports, exports, print actions, approvals, role changes and failed access attempts. Logs must be tamper-resistant and access-restricted.
- Apply download/print controls and watermarking where supported and required, while recognising that technical controls cannot prevent every photograph or transcription.
- Apply authority-defined backup, retention, legal-hold and authorised-destruction rules.
- Test direct URL access, API access, IDOR, role escalation, cross-country leakage, expired appointments, session revocation, export abuse and backup restoration.
- Use synthetic sample questions only during development and security testing.

## 9. Separation from learner-facing content

The examiner question bank is not the student worksheet bank. A question may be copied or adapted into learner practice only after an authorised release decision confirms it is not confidential and rights and educational review are complete.

Never expose draft papers, answer keys, marking schemes, examiner comments, future examination dates or confidential practical tasks to learner accounts. Do not use confidential examination material to personalise student practice or train a general model.

## 10. Required acceptance tests

Before live activation, demonstrate:
1. Unauthorised student, parent, teacher, school-admin and paid-user accounts are denied at UI, API and database layers.
2. A valid examiner sees only their assigned jurisdiction, session, subject, level and duties.
3. An expired or revoked examiner loses access, including existing sessions and tokens.
4. Owner technical support cannot read confidential paper content without a separately authorised, audited emergency process.
5. Question-bank filters return only items with compatible jurisdiction, source, status and permitted use.
6. AI proposals always remain drafts and carry valid source/indicator references.
7. No paper can be approved or exported without all required human approvals.
8. Every paper passes blueprint coverage, answerability, marks/time, accessibility and moderation checks.
9. Practical assessments include safety, materials and human observation controls.
10. No confidential content appears in student apps, ordinary notifications, public URLs, search indexes, analytics or non-examiner APIs.
11. Audit history records who did what, when, to which version and under which authority.
12. Load, outage, recovery, backup-restore and incident-response tests pass.

## 11. Delivery sequence and dependencies

This separate restricted module must not interrupt the user's locked core delivery order:
1. Complete the official curriculum source and indicator inventory.
2. Complete exact 45/45/25-day distributions and prerequisite mapping.
3. Complete student worksheets and teacher guides, including Term 3 revision and practical-learning links.
4. Build the separate Global Library after worksheet acceptance gates pass.
5. Expand user capacity and personal information space with privacy and scale safeguards.

Keep this examiner specification documented and reviewed in parallel. Begin technical implementation only after curriculum data contracts and authority requirements are stable. Activate only after formal examination-authority agreement, legal/privacy review, independent penetration testing and explicit release approval.

## 12. Current implementation boundary

This is a requirements specification only. It does not create examiner accounts, grant roles, import confidential questions, generate live national papers, change Firebase/Auth/database rules, connect an AI question generator or activate an examination service. No production deployment, payment change, learner-record change or APK replacement is authorised.
