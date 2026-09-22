# Pacific Education — Legal Publication and Regulatory Processing Specification

**Document purpose:** Define every application-side record, workflow, notice, approval gate and evidence package required to prepare Pacific Education for professional/legal publication and release processing.

**Status:** PREPARATION SPECIFICATION — not legal advice, legal approval, regulatory approval or proof of compliance.

**Jurisdiction baseline:** Fiji-first, with additional jurisdiction modules required before offering the service outside Fiji.

## 1. Publication principle

Pacific Education must distinguish four different states:

1. **Drafted** — text has been prepared.
2. **Reviewed** — an authorized reviewer has reviewed the relevant text/control.
3. **Approved** — the person with the required authority has expressly approved the document for its stated purpose.
4. **Published/Effective** — the approved version has actually been published and its effective date has begun.

A document must never display "legally compliant", "government approved", "Ministry approved", "certified", "registered" or equivalent wording unless the required authority and evidence are recorded.

## 2. Legal-publication document register

The app should maintain a versioned register for, where applicable:

- Terms of Service / User Terms
- Privacy Notice
- Data Governance Policy
- Child Safeguarding Policy
- Parent/Guardian Information and Consent Notice
- Student/learner notice appropriate to age and context
- Teacher/Staff Terms and Responsibilities
- Acceptable Use Policy
- Community/Communication Rules
- Assessment and Academic Integrity Rules
- Complaints and Dispute Procedure
- Refund/Cancellation Policy
- Payment and Subscription Terms
- Accessibility Statement
- Cookie/storage/analytics notice where applicable
- Security and Responsible Disclosure Policy
- Incident and Breach Response Procedure
- Data Retention and Deletion Policy
- Data Subject/Individual Request Procedure
- Vendor/Processor Data Processing requirements
- Hosting/Cloud terms record
- Education-sector/curriculum authority references
- Intellectual Property and Ownership Notice
- Copyright/licensing notices
- App Store/Google Play disclosures
- Marketing/Advertising disclosure where applicable
- International-use/jurisdiction terms where applicable
- Insurance/risk documents where required
- Business registration/tax records where applicable
- Professional legal review record
- Government/Ministry correspondence and approvals, if actually obtained

The register must allow documents to be marked **Not Applicable** only with a recorded reason and reviewer.

## 3. Required document metadata

Every published legal/procedural document should have:

- document ID
- document title
- document type
- owner
- responsible operational owner
- jurisdiction
- audience
- purpose
- version
- status
- effective date
- publication date
- review date
- superseded date where applicable
- source/legal authority references
- related policies
- related application controls
- reviewer
- review organization where applicable
- approval authority
- approval date
- evidence references
- change reason
- change history
- public URL/path
- accessibility status
- translation/language status where applicable

## 4. Version-control rule

Only one version may be identified by the app as the currently effective public version for a given document type and jurisdiction.

Previous versions must remain traceable where retention is required.

The app must prevent accidental publication of:

- draft versions;
- superseded versions as current;
- unreviewed legal text;
- documents with unresolved mandatory approval gates;
- documents belonging to another jurisdiction.

## 5. Legal review workflow

Recommended state machine:

**DRAFT → INTERNAL_REVIEW → EVIDENCE_READY → PROFESSIONAL_REVIEW → REVISION_REQUIRED / APPROVED → OWNER_APPROVAL → PUBLISH_READY → PUBLISHED → EFFECTIVE → SUPERSEDED**

If legal/professional review is required and has not occurred, the app must not mark the document legally approved.

A rejection or requested change returns the document to the appropriate prior state.

## 6. Automatic preparation after practical implementation

When a practical requirement becomes independently VERIFIED, Pacific Education Guardian may automatically prepare:

- the corresponding legal-review checklist;
- evidence index;
- draft policy/control wording;
- reviewer assignment request;
- unresolved-issues list;
- change-impact report;
- publication package.

Guardian must not automatically convert implementation evidence into a legal conclusion.

## 7. Privacy publication processing

The app must prepare a privacy review package covering, as applicable:

- what personal information is collected;
- why it is collected;
- how it is used;
- lawful/authorized basis identified by professional review;
- who receives it;
- vendors/service providers;
- international or cross-border processing;
- storage location;
- retention;
- deletion;
- correction/access/request handling;
- security controls;
- incident handling;
- children's information;
- parent/guardian processes where applicable;
- education-sector data sharing;
- analytics/cookies/technical identifiers;
- automated processing/AI features;
- contact point for privacy matters.

The app must not claim that a particular legal basis applies until verified for the actual service and jurisdiction.

## 8. Child safeguarding publication processing

Prepare and route for appropriate specialist/legal review:

- safeguarding policy;
- prohibited conduct;
- adult-to-child communication boundaries;
- reporting/escalation process;
- emergency/safety escalation;
- moderation;
- teacher/administrator responsibilities;
- parent/guardian involvement;
- evidence preservation;
- account restriction procedures;
- staff/vendor screening requirements where applicable;
- safeguarding training/acknowledgement;
- incident register.

The app must not expose children's sensitive information in logs, support tickets, analytics or public pages.

## 9. Education-sector publication processing

The app must distinguish:

- official curriculum/source material;
- verified government/education authority reference;
- Pacific Education internal interpretation or mapping;
- teacher-created material;
- generated/AI-assisted material.

Each curriculum reference must record:

- issuing authority;
- title;
- version/date;
- source;
- applicable class/level/subject;
- relevant achievement indicator/reference;
- verification status;
- verifier;
- verification date;
- supersession status.

Internal mappings must never be labelled as official government curriculum unless that status is independently verified.

Fiji's current legislative environment must be rechecked before production because Parliament's published records show the Education Act 2026 among the 2026 Acts and also show ongoing legislative activity. citeturn0search2turn0search1

## 10. Cybersecurity publication processing

Prepare:

- security architecture summary;
- authentication/security controls;
- authorization model;
- encryption/key-management description;
- vulnerability management;
- security testing;
- incident response;
- access logging;
- backup/recovery;
- dependency management;
- secure development controls;
- responsible disclosure procedure.

Fiji's Cybercrime Act 2021 includes offences concerning unauthorized access to computer systems, so production access controls and authorization must be treated as a substantive security requirement rather than a client-side feature. citeturn0search14

## 11. Payment/legal publication processing

Prepare:

- price schedule;
- currency;
- taxes/charges where applicable;
- billing period;
- payment method;
- authorization status;
- cancellation;
- refunds;
- failed payments;
- duplicate payment handling;
- receipts;
- entitlement activation;
- payment-provider identity;
- dispute handling;
- reconciliation;
- transaction records.

The app must never treat a browser-side payment flag as proof of payment.

Where a regulated payment service is used, the selected provider and processing model must be reviewed against applicable Fiji requirements. Fiji's National Payment System Act 2021 defines payment services, payment instruments and payment service providers. citeturn0search13

## 12. Consumer/user publication processing

Prepare clear public information covering:

- who provides the service;
- what the service does;
- pricing;
- trial/pilot status;
- limitations;
- cancellation;
- refunds;
- support;
- complaints;
- service changes;
- suspension/termination;
- applicable jurisdiction;
- contact details.

Marketing claims must be supported by evidence.

## 13. Intellectual property and ownership publication

The app should clearly record:

- owner;
- platform ownership;
- software copyright position;
- content ownership/licensing;
- third-party/open-source components;
- contributor rights;
- vendor rights;
- restrictions on copying/reuse;
- permitted licenses;
- ownership exceptions created by written agreement.

Providing funding, hosting, technical services, distribution or support must not be represented as transferring ownership unless a separate valid agreement actually does so.

## 14. Vendor and third-party processing

For every production vendor record:

- legal entity name;
- service;
- purpose;
- data accessed;
- jurisdiction;
- hosting/data location;
- security documentation;
- contractual terms;
- sub-processors where relevant;
- incident obligations;
- deletion/return obligations;
- termination process;
- owner approval;
- professional/legal review where required.

Do not publish vendor claims that have not been verified.

## 15. Complaints and dispute processing

The app must provide a controlled workflow:

**Complaint received → acknowledgement → classification → responsible owner → investigation → evidence → response → escalation → resolution → closure → record retention**

Include categories for:

- account/access;
- privacy;
- safeguarding;
- curriculum;
- assessment/marks;
- payment;
- accessibility;
- teacher/user conduct;
- technical service;
- content;
- ownership/IP.

High-risk complaints must be escalated immediately according to the approved safeguarding/security/legal procedures.

## 16. Incident publication processing

Maintain a private incident workflow.

Minimum record:

- incident ID;
- date/time detected;
- detection source;
- affected system;
- severity;
- affected data/category;
- immediate containment;
- investigation owner;
- evidence;
- notifications considered;
- professional/legal review;
- corrective action;
- closure approval.

Do not automatically publish an incident or disclosure simply because an alert was generated.

## 17. Consent and acknowledgement records

Where consent or acknowledgement is required, record:

- document/version presented;
- person/account;
- date/time;
- action;
- consent/acknowledgement status;
- withdrawal where supported;
- applicable scope;
- evidence reference.

Do not treat silence, a preselected control or an unrelated account action as consent unless the applicable reviewed procedure permits it.

## 18. Accessibility publication processing

Each public legal/policy page should be checked for:

- readable language;
- mobile display;
- keyboard/accessibility compatibility where applicable;
- headings and structure;
- sufficient text alternatives;
- downloadable accessible formats where needed;
- clear contact route for accessibility problems.

The app should retain the test date, tester, environment, defects and resolution.

## 19. App-store/public marketplace package

Before submitting a production application to a marketplace, maintain a submission package containing, as applicable:

- application name;
- developer/owner identity;
- package/application identifier;
- privacy-policy URL;
- support URL;
- terms URL;
- age/content classification information;
- data-safety/privacy declarations;
- permissions justification;
- payment/subscription declarations;
- screenshots and descriptions;
- claims/evidence review;
- target jurisdictions;
- release version;
- reviewer notes;
- required declarations;
- submission date;
- review outcome;
- rejection/issues;
- corrective submission history.

Marketplace approval must be recorded as a third-party platform decision, not as government/legal approval.

## 20. Publication controls inside the app

The production system should enforce:

- draft cannot be presented as effective;
- expired document warning;
- superseded document warning;
- missing approval blocks publication;
- missing effective date blocks activation;
- missing jurisdiction blocks jurisdiction-sensitive publication;
- changed legal text triggers re-review;
- changed data processing triggers privacy review;
- changed payment terms trigger payment/consumer review;
- changed child-facing communication triggers safeguarding review;
- changed curriculum claims trigger curriculum-source review.

## 21. Legal-change monitoring

Maintain a legal/regulatory watch register:

- source authority;
- jurisdiction;
- instrument/document;
- publication date;
- effective date;
- change summary;
- affected Pacific Education controls;
- assigned reviewer;
- impact assessment;
- required update;
- completion evidence.

Official Fiji sources should be used for current legislation and parliamentary developments. Parliament publishes current Acts and Bills, including 2026 legislation and ongoing Bills. citeturn0search2turn0search1

The system must not assume that a Bill is law. Fiji Parliament describes the process whereby a Bill passed by Parliament proceeds through finalisation and Presidential assent before becoming an Act and being sent for Gazette publication. citeturn0search0

## 22. Legal/publication evidence package

Before professional review, generate one controlled package containing:

1. document register;
2. current draft documents;
3. previous versions;
4. change history;
5. system/data-flow summary;
6. data inventory;
7. user-role matrix;
8. authorization evidence;
9. security evidence;
10. safeguarding evidence;
11. accessibility evidence;
12. curriculum-source evidence;
13. payment evidence;
14. vendor register;
15. incident/complaint procedures;
16. retention/deletion design;
17. consent/acknowledgement design;
18. pilot findings;
19. unresolved issues;
20. proposed questions for legal/professional reviewer;
21. owner decision log.

## 23. Professional review questions

The application should generate questions rather than presume answers:

- Which laws, regulations, orders, standards and contractual requirements apply?
- Which data-processing rules apply to the actual users and data?
- What child-safeguarding obligations apply?
- What education-sector permissions or approvals are required?
- Are any licences or registrations required?
- What payment/consumer obligations apply?
- Are cross-border transfers involved?
- What contractual terms are required with schools, teachers, parents, vendors and providers?
- What retention/deletion periods are required?
- What incident notification duties apply?
- What accessibility obligations apply?
- What IP/licensing obligations apply?
- What tax/business obligations apply?
- Which documents must be published, and which must remain internal?
- Which claims require documentary authority?

## 24. Owner approval

Owner approval must be explicit and version-specific.

The approval record should include:

- document/package version;
- scope;
- unresolved issues accepted, if any;
- conditions;
- date;
- authorized owner;
- approval status.

Owner approval cannot replace specialist/legal/government approval where such approval is required.

## 25. Publication execution

Only after all applicable review gates are satisfied:

1. freeze the approved document version;
2. generate publication package;
3. verify hashes/version identifiers where appropriate;
4. publish through the approved channel;
5. record public location;
6. record publication timestamp;
7. activate the effective version;
8. preserve the approval evidence;
9. notify affected users where required;
10. schedule next review.

## 26. Automatic legal-procedure transition

When practical implementation is verified:

**PRACTICAL VERIFIED → EVIDENCE PACKAGE → PROFESSIONAL REVIEW REQUEST → LEGAL/REGULATORY QUESTIONS → REVIEW RESULT → REQUIRED REVISION → OWNER APPROVAL → PUBLICATION → EFFECTIVE VERSION**

The automation may prepare records and controlled documentation.

It must never:

- invent legal conclusions;
- fabricate approval;
- represent a reviewer as having approved something they did not approve;
- claim Ministry/government authorization without evidence;
- publish confidential legal advice;
- bypass a required professional review;
- convert a failed gate into approval.

## 27. Public/private separation

Public:

- effective policies;
- required notices;
- current terms;
- current privacy notice;
- current support/complaints information;
- approved ownership/licensing statements.

Restricted/internal:

- legal advice;
- security vulnerabilities;
- incident investigation;
- child safeguarding case records;
- private contracts;
- credentials;
- security keys;
- personal data;
- confidential reviewer comments.

## 28. Final legal-publication gate

A document is **PUBLISH-ELIGIBLE** only when all applicable conditions are true:

- correct jurisdiction;
- correct document type;
- current source references;
- implementation evidence ready;
- required professional review completed;
- required government/authority approval obtained where applicable;
- unresolved blocking issues = 0;
- owner approval recorded;
- effective date defined;
- accessibility/publication checks passed;
- public/private classification confirmed.

Otherwise status remains **BLOCKED** or **REVIEW REQUIRED**.

## 29. Important legal boundary

This specification organizes legal and regulatory preparation. It does not itself establish compliance with Fiji law, Ministry approval, registration, licensing, certification or legal effectiveness.

Current laws, regulations, policies, official education requirements, contracts and professional advice must be checked against the actual production service before launch.

## 30. Current status

**LEGAL PUBLICATION PROCESSING: PREPARED**

**PRODUCTION RELEASE: BLOCKED until all applicable practical, security, privacy, safeguarding, curriculum, payment, professional/legal and owner-approval requirements are actually completed and evidenced.**
