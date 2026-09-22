# Pacific Education — Stage 21 Production Authentication & Account Security

## Status

**Stage 21 architecture contract: DEFINED — production implementation and independent verification required.**

This document defines the required production authentication boundary. The existing browser prototype authorization remains prototype-only.

## 1. Trust boundary

The client must be treated as untrusted.

The following are never sufficient proof of production identity or authorization:

- localStorage values
- JavaScript variables
- URL parameters
- hidden form fields
- cached prototype state
- client-side role flags
- prototypeSession flags

Production identity and permissions must be established and enforced server-side.

## 2. Account lifecycle

Production accounts require controlled:

1. Registration or administrator-created provisioning
2. Identity verification appropriate to the account type
3. Authentication
4. Session establishment
5. Role assignment
6. Account status enforcement
7. Recovery procedures
8. Suspension/revocation
9. Audit logging

Account deletion, correction and retention must follow the approved privacy/data-governance policy.

## 3. Roles

Supported education roles may include:

- student
- teacher
- parent
- ministry
- head_of_school
- examiner
- owner
- admin

A role must be stored and enforced server-side. A client cannot promote itself to another role.

## 4. Authentication requirements

Production authentication should use an established, security-reviewed identity provider or equivalent server-side authentication implementation.

Required controls include:

- Secure password handling if passwords are used
- Multi-factor authentication where appropriate
- Secure session/token handling
- Session expiration and revocation
- Protection against credential stuffing and brute force
- Rate limiting
- Account recovery controls
- Secure logout/revocation
- Device/session visibility where appropriate
- Security event logging

Never store plaintext passwords, password-equivalent secrets, private keys or service credentials in the repository.

## 5. Authorization

Authentication answers **who is signed in**.

Authorization answers **what that account may access or change**.

Every protected server request must independently evaluate:

- authenticated account
- account status
- role
- verified education relationship
- resource scope
- requested operation
- applicable school/jurisdiction constraints

Deny by default when required information cannot be verified.

## 6. Relationship security

Student, teacher and parent access must require a verified relationship plus permission.

A relationship invitation, link, identifier or discovery result must not itself expose protected education information.

Revoked relationships must stop access according to the production authorization policy.

## 7. Sessions and tokens

Production sessions must:

- Use secure transport
- Use appropriate expiration
- Support revocation
- Avoid sensitive information in URLs
- Prevent token leakage through logs or client-visible diagnostics
- Use secure cookie/token configuration appropriate to the selected architecture
- Rotate or invalidate credentials when required by the threat model

Exact token architecture must be selected during production implementation and security review.

## 8. Child and vulnerable-user protection

Production authentication design must minimize unnecessary collection of child information and support safeguarding controls.

Do not use real child personal information in prototype testing.

Administrative and support access must be separately controlled and audited.

## 9. Owner control

Owner/admin privileges must be explicitly provisioned server-side.

No external technical, funding, infrastructure or distribution arrangement should automatically create ownership or unrestricted administrative access.

Owner-controlled release approval remains separate from technical authentication.

## 10. Authentication testing evidence

Before Stage 21 is implementation-complete, evidence should include:

- Login/authentication success and failure tests
- Session expiry and revocation tests
- Password/recovery tests if passwords are used
- MFA tests where enabled
- Brute-force/rate-limit tests
- Role-escalation tests
- Relationship-access tests
- Unauthorized resource-access tests
- Logout tests
- Audit-log tests
- Account suspension/revocation tests
- Security review findings and remediation records

## 11. Release boundary

Stage 21 does not authorize production publication.

The production gate remains fail-closed until the production authentication implementation, backend, database, security testing, privacy/safeguarding controls and required authorized or independent reviews are complete.
