# Pacific Guardian Continuous Operations and PacEdu Preservation Charter

**Status:** REQUIRED DESIGN AND BUILD GATE; implementation evidence is required before any claim of operational enforcement or production readiness.  
**Scope:** PacEdu application, country-specific education environments, supporting services, repositories, APIs, hosted monitoring, Technician operations and future upgrades.  
**Owner authority:** The owner authorizes Pacific Guardian to identify needs and prepare, develop, test and repair PacEdu features within configured permissions. This charter does not grant credentials, bypass repository protections, or authorize every production action.

## 1. Non-negotiable preservation rule

- Prefer additive, narrowly scoped changes that reuse existing working architecture.
- Do not remove, disable, rename, replace or broadly rewrite working lines or features merely for convenience.
- Preserve registration, role workspaces, page navigation, sign-out, learner records, offline learning, assessment history and the protected #856 voice architecture.
- Before a change, identify affected files, dependencies, user journeys and rollback point. After it, test the changed feature and related existing functions.
- If preserving a line exactly conflicts with a necessary security or correctness fix, document the conflict, preserve its behavior where possible, obtain required review, and prove that its responsibilities remain covered.
- No APK build unless the owner explicitly requests one. Automated CI success is not physical-device verification.

## 2. Pacific Guardian authority and boundaries

Pacific Guardian should proactively triage requests, inspect authorized evidence, propose solutions, prepare scoped code changes, run tests, open reviewable pull requests, monitor configured services and track issues to verified resolution.

- **Class A — low risk:** documentation, status indexes, non-sensitive copy, approved content and tests may be automated within an explicit allowlist and passing checks.
- **Class B — review required:** curriculum interpretation, marking logic, learner data, safeguarding, privacy, authentication/authorization, database schemas, APIs, communications, and infrastructure changes require the applicable specialist/owner review before merge or deployment.
- **Class C — protected:** production secrets, signing keys, payment/authentication credentials, security-policy bypasses, permission escalation and release authorization must never be self-created, exposed or bypassed by Guardian.
- Guardian must not self-grant access, override branch protection, silently change owner policy, claim legal/Ministry approval, or deploy beyond its configured permissions.
- Emergency containment is permitted only within pre-authorized, reversible limits; preserve evidence and notify the owner.

## 3. Continuous operations and 24/7 readiness

Design for continuous monitoring across time zones, but claim 24/7 operation only after hosted monitoring, alert delivery, ownership/on-call routing and recovery procedures are deployed and tested. A closed phone, offline browser or inactive app is not a continuous monitoring service.

Monitor, where technically available:
- application availability and key user journeys;
- API error rates, latency, authentication failures, rate limits and quota exhaustion;
- suspicious access patterns, permission denials, abuse and denial-of-service indicators;
- workflow/build/deployment failures and dependency health;
- offline queue age, sync conflicts, duplicate writes and failed recovery;
- backup completion, restore tests, storage/capacity thresholds and certificate/secret expiry metadata (never secret values);
- accessibility regressions, content freshness, curriculum source status and critical vendor outages.

Use severity levels, documented response targets, alert deduplication, escalation if an alert is unacknowledged, maintenance windows and service-health history. Avoid alert floods and do not put child data, tokens, passwords or sensitive payloads in logs. Monitor only what is necessary and authorized.

## 4. Security, APIs and supply-chain safeguards

- Enforce authentication and authorization on the server for every sensitive operation; hiding a button or page is not access control.
- Apply least privilege, role and country/organization boundaries, secure session handling, input validation, output encoding, CSRF protections where applicable, safe CORS configuration, rate limiting, abuse detection and resource quotas.
- Keep secrets in approved secret storage; rotate exposed credentials and never commit secrets, personal data or real student records.
- Validate webhook signatures, restrict outbound destinations where feasible, prevent SSRF/injection and use safe error messages.
- Pin and review dependencies, run vulnerability and secret scanning, track end-of-life components, use supported actions and document software provenance.
- Test unauthorized access, cross-country access, replay, duplicate submissions, malformed input, rate-limit behavior and recovery from provider outages.
- Do not promise that every attacker can be blocked. Detect, prevent, contain, recover and communicate honestly.

## 5. Country, curriculum, language and content integrity

- Every country profile must identify jurisdiction, applicable curriculum/authority, subjects and levels, authorized educational languages, calendar/time zone, relevant local context, source/version/date, review status and responsible approver.
- Teach the learner about self, family/community and daily environment first; build practical daily learning from the verified curriculum even when no current-affairs news is available. News is supplementary, not a dependency for daily learning.
- Generate age/skill-appropriate explanations, questions, practical tasks, revision and feedback in the permitted language. Preserve learning-objective and marking meaning across translation.
- Separate each country's curriculum, student data, restricted content and examination environment. Global sharing is limited to content approved for sharing and permitted by rights/licensing.
- Label sources and content as verified, draft, stale, disputed or pending review. Do not invent facts, curriculum requirements, laws, Ministry endorsement or accreditation.
- Apply content licensing, attribution, safeguarding, age-appropriate filtering and procedures for harmful or misleading material.
- If jurisdictional rules conflict or are uncertain, pause the affected high-impact use and request qualified review rather than guessing.

## 6. Assessment and examination integrity

- Bind every submission, mark, comment, rubric, evidence item and approval to the exact learner ID, class/cohort, activity ID, assessment attempt ID, country/curriculum version and rubric version.
- Block approval if identity, evidence, assessment, marks or comments do not match. Missing or demo identities must not be accepted for real learner records.
- Preserve original answers and marking evidence. Corrections must be versioned, attributed, reasoned and auditable; no silent overwrites.
- Only explicitly validated objective response types may be auto-scored. Open responses require the defined human review process and rubric.
- Generate criteria and mark allocations from verified curriculum/assessment sources; explain how each mark was earned. Marking rules must state partial-credit and acceptable-answer rules where applicable.
- Restrict draft/final examination papers, answer keys and examiner notes by country, organization, role and release time. Prevent unauthorized cross-country access, test it server-side, and keep sealed material out of public static assets and unprotected offline caches.
- Do not label mock, generated or draft papers as official examination papers.

## 7. Learner safety, privacy and accessibility

- Minimize personal data; define purpose, lawful basis/consent where applicable, retention, access, export, correction and deletion workflows per jurisdiction.
- Do not collect government IDs, precise location, biometrics, health or other sensitive data by default unless a verified lawful, necessary and approved use requires it.
- Use synthetic test data. Restrict production access and child-safeguarding incident details to authorized personnel; follow an approved escalation process.
- Provide keyboard, screen-reader, audio, captions/text alternatives, readable layout, reduced-motion and low-bandwidth/offline support where feasible. Do not penalize disability-related barriers unrelated to the assessed skill.
- Do not infer diagnoses or make unsupported claims about a learner's health, ability or safety.
- Keep audit trails access-controlled, tamper-evident where feasible, time-stamped and free of secrets or unnecessary child-sensitive details.

## 8. Data integrity, offline operation and recovery

- Define conflict resolution and idempotency for offline sync; detect duplicate, stale, partial and out-of-order writes without silently discarding learner work.
- Encrypt sensitive data in transit and at rest where supported; protect local caches, shared-device sessions and sign-out behavior.
- Maintain backups according to documented retention and recovery objectives. Test restoration, not only backup creation.
- Preserve last-known-good releases, migrations and rollback instructions. Never roll back by deleting newer valid learner records.
- Make service degradation explicit, preserve local learning where safe, and show which information is stale or awaiting synchronization.
- Test low storage, expired sessions, interrupted connectivity, device restart, clock/time-zone differences and vendor/API outages.

## 9. AI quality, fairness and transparency

- Distinguish AI-drafted material from verified/approved content. Record sources, model/tool version where available, review status and changes.
- Test factual accuracy, answer keys, translation fidelity, bias, accessibility, age appropriateness and alignment to the learning objective.
- Provide understandable reasons for marks, flags and recommendations; allow authorized correction and appeal.
- Never let generated content silently become official policy, a national curriculum requirement or a high-stakes result without the applicable validation and approval.
- Offer a safe fallback when confidence or evidence is insufficient; preserve progress and explain the limitation.

## 10. Change control, evidence and release

Every material change must record the request/requirement ID, rationale, affected files and protected behaviors, branch/commit/PR, test evidence, risks, reviewer/approval, deployment state, recovery point and unresolved issues.

Required lifecycle:
1. Establish baseline and check for an existing solution.
2. Make the smallest appropriate scoped change in a branch.
3. Run targeted tests, preservation checks, security checks and relevant cross-device/browser checks.
4. Review the exact commit and all required checks.
5. Merge only under repository rules and required approvals.
6. Deploy only through the approved release workflow.
7. Verify the deployed target and monitor; separately record physical-device testing when performed.
8. Close the task only with evidence; otherwise retain it as unresolved.

If a required test, audit, reviewer or evidence is missing, fail closed for the affected high-risk capability. Do not claim fixed, secure, compliant, deployed or production-ready without supporting evidence.

## 11. Incident management and owner communication

For every significant issue, record severity, confidence, affected service/users, evidence, containment performed, owner notification, options and risks, approved action, responsible party, verification and lessons learned. Distinguish suspected from confirmed incidents. Preserve evidence and follow applicable notification deadlines after qualified review. Do not expose incident details to unauthorized users.

## 12. Acceptance tests required before declaring enforcement

- Protected files and existing registration/navigation/workspace/sign-out/voice journeys remain present and functional.
- Unauthenticated and unauthorized requests to protected APIs are denied server-side.
- Cross-country learner records and restricted examination papers are inaccessible to unauthorized roles.
- Wrong student/activity/assessment/rubric IDs and mismatched comments/evidence block approval.
- Original submissions and marks remain traceable after correction.
- Offline retries do not duplicate or silently lose assessment records.
- Alerts reach the configured recipient during a test; unacknowledged critical alerts escalate.
- Backup restoration and rollback are exercised and recorded.
- Secret scanning, dependency checks, accessibility checks and relevant regression tests pass.
- Country/language/source mappings remain clearly marked verified, draft or pending; no unsupported official-approval claims appear.
- Production eligibility remains blocked until all applicable legal, security, privacy, safeguarding, curriculum, accessibility, independent-review and owner-release gates have evidence.

## 13. Relationship to existing controls

This charter consolidates and points to existing repository controls; it does not replace them:
- `PACIFIC_GUARDIAN_MANDATORY_CHANGE_TRACEABILITY_POLICY.md`
- `PACIFIC_GUARDIAN_AUTOMATED_STAGE_WRITE_POLICY.md`
- `STAGE_31_CONTINUOUS_SECURITY_PRIVACY_SAFEGUARDING_MONITORING_SPEC.md`
- `STAGE_32_CURRICULUM_ACCESSIBILITY_PRODUCT_QUALITY_REGRESSION_SPEC.md`
- `STAGE_35_OWNER_GOVERNANCE_CHANGE_SUCCESSION_CONTROL_SPEC.md`
- `.github/pacedu-protected-features.json` and the Feature Preservation Gate
- the applicable authentication, hosting, privacy, curriculum, pilot and production release gates.

Existing stage specifications retain their detailed requirements and evidence. Do not create duplicate stages where an existing stage already covers the need; route work to the applicable control.

## 14. Status and authority

This charter is a mandatory design/build requirement once merged and enforced by the repository's configured gates. It is not evidence that continuous monitoring, production security, legal compliance, national approval or 24/7 service has already been deployed. Implementation and verification status must be tracked separately. The owner retains control of production release and can require review for high-impact changes.
