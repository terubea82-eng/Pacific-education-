# PacEdu PCD Architecture — Controlled Pilot

Status: architecture proposal on a feature branch; not merged or deployed.
Scope: PCD learner evidence, assessment, ability recommendations and teacher review.
Compatibility rule: extend existing modules in small steps; do not rewrite the protected navigation, voice baseline, offline sync, or working workspaces.

## 1. Design goals
- Keep learner activities simple and accessible on phones, including offline-first use.
- Match evidence to a verified learner ID, class, term and subject; never match by name alone.
- Keep teacher approval as the gate before learner activities or evidence become approved records.
- Treat automated ability as a provisional recommendation, not a diagnosis or permanent label.
- Missing, late, inaccessible, or unsubmitted work is not evidence of low ability.
- Keep records traceable; preserve teacher-approved marks and feedback rather than silently rewriting them.

## 2. Logical components
1. Identity and role context: learner/session role, verified student reference, class reference and permissions.
2. Curriculum/activity planner: country, class/level, subject, term, week, day, learning outcome, ability-differentiated tasks and teacher review status.
3. Activity delivery: publishes only teacher-approved activities; supports typed/manual work and optional camera/audio evidence.
4. Evidence intake: validates identity and activity scope; records submission metadata and pending review status.
5. Assessment engine: auto-scores only validated objective items with answer keys; free responses, photos and voice remain pending human review unless a validated rubric is explicitly enabled.
6. Teacher review queue: shows learner/class/term/subject, activity, evidence and review actions; rejects identity mismatches and duplicate cross-learner attachment.
7. Ability recommendation engine: reads only eligible teacher-reviewed evidence for the exact learner/class/term/subject; returns insufficient-evidence or provisional band with transparent reasons.
8. Learner progress and portfolio: presents approved feedback and progress; keeps an audit trail for marks, reviews and corrections.
9. Offline queue and sync: queues permitted actions, retries safely, prevents duplicate records and surfaces sync conflicts without overwriting approved data.
10. Privacy/security and observability: least-privilege access, data minimisation, retention/deletion policy, safe rendering of untrusted text, traceable errors and no sensitive student data in logs.

## 3. Evidence and ability rules
- Current prototype requires at least five distinct teacher-marked daily activities and a teacher-marked term examination in the same student, class, term and subject scope.
- Repeat attempts for one activity count once. Unreviewed work does not count.
- Proposed bands: Foundation, Developing, Expected-level, Advanced. Thresholds must remain visible and configurable by authorised curriculum owners; validate them with educators before production use.
- The engine must show evidence counts, exam percentage, activity approval rate, recommendation reason, review status and the date/source of the evidence.
- Teacher review can confirm or adjust a recommendation with a recorded reason. Do not overwrite historical review records.
- If evidence is insufficient or conflicting, show “Awaiting evidence” and a clear next step rather than guessing a level.

## 4. Main data records
- LearnerContext: studentId, classId, role, identityVerified, countryCode, updatedAt.
- ActivityPlan: activityId, countryCode, classId, subject, term, week, day, outcomeId, abilityTasks, approvalStatus, approvedBy, approvedAt.
- EvidenceSubmission: submissionId, activityId, studentId, classId, term, subject, responseType, submittedAt, syncStatus, reviewStatus.
- AssessmentResult: resultId, submissionId, score, maximum, rubricVersion, scorerType, reviewedBy, reviewedAt.
- AbilityRecommendation: recommendationId, studentId, classId, term, subject, evidenceIds, evidenceCount, examPercentage, activityApprovalRate, band, ruleVersion, status, generatedAt.
- TeacherReview: reviewId, recommendationId, reviewerId, decision, finalBand, reason, createdAt. Append new reviews rather than silently editing history.
- AuditEvent: eventId, actorRole, action, recordType, recordId, timestamp, outcome; exclude unnecessary child personal information.

## 5. Workflow
Teacher creates/selects a plan → curriculum and class scope checked → teacher approves → activity becomes visible to the correct learners → learner submits typed/manual or optional camera/audio work → identity and scope validated → objective answers may be auto-scored → other evidence waits in teacher review queue → teacher reviews evidence and identity → eligible evidence enters portfolio and ability engine → provisional recommendation shown with reasons → teacher confirms/adjusts with reason → learner receives approved feedback and next activity → offline changes sync with conflict checks.

## 6. Permissions
- Learner: view approved assigned activities; submit own work; view feedback released to them.
- Teacher: approve plans, review evidence for assigned class, enter/verify marks and review recommendations.
- Head/administrator: only authorised aggregate/class oversight; access to identifiable evidence must be explicitly permissioned.
- Technician: maintenance and diagnostics only; no routine access to learner content.
- System: least privilege; every privileged action is auditable.

## 7. Failure and safety behaviour
- Unverified learner/class: stop evidence attribution and request identity confirmation.
- Missing script/module/data: show a safe status and preserve navigation; do not silently assign a level.
- Offline: preserve local pending work and show sync status; never claim a remote save until confirmed.
- Teacher review unavailable: retain pending status and keep the activity/evidence traceable.
- Malformed or untrusted text: render as text, not executable HTML.
- Conflicting records: flag for authorised resolution; do not merge learners or overwrite approved marks.

## 8. Staged implementation
Stage A — architecture and tests: document contracts, privacy boundaries and regression expectations.
Stage B — ability-box diagnosis: test how active learner/class/term/subject context is selected and why the existing recommendation is or is not rendered.
Stage C — minimal UI wiring: display the current evidence status and recommendation from the existing engine; no duplicated scoring logic.
Stage D — integration tests: verified identity, wrong learner, wrong class, wrong term/subject, insufficient evidence, teacher-approved evidence, teacher adjustment and offline retry.
Stage E — pilot validation: educator review of thresholds and curriculum mapping, phone tests, privacy/rules review and rollback plan.
Stage F — release: only after required checks pass and explicit merge/release approval.

## 9. Acceptance criteria
- Existing navigation, voice, offline-sync and teacher-approval tests remain passing.
- A learner never sees another learner's evidence or recommendations.
- Ability box visibly distinguishes identity required, awaiting evidence, recommendation ready, and teacher reviewed.
- Recommendations include their evidence scope and rule explanation.
- No official curriculum/exam claim without authoritative verification.
- No production deployment or APK build is implied by this architecture document.
