# Pacific Education — Stage 20.6 Failure Behavior, Audit Verification and Operational Resilience Specification

**Status:** SPECIFICATION PREPARED — implementation and independent verification required.  
**Stage:** 20.6  
**Production approval:** NOT GRANTED.

## 1. Purpose

Define fail-closed behavior, audit verification, service-dependency failure handling, operational resilience, monitoring, incident escalation and recovery verification for the production backend.

The system must fail safely rather than silently granting access, accepting unverified results, losing authoritative records or presenting local client state as confirmed production state.

## 2. Core failure principle

When an authoritative dependency cannot safely verify a request, Pacific Education must not assume success.

For security-sensitive or authority-sensitive operations:

**Unable to verify → deny, defer or require controlled recovery.**

The system must never convert an outage into implicit authorization.

## 3. Authoritative dependencies

Identify and monitor dependencies including:

- authentication/session service;
- authorization service;
- education relationship service;
- production database;
- curriculum/reference service where required;
- learning/progress API;
- assessment/result service;
- offline synchronization service;
- payment verification service;
- audit/event service;
- notification/communication service where applicable;
- monitoring and incident-management services.

Each dependency must have a documented failure behavior.

## 4. Failure classification

Classify failures as:

- **TRANSIENT** — retry may succeed;
- **DEGRADED** — service remains available with restricted functionality;
- **UNAVAILABLE** — authoritative service cannot safely respond;
- **INTEGRITY_RISK** — data correctness is uncertain;
- **SECURITY_RISK** — unauthorized or malicious activity may be occurring;
- **RECOVERY_REQUIRED** — controlled restoration or operator intervention is required.

Do not automatically classify a failure as harmless merely because the application remains reachable.

## 5. Authentication failure behavior

If authentication cannot be verified:

- do not grant protected access;
- do not treat an old client token as permanently valid;
- do not expose protected learner records;
- preserve only safe local work where appropriate;
- provide a clear retry/recovery message;
- log the event according to the approved audit policy.

## 6. Authorization failure behavior

If authorization cannot be verified:

- deny the protected operation;
- do not fall back to client-side role flags;
- do not use cached permissions as authoritative indefinitely;
- do not expose another user's records;
- record the material authorization failure where appropriate.

## 7. Relationship-service failure

If a student, teacher, parent/guardian or organizational relationship cannot be verified:

- do not create or extend access based solely on previous client state;
- deny or defer relationship-dependent access;
- preserve only permitted non-sensitive local work;
- retry when the authoritative service is available;
- record the resulting state.

## 8. Database failure

If the production database is unavailable or integrity is uncertain:

- reject operations requiring authoritative persistence;
- do not report successful permanent saving;
- do not create marks or completion records in an unverified state;
- preserve safe retry information where permitted;
- alert the responsible operator;
- initiate recovery procedures when required.

## 9. Partial transaction protection

Operations requiring multiple related changes must use transactions or an equivalent atomic mechanism.

Examples:

- assessment submission + authoritative result;
- relationship change + authorization state;
- accepted synchronization operation + progress update;
- result correction + audit event.

If the transaction cannot complete safely, the system must not report it as fully completed.

## 10. Offline failure behavior

When offline:

Allowed:
- permitted local lesson activity;
- safe local progress queueing;
- non-sensitive temporary state.

Not automatically authoritative:
- final marks;
- production entitlements;
- relationship verification;
- permanent account changes;
- legal/owner approvals;
- production release decisions.

When synchronization fails, the user must see a truthful state such as:

- Waiting to sync;
- Sync failed — retry available;
- Conflict detected;
- Review required.

## 11. Retry policy

Retries must be:

- bounded;
- controlled;
- idempotent where possible;
- protected against retry storms;
- observable;
- safe after partial completion.

Do not repeatedly submit sensitive operations without an idempotency mechanism.

## 12. Idempotency and duplicate protection

Every operation requiring duplicate protection must have a unique operation or request identifier.

Repeated requests must not:

- create duplicate assessment attempts;
- duplicate marks;
- duplicate payments;
- duplicate relationship records;
- duplicate progress events.

The server must return the authoritative outcome of an already-processed operation when appropriate.

## 13. Timeout behavior

Timeout does not mean failure of the underlying operation is certain.

After a timeout:

- do not blindly repeat a non-idempotent operation;
- check authoritative operation status where supported;
- use the operation identifier;
- report an uncertain/pending state when necessary;
- reconcile before allowing another equivalent operation.

## 14. Audit architecture

Audit records must capture material security, governance and data-integrity events.

Recommended fields:

- audit_event_id;
- event_type;
- actor/account reference;
- role at event time where appropriate;
- resource type/reference;
- action;
- result;
- timestamp;
- request/operation reference;
- source/service;
- reason where required;
- correlation ID;
- previous/new state references where appropriate.

Avoid storing unnecessary sensitive payloads.

## 15. Audit integrity

Audit records must be protected against unauthorized alteration.

Production design should provide:

- restricted write permissions;
- restricted read permissions;
- controlled retention;
- reliable timestamps;
- correlation identifiers;
- monitoring;
- integrity verification where supported.

The audit service must not become a mechanism for exposing private learner information.

## 16. Mandatory audit events

At minimum evaluate recording of:

- authentication security events;
- authorization denials;
- relationship creation/change/revocation;
- learner access changes;
- lesson completion;
- assessment submission;
- authoritative result creation;
- result correction;
- offline synchronization;
- synchronization conflicts;
- administrative changes;
- production configuration changes;
- payment verification events;
- security incidents;
- recovery operations;
- migration execution.

## 17. Audit verification

Verification must demonstrate that:

1. the event was generated;
2. required fields were recorded;
3. the correct actor/resource context was captured;
4. unauthorized users cannot alter protected audit data;
5. sensitive payloads are minimized;
6. timestamps/correlation references are usable;
7. events remain retrievable according to retention requirements.

## 18. Monitoring

Monitor at minimum:

- authentication failures;
- authorization failure rates;
- API errors;
- database errors;
- synchronization failures;
- assessment submission failures;
- backup failures;
- recovery events;
- migration failures;
- unusual administrative activity;
- security alerts;
- service availability;
- queue growth;
- storage/capacity thresholds.

Monitoring thresholds must be configured and tested rather than merely documented.

## 19. Incident severity

Define operational severity according to actual risk.

Suggested internal levels:

- **P1 — Critical:** material security, privacy, integrity or major service impact;
- **P2 — High:** significant service or data-risk impact;
- **P3 — Moderate:** limited impact with workaround;
- **P4 — Low:** minor defect or operational issue.

These are operational labels, not legal classifications.

## 20. Incident response

For a material incident:

1. detect;
2. preserve relevant evidence;
3. contain;
4. assess scope;
5. protect affected users;
6. restore safe operation;
7. investigate root cause;
8. document decisions;
9. complete required notifications through the authorized process where applicable;
10. implement corrective action;
11. verify closure.

Applicable notification duties must be determined by the authorized privacy/legal/security reviewers and current requirements.

## 21. Safeguarding-related failure

If a failure could expose a child or otherwise create a safeguarding concern:

- restrict affected access where necessary;
- preserve evidence;
- prevent further unauthorized communication or disclosure;
- escalate through the approved safeguarding process;
- do not rely solely on automated classification;
- document the response.

The technical system must not independently make legal or safeguarding determinations.

## 22. Payment-related failure

If payment verification is unavailable:

- do not treat a client-side payment status as proof;
- do not create permanent entitlement solely from local state;
- place the transaction into a controlled pending/reconciliation state where appropriate;
- prevent duplicate charging/entitlement where possible;
- preserve transaction references;
- escalate unresolved discrepancies.

## 23. Recovery verification

After recovery, verify:

- authentication;
- authorization;
- education relationships;
- learning data;
- assessment data;
- marks/results;
- audit records;
- offline synchronization;
- backups;
- monitoring;
- security controls.

Do not return the affected function to normal operation merely because the server responds to a health check.

## 24. Operational health states

The application should support clear internal states such as:

- HEALTHY;
- DEGRADED;
- AUTHENTICATION_UNAVAILABLE;
- AUTHORIZATION_UNAVAILABLE;
- DATABASE_UNAVAILABLE;
- SYNC_DEGRADED;
- RECOVERY_IN_PROGRESS;
- SECURITY_REVIEW_REQUIRED;
- SERVICE_RESTORED_PENDING_VERIFICATION.

The exact public wording may be simplified for users.

## 25. Health checks

Separate:

- **liveness:** service process is running;
- **readiness:** service can safely accept intended traffic;
- **dependency health:** required authoritative dependencies are functioning;
- **integrity health:** critical data checks are passing.

A process being alive must not automatically mean that it is safe to serve protected operations.

## 26. Operational runbooks

Create controlled runbooks for:

- authentication outage;
- authorization outage;
- database outage;
- synchronization outage;
- backup failure;
- restore;
- migration failure;
- suspected data corruption;
- suspected account compromise;
- security incident;
- privacy incident;
- safeguarding concern;
- payment reconciliation failure.

Each runbook requires an owner, version, review date and escalation path.

## 27. Change management

Operational resilience controls must be updated when:

- infrastructure changes;
- APIs change;
- database schema changes;
- authentication changes;
- payment provider changes;
- privacy requirements change;
- safeguarding requirements change;
- curriculum-related data structures change;
- monitoring thresholds change.

Material changes require impact assessment and appropriate review.

## 28. Required Stage 20.6 test matrix

At minimum test:

1. authentication service unavailable;
2. authorization service unavailable;
3. relationship service unavailable;
4. database unavailable;
5. database integrity uncertainty;
6. API timeout;
7. duplicate request;
8. timeout after server-side processing;
9. offline sync failure;
10. stale authorization;
11. revoked relationship during sync;
12. assessment submission failure;
13. partial transaction failure;
14. audit event creation;
15. unauthorized audit alteration;
16. backup/recovery event logging;
17. migration failure;
18. security incident escalation;
19. safeguarding-risk escalation;
20. payment-verification outage;
21. monitoring alert generation;
22. recovery and readiness verification.

Expected result: the system fails safely, does not fabricate authority, preserves recoverable work where appropriate and records required events.

## 29. Evidence requirements

Stage 20.6 evidence must include:

- tested failure scenarios;
- fail-closed authorization behavior;
- offline failure behavior;
- idempotency evidence;
- transaction integrity evidence;
- audit generation and protection evidence;
- monitoring/alert evidence;
- incident runbooks;
- recovery verification evidence;
- independent technical verification.

Each evidence record must identify the test/environment, date, verifier and safe reference.

## 30. Automatic transition

When all mandatory Stage 20.6 evidence is independently verified and the required review is approved, Guardian may automatically prepare the Stage 20.7 verification package and update the controlled evidence index.

Guardian must not:

- declare legal compliance;
- declare production readiness;
- approve security or privacy sufficiency;
- approve Ministry requirements;
- authorize production release;
- bypass specialist or owner review.

## 31. Completion rule

Stage 20.6 remains **INCOMPLETE** until implementation, testing, evidence and required verification are actually completed.

Documentation, a passing prototype test or a healthy development environment does not constitute production verification.

## 32. Release boundary

Stage 20.6 completion does not authorize production launch.

Stage 20.7 independent technical verification and all broader production, security, privacy, safeguarding, curriculum, payment, professional/legal and owner-approval gates remain mandatory.

**Current status: PREPARED — practical implementation required.**