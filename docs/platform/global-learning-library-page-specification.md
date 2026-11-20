# PacEdu Global Learning Library — Product and Access Specification

**Status:** staging specification only  
**Proposed page:** Global Learning Library  
**Placement:** separate page, reachable from the learner's main learning area through one clearly labelled entry  
**Implementation status:** not connected to runtime, authentication, catalogue storage, subscriptions or payment services

## 1. Purpose

Create a welcoming, easy-to-use global library where learners can discover educational resources from different countries and languages. A learner can read, listen to or watch a resource using the format and accessibility options available for that item.

The library is supplementary learning. Choosing or reading a country's material does not itself create official school enrolment, curriculum accreditation, assessment credit or government endorsement.

## 2. Main collections

Use two clear collection choices at the top of the page:

### Fiction
Educational and age-appropriate stories, including:
- early readers, picture books and graded readers;
- folktales, fables, myths and cultural stories where rights and cultural permissions allow;
- historical fiction and biographies presented as fiction only when clearly labelled;
- science fiction and imaginative stories that encourage curiosity, problem-solving and literacy;
- novels and short stories suitable for the learner's age and reading level.

### Non-fiction
Educational information and reference material, including:
- literacy, language and dictionaries;
- mathematics and problem-solving;
- science, nature, environment and climate;
- history, geography and cultures;
- technology, computing and engineering;
- health and healthy living;
- agriculture, food and sustainability;
- arts, music education and crafts;
- financial literacy, business and entrepreneurship;
- biographies, study skills, careers and general knowledge.

Every item must be genuinely educational or support learning. Exclude pornography, gambling promotion, extremist recruitment/propaganda, commercial product advertising disguised as lessons, and unrelated entertainment catalogues.

## 3. Read, listen and watch

Each resource page should show only the formats actually available:

- **Read:** accessible HTML text or a rights-cleared digital book/document reader. Offer font resizing, spacing, contrast and bookmarks.
- **Listen:** rights-cleared audiobook/audio narration, play/pause, replay, speed control and clear progress. Provide a transcript or text alternative where available.
- **Watch:** rights-cleared educational video with captions, transcript, playback controls and a clear duration. Avoid autoplay and provide a low-bandwidth option where possible.

A book must not display a Listen or Watch button unless that format exists and the user is authorised to access it. Do not convert or narrate third-party material without the required rights.

## 4. Simple page design

Keep the page separate from Teacher Workspace and the daily activity sequence. Do not insert library browsing into the middle of a learner's lesson.

Recommended layout:
1. Page title: **PacEdu Global Learning Library**.
2. One short instruction: "Choose a collection, then choose Read, Listen or Watch."
3. Two large collection choices: **Fiction** and **Non-fiction**.
4. Simple search field for title, author, topic or keyword.
5. Optional filters: language, age/reading level, country/culture, subject and format.
6. Resource cards with cover/thumbnail, title, author/creator, language, level, short description and available format labels.
7. One clear **Open** action per item.
8. A **Continue reading/listening/watching** row based on the user's saved progress.
9. A simple **My Saved Books** list.

On small Android screens, use a single-column layout, large touch targets, short labels and minimal scrolling. Keep the main reading/listening/watching controls visible and predictable. Provide text labels alongside icons; do not rely on colour or icons alone.

## 5. Paid access and free catalogue

- Full catalogue access is an optional paid entitlement, granted only after the trusted billing service confirms an active subscription or a valid school/country sponsorship agreement.
- The page must never trust a client-side flag, local storage value or user-editable role to grant paid access.
- A free account may browse the catalogue and open resources explicitly marked `FREE`; where permitted, it may receive a short preview of a paid item. Do not imply that all catalogue resources are free.
- A paid user receives access only to resources included in their active plan, territory and licence terms.
- Show a clear lock label and the access reason for a paid-only item. The upgrade explanation must be respectful, brief and not interrupt a lesson.
- No silent trial conversion, hidden recurring charge or child-directed pressure to buy. Purchases for children must use the required guardian/authorised payer flow.
- If a paid plan expires or payment is not confirmed, retain access to resources designated free and explain the status clearly. Apply any paid-access grace period and suspension only as stated in the published agreement and applicable law.
- Country-specific agreements may sponsor cohorts or provide different access rights. Do not infer a country's payment obligation from a learner's chosen curriculum or residence.

## 6. Resource rights and licensing

A resource being visible on a website does not mean PacEdu may copy, host, translate, narrate, adapt or distribute it.

Every catalogue item must record:
- stable resource ID, version, title and creator/rights holder;
- resource type and available formats;
- rights category: PacEdu-owned, verified public domain, open licence, licensed/permission granted, or external link only;
- licence/permission evidence, permitted territories, languages, formats, term and attribution requirements;
- source URL, source access date and evidence reference;
- whether streaming, download, offline caching, narration, captions, translation or adaptation are permitted;
- publication/review/expiry dates and withdrawal process.

Use external-link-only access when PacEdu has permission to link but not to host or reproduce. Do not scrape books, videos, audio, school textbooks, exam papers or paid learning content. Keep expired, disputed or withdrawn resources unavailable until reviewed.

## 7. Educational quality, age suitability and country coverage

Each item should have:
- fiction/non-fiction classification;
- subject/topic tags;
- language and available translation status;
- recommended age band and reading/listening level;
- country/cultural context where relevant;
- supplementary or officially authorised curriculum label;
- learning purpose and short summary;
- educator review status and reviewer audit details;
- content suitability notes and accessibility metadata.

Do not label a resource as officially aligned to a national curriculum unless an authorised reviewer verifies the exact source and jurisdiction. Respect cultural ownership, Indigenous knowledge protocols and any community permissions required for stories, recordings or images.

## 8. Accessibility and learner protection

Support, as applicable:
- readable text, adjustable font and spacing, high contrast and screen-reader labels;
- keyboard, switch and assistive-technology navigation;
- audio controls with visible text alternatives;
- captions and transcripts for video/audio where available;
- descriptive image text and accessible book navigation;
- low-bandwidth playback and clear download/offline availability only when the licence permits it.

Do not claim DeafBlind compatibility without testing with the relevant assistive technologies and users. Do not autoplay audio/video. Keep learner progress private and do not expose reading history to other learners. Collect only the progress data needed to resume a resource and provide the stated service.

## 9. Progress and continuity

When identity and secure storage are implemented, allow a learner to:
- bookmark a book or resource;
- resume at the last saved page, chapter or playback position;
- keep a personal saved list;
- choose preferred language and accessible format;
- remove an item from their saved list and request deletion of their reading history subject to applicable retention rules.

Save progress only to the authenticated learner's account using server-side authorisation. Shared-device sign-out must prevent the next learner from seeing the previous learner's saved items or history. Offline progress sync must handle conflicts safely and must not claim cross-device continuity until tested.

## 10. Owner and country administration

The Owner may review global catalogue totals, rights status, usage aggregates, licence expiry and content complaints. Country administrators may manage only resources and review queues within their authorised country scope. Do not expose individual children's reading histories in aggregate dashboards.

Provide an auditable workflow for adding, reviewing, approving, restricting, suspending and withdrawing resources. Rights review and educator review are separate approvals.

## 11. Minimum release gates

Before implementation or release:
- verified authentication and server-side paid-entitlement checks exist;
- subscription and country-sponsored access rules are defined and legally reviewed;
- catalogue and media delivery enforce resource licence, territory, age and plan restrictions;
- protected media cannot be retrieved through guessed or unauthorised direct URLs;
- tests cover free, paid, expired, suspended, sponsored, child/guardian and country-restricted accounts;
- tests cover read/listen/watch availability, resume progress, shared-device privacy and offline behaviour;
- copyright, privacy, child-safety, accessibility and country-specific legal review is complete;
- Android usability testing confirms the page is simple for young learners and assistive technology users.

## 12. Explicit non-changes

This specification does not create or upload books, audio or videos; grant copyright permissions; activate a paid subscription; change prices; add a page to the live app; alter Firebase Authentication, Firestore, Storage, IAM, payment records or user entitlements; or deploy an APK/site. Implementation requires a separate reviewed change after identity, authorisation and licensing gates are met.
