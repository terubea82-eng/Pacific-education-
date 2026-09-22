# Pacific Education — Stage 24 Privacy & Data Governance

## Status

**Stage 24 architecture contract: DEFINED — production implementation, legal/privacy review and independent verification required.**

This stage defines how Pacific Education should govern personal and education data. It does not itself establish legal compliance.

## 1. Data governance principles

Pacific Education production systems must:

- Collect only data necessary for an approved education purpose.
- Use data only for defined and authorized purposes.
- Restrict access according to identity, role, verified relationship and resource scope.
- Keep production records authoritative on the server.
- Protect data during transmission, storage, backup and disposal.
- Maintain auditable administrative access.
- Avoid collecting real child-sensitive information in prototype testing.

## 2. Data classification

Before production launch, define a data inventory and classification covering at least:

- Account and authentication data
- Student/learner profile data
- Parent/guardian relationship data
- Teacher and school relationship data
- Learning progress
- Assessments and marks
- Curriculum/reference records
- Communication records
- Payment and subscription status
- Audit/security events
- Technical/device information

Each category must have an approved purpose, access scope, retention rule and protection requirement.

## 3. Access governance

Access to personal or education data must be denied by default.

Every protected operation should verify:

1. Authenticated identity
2. Account status
3. Role
4. Verified relationship where required
5. Resource ownership/scope
6. Requested operation
7. Applicable school/jurisdiction restrictions

Technical staff, support personnel and administrators must not receive unrestricted access merely because they provide infrastructure or technical services.

## 4. Retention and deletion

Production must establish documented retention periods for each data category.

The implementation should support, as applicable:

- Record retention controls
- Deletion workflows
- Correction/update workflows
- Account closure
- Relationship removal
- Secure disposal
- Backup-expiry handling
- Legal/operational retention exceptions

Deletion must not be claimed complete while recoverable copies remain under an applicable retention period.

## 5. Consent and authorization

Where consent or another authorization mechanism is required, production must record the relevant authorization state securely and audit important changes.

An invitation, link, identifier or client-side flag must never substitute for required authorization.

Child-related access must follow the approved safeguarding and adult/guardian authorization model.

## 6. Data sharing

Before production launch, document:

- Who can access each data category
- Why access is required
- What information may be shared
- When sharing is permitted
- How sharing is logged
- How access is revoked

External providers should receive only the minimum information necessary for their approved service.

## 7. International and third-party services

If Pacific Education uses hosting, analytics, authentication, payment, messaging or other third-party providers, document the data exchanged with each provider.

Provider access, geographic processing, contractual requirements and security controls must be reviewed before production use where applicable.

## 8. Privacy notices and user rights

Production privacy documentation must clearly explain, as applicable:

- What information is collected
- Why it is collected
- How it is used
- Who may access it
- How long it is retained
- How users can request applicable rights
- How security/privacy incidents are handled
- How users can contact the responsible service/operator

The published privacy notice must match actual production behavior.

## 9. Logging and audit

Audit records should capture security-relevant events without unnecessarily copying sensitive education data.

At minimum, privileged actions and material access-control changes should be attributable to an authenticated account and timestamped.

Audit data itself must be access-controlled and retained according to policy.

## 10. Data quality

Production records should support appropriate correction and validation controls.

Assessment and learning records must preserve authoritative server state and prevent unauthorized client-side alteration.

Where corrections are made to material records, the system should preserve an appropriate audit trail.

## 11. Privacy incident response

A documented process must cover:

- Detection
- Containment
- Investigation
- Risk assessment
- Required notification/escalation
- Remediation
- Recovery
- Record keeping
- Post-incident review

Applicable legal and regulatory obligations must be determined by qualified professionals for the jurisdictions in which the service operates.

## 12. Required Stage 24 evidence

Stage 24 should not be marked implementation-complete until evidence exists for:

- Production data inventory
- Data-flow map
- Data classification
- Access-control matrix
- Retention schedule
- Deletion/correction procedures
- Consent/authorization design where applicable
- Third-party data-sharing register
- Privacy notice reviewed against actual implementation
- Audit/logging design verified
- Privacy incident procedure documented
- Independent privacy/legal review where required
- Identified findings remediated or formally documented for owner decision

## 13. Release boundary

Stage 24 does not authorize production publication.

The production approval gate remains fail-closed until privacy governance is implemented and verified together with the remaining production requirements.
