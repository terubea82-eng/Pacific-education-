# PacEdu global legal-readiness and user-safety requirements

**Status:** staging requirements; not legal certification  
**Applies to:** every country, jurisdiction, school, education authority, qualification provider and user group supported by PacEdu  
**Owner direction:** curriculum-first source verification is mandatory. These controls are additional release requirements, not permission to launch in a country.

## 1. Legal readiness is jurisdiction-specific

PacEdu must not assume that one country's legal settings apply globally. Before enabling learner accounts, school use, data collection, content publication or payments in a jurisdiction, maintain a reviewed jurisdiction profile containing:

- country and relevant state/province/territory;
- applicable education regulator, curriculum authority and qualification/examination authority;
- approved levels, subjects, school calendar and language requirements;
- child-protection and mandatory-reporting requirements relevant to the service;
- privacy/data-protection authority, lawful basis requirements, children's consent/age rules and data-subject rights;
- cross-border transfer and data-residency restrictions;
- copyright, educational-use exceptions, licences and permissions;
- consumer, e-commerce, subscription, tax, payment and refund rules;
- accessibility/disability obligations;
- local emergency, safeguarding and complaints contacts;
- local legal reviewer, review date, evidence links and next review date.

**Release states:** `NOT_ASSESSED`, `ASSESSMENT_IN_PROGRESS`, `LEGAL_REVIEW_REQUIRED`, `APPROVED_WITH_LIMITS`, `BLOCKED`, `REVIEW_EXPIRED`. A country must not be marked approved based on an AI summary alone. Approval requires documented review by an appropriately qualified local professional and the relevant institutional/authority permissions where required.

## 2. Curriculum and institutional authority

- Identify the controlling authority for the exact learner jurisdiction, institution, programme, level and subject.
- Distinguish national curriculum, subnational curriculum, examination/qualification prescription and an institution's authorised programme.
- Record document title, issuing body, version, effective date, source location, official URL, licence/permission status and educator validation.
- If authorities conflict or adoption status is unclear, block curriculum-verified claims and request written clarification.
- Do not treat a textbook, third-party website, teacher-made plan or AI-generated outline as a mandated prescription.
- Older prescriptions may be used only as clearly labelled interim sources under the curriculum-first rule; they must not be represented as current.
- Keep each jurisdiction's indicator records separate. Never silently reuse another country's curriculum mapping.
- Use the local approved instructional calendar; Fiji's 45+45+25 day structure is not a global default.

## 3. Copyright, licences and resource provenance

Every imported or generated resource must have a provenance record:

- creator/issuing body and exact title/version;
- source URL and retrieval date;
- copyright owner where known;
- licence type and permitted uses (view, link, quote, adapt, translate, store, redistribute, commercial use);
- written permission or licence evidence and expiry/territory limits;
- attribution text and required notices;
- whether the resource contains third-party images, maps, audio, fonts or extracts.

Default to metadata, links, original explanations and original practice questions when redistribution rights are unclear. Do not copy complete prescriptions, textbooks, exam papers, worksheets, images or answer keys into PacEdu without a licence or permission that covers the intended use. A document being publicly accessible does not mean it is free to reproduce, adapt or sell. Provide a takedown/contact route and a documented rights-review process.

## 4. Children, privacy and learner data

Before collecting personal data, complete a jurisdiction-specific privacy assessment and document the lawful basis, purposes, necessity, retention and user rights.

- Collect the minimum information needed. Avoid collecting national ID numbers, exact home addresses, sensitive family details or health diagnoses unless strictly necessary, lawful and specifically approved.
- Use age-appropriate privacy notices in languages learners and guardians can understand.
- Implement guardian consent/authorisation where applicable; do not assume one universal age of consent.
- Separate learner, guardian, teacher, school administrator, institution, regulator and PacEdu owner permissions.
- Enforce least privilege, strong authentication, secure password recovery, encryption in transit and at rest, audit logs and timely access revocation.
- Never expose one school's learner records to another school or ordinary users. Owner-level visibility must be restricted, justified and audited.
- Define retention schedules, deletion/anonymisation, correction/export requests, account closure and legal holds for each jurisdiction.
- Establish incident response, breach assessment, regulator/guardian notification decision paths and contact ownership.
- Assess hosting region, subprocessors, backups and international transfers before activation. Do not promise local data residency until technically verified.
- Do not use children's work, profile data, voice or behaviour for advertising, profiling, model training or unrelated analytics without a separate lawful basis and required consent; default is no such secondary use.

## 5. Voice, accessibility and disability inclusion

- Provide equivalent text alternatives for all audio instructions and activities.
- Support screen readers, keyboard navigation, high contrast, scalable text, captions/transcripts, clear focus order and simple linear Next/Back navigation.
- Make audio controls available for relevant reading and activity content, with pause/stop/replay and no competing automatic narrators.
- Preserve learner progress after disconnection and accidental closure without exposing another learner's session.
- Teacher-authorise voice response features where required by the learner's support plan and applicable rules. Offer text, speech, pointing, signing, drawing and hard-copy alternatives as appropriate.
- Do not infer or store a disability diagnosis from interaction patterns. Record only the minimum accommodation instructions authorised by the school/guardian.
- Do not use voiceprints or voice recordings for identity recognition. Minimise recording; where audio must be processed, state whether it is stored, who can access it, retention and deletion.
- Test with actual assistive technologies and users with disabilities before claiming accessibility conformance. Target WCAG 2.2 AA as a product engineering baseline, while checking local legal standards separately.

## 6. Child safeguarding and communication

- No unrestricted private adult-to-child messaging or public learner profiles.
- Provide school-controlled, role-restricted communication with reporting, moderation, audit trails and escalation.
- Define who can contact a learner, for what purpose, at what times and under whose authorisation.
- Do not expose personal contact details or learner location to other users.
- Establish reporting and response procedures for abuse, exploitation, bullying, threats, self-harm disclosures and unsafe content, aligned with local law and school safeguarding policy.
- Do not promise confidentiality where a safeguarding or legal duty requires escalation. Explain limits in age-appropriate language.
- Provide accessible report/help routes and local emergency guidance without pretending PacEdu replaces emergency services or professional care.

## 7. AI and educational quality controls

- Label AI-assisted drafts clearly for teachers; do not claim AI-generated material is officially endorsed.
- Require source-linked concept/indicator verification before any daily activity is released.
- Keep the same approved learning objective across Copper, Bronze, Silver and Gold; vary scaffolding and challenge only.
- Require educator review of concept unpacking, local language, cultural appropriateness, factual accuracy, safety and age suitability.
- Automatically mark only validated objective items with a reviewed answer key. Route essays, drawings, practical work, ambiguous responses and accommodations for human review.
- Show learners when a response is AI-assisted or automatically marked, and provide a teacher appeal/correction path.
- Keep a versioned audit record of source, prompt/template version, generated activity, reviewer, approval and changes.
- Do not let AI make high-impact decisions about admission, discipline, disability, progression, qualification or learner ranking without lawful authority, meaningful human review and an appeal process.

## 8. Payments, subscriptions and institutional agreements

Before accepting payment in a jurisdiction, verify local consumer, tax, payment-services and subscription requirements.

- Show price, currency, taxes/fees, billing interval, renewal date, cancellation process and refund terms before checkout.
- Obtain explicit confirmation for recurring payments and provide a simple cancellation route.
- Issue an itemised receipt and maintain auditable payment status; never store full card details in PacEdu.
- Distinguish free educational resources from paid features. Do not imply that a child must pay to access a resource that the school or law requires to be free.
- For government or country-wide student agreements, require a signed agreement defining eligible learners, student-count methodology, currency, price per learner, billing period, reconciliation, disputes, tax, refunds and termination.
- Show country-level counts and amounts only to specifically authorised owner/finance roles; use aggregate reporting by default.
- Do not activate a country's payment arrangement until the agreement and local payment/tax review are approved.

## 9. User rights, transparency and support

Provide separate, plain-language notices for learners, parents/guardians, teachers and institutions covering:

- what PacEdu does and does not do;
- what data is collected and why;
- who can see learner data;
- how AI, audio, automatic marking and progress tracking work;
- what is free and what is paid;
- copyright and permitted use of uploaded materials;
- reporting, complaints, correction, export and deletion routes;
- service limitations, outages, offline behaviour and recovery;
- support contact, response expectations and escalation.

Terms and notices must be versioned, accessible and available before account creation or payment. Record acceptance and guardian/institution authorisation where legally required. Do not use a single checkbox to bundle unrelated consents.

## 10. Operational release gates

A jurisdiction launch checklist must not pass until all relevant items are evidenced:

1. Curriculum authority and current prescription verified.
2. Institution/programme authority and school permission verified.
3. Copyright/licensing review completed for every included resource type.
4. Privacy impact assessment and lawful basis approved.
5. Child consent/guardian workflow tested where required.
6. Hosting, processors and cross-border transfer review completed.
7. Safeguarding policy, reporting route and responsible contacts approved.
8. Accessibility and assistive-technology tests completed.
9. Payment, consumer, tax and refund review completed if payments are enabled.
10. Security review, role tests, audit logs, backup and incident-response tests completed.
11. User notices, terms, complaint and deletion workflows published and tested.
12. Named local reviewer and review/expiry date recorded.

Missing evidence means the relevant feature stays disabled. A country can be enabled for a limited, non-production pilot only where the responsible authority and local legal reviewer have documented the permitted scope and safeguards.

## 11. Required product architecture

Implement these as data-driven country/institution profiles, not hard-coded global assumptions:

- jurisdiction profile and approval status;
- curriculum authority and version registry;
- resource licence/provenance registry;
- privacy notice/consent version and guardian authorisation;
- role and school/tenant access policy;
- data retention and deletion schedule;
- safeguarding policy and escalation contacts;
- payment terms and signed institutional agreements;
- accessibility test record;
- reviewer identity, evidence, decision date and expiry;
- feature flags that block accounts, uploads, AI generation, messaging, analytics or payments until their individual approvals are satisfied.

Use server-side enforcement for all security, permission, consent, payment, learner-data and release decisions. Client-side checks are helpful usability safeguards but are not a security boundary. Log decisions without placing sensitive learner data in logs.

## 12. Pilot and production boundary

This document is a product requirements checklist, not a legal opinion, certification or proof that PacEdu currently complies. The staging implementation must not activate new jurisdictions, collect new categories of learner data, publish protected materials, enable adult-to-child messaging or take payments merely because this document exists. Each feature requires its own reviewed approval and tested server-side controls.

**Release principle:** safe by default, minimum data, clear permissions, accessible by design, human oversight, traceable sources, and no country activation without documented local review.
