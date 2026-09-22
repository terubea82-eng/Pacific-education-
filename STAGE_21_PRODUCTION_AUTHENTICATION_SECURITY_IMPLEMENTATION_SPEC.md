# Pacific Education — Stage 21 Production Authentication and Security Implementation Specification

**Status:** SPECIFICATION PREPARED — practical implementation and independent security verification required.  
**Stage:** 21  
**Production approval:** NOT GRANTED.

## 1. Purpose

Define the production authentication, session, account-security and authorization foundations required for Pacific Education.

This specification converts the existing security architecture into implementation requirements while preserving the rule that prototype browser controls are not production security boundaries.

## 2. Security authority boundary

Production identity and access decisions must be server-authoritative.

The following must never independently establish production access:

- localStorage;
- browser JavaScript variables;
- hidden HTML fields;
- URL parameters;
- cached role values;
- client-side approval flags;
- GitHub Pages state;
- prototype authentication;
- client-provided permission fields.

The client requests access; the production server verifies and decides.

## 3. Authentication architecture

Production authentication must provide:

1. unique account identity;
2. secure credential or approved identity-provider authentication;
3. protected sessions/tokens;
4. account status controls;
5. session expiration;
6. revocation;
7. recovery procedures;
8. rate limiting;
9. security-event logging;
10. secure integration with the production authorization service.

The selected authentication provider/technology remains an owner-approved implementation decision.

## 4. Account lifecycle

Use controlled states such as:

- INVITED;
- PENDING_VERIFICATION;
- ACTIVE;
- SUSPENDED;
- LOCKED;
- DISABLED;
- DELETED/DEACTIVATED according to approved retention rules.

Only authorized server-side processes may change protected account state.

Account status changes must be auditable.

## 5. Registration and invitation

Registration must:

- validate required fields;
- minimize personal information;
- prevent duplicate-account confusion;
- verify the intended identity mechanism;
- establish the account only through the approved server workflow.

Education relationships must not be assumed from an email address alone.

Where invitation-based access is used, invitation tokens must be:

- unpredictable;
- time-limited;
- single-use where appropriate;
- server-validated;
- revocable;
- protected from disclosure.

## 6. Credential security

If Pacific Education directly manages passwords, production implementation must use a modern password-hashing mechanism provided by a maintained security library.

Never store:

- plaintext passwords;
- reversible password encryption;
- passwords in logs;
- passwords in analytics;
- passwords in GitHub;
- passwords in client-side storage.

Password policy must balance security with practical accessibility and must follow the requirements of the selected authentication provider and applicable professional/security review.

## 7. Multi-factor authentication

Where required by the production risk assessment or selected identity provider, support an approved multi-factor authentication mechanism.

MFA recovery must be controlled so that recovery does not become an easier route around authentication.

## 8. Session security

Production sessions must have:

- secure issuance;
- expiration;
- revocation;
- appropriate inactivity/absolute lifetime controls;
- protected transport;
- secure cookie/token handling;
- protection against session fixation;
- protection against token leakage.

Do not expose long-lived privileged credentials in browser source or URLs.

## 9. Token handling

If token-based authentication is selected:

- validate issuer;
- validate audience;
- validate signature;
- validate expiration;
- validate relevant claims;
- reject malformed/altered tokens;
- enforce server-side authorization independently of token role claims where required;
- support revocation/session invalidation strategy.

A valid authentication token does not automatically grant every resource permission.

## 10. Authorization relationship

Authentication answers:

**Who is this account?**

Authorization answers:

**What may this account do with this resource in this context?**

Education relationship verification answers:

**What verified relationship exists between the account and the learner/teacher/parent/organization?**

These decisions must remain distinct.

## 11. Production roles

Existing role categories may include:

- student/learner;
- teacher;
- parent/guardian;
- organization/school;
- ministry/authorized education authority where formally applicable;
- support/operator;
- administrator;
- owner-controlled governance role.

Roles must be assigned server-side.

A client cannot promote itself by changing a role field.

## 12. Permission model

Permissions must be explicit.

Examples:

- view own learning;
- update permitted learning activity;
- submit own assessment;
- view authorized learner progress;
- manage assigned class;
- manage verified relationship;
- communicate within permitted scope;
- administer approved organizational resources;
- manage governance records;
- manage production configuration.

High-risk permissions require stronger authorization and review.

## 13. Least privilege

Every account and service should receive only the permissions required for its function.

Administrative access must be separated from ordinary teaching and learning access.

Production database access must not be granted to normal application users.

## 14. Resource-level authorization

For every protected API request verify as applicable:

1. authenticated account;
2. account status;
3. role;
4. verified relationship;
5. resource ownership/scope;
6. requested permission;
7. organization/class scope;
8. jurisdictional constraints where applicable;
9. current resource state.

Deny by default when required information cannot be verified.

## 15. Learner protections

Learner records require strict scope control.

A teacher must only access learners within the authorized teaching scope.

A parent/guardian must only access records connected through a verified relationship and approved permissions.

A learner must not access another learner's records.

Support personnel must not receive broad learner-data access merely because they can technically access the system.

## 16. Parent/guardian relationship

Relationship establishment must be a separate controlled workflow.

Do not infer parental authority from:

- name similarity;
- email address;
- phone number;
- user assertion alone.

The production relationship service must record the verification method, status, scope and revocation state according to approved policy.

## 17. Teacher relationship

Teacher access should be tied to an authorized school/class/teaching relationship where applicable.

Class assignment changes must update effective authorization.

A former teacher's access must not remain active indefinitely after the relationship ends.

## 18. Revocation

Access revocation must be server-authoritative.

When an account, role or relationship is revoked:

- future protected requests must be denied;
- active sessions/tokens must be invalidated according to the chosen architecture;
- offline operations requiring current authorization must be rejected or reviewed;
- material revocation events must be audited.

## 19. API security

Production APIs must implement:

- HTTPS/TLS;
- authentication middleware;
- authorization middleware;
- input validation;
- output filtering;
- rate limiting;
- safe error responses;
- request correlation;
- security logging;
- abuse detection appropriate to risk.

Do not return internal stack traces, secrets or unnecessary personal information to clients.

## 20. Authentication endpoints

Typical endpoint families include:

- /api/auth/register;
- /api/auth/login;
- /api/auth/logout;
- /api/auth/session;
- /api/auth/recovery;
- /api/auth/verify;
- /api/auth/mfa where applicable.

Actual production routes may differ.

Every endpoint must have a defined authentication and abuse-control policy.

## 21. Account recovery

Recovery must verify the account using the approved recovery mechanism.

Recovery must not allow an attacker to:

- bypass MFA without controlled verification;
- reset another user's credentials;
- assume a privileged account;
- establish a false education relationship.

Recovery actions must be rate-limited and audited.

## 22. Brute-force and abuse controls

Protect authentication and recovery endpoints with controls appropriate to risk, such as:

- rate limiting;
- progressive delays;
- abuse detection;
- account lock or challenge mechanisms where appropriate;
- monitoring;
- alerting.

Avoid controls that create unnecessary denial-of-service opportunities.

## 23. Security headers and transport

Production web delivery should use appropriate security headers and secure transport configuration.

At minimum evaluate:

- HTTPS enforcement;
- secure cookie attributes;
- content security policy;
- frame protections;
- MIME-sniffing protection;
- referrer policy;
- permissions policy.

The exact configuration must be verified against the selected hosting architecture.

## 24. Cross-origin and API protection

Production APIs must explicitly control allowed origins.

Do not use unrestricted cross-origin access merely to make the prototype work.

Where cookies or browser credentials are used, configure appropriate CSRF protections.

## 25. Secret management

Production secrets must be stored in an approved secret-management system or protected deployment configuration.

Never commit:

- API secrets;
- database passwords;
- private keys;
- signing keys;
- payment credentials;
- authentication provider secrets.

Rotate credentials when exposure is suspected.

## 26. Administrative access

Privileged accounts require:

- strong authentication;
- least privilege;
- controlled assignment;
- audit logging;
- session controls;
- review;
- revocation;
- emergency-access procedure.

Owner governance authority must not be confused with unrestricted technical access.

## 27. Service accounts

Production service accounts must:

- have unique identities;
- use least privilege;
- avoid interactive login where unnecessary;
- have managed credentials;
- have rotation/revocation;
- be monitored;
- be documented.

## 28. Authentication and authorization audit events

At minimum evaluate recording:

- login success;
- login failure;
- logout;
- session revocation;
- account activation;
- account suspension/lock;
- credential recovery;
- MFA changes;
- role changes;
- relationship creation;
- relationship revocation;
- privileged access;
- authorization denial;
- security configuration changes.

Avoid storing passwords or unnecessary sensitive authentication payloads.

## 29. Privacy and data minimization

Authentication data must be limited to what is necessary.

Do not collect additional identity information simply because the database can store it.

Retention, deletion and access rules must be aligned with the approved privacy/data-governance process.

## 30. Security testing

Required testing should include:

- authentication bypass attempts;
- authorization bypass attempts;
- privilege escalation;
- horizontal access-control testing;
- vertical privilege testing;
- session fixation;
- token tampering;
- expired-token handling;
- revoked-session handling;
- recovery abuse;
- brute-force controls;
- rate-limit testing;
- CSRF testing where applicable;
- CORS testing;
- input-validation testing;
- sensitive-data exposure;
- secret scanning;
- dependency/vulnerability testing.

Testing must be performed in approved environments and must not intentionally disrupt production.

## 31. Failure behavior

If authentication or authorization cannot be safely verified:

- deny protected access;
- do not fall back to client-side permissions;
- do not assume cached authorization remains valid indefinitely;
- preserve safe local work where appropriate;
- report a truthful recoverable state;
- log the material event.

## 32. Required Stage 21 evidence

Evidence must include:

- selected authentication architecture;
- production identity implementation;
- account lifecycle implementation;
- session controls;
- role/permission implementation;
- relationship authorization;
- revocation;
- API security;
- secret-management configuration;
- authentication security tests;
- authorization tests;
- recovery tests;
- security review;
- independent security verification.

Evidence must identify environment, date, verifier and safe reference.

No secrets or unnecessary personal/child data may be included.

## 33. Independent review

Stage 21 requires appropriate independent security verification.

The verifier must record:

- scope;
- environment;
- methods;
- findings;
- limitations;
- unresolved issues;
- retest results;
- final review status.

A passing automated test is not equivalent to independent security review.

## 34. Guardian automation boundary

Stage 21 is classified as a protected review-controlled stage.

Guardian may:

- validate evidence records;
- prepare documentation;
- prepare a review package;
- create a controlled review PR when policy permits;
- update evidence indexes after verified review.

Guardian must not:

- create or expose production credentials;
- generate signing secrets;
- bypass authentication;
- bypass authorization;
- merge protected security changes without required authorization;
- declare security compliance;
- declare legal compliance;
- authorize production launch.

## 35. Stage 21 completion rule

Stage 21 remains **INCOMPLETE** until:

1. implementation is complete;
2. mandatory tests pass;
3. security evidence is recorded;
4. required independent security verification is completed;
5. blocking defects = 0;
6. required review status is APPROVED;
7. completion authority is recorded.

If any condition is missing, the stage remains INCOMPLETE.

## 36. Automatic transition

After genuine Stage 21 completion, Guardian may prepare the next controlled stage package.

The next stage remains separately review-controlled.

Automatic documentation preparation must never be interpreted as legal approval, Ministry approval or production authorization.

## 37. Release boundary

Completion of Stage 21 does not authorize production launch.

Stages 22 onward and all applicable privacy, child-safeguarding, accessibility, curriculum, payment, legal/professional and owner-approval gates remain mandatory.

**Current status: PREPARED — practical implementation and independent security verification required.**