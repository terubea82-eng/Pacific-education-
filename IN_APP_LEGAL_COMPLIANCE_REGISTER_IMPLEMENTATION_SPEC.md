# Pacific Education — In-App Legal & Compliance Register Implementation Specification

**Purpose:** Define the application-side register that manages legal, regulatory, professional-review and publication records.

**Status:** SPECIFICATION PREPARED — implementation and verification required.

## 1. Core rule

The register is an evidence-management and workflow system. It does not itself determine whether Pacific Education is legally compliant.

It must distinguish:

- information recorded;
- evidence supplied;
- implementation verified;
- professional review completed;
- government/authority decision recorded;
- owner approval recorded;
- publication completed;
- effective status.

## 2. Register record

Each compliance/publication item should contain:

- unique record ID;
- requirement category;
- requirement title;
- description/question;
- jurisdiction;
- affected population;
- source authority;
- source title;
- source URL/reference;
- source version/date;
- effective date where known;
- applicability status;
- implementation owner;
- affected app feature/control;
- evidence references;
- reviewer;
- reviewer role/organization;
- review date;
- review outcome;
- unresolved issues;
- required action;
- document version;
- publication status;
- owner approval status;
- next review date;
- created/updated timestamps.

## 3. Controlled statuses

Use only defined states:

**PLANNED → IMPLEMENTED → EVIDENCE_READY → SPECIALIST_REVIEW → LEGAL_REVIEW → OWNER_APPROVAL → PUBLISH_READY → PUBLISHED → EFFECTIVE → SUPERSEDED**

Alternative controlled outcomes:

- NOT_APPLICABLE — requires documented reason and authorized review;
- BLOCKED — mandatory condition is missing;
- REVISION_REQUIRED — reviewer requires changes;
- WITHDRAWN — item intentionally removed under change control.

## 4. Applicability decision

The system must not automatically decide that a law or regulatory requirement applies.

It may prepare an applicability question for authorized review.

Required fields:

- jurisdiction;
- user population;
- service activity;
- data involved;
- commercial/payment activity;
- education-sector activity;
- child-facing activity;
- cross-border activity;
- proposed applicability;
- reviewer;
- decision;
- reasoning/evidence.

## 5. Evidence register

Every evidence item should have:

- evidence ID;
- linked requirement ID;
- evidence type;
- description;
- source/reference;
- date;
- environment;
- test/result;
- verifier;
- verification status;
- confidentiality classification;
- expiry/review date.

Never store passwords, private keys, access tokens, payment credentials or unnecessary real child data as evidence.

## 6. Review record

A review record must identify:

- requirement/document reviewed;
- exact version;
- reviewer identity;
- reviewer role;
- review organization where applicable;
- review date;
- scope;
- findings;
- required changes;
- outcome;
- conditions;
- follow-up date;
- supporting evidence.

A reviewer must not be shown as approving a matter unless an actual approval record exists.

## 7. Government/authority decision record

Where an official approval, registration, licence, notice, authorization or other authority decision is required, record:

- authority;
- instrument/application type;
- application/reference number;
- submission date;
- requested scope;
- decision date;
- decision;
- conditions;
- expiry/renewal date;
- official evidence reference;
- verification status.

The app must not fabricate or infer an official decision.

## 8. Publication record

For every published legal/procedural document record:

- document ID;
- approved version;
- publication channel;
- public location;
- publication timestamp;
- effective date;
- audience;
- jurisdiction;
- accessibility check;
- owner approval;
- professional review status;
- superseded version;
- next review date.

## 9. Publication blocking rules

Publication must be blocked when applicable:

- required review is missing;
- required approval is missing;
- required government decision is missing;
- document version is not frozen;
- jurisdiction is unclear;
- effective date is missing;
- unresolved blocking issue exists;
- evidence is incomplete;
- required accessibility check has failed;
- required implementation control is not verified.

## 10. Automatic transition

When a practical stage produces verified evidence, Guardian may automatically create:

- linked legal/compliance register item;
- evidence index;
- reviewer request;
- unresolved-question list;
- document update task;
- change-impact record.

Guardian must not automatically mark the item legally approved.

## 11. Change impact

Changes to the application must trigger an impact assessment.

Examples:

### Authentication change
Review:
- security;
- privacy;
- access control;
- terms/notices where affected.

### New child data field
Review:
- privacy;
- data minimization;
- safeguarding;
- retention;
- consent/notice requirements.

### New communication feature
Review:
- safeguarding;
- privacy;
- moderation;
- terms;
- abuse reporting.

### New payment method
Review:
- payment provider;
- consumer/refund terms;
- reconciliation;
- privacy;
- applicable financial/payment requirements.

### Curriculum change
Review:
- official source/version;
- mapping;
- authorized education review;
- affected lessons/assessments.

### New country/jurisdiction
Review:
- local legal/regulatory requirements;
- privacy;
- child protection;
- consumer/payment;
- education requirements;
- tax/business requirements.

## 12. Public/private classification

Each record must be classified:

- PUBLIC;
- INTERNAL;
- RESTRICTED;
- CONFIDENTIAL.

Confidential legal advice and sensitive safeguarding/security records must not appear on public pages.

## 13. Document versioning

A document change must create:

- new version;
- change reason;
- changed sections;
- affected requirements;
- affected controls;
- reviewer requirement;
- approval requirement;
- publication impact.

The previous effective version must remain traceable where retention is required.

## 14. Review reminders

The system may generate reminders for:

- upcoming review;
- expired source;
- changed legislation/reference;
- expiring approval;
- expiring certificate/evidence;
- overdue corrective action;
- overdue professional review.

A reminder is not proof that the underlying requirement remains satisfied.

## 15. Legal-source monitoring

For each legal source, store:

- authority;
- source location;
- document title;
- version/date;
- retrieval date;
- effective status;
- affected requirements;
- last checked;
- next check.

The system should flag source changes for human review rather than automatically rewriting legal conclusions.

## 16. Audit trail

All material changes must record:

- actor;
- timestamp;
- action;
- old state;
- new state;
- affected record;
- reason;
- linked evidence/change ID.

Audit history must be protected from ordinary users.

## 17. Dashboard states

The owner/admin review dashboard should show:

- Total requirements;
- Planned;
- Implemented;
- Evidence ready;
- Specialist review;
- Legal review;
- Owner approval;
- Publish ready;
- Published;
- Effective;
- Blocked;
- Revision required;
- Not applicable;
- Overdue reviews.

Do not display a single overall “legally compliant” score.

## 18. Owner control

Owner approval must remain explicit.

The register must never:

- transfer ownership;
- grant equity;
- grant partner control;
- authorize production automatically;
- replace legal advice;
- replace government approval;
- override security or safeguarding gates.

## 19. Production release dependency

The final production release gate should consume verified register states but remain independently controlled.

A document being published does not automatically mean the application is production-ready.

A production release requires all separate mandatory technical, security, privacy, safeguarding, curriculum, payment, professional/legal and owner-approval gates.

## 20. Required implementation tests

Test:

1. draft cannot become published without required gates;
2. superseded version cannot become current accidentally;
3. missing reviewer blocks applicable review completion;
4. missing authority evidence blocks authority-approved status;
5. unauthorized users cannot alter legal records;
6. confidential records remain restricted;
7. version changes trigger required review;
8. practical verification can create a review package;
9. automation cannot create legal approval;
10. audit records are retained;
11. blocked records cannot pass the publication gate;
12. source changes create a review task.

## 21. Completion evidence

Stage completion requires:

- implemented register;
- database schema verified;
- access controls verified;
- workflow tests passed;
- publication blocking tests passed;
- audit trail verified;
- sample synthetic records processed;
- independent technical review recorded.

## 22. Legal boundary

This implementation does not establish legal compliance.

Actual applicable Fiji law, regulations, government requirements, education-sector requirements, contracts and professional advice must be verified for the actual production service and its users.

**Current status: PREPARED — implementation required.**
