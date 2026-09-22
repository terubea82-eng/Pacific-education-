# Pacific Education — Stage 20 Production Backend & Data Architecture

## Status

**Stage 20 architecture contract: DEFINED — implementation and independent verification still required.**

This document defines the production boundary for the Pacific Education backend. It does not claim that a production backend, database, authentication service, hosting environment, or payment verification service already exists.

## 1. Production boundary

The browser/PWA and GitHub Pages prototype are untrusted clients.

Production authority must reside on server-side services. Client-side localStorage, JavaScript flags, cached state, and prototype authorization must never be accepted as proof of identity, role, relationship, permission, marks, payment, or production approval.

## 2. Core production services

A production deployment should provide separate server-side components for:

- Authentication and session management
- Authorization and relationship enforcement
- Education data API
- Curriculum/reference service
- Learning and lesson-progress service
- Assessment and marks service
- Teacher/parent/student relationship service
- Offline synchronization service
- Audit/event logging
- Payment verification
- Administrative/owner control
- Monitoring, alerting and operational health

Services must communicate over authenticated, encrypted connections and apply least-privilege access.

## 3. Minimum production data domains

### Accounts
- account_id
- role
- status
- created_at
- updated_at

### Profiles
- profile_id
- account_id
- country/jurisdiction
- display_name or approved profile fields
- created_at
- updated_at

### Education relationships
- relationship_id
- subject_account_id
- related_account_id
- relationship_type
- verification_status
- verified_at
- verified_by
- created_at
- revoked_at

A relationship record never grants access by itself. Authorization must evaluate the authenticated account, role, relationship, requested resource and current permission.

### Student learning
- student_id
- lesson_id
- progress state
- completion evidence
- timestamps
- synchronization/version metadata

### Assessments and marks
- assessment_id
- student_id
- assessment type
- score/result
- assessment status
- verified_by
- timestamps

Marks must be immutable by default. Corrections require an authorized workflow, reason, actor identity and audit record.

### Curriculum references
- curriculum_reference_id
- jurisdiction
- year/form
- subject
- official source identifier
- source version/date
- verification status
- alignment evidence

### Audit events
- audit_event_id
- actor/account identifier
- action
- resource type/id
- outcome
- timestamp
- request/correlation identifier
- security-relevant metadata

Do not place unnecessary child personal information into logs.

## 4. Server-side authorization

Every protected API operation must evaluate:

1. Authenticated identity
2. Account status
3. Role
4. Verified relationship, where required
5. Resource ownership/scope
6. Requested permission
7. Jurisdiction/school constraints where applicable
8. Data-minimization rules

The API must deny by default when any required authorization input is missing or invalid.

## 5. Offline synchronization

Offline clients may queue permitted operations locally.

On reconnect:

1. Authenticate the client.
2. Validate the session.
3. Validate each queued operation server-side.
4. Apply idempotency protection.
5. Reject unauthorized or stale operations.
6. Return authoritative server state.
7. Record security/audit events.
8. Never treat a client-side "success" flag as authoritative.

Conflict handling must be explicit for learning progress, assessments and marks.

## 6. Backup and recovery

Production data requires:

- Automated backups
- Encrypted backup storage
- Defined retention
- Restore testing
- Recovery objectives
- Restricted backup access
- Documented disaster-recovery procedures

A backup that has never been restored/tested must not be treated as verified recovery capability.

## 7. Fail-closed behavior

If the production API, authentication service, authorization service or required verification service is unavailable:

- Do not grant new protected access.
- Do not convert client claims into authoritative records.
- Do not accept client-side payment confirmation as proof of payment.
- Preserve only explicitly permitted offline work.
- Reconcile against authoritative server state after recovery.

## 8. Security and privacy boundary

Production implementation requires security testing and appropriate independent review before approval.

The implementation must also establish:

- Data minimization
- Encryption in transit and at rest where appropriate
- Secret management outside source control
- Access logging and monitoring
- Rate limiting and abuse protection
- Secure error handling
- Dependency and vulnerability management
- Child-safeguarding operational controls
- Privacy/data-governance controls
- Backup and recovery testing

## 9. Required Stage 20 evidence

Stage 20 should not be marked implementation-complete until there is evidence for:

- Production database provisioned and access-controlled
- API deployed in a production-like environment
- Server-side authorization tests passing
- Relationship authorization tests passing
- Learning/assessment/marks persistence tests passing
- Offline synchronization and conflict tests passing
- Backup restore test passing
- Audit logging verified
- Fail-closed outage tests passing
- Security/privacy review completed or formally tracked as an external prerequisite

## 10. Release gate

**Stage 20 does not authorize production release.**

The existing production gate remains fail-closed until all required production controls and authorized/independent reviews are completed.
