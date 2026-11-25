# Free Learning Library: Resource Governance and Access Specification

**Status:** staging design only  
**Scope:** global catalogue, free-access rules, resource review and withdrawal controls  
**Implementation status:** not connected to the app, Firebase, storage, authentication or payment services

## 1. Product rule

PacEdu should make genuinely useful learning materials available without requiring a paid subscription. Free access must not be a disguised trial, and a learner must not be pressured to pay to continue an ordinary learning session.

The free library is a separate entitlement from optional paid features. A user may choose one or more curriculum countries for supplementary learning. That choice does not establish school enrolment, official assessment status, government endorsement or a country payment obligation.

## 2. Resource classes

Every catalogue item must be assigned exactly one rights class:

- `PACEDU_OWNED`: created by PacEdu or a contributor who has signed a valid rights assignment/licence.
- `PUBLIC_DOMAIN_VERIFIED`: public-domain status checked for the relevant jurisdiction and type of work.
- `OPEN_LICENSE`: a recognised open licence is recorded, including attribution, adaptation, share-alike and non-commercial conditions as applicable.
- `THIRD_PARTY_LINK`: an external link only. PacEdu does not copy, rehost, modify or redistribute the material unless separate permission is recorded.
- `PERMISSION_REQUIRED`: not publishable until written permission and its scope are verified.
- `WITHDRAWN`: hidden from learners pending rights, safety, accuracy or quality resolution.

A resource being publicly viewable on the internet does not mean it is free to copy, upload, translate, adapt or distribute. Do not scrape or reproduce textbooks, worksheets, videos, images or examination papers without a documented legal basis.

## 3. Required catalogue record

Each item should have:

- immutable resource ID and version;
- title, short description, resource type and language;
- intended age band, class/level and accessibility features;
- subject and curriculum jurisdiction(s);
- explicit label: supplementary, officially authorised, or general knowledge;
- rights class, rights holder, licence name/version and permitted uses;
- source URL or internal source record, access date and evidence reference;
- attribution text and any restrictions;
- author/uploader, reviewer, review date and approval state;
- publication date, review/expiry date and withdrawal reason when applicable;
- safety/content rating and any teacher/guardian restrictions;
- file checksum and storage location for PacEdu-hosted files.

Missing rights evidence, source provenance, required attribution or approval means the item is not learner-visible.

## 4. Publication and review states

Use these states:

1. `DRAFT` — private authoring only.
2. `PENDING_RIGHTS_REVIEW` — permission, licence or public-domain evidence is being checked.
3. `PENDING_EDUCATOR_REVIEW` — subject accuracy, age suitability, curriculum label and accessibility are being checked.
4. `APPROVED_FREE` — rights and educational review passed; eligible for free catalogue access.
5. `APPROVED_RESTRICTED` — approved only for a named jurisdiction, age group, school or licence condition.
6. `EXPIRED_REVIEW` — review date passed; remove from discovery until rechecked.
7. `SUSPENDED` — temporarily unavailable during a complaint or safety/accuracy investigation.
8. `WITHDRAWN` — no longer available; retain an audit record, not a learner-facing copy.

Approval requires both rights clearance and content review. A teacher's approval of educational quality does not replace copyright permission. A rights-holder's permission does not replace age-suitability and educational review.

## 5. Free-library access rules

- Eligible registered users receive the `free_library` entitlement without entering payment-card details.
- The entitlement is checked by a trusted server/API using the authenticated UID and account status. A browser flag, local storage value or client-supplied role must never grant access.
- Only `APPROVED_FREE` resources, plus items whose restricted terms match the user, may be returned.
- A user can browse supplementary materials for another country when the rights permit it. The interface must clearly show the selected curriculum jurisdiction and supplementary status.
- A resource restricted to a school, country, age band or cohort must not be exposed outside that scope.
- Paid entitlements may add optional features or content, but must not silently reclassify a free resource or remove the user's free-library entitlement.
- No child-facing prompt should interrupt a lesson, shame a learner, imply that payment improves grades, or pressure a child to purchase. Any purchase flow must use the authorised payer/guardian process and clear terms.
- Free access must not be conditional on agreeing to advertising, behavioural profiling or sale of personal information.

## 6. Accessibility and learning quality

Where relevant, each resource should support readable text, keyboard/switch navigation, screen-reader labels, scalable text, clear contrast, captions/transcripts and audio alternatives. Do not claim DeafBlind compatibility unless the actual interaction has been tested with appropriate assistive technology and users.

For activities, keep instructions short and consistent. Audio playback is an access feature, not a replacement for accessible text. Voice-answer submission remains unavailable unless the trusted teacher-authorisation control is implemented and verified.

Educational content must identify its intended level, learning objective and answer/marking guidance where appropriate. Keep supplementary practice separate from official curriculum coverage and official assessment records. Do not invent or imply official achievement indicators.

## 7. Safety, accuracy and complaints

- Screen uploads and external links for malware, deceptive redirects, personal data exposure and age-inappropriate content.
- Do not publish learner-identifying information, student work or photographs without the required lawful basis and guardian/learner permissions.
- Provide a visible report-content route for copyright, safety, factual error, accessibility and broken-link complaints.
- On a credible rights or safety complaint, suspend the item promptly while an authorised reviewer investigates.
- Keep a versioned audit record of who submitted, reviewed, approved, changed, suspended or withdrew an item and why.
- Recheck time-sensitive resources and external links on a defined schedule; expired or broken items leave learner discovery until reviewed.
- A withdrawn resource must not remain accessible through an old public URL or cached catalogue response where PacEdu controls delivery.

## 8. Owner and country-level oversight

The PacEdu Owner may view global catalogue totals and moderation/rights status. A country administrator may view only items and review queues within their authorised country scope. Neither role should expose children's personal data in aggregate catalogue reports.

Useful aggregate measures include free resources by subject/level/language, rights class, approval state, accessibility coverage, review overdue count, complaints and withdrawals. These are catalogue quality measures, not a reason to collect unnecessary learner behaviour.

## 9. Minimum release gates

Before this design is implemented:

- verified Firebase Authentication or equivalent identity is in place;
- trusted server-side authorisation protects catalogue reads and writes;
- roles and country scope are assigned server-side, never from client input;
- storage paths and download delivery enforce the same rights and access policy;
- catalogue records validate required rights, source, curriculum and review metadata;
- tests cover anonymous access, active free users, suspended users, children, country restrictions, expired items, withdrawn items, role escalation and direct-file URL access;
- copyright, privacy, child-safety and jurisdiction-specific legal review is complete;
- accessibility is tested on supported Android devices and assistive technologies;
- an operational takedown and appeal process exists.

## 10. Explicit non-changes

This document does not create or upload learning resources, establish copyright ownership, grant licences, create user entitlements, alter registration, change Firebase Authentication/Firestore/Storage/IAM, add a catalogue UI or API, collect payments, or deploy anything. All of those require separate reviewed implementation work.
