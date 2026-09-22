# Pacific Education — Stage 20 Production Database and API Implementation Specification

**Stage:** 20 — Production Backend Data Architecture  
**Status:** IMPLEMENTATION SPECIFICATION — practical implementation and independent verification required  
**Control state:** FAIL-CLOSED  
**Production approval:** NOT GRANTED  
**Owner control:** Pacific Education remains owner-controlled property.

## 1. Purpose

This specification converts the Stage 20 architecture contract into an actionable technical implementation plan. It defines the minimum production backend boundaries, data domains, APIs, synchronization behavior, auditability, backup/recovery, testing, evidence and review requirements.

This is a technical implementation specification. It is not legal advice, legal approval, Ministry approval, cybersecurity certification, production authorization, or proof of compliance with any law, regulation, curriculum authority or contractual requirement.

## 2. Non-negotiable architecture principles

1. The browser/mobile client is untrusted.
2. GitHub Pages, client JavaScript, localStorage, cached state, URL parameters, hidden fields and prototype flags are never production security boundaries.
3. Production identity, roles, relationships, permissions, learning records, assessment/marks, payment status and production approval are server-authoritative.
4. Authorization is deny-by-default.
5. Sensitive operations require server-side authorization on every request.
6. Offline operation may queue requests locally, but the server remains authoritative.
7. Client success is not proof of server acceptance.
8. Production secrets, credentials, signing keys and payment credentials must remain outside source code and repository history.
9. Personal/child data must not be used in prototype testing unless a separately approved process permits it.
10. Stage 20 completion does not authorize production launch.

## 3. Target production architecture

Client (web/mobile) → TLS → API gateway/reverse proxy → application services → production database

Supporting services:

- Authentication/session service
- Authorization and relationship service
- Education/learning service
- Curriculum reference service
- Assessment/marks service
- Offline synchronization service
- Audit/event logging
- Payment verification service
- Monitoring/health service
- Backup/recovery system
- Owner/admin control plane

Services must communicate through authenticated, least-privilege interfaces. No client component receives direct database credentials.

## 4. Core data domains

### 4.1 Accounts

Minimum conceptual fields:

- account identifier
- authentication-provider identifier
- account status
- role assignments
- created/updated timestamps
- security/audit references

Authentication secrets are handled by the approved authentication system and are not stored in ordinary application records unless the chosen architecture explicitly requires secure, professionally reviewed handling.

### 4.2 Profiles

Separate identity/profile information from authorization.

Possible fields include:

- profile identifier
- account identifier
- display name
- required non-sensitive profile attributes
- status
- timestamps

Collect only data required for the service.

### 4.3 Education relationships

Represent relationships explicitly rather than assuming them from role names.

Examples:

- student ↔ teacher
- student ↔ parent/guardian
- student ↔ class/school
- teacher ↔ class
- authorized administrator ↔ organization

Relationship records require status, scope, source/verification information and timestamps.

A relationship existing in the database does not by itself grant unrestricted access.

### 4.4 Curriculum references

Store:

- source identifier
- issuing authority/source
- document/version identifier
- effective/reference date where known
- subject/level/term
- achievement indicator/reference
- internal mapping status
- verification status

Official curriculum claims must remain distinguishable from Pacific Education internal mappings.

### 4.5 Learning and progress

Store:

- learner identifier
- curriculum reference
- lesson/activity identifier
- progress state
- completion evidence
- timestamps
- synchronization/version metadata

Progress updates must be idempotent and authorized.

### 4.6 Assessments and marks

Separate assessment definitions, attempts and authoritative results.

Minimum conceptual domains:

- assessment
- assessment item/question
- learner attempt
- response
- result/mark
- reviewer/teacher record
- audit history

The client must never be trusted to assign an authoritative mark.

### 4.7 Audit events

Record security- and integrity-relevant events such as:

- authentication events
- authorization decisions where required
- relationship changes
- assessment/mark changes
- sensitive record access
- synchronization acceptance/rejection
- administrative changes
- payment verification events
- security/incident events

Audit records must be protected from ordinary user modification.

## 5. Authorization model

For every protected request:

Authenticated identity → account status → role → verified relationship → resource scope → requested permission → policy constraints → ALLOW/DENY

Examples:

- A student may access only their authorized learning scope.
- A teacher may access only learners/classes within an authorized teaching scope.
- A parent/guardian may access only an appropriately verified relationship scope.
- Administrative access must be separately authorized and audited.

Every failure defaults to DENY.

Authorization must be tested independently of the user interface.

## 6. API requirements

Production APIs must:

- use authenticated transport
- validate input server-side
- authenticate every protected request
- authorize every protected resource
- validate resource ownership/scope
- enforce least privilege
- use stable identifiers
- prevent unauthorized object-reference access
- implement rate limiting appropriate to the operation
- return safe errors without secrets or unnecessary personal data
- provide request/correlation identifiers where operationally appropriate
- record required audit events
- support idempotency for retried operations
- reject malformed, stale or unauthorized requests

Sensitive APIs must not rely on a client-provided role, permission, mark, payment state or approval flag.

## 7. Offline synchronization

Offline support must follow:

Local queue → authenticated sync → server validation → authorization → idempotency/conflict check → accept/reject → authoritative response → audit

Required behavior:

- each queued operation has a stable operation identifier
- duplicate submission does not create duplicate authoritative records
- stale/unauthorized operations are rejected safely
- conflicts have explicit resolution rules
- server state is authoritative
- rejected operations are surfaced clearly
- sync results are auditable
- sensitive data stored locally is minimized and protected according to the approved production design

No offline queue may override server authorization.

## 8. Database integrity and migrations

The production database must provide:

- appropriate primary/foreign keys
- uniqueness constraints
- referential integrity
- validation constraints
- transaction boundaries for critical operations
- migration versioning
- rollback/recovery strategy where feasible
- controlled schema-change process
- least-privilege database accounts

Database changes affecting security, privacy, marks, payment, relationships or production operations require the applicable review before release.

## 9. Backup and recovery

Before Stage 20 completion:

- automated backups must be configured
- backup access must be restricted
- backup storage must be appropriately protected
- retention must be defined
- restoration must be tested
- migration/recovery procedures must be tested
- recovery objectives must be documented
- restoration evidence must be recorded

A configured backup that has never been restored/tested is not sufficient evidence of recovery capability.

## 10. Failure and fail-closed behavior

If authentication, authorization, relationship verification, critical database access or other required authority services are unavailable:

- protected operations must fail safely
- no client-side flag may substitute for missing authority
- no unauthorized access may be granted
- the system should provide a safe user-facing status
- the event should be logged where logging remains safely available
- recovery must not silently create conflicting authoritative records

## 11. Security and privacy boundaries

Production implementation must include, as applicable:

- secret management outside source control
- encryption in transit
- appropriate encryption/protection at rest
- access control
- dependency and vulnerability management
- security testing
- monitoring
- incident response
- data minimization
- retention/deletion controls
- child safeguarding controls
- privacy/data governance controls

These matters continue into Stages 21–24 and must not be falsely marked complete merely because Stage 20 infrastructure exists.

## 12. Practical implementation gates

### Gate 20.1 — Production environment

Evidence required:

- approved production or production-like environment exists
- access is restricted
- configuration is documented
- secrets are externalized
- environment separation is demonstrated

### Gate 20.2 — Data model

Evidence required:

- production schema implemented
- relationships and integrity constraints tested
- required data domains implemented
- migration process demonstrated

### Gate 20.3 — Authorization

Evidence required:

- server-side identity/role checks
- relationship authorization tests
- resource-scope tests
- deny-by-default tests
- unauthorized object-reference tests

### Gate 20.4 — Persistence and synchronization

Evidence required:

- learning/progress persistence tests
- assessment/mark persistence tests
- offline queue tests
- duplicate/idempotency tests
- conflict handling tests
- authoritative server-state tests

### Gate 20.5 — Backup/recovery

Evidence required:

- backup execution evidence
- restore test evidence
- migration/recovery evidence
- access-control evidence

### Gate 20.6 — Audit and failure behavior

Evidence required:

- audit logging verification
- authorization failure evidence
- outage/fail-closed evidence
- security-relevant event evidence

### Gate 20.7 — Independent verification

Evidence required:

- independent technical review
- identified defects
- remediation evidence
- final reviewer decision
- reviewer identity and date

## 13. Test matrix

| Area | Required tests |
|---|---|
| Authentication | valid, invalid, expired/revoked session |
| Authorization | allowed and denied role/resource combinations |
| Relationships | verified, unverified, removed and conflicting relationships |
| Data isolation | cross-user and cross-class access attempts |
| Learning | create/update/retry/replay behavior |
| Assessments | authorized submission, unauthorized modification, result integrity |
| Marks | authorized entry/change, unauthorized change, audit history |
| Offline | queue, retry, duplicate, stale, conflict and rejection |
| Database | constraints, transactions and migration |
| Backup | backup and real restore |
| Audit | required events recorded and protected |
| Failure | unavailable auth/API/database/verification services |
| Security | input validation, rate limits and common authorization failures |

Tests must use synthetic/test data until the appropriate production data-governance process is approved.

## 14. Evidence record requirements

Each Stage 20 evidence item must contain:

- exact Stage 20 requirement text
- implementation status
- evidence status
- status: VERIFIED only after actual verification
- verified-by identity/role
- verification date/time
- evidence type
- non-secret reference to supporting evidence
- blocking-defect status
- applicable review status

Documentation alone is not implementation evidence.

No passwords, API keys, tokens, payment credentials or unnecessary child personal data may be placed in evidence records or Git history.

## 15. Stage completion rule

Stage 20 may become COMPLETE only when:

1. all mandatory evidence requirements are verified;
2. required technical review is approved;
3. blocking defects = 0;
4. completion authority is recorded;
5. required evidence mapping is complete;
6. automated validation passes;
7. the change is recorded in the controlled repository workflow.

Otherwise Stage 20 remains INCOMPLETE.

## 16. Transition to later professional/legal procedures

When a practical Stage 20 requirement is genuinely verified, Guardian may prepare the next documentation/evidence/review package according to the approved automation controls.

Guardian must not automatically declare:

- legal compliance
- regulatory compliance
- Ministry approval
- child-safeguarding approval
- privacy approval
- cybersecurity certification
- production readiness
- production release authorization

Those conclusions require the appropriate authorized professional/reviewer and owner decision.

## 17. Ownership and change control

Pacific Education remains owner-controlled. Technical implementation, hosting, vendors, funding or support do not automatically transfer ownership, equity, partnership, control or intellectual-property rights.

Every material production change should record:

- requirement/stage
- reason
- affected components
- evidence
- reviewer
- decision
- deployment status
- rollback/recovery considerations

## 18. Stage 20 deliverables

The practical Stage 20 package should ultimately contain:

1. Production data model/schema
2. Production API specification
3. Authorization model
4. Relationship model
5. Learning/progress persistence
6. Assessment/marks persistence
7. Offline synchronization implementation
8. Audit implementation
9. Backup/recovery implementation
10. Migration controls
11. Test results
12. Independent technical verification
13. Evidence register
14. Approved Stage 20 completion record

## 19. Explicit boundary

This specification prepares the technical work. It does not represent completion of that work.

**Current Stage 20 state: INCOMPLETE — implementation and independent verification required.**

**Current production release state: BLOCKED until all mandatory production gates are independently satisfied and authorized.**
