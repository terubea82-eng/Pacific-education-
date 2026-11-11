# Global Library — Daily Learner Support and Safe Integration

**Status:** staging specification only. This document does not activate a runtime library, upload media, grant paid access, or change Firebase/payment services.

## Purpose

The PacEdu Global Learning Library should strengthen everyday learning, not become a disconnected entertainment catalogue. Learners should be able to use a relevant book, audio resource or educational video to understand, practise, revise and extend the same learning they are doing in their daily activities.

The library contains only educational fiction and non-fiction. General entertainment, unrelated social video, gambling, advertising content and unreviewed user uploads are out of scope.

## Daily learning connection

For each published daily activity, the platform may recommend a small set of library resources that match:

- learner's selected country and curriculum pathway;
- class/level, age suitability and reading/accessibility level;
- subject, approved learning objective and current topic;
- language preference and available format;
- prerequisite knowledge and the learner's next learning step.

Recommendations are supporting resources, not substitutes for the approved daily activity, teacher instruction, curriculum source or assessment. A resource must not be labelled as curriculum-aligned until an authorised educator has verified the mapping.

### Suggested daily learner sequence

1. **Learn:** open the daily activity and see its learning objective.
2. **Explore:** choose one short recommended Read, Listen or Watch resource.
3. **Practise:** return to the matching daily activity and attempt the questions.
4. **Reflect:** optionally save a note, bookmark or learner reflection.
5. **Continue:** resume the activity and resource at the last safely saved position where technically supported.

Do not force learners to consume library media before they can attempt a daily activity. Offer a clear **Skip resource and continue** action.

## Library page layout

Keep the library on its own page, separate from the Teacher Workspace and daily activity page. Use a short, consistent layout:

- Page title: **Global Learning Library**
- Two collection choices: **Fiction** and **Non-fiction**
- Three format choices: **Read**, **Listen**, **Watch**
- Search by title, author/creator, subject or topic
- Simple filters: country/curriculum label, language, age/level, subject and format
- Sections: **Recommended for today's learning**, **Continue learning**, **Saved items**, **Browse all**
- Each resource card shows title, creator, format, language, level/age guidance, duration or reading estimate, rights/access label and review status.

On small Android screens, use one-column cards, large touch targets, plain labels and no crowded menus. Keep the learner's current activity easy to return to.

## Resource selection and quality

Each resource must pass both rights review and educational/safety review before publication. Record at minimum:

- stable resource ID, title, creator/author and publisher where known;
- fiction or non-fiction classification, subject/topic and short educational purpose;
- format, language, transcript/captions where applicable and accessibility features;
- age/level guidance and content advisory where needed;
- country/jurisdiction availability and curriculum mapping status;
- source URL or stored-file provenance, rights category, licence/permission evidence, permitted territories, formats and expiry/review date;
- reviewer, approval date, version, publication state and takedown contact/process.

Publicly viewable content is not automatically free to copy, stream, translate, download or redistribute. Use PacEdu-owned content, public-domain works whose status is verified in the relevant jurisdiction, appropriately licensed content, or links/embeds explicitly permitted by the rights holder. Respect licence attribution and restrictions.

## Paid and free access

- A verified paid-library entitlement or valid school/country sponsorship may unlock the resources included in that plan/agreement.
- Free users retain access to resources explicitly designated free. A free preview is allowed only when the rights holder's terms permit it.
- Never use a client-side flag, hidden button, local storage value or editable browser data as proof of payment.
- Check entitlements on a trusted server for each protected resource and each protected download/stream URL.
- A paid plan must describe included formats, countries, languages, download/offline rights, limits, billing period and renewal/cancellation terms before purchase.
- For children, purchase and renewal require the appropriate guardian or authorised payer consent. Do not display pressure prompts, countdowns or repeated upgrade interruptions in learning activities.
- If a paid entitlement expires or cannot be verified, explain the status calmly and preserve access to eligible free resources and the learner's existing records under the published retention policy.

## Daily progress and privacy

Track only what is needed to provide the requested learning service, such as resource opened, last position, completion if meaningful, bookmarks and learner-selected feedback. Do not treat opening or watching a resource as proof of learning or award assessment marks automatically.

Do not share an individual child's reading, listening or viewing history with advertisers or unrelated third parties. Show personal progress only to the learner and appropriately authorised guardians/teachers under clear role permissions. Owner reporting should be aggregated and privacy-protective.

For shared devices, provide clear sign-out and account switching. Never expose one learner's bookmarks or resume position to another learner.

## Accessibility and low-connectivity support

- Provide readable text, adjustable text size and good contrast.
- Provide audio controls with play/pause, seek, speed where available, and a visible stop control.
- Provide captions and transcripts for video/audio when available or required.
- Ensure screen-reader labels, keyboard access and logical focus order.
- Do not make colour, sound or video the only way to understand instructions.
- Where rights and device capacity permit, offer an explicit download for offline use; show download size and storage requirements.
- Save progress safely and resume after interruption where supported. Explain when a resource is streaming-only or cannot be saved offline.
- Do not promise offline availability unless the content is actually stored and usable offline.

## Teacher and curriculum safeguards

Teachers may recommend or assign resources only within their authorised classes and roles. They may flag a resource as useful or report a mismatch; they cannot approve copyright status or official curriculum mapping unless separately authorised to do so.

Supplementary resources for another country's curriculum must be labelled **Supplementary learning — not official enrolment or assessment**. Official curriculum mappings require the correct authority, framework version, level, subject, source evidence and review approval. Keep each country's curriculum and assessment records separate.

## Moderation, expiry and takedown

Provide a learner/guardian/teacher report action. Quarantine a reported resource for review when a credible child-safety, rights or harmful-content concern is raised. Record the report, reviewer, decision and action. Remove or restrict expired, withdrawn, geographically restricted or rights-disputed resources promptly, while retaining an audit record. Broken external links should be flagged and periodically rechecked.

## Release gates

Before learner-facing release, verify:

1. the separate page works on supported Android browsers and small screens;
2. catalogue search and filters return only approved resources;
3. all resource rights and territory permissions are recorded;
4. age suitability, educational quality and country labels are reviewed;
5. paid access is checked server-side and free resources remain accessible;
6. guardian/payer consent, cancellation and entitlement expiry are tested;
7. learner progress is private, correctly separated on shared devices and recoverable as described;
8. audio, captions, transcripts, screen-reader controls and low-connectivity behaviour are tested;
9. teachers cannot assign or expose resources outside their authorised classes;
10. reporting, takedown, expiry and audit processes work.

## Explicit non-goals for this staging document

No library page, media catalogue, audio/video player, content upload, external embed, subscription, payment, Firebase rule, entitlement service, learner tracking, or production deployment is implemented or activated by this document.
