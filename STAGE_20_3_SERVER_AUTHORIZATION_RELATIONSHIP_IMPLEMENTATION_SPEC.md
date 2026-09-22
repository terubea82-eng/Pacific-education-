# Pacific Education — Stage 20.3 Server-Side Authorization and Relationship Implementation Specification

**Stage:** 20.3 — Authorization and Education Relationships  
**Status:** SPECIFICATION PREPARED — implementation and independent verification required  
**Control:** FAIL-CLOSED  
**Production approval:** NOT GRANTED

## 1. Purpose

Define how production authorization must enforce identity, role, verified education relationships, resource scope and permissions on the server.

This document is an implementation specification, not evidence of completed security controls.

## 2. Non-negotiable security boundary

The browser, GitHub Pages prototype, JavaScript, localStorage, URL parameters, hidden fields and client-side flags are untrusted.

They must never be authoritative for:

- identity
- authentication
- role
- relationship verification
- permissions
- assessment marks
- payment status
- production approval

Every protected production request must be evaluated server-side.

## 3. Authorization decision chain

For every protected request:

**Authenticated identity → account status → role → verified relationship → resource scope → requested action → policy → allow/deny**

If any required condition is missing, ambiguous, expired or invalid, deny access.

## 4. Account and session controls

Production authentication must provide:

- unique account identity
- secure session/token handling
- account status checks
- session expiry and revocation
- rate limiting where appropriate
- protection against replay and unauthorized token use
- secure error responses
- server-side authorization on every protected operation

Authentication credentials and secrets must remain outside source code.

## 5. Role model

Supported role categories may include:

- student/learner
- teacher
- parent/guardian
- ministry/authorized education authority
- owner/authorized administrator

A role alone does not grant access to another person's education information.

Role assignment, change and revocation must be auditable.

## 6. Verified relationship model

A relationship must have:

- relationship identifier
- parties
- relationship type
- scope
- verification status
- verification source/reference
- effective date
- expiry/revocation where applicable
- audit history

Possible relationship types include:

- learner → teacher
- learner → parent/guardian
- learner → class
- teacher → class
- authorized authority → approved education scope

A relationship must not be considered verified merely because a client submits matching names, IDs or URL parameters.

## 7. Permission model

Permissions should be action-specific and resource-scoped.

Examples:

- view own learning progress
- submit permitted learning activity
- view assigned learner progress
- record authorized assessment results
- view authorized class information
- communicate within an authorized relationship
- administer approved organization scope

Use least privilege.

Deny by default.

## 8. Resource ownership and scope

Before returning or changing a resource, the server must establish:

1. authenticated account;
2. active account status;
3. role;
4. verified relationship, when required;
5. resource ownership or authorized scope;
6. requested action;
7. applicable policy restrictions.

Never authorize solely from a resource ID supplied by the client.

## 9. Student/learner protections

Learner information requires additional access controls.

A teacher must only access learners within the teacher's verified authorized scope.

A parent/guardian must only access information for the learner(s) for whom the relationship has been verified and remains active.

A learner should normally access only their own authorized information.

Special or sensitive information must require additional authorization where applicable.

## 10. Assessment and marks

The client may submit an assessment response, but cannot declare an authoritative mark.

The server must:

- authenticate the submitter;
- verify assessment availability;
- verify learner/resource scope;
- validate the submission;
- apply the approved assessment rules;
- create an authoritative result;
- record relevant audit information;
- prevent unauthorized modification.

Changes to authoritative results require controlled authorization and audit history.

## 11. Communication boundary

Education Link Bridge principles remain enforced:

**Identity → Role → Verified Relationship → Authorization → Permission → Communication**

Relationship availability never means information access.

Communication endpoints must independently verify authorization before exposing or accepting education-related information.

## 12. Revocation and change handling

When a relationship, role or account is revoked:

- new unauthorized requests must be denied;
- active permissions must be re-evaluated;
- cached authorization decisions must not outlive their approved validity;
- affected operations must be auditable;
- historical records must remain protected.

## 13. Offline synchronization

Every queued operation must be re-authorized when received by the server.

The server must:

- authenticate the submitting account;
- validate operation identity/idempotency;
- check current permission;
- validate resource scope;
- reject unauthorized or stale operations;
- detect conflicts;
- return authoritative server state;
- record relevant audit events.

A previously authorized offline operation does not automatically remain authorized forever.

## 14. API requirements

Protected endpoints must:

- require authentication where applicable;
- perform server-side authorization;
- validate input;
- enforce resource scope;
- avoid excessive data return;
- use safe error messages;
- rate-limit sensitive operations where appropriate;
- produce appropriate audit events.

Never create an endpoint that allows a client to bypass authorization by changing an ID or role parameter.

## 15. Required security tests

At minimum test:

- unauthenticated access;
- wrong-role access;
- unverified relationship;
- expired relationship;
- revoked relationship;
- cross-student access;
- cross-teacher/class access;
- unauthorized assessment changes;
- unauthorized communication;
- altered client role;
- altered resource ID;
- replayed operation;
- duplicate offline operation;
- stale offline operation;
- revoked access after offline authorization;
- API/database outage;
- malformed authorization input.

Expected result for unauthorized cases: **DENY**.

## 16. Evidence required for Stage 20.3

Evidence must include:

- implemented server-side authorization controls;
- role and relationship test results;
- resource-scope test results;
- assessment/marks authorization tests;
- communication authorization tests;
- offline authorization/conflict tests;
- revocation tests;
- audit verification;
- independent technical/security review;
- identified defects and their resolution status.

Evidence must identify reviewer, date/time and safe non-secret references.

Do not place passwords, tokens, private keys, production credentials or real children's sensitive data in repository evidence.

## 17. Completion rule

Stage 20.3 remains **INCOMPLETE** until implementation is operational in an approved test/production-like environment and required evidence is independently verified.

The Guardian may prepare review documentation or a controlled pull request according to the automated stage-write policy, but cannot independently declare the security control complete.

## 18. Transition to legal/professional procedure

When practical implementation evidence is verified, the system may automatically prepare the next review package.

That package must route relevant matters to the appropriate authorized professional/reviewer for privacy, child safeguarding, education-sector, contractual, regulatory or other applicable review.

Automatic documentation preparation is not legal approval or a declaration of compliance.

## 19. Ownership and release boundary

Pacific Education remains owner-controlled.

Completion of Stage 20.3 does not:

- transfer ownership;
- grant partner control;
- establish legal compliance;
- establish Ministry approval;
- authorize production launch;
- authorize payment activation;
- override Stage 29 or Stage 30 controls.

**Current status: PREPARED — practical implementation required.**
