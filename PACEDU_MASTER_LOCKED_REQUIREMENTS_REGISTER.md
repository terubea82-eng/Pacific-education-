# PacEdu Master Locked Requirements Register

**Register ID:** PACEDU-MASTER-LOCKED-REQUIREMENTS  
**Purpose:** Single source of truth for owner-approved requirements to preserve throughout PacEdu development, maintenance, testing and future upgrades.  
**Status:** Proposed for protection through PR #197; requirements are not considered implemented merely because they are recorded here.  
**Owner intent:** Pacific Guardian is authorized to develop and improve PacEdu using its existing architecture and working code, within configured permissions and the safeguards in this register.

## How every future change must use this register

1. Before planning or editing, read this register, the continuous operations charter and any relevant existing Stage, voice, security, curriculum or release specification.
2. Identify which requirement IDs the change affects and list them in the pull request description.
3. Prefer additive, narrow changes that preserve existing code and behavior. Do not broadly rewrite or delete working features for convenience.
4. Add or update tests for each applicable requirement. If a requirement is not yet technically enforceable, mark it **NOT YET ENFORCED** and create a tracked implementation task.
5. Do not merge or deploy while required checks fail or a protected behavior has regressed. Do not bypass repository protections.
6. Do not claim a requirement is implemented, secure, compliant, deployed or physically verified without evidence.
7. For future work in ChatGPT or a development session, remind the owner and developer to consult this register whenever the task could affect a listed area. A reminder in conversation is not a substitute for automated checks.
8. When new owner requirements are approved, add them here with a stable ID, acceptance test, implementation status and linked PR. Do not silently remove or weaken an existing requirement. Changes to the owner's requirements must be explicitly documented.

## A. Preservation, development authority and change control

- **PRESERVE-001 — Existing working features:** preserve working lines, behaviors and responsibilities; reuse existing architecture and prefer additive, narrowly scoped changes.
- **PRESERVE-002 — Protected voice #856:** protect `src/js/pacificEducationMandatoryVoiceNavigation.js` and `src/js/pacificEducationSpeechVoice.js`; no modification without a documented necessity, regression evidence and applicable owner approval.
- **PRESERVE-003 — Core journeys:** preserve registration, country/language handoff, role selection, sequential page navigation, role workspaces, back/next flow, sign-out, learner records, offline learning and current working user journeys.
- **PRESERVE-004 — No false physical-test claim:** CI success is not proof the installed Android APK works. Physical phone verification is separate and only confirmed when the owner reports the result.
- **PRESERVE-005 — No unrequested APK build:** do not initiate an APK build unless the owner explicitly asks.
- **CHANGE-001 — Traceable work:** branch, commit, PR, reason, affected files, requirement IDs, test evidence, review and recovery point must be recorded for material changes.
- **CHANGE-002 — Safe release:** required checks and repository rules must pass; use existing release and production gates. Never self-authorize a production release or bypass protections.
- **CHANGE-003 — Rollback:** retain a known-good revision and recovery instructions; do not recover by silently deleting valid newer learner records.
- **CHANGE-004 — Pacific Guardian development authority:** Guardian may investigate, propose, develop, repair and test within configured permissions. This owner authorization does not itself create GitHub, hosting, secrets or production permissions.

## B. Pacific Guardian and Technician operations

- **GUARDIAN-001 — Owner protection and advice:** detect or receive issues, verify evidence, explain severity and confidence, offer practical options and risks, notify the owner, and track unresolved matters through verification.
- **GUARDIAN-002 — 24/7 readiness:** design for continuous monitoring across time zones. Claim 24/7 service only after hosted monitoring, alert delivery, escalation ownership and recovery procedures are deployed and tested.
- **GUARDIAN-003 — Technician assistance:** provide the Technician workspace with actionable diagnostics, maintenance tasks, safe repair recommendations, test results and unresolved-risk status.
- **GUARDIAN-004 — No autonomous privilege escalation:** Guardian must not self-grant access, expose secrets, override branch protections or perform irreversible/high-impact actions outside explicit authority.
- **GUARDIAN-005 — Fail-safe behavior:** when identity, evidence, permissions, curriculum source or other critical facts are missing, preserve records, explain the limitation and block unsafe actions.
- **GUARDIAN-006 — Honest status:** distinguish detected, suspected, confirmed, action attempted, action succeeded, independently verified, blocked and unresolved states.
- **GUARDIAN-007 — Alerts:** critical incidents should reach a tested, configured channel; unacknowledged alerts should escalate. Alert messages must not expose learner data, tokens or secrets.
- **GUARDIAN-008 — Scope limitation:** monitoring can cover only services, data and signals that are configured and authorized. A closed phone or offline browser is not a continuous monitoring service.

## C. Cybersecurity, API and supply-chain protection

- **SECURITY-001 — Server-side authorization:** every sensitive API/action must check authentication, role, country/organization boundary and resource ownership server-side. Hiding UI elements is not access control.
- **SECURITY-002 — API defenses:** validate inputs, encode outputs, limit request rates and resource use, handle sessions securely, configure CORS and CSRF protections where applicable, and validate webhooks and external destinations.
- **SECURITY-003 — Secrets:** store credentials in approved secret storage; never commit, log or display API keys, passwords, signing keys, tokens or private learner data. Rotate exposed credentials.
- **SECURITY-004 — Threat response:** detect suspicious access and abuse, contain within pre-authorized limits, preserve evidence, notify the owner and follow a recovery process. Do not promise perfect hacker prevention.
- **SECURITY-005 — Dependencies:** scan for vulnerabilities and leaked secrets; review and update dependencies/actions with compatibility tests; track unsupported components and software provenance.
- **SECURITY-006 — Isolation tests:** test unauthorized roles, cross-country access, malformed input, replay, duplicate requests, quota exhaustion, provider outage and safe error handling.
- **SECURITY-007 — Audit:** keep access-controlled, time-stamped, tamper-resistant where feasible logs for sensitive changes; exclude secrets and unnecessary child-sensitive details.

## D. Country profiles, curriculum and authorized languages

- **COUNTRY-001 — Independent national environments:** every country has a distinct profile for jurisdiction, curriculum, school levels, language rules, local context, assessment standards, time zone/calendar, data rules and authorized reviewers.
- **COUNTRY-002 — Verified authority:** record source, version, date, review status and responsible approver for curriculum and regulatory mappings. Do not claim government, Ministry or accreditation approval without evidence.
- **COUNTRY-003 — Country boundaries:** do not expose a country's private learner records, restricted content, teacher communications or confidential examinations to another country without explicit authorization.
- **LANGUAGE-001 — Authorized learning language:** daily activities, curriculum materials, questions, revision, assessment instructions, rubrics, feedback and teacher guidance must follow applicable government/curriculum/school language rules and the learner's permitted preference.
- **LANGUAGE-002 — Language-specific exceptions:** where a subject or examination mandates a particular language, enforce that requirement and explain it. Do not silently substitute another language.
- **LANGUAGE-003 — Translation fidelity:** preserve learning objectives, technical vocabulary, expected answer meaning, rubric levels and mark allocations. Flag uncertain translations for qualified review.
- **LANGUAGE-004 — Accessibility language support:** voice, screen reader, captions and alternative formats should support the authorized language where technically available. Disclose limitations rather than silently changing language.
- **CURRICULUM-001 — Evidence-backed mapping:** map learning objectives and criteria to verified sources; label draft, stale, disputed, pending or verified status.
- **CURRICULUM-002 — Local relevance:** teach students to know themselves first, then understand their home, family, community, environment and country before expanding to other countries and global topics.
- **CURRICULUM-003 — Practical learning:** connect reading, questions and activities to everyday life and real problems, while maintaining the required curriculum objectives and skill standards.
- **CURRICULUM-004 — Skill-responsive pathway:** adapt to demonstrated skill, pace, progress and accessibility needs, not age alone.
- **CURRICULUM-005 — Complete learning cycle:** provide instruction/explanation, examples, practice, differentiated support, feedback, revision, review, reflection and progress evidence as appropriate.
- **CURRICULUM-006 — Fiji pathway:** support the intended Fiji ECE–Year 13 pathway, but do not label mappings official or Ministry-approved without verified evidence.
- **CURRICULUM-007 — No unsupported diagnosis:** do not diagnose learners or make unsupported medical claims from educational performance.

## E. Daily learning and current affairs

- **DAILY-001 — Daily learning cannot depend on news:** if current-affairs news is absent or unsuitable, PacEdu must still generate curriculum-aligned real-life learning text, questions and practical activities using verified country context.
- **DAILY-002 — National context first:** everyday examples should reflect the learner's own permitted language, environment, community and country.
- **NEWS-001 — Global current-affairs library:** retain an organized, searchable library of educational current affairs from multiple countries for permitted research and comparative learning.
- **NEWS-002 — National daily priority:** each student's daily current-affairs learning should focus on their own country; international news is supplementary unless a curriculum objective calls for it.
- **NEWS-003 — News provenance:** record source, publication date, location/country, topic, reliability/review status and licensing constraints.
- **NEWS-004 — Fact and opinion distinction:** separate verified facts, developing reports, opinion and unverified claims; stale content must be labelled.
- **NEWS-005 — Safe reuse:** store full articles or media only where permitted; otherwise retain lawful metadata/links and create appropriately attributed original summaries.
- **DAILY-003 — Lesson outputs:** where relevant, include a practical situation, explanation/reading, questions, expected answers, marking criteria, feedback and revision.
- **DAILY-004 — Offline continuity:** approved downloaded lessons remain available offline; stale news, pending content and synchronization state must be visible.

## F. Assessment, marks and examination security

- **ASSESSMENT-001 — Exact learner identity:** bind each submission, mark, comment, rubric and evidence item to the correct student ID, class/cohort, activity ID, assessment-attempt ID, country/curriculum version and rubric version.
- **ASSESSMENT-002 — Block mismatch:** wrong/missing/demo student identity, mismatched assessment/activity/evidence, or unrelated comments must block approval and explain why.
- **ASSESSMENT-003 — Preserve original work:** teacher approval must not silently alter the learner's original answer, marks, comments or evidence. Return for correction with a reason and create a traceable version if amended.
- **ASSESSMENT-004 — Explain each mark:** maintain criterion-level marks and rationale so learners and authorized teachers can understand why each mark was earned.
- **ASSESSMENT-005 — Objective auto-scoring only:** only validated objective response types may be auto-scored; open-ended, matching or other non-objective responses remain in the appropriate human-review path unless explicitly validated.
- **ASSESSMENT-006 — Consistent criteria:** version-lock criteria for each assessment attempt and define mark allocation, acceptable answers, partial credit and feedback rules as applicable.
- **ASSESSMENT-007 — Daily/revision/final criteria:** create suitable criteria for daily learning, revision and final examinations based on verified curriculum sources; do not invent official national requirements.
- **EXAM-001 — Confidential paper isolation:** draft/final external examination papers, answer keys, examiner notes and marking schemes must be access-restricted by country, organization, role and release time.
- **EXAM-002 — No public leakage:** confidential papers must not be included in public static assets or unprotected offline caches.
- **EXAM-003 — Country examination jurisdiction:** generate country-specific papers and marking criteria only from verified applicable curriculum/exam requirements; no unauthorized cross-country viewing.
- **EXAM-004 — Status honesty:** distinguish generated draft, reviewed mock, authorized official material and released paper. Never label generated/draft papers official without authorization.
- **EXAM-005 — Professional review:** high-stakes/external examination content requires authorized subject/examination review and an audit trail before release.

## G. Learner privacy, child safeguarding and inclusion

- **PRIVACY-001 — Data minimization:** collect only data necessary for a defined purpose; define access, retention, correction, export/deletion and consent/lawful basis according to applicable jurisdiction.
- **PRIVACY-002 — Sensitive data:** do not collect precise location, biometrics, government IDs, health or other sensitive data by default without verified necessity, lawful basis and approval.
- **SAFEGUARD-001 — Child protection:** age-appropriate content, safe communication, minimal disclosure, approved safeguarding escalation and restricted access to incident details.
- **ACCESS-001 — Inclusive access:** test blind/low-vision, deaf/hard-of-hearing and other accessibility needs; support screen readers, keyboard navigation, readable text, captions/text alternatives and suitable audio where available.
- **ACCESS-002 — Fair assessment:** do not penalize a learner for an accessibility barrier unrelated to the skill being assessed.
- **ACCESS-003 — Offline/low-bandwidth use:** preserve learning continuity for low-connectivity environments and disclose unsupported features.

## H. Data integrity, sync, backups and recovery

- **DATA-001 — Offline sync integrity:** prevent duplicate, stale, partial and out-of-order writes from silently losing or corrupting learner work.
- **DATA-002 — Idempotency/conflicts:** define safe retry behavior and conflict resolution for assessments, progress and messages.
- **DATA-003 — Local privacy:** protect local caches, shared-device sessions, session expiry and sign-out.
- **RECOVERY-001 — Tested backup:** monitor backup completion and test restoration; a successful backup job alone is not proof recovery works.
- **RECOVERY-002 — Safe rollback:** retain known-good source/release and migration recovery plans without discarding valid newer learner data.
- **RECOVERY-003 — Outage behavior:** identify stale data and service degradation; preserve safe offline learning and clearly show unsynced work.

## I. AI-generated content and quality

- **AI-001 — Review status:** distinguish AI-drafted, teacher-reviewed, verified and approved content.
- **AI-002 — Curriculum grounding:** tie generated lessons, questions, answer keys and rubrics to verified objectives and country/language settings.
- **AI-003 — Quality checks:** test factual accuracy, translation fidelity, answer keys, bias, age appropriateness, accessibility and objective alignment.
- **AI-004 — High-stakes gate:** generated content must not silently become official curriculum, high-stakes marks or official examination material without required human validation.
- **AI-005 — Explainability:** explain marks, feedback and significant recommendations in understandable terms; permit authorized correction and appeal.
- **AI-006 — Safe fallback:** when evidence or confidence is insufficient, preserve progress, label uncertainty and request review instead of guessing.

## J. 24/7 health, maintenance and incident response

- **OPS-001 — Hosted monitoring:** monitor application availability, key journeys, APIs, workflows, dependencies, synchronization, backup/restore, capacity and relevant security events where configured.
- **OPS-002 — Incident severity:** define critical/high/medium/low severity, response targets, alert deduplication, escalation and maintenance windows.
- **OPS-003 — Alert delivery test:** test the actual recipient/channel and escalation path; do not assume a configured notification is delivered.
- **OPS-004 — External dependencies:** identify provider outages, quotas, expiring certificates and secret expiry metadata without exposing secret values.
- **OPS-005 — Maintenance records:** track issue, evidence, severity, owner notification, approved action, responsible actor, verification and remaining risks.
- **OPS-006 — 24/7 claim gate:** do not claim continuous operational coverage until service deployment, coverage, alert routing and recovery have been demonstrated.
- **OPS-007 — Threat recovery:** test containment, incident communication, restoration and lessons learned within approved procedures.

## K. Acceptance and status discipline

For every applicable requirement, the change must link to a concrete test, check, evidence record or explicit tracked implementation task. Required negative tests include unauthorized access, cross-country data access, identity mismatches, silent mutation, missing language/curriculum verification, offline retries and failed alert delivery.

Status vocabulary:
- **PASS:** evidence demonstrates the requirement is satisfied for the tested scope.
- **IMPROVEMENT:** enhancement recommended; no immediate blocking defect established.
- **OWNER ACTION REQUIRED:** decision or permission needed from owner.
- **BLOCKED:** required evidence, permissions, approval or test is missing or failed.
- **NOT YET ENFORCED:** recorded design requirement without verified technical control.
- **PHYSICAL DEVICE NOT VERIFIED:** no owner-confirmed test on the target device.

A CI success, policy document, passing static check or successful merge alone does not prove production security, government approval, 24/7 operation or physical-device behavior.

## L. Relationship to existing governance

This master register complements and does not replace existing repository controls and detailed specifications, including:
- `PACIFIC_GUARDIAN_CONTINUOUS_OPERATIONS_AND_PACEDU_PRESERVATION_CHARTER.md`
- `PACIFIC_GUARDIAN_MANDATORY_CHANGE_TRACEABILITY_POLICY.md`
- `PACIFIC_GUARDIAN_AUTOMATED_STAGE_WRITE_POLICY.md`
- `STAGE_31_CONTINUOUS_SECURITY_PRIVACY_SAFEGUARDING_MONITORING_SPEC.md`
- `STAGE_32_CURRICULUM_ACCESSIBILITY_PRODUCT_QUALITY_REGRESSION_SPEC.md`
- `STAGE_35_OWNER_GOVERNANCE_CHANGE_SUCCESSION_CONTROL_SPEC.md`
- `.github/pacedu-protected-features.json` and the Feature Preservation Gate
- existing pilot, assessment, security, voice and production release gates.

Where a detailed specification already exists, use it rather than creating duplicate implementation stages. Link the relevant requirement IDs and evidence to the existing control.

## M. Change history

- **2026-10-20:** Consolidated owner requirements discussed in the current conversation about national curriculum and language, real-life daily learning, global current affairs, assessment integrity, confidential examinations, Pacific Guardian authority, 24/7 maintenance, API/security protection, child privacy, accessibility, offline continuity, preservation and controlled release.
- This register must be updated as future owner-approved requirements arise. Merge status and enforcement status must be recorded separately.
