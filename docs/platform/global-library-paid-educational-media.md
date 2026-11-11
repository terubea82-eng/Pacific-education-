# PacEdu Global Library — Paid Educational Reading, Listening and Video Collection

**Status:** staging product specification only  
**Proposed page:** separate page named **Global Library**  
**Audience:** users with an active, verified paid-library entitlement  
**Implementation status:** not yet connected to the app, authentication, content storage or payment services

## 1. Product recommendation

Create a separate, easy-to-use **PacEdu Global Library** for educational fiction and non-fiction. It should let an entitled user choose how to learn:

- **READ** — books, stories, articles and illustrated learning texts.
- **LISTEN** — audiobooks, narrated stories, spoken articles and educational audio.
- **WATCH** — educational videos, documentaries, demonstrations and animated explainers.

Keep this page separate from Teacher Workspace, daily student activities, tests and the existing free learning library. A simple Library entry may be shown in the main learner home page, but the full collection opens on its own page.

The Global Library is a supplementary learning and enrichment service. It must not be presented as a replacement for a country's official curriculum, school textbook or teacher instruction.

## 2. Simple learner experience

Use a calm, uncluttered layout with large touch targets and short labels. Avoid a complex menu.

Recommended page order:

1. Page heading: **PacEdu Global Library**.
2. One-line instruction: **Choose what you want to read, listen to or watch.**
3. Three large actions: **Read**, **Listen**, **Watch**.
4. Two clear collection choices: **Fiction** and **Non-fiction**.
5. Search box: **Search books, topics or authors**.
6. A small set of useful shelves: **Continue Learning**, **Popular**, **New**, **By Subject**, **By Country**, **By Language**, **For My Level**.
7. Resource cards with cover/thumbnail, title, author/creator, language, level/age guidance, format and a clear action.
8. A simple **My Library** area for saved items, bookmarks and progress.

Do not show every filter at once. Put optional filters behind one clearly labelled **Filter** control. Keep the learner's last-used mode and reading position when safely available.

## 3. Fiction and non-fiction collections

### Fiction

Educational fiction may include:
- age-appropriate short stories, novels and chapter books;
- stories about friendship, problem-solving, courage, empathy and community;
- historical fiction clearly labelled as fictionalised;
- science, nature, technology and environmental adventure stories;
- culturally respectful stories from Fiji and other countries;
- graded readers for emerging, developing and confident readers.

A story may teach values or introduce ideas, but do not label fictional events as historical or scientific facts. Add a short note where a story contains fictionalised history or invented science.

### Non-fiction

Educational non-fiction may include:
- science, nature, health and environment;
- history, geography and social studies;
- biographies and life stories;
- mathematics and practical problem-solving;
- technology, agriculture and financial literacy;
- languages, dictionaries and reference guides;
- arts, culture and heritage;
- study skills, careers and general knowledge.

Clearly identify factual sources, publication dates and review dates for content where facts can change.

## 4. Browsing and matching

Allow browsing by:
- Fiction / Non-fiction;
- Read / Listen / Watch;
- country or curriculum jurisdiction;
- subject and topic;
- language;
- age band and learning level;
- author/creator;
- duration or book length;
- accessibility features.

A user may explore resources from other countries. Show the country/curriculum label and mark them **Supplementary learning** unless the relevant authority has formally authorised them for official use.

Recommendations should be based on chosen interests and learning level, not sensitive profiling. Do not infer a child's ability or diagnose a learning need from library activity.

## 5. Read, listen and watch controls

### Reading
- readable page layout, scalable text and adjustable spacing;
- clear chapter/page navigation and progress;
- bookmarks and a **Continue reading** action;
- optional text-to-speech where available and properly tested;
- no forced auto-advance.

### Listening
- large Play/Pause, Stop, Back 10 seconds and Forward 10 seconds controls;
- visible title, chapter/track and playback position;
- adjustable playback speed and volume;
- transcript or readable text when available;
- remember playback position for the same authorised account.

### Watching
- large Play/Pause and full-screen controls;
- captions/subtitles and transcript where available;
- clear video duration and language;
- playback quality choices where supported by the player;
- no autoplay with sound and no unrelated advertisements.

For every format, provide an obvious way to return to the library. Controls must work with keyboard, screen reader, switch access and touch. Do not claim full DeafBlind compatibility until tested with the relevant assistive technologies and users.

## 6. Paid access and child safeguards

- The Global Library page may be browsed as a locked preview, but full premium content is available only after a trusted server confirms an active `paid_library` entitlement for the signed-in account.
- Never unlock paid content using a client-side flag, URL parameter, local storage value or user-editable role.
- Do not make a child enter payment details. A parent, guardian, school or other authorised payer must approve purchases where required.
- Show the payer the price, currency, billing period, renewal, cancellation and covered users before consent.
- No silent conversion from free access to paid access, no misleading countdowns and no pressure during lessons.
- When a paid entitlement expires or payment is not confirmed, stop new premium access according to the published agreement, but preserve bookmarks and progress for the retention period and retain access to the separate free library.
- If the account has more than one country curriculum, library access and billing country remain separate. Selecting a country's books must not create a country-government payment obligation.
- Country licensing restrictions must be enforced independently of the user's billing country.

## 7. Content rights and approval

Every item must have a verified legal basis for the specific use: PacEdu-owned, public domain verified for the relevant jurisdiction, open licence with conditions recorded, or written permission from the rights holder. A publicly accessible web page or video is not automatically licensed for PacEdu to copy, host, translate, adapt, stream or sell access to.

Store at least:
- stable resource ID and version;
- title, description, author/creator and publisher/rights holder;
- fiction/non-fiction classification and educational subject;
- media type (text, audio, video) and language;
- age band, level and content advisory;
- country/curriculum labels and permitted territories;
- source URL, licence/permission evidence, attribution and restrictions;
- publication date, review date and expiry date;
- transcript/caption and accessibility availability;
- review state, reviewer, approval date and audit history.

Use the review sequence:
`DRAFT` → `PENDING_RIGHTS_REVIEW` → `PENDING_EDUCATOR_REVIEW` → `APPROVED_PAID`.

Also support `APPROVED_FREE`, `APPROVED_RESTRICTED`, `EXPIRED_REVIEW`, `SUSPENDED` and `WITHDRAWN`. Both rights clearance and educational/age-suitability review are required. A resource with missing rights evidence must not be published.

## 8. Content quality and child safety

- Use reputable educational publishers, authors, public institutions and properly licensed creators.
- Review factual accuracy, age suitability, language quality, cultural respect and accessibility.
- Label opinions, fictional stories, historical interpretation and established facts distinctly.
- Exclude non-educational entertainment, gambling promotion, adult content, extremist recruitment, dangerous instructions and deceptive material.
- Do not expose children to user-generated public comments, direct messages or unmoderated uploads.
- Provide report-content and copyright complaint actions; suspend credible safety/rights complaints while reviewed.
- Keep a versioned record of approvals, corrections, complaints and withdrawals.
- Do not insert commercial ads into books, audio or videos.

## 9. Owner and country administration

The PacEdu Owner should manage global catalogue governance, rights status, paid/free classification, quality controls and aggregate usage reports. Country administrators may manage only the content and review tasks within their authorised country scope. Country administrators must not see global user totals or unrelated country financial data.

Useful aggregate measures:
- catalogue counts by fiction/non-fiction, format, language, subject and level;
- approved, pending, expired, restricted and withdrawn items;
- licensed territories and licence expiry alerts;
- accessibility coverage;
- aggregated reads/listens/watches and completion measures.

Avoid exposing identifiable child reading histories in general reports. Restrict individual progress to the user and authorised roles with a legitimate educational need.

## 10. Recommended phased delivery

**Phase 1 — Catalogue foundation:** define the resource record, rights evidence, content review workflow and approved starter collection.

**Phase 2 — Separate page:** build the simple Global Library page with Read/Listen/Watch, Fiction/Non-fiction, search, resource cards and My Library.

**Phase 3 — Media experiences:** add accessible reader, audio player and captioned video player, with safe progress/bookmark handling.

**Phase 4 — Paid entitlement:** connect the page to verified server-side paid-library entitlement and guardian/payer approval. Test expiry, refunds, country restrictions and account recovery.

**Phase 5 — Quality and scale:** expand country/language collections only as rights and educational reviews are completed; monitor accessibility, content complaints and licence expiry.

## 11. Acceptance tests before release

- Free user can still use the separate free library and cannot fetch premium content directly.
- Active paid user can open the Global Library and use only resources allowed for their account and territory.
- Expired, suspended or unauthorised account cannot access premium media through a direct file URL or API call.
- Fiction and non-fiction filters return correctly classified resources.
- Read, listen and watch controls work on supported Android browsers and devices.
- Reading position, audio position and bookmarks recover safely for the correct account.
- Captions/transcripts, screen-reader labels, scalable text and keyboard/switch navigation are tested.
- Age restrictions, country licensing and language filters are enforced server-side.
- Copyright complaint, expiry, suspension and withdrawal remove content from discovery and protected delivery.
- Child accounts cannot purchase or change paid entitlements themselves where guardian approval is required.
- No learning session is interrupted by advertising or coercive upgrade prompts.

## 12. Explicit non-changes

This document is a proposal only. It does not create the page, upload or license books, copy external videos, add a media player, create a paid entitlement, charge users, change registration, modify Firebase/Auth/Storage/payment settings, or deploy the application. Those steps require separate implementation, legal review, security review and approval.
