# Pacific Education — Stage 20.2 Production Database Schema Specification

**Stage:** 20.2 — Production Data Model  
**Status:** SPECIFICATION PREPARED — implementation and verification required  
**Control:** FAIL-CLOSED  
**Production approval:** NOT GRANTED

## 1. Purpose

Define the production database domains, relationships, integrity rules and migration requirements needed by Pacific Education. This is a logical schema specification, not a database deployment.

## 2. Core design

Use a relational production database or an equivalently controlled data store that supports:

- unique identifiers
- relationships and integrity constraints
- transactions
- controlled migrations
- backups/restoration
- access control
- auditability

The application server is the only normal application path to the production database.

## 3. Logical domains

### A. Accounts

Conceptual record:

- account_id — unique identifier
- auth_provider_id — external authentication reference
- status
- created_at
- updated_at

Authentication secrets remain under the approved authentication system.

### B. Roles

Conceptual record:

- role_id
- account_id
- role
- status
- assigned_at
- revoked_at

Roles do not independently establish relationships or unrestricted access.

### C. Profiles

Conceptual record:

- profile_id
- account_id
- minimum required profile attributes
- status
- timestamps

Data collection must be minimized.

### D. Education relationships

Conceptual record:

- relationship_id
- subject account/profile reference
- related account/profile reference
- relationship type
- scope
- verification status
- verification source/reference
- effective dates
- timestamps

Examples include learner–teacher, learner–parent/guardian and learner–class relationships.

### E. Organizations/classes

Conceptual records:

- organization/school
- class/group
- class membership
- teacher assignment
- effective dates

Access must be limited to the authorized scope.

### F. Curriculum references

Conceptual record:

- curriculum_reference_id
- issuing authority/source
- document/version
- subject
- level/class
- term
- achievement indicator/reference
- source date/version metadata
- internal mapping status
- verification status

Official sources must remain distinguishable from Pacific Education internal mappings.

### G. Lessons and learning progress

Conceptual records:

- lesson/activity
- curriculum linkage
- learner progress
- completion state
- completion timestamp
- synchronization/version metadata

Progress records must be authorized and idempotent.

### H. Assessments

Separate:

1. assessment definition
2. assessment items
3. learner attempts
4. responses
5. authoritative results
6. review/audit history

The client must never directly establish an authoritative mark.

### I. Audit events

Conceptual fields:

- audit_event_id
- event type
- actor/account reference where applicable
- affected resource reference
- action/result
- timestamp
- correlation/request reference
- non-sensitive metadata

Audit records must be protected from ordinary user modification.

### J. Offline synchronization

Conceptual record:

- operation_id
- authenticated account reference
- operation type
- resource reference
- client-created timestamp
- server-received timestamp
- operation version
- processing status
- rejection/conflict reason where applicable

Do not store unnecessary sensitive payloads.

## 4. Relationship rules

Minimum integrity rules:

- every role belongs to an existing account
- every relationship references valid parties
- class membership references valid learners/classes
- teacher assignments reference valid teachers/classes
- learning records reference valid learners/activities
- assessment attempts reference valid assessments and learners
- results reference valid attempts
- curriculum mappings reference versioned curriculum references
- audit records reference valid resources where applicable
- synchronization operations have unique operation identifiers

## 5. Authorization data boundary

Database relationships are data; they are not authorization by themselves.

The server authorization layer must evaluate:

identity → account status → role → verified relationship → resource scope → permission → policy → decision

A database query must not be exposed directly to clients.

## 6. Data integrity

Critical operations should use transactions where multiple records must change together.

Examples:

- assessment submission and authoritative result creation
- relationship activation/revocation
- class membership changes
- migration operations
- synchronization acceptance

Uniqueness and foreign-key constraints should prevent duplicate or orphaned authoritative records.

## 7. Versioning and migrations

Every production schema change must have:

- migration identifier
- version
- reason
- affected domains
- test result
- review status
- deployment record
- rollback/recovery consideration

Migrations must first be tested in development and staging.

## 8. Data minimization

Do not create fields merely because they might be useful later.

For each personal-data field record:

- purpose
- necessity
- authorized access
- retention requirement
- deletion/anonymization approach where applicable

Sensitive data should be separated and access-controlled where appropriate.

## 9. Test database

Before any real production data:

- create synthetic test accounts
- create synthetic teacher/student/guardian relationships
- create synthetic lessons and assessments
- test marks and progress
- test unauthorized access
- test deletion/revocation scenarios
- test synchronization
- test migrations
- test backup restoration

Do not use real children's personal information for ordinary development testing.

## 10. Required schema verification

Stage 20.2 evidence must demonstrate:

1. all required domains exist;
2. identifiers and relationships work;
3. integrity constraints work;
4. authorization boundaries can be enforced;
5. migrations are repeatable;
6. test data passes expected workflows;
7. unauthorized access is denied;
8. audit events are recorded where required;
9. backup/recovery works with the implemented schema.

## 11. Completion boundary

Stage 20.2 remains incomplete until the schema is actually implemented and the required evidence is independently verified.

Completion of the schema does not authorize production launch.

**Current status: PREPARED — implementation required.**
