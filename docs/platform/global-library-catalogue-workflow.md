# PacEdu Global Library Catalogue — Data Dictionary and Workflow

**Status:** staging specification and schema only. No live catalogue, media, user entitlement or runtime page is created.

## Purpose

Use one consistent catalogue record for every educational fiction and non-fiction item, whether the learner reads it, listens to it, watches it or uses an approved interactive resource. The machine-readable contract is `global-library-resource.schema.json`.

## Catalogue organisation

- **Collections:** Fiction and Non-fiction.
- **Formats:** Read, Listen, Watch and, only where educational and accessible, Interactive.
- **Resource types:** book, short read, audiobook, audio lesson, educational video and interactive resource.
- **Subjects/topics:** controlled values should be maintained by authorised catalogue administrators; avoid uncontrolled duplicates and spelling variants.
- **Language:** store a language code consistently (recommended BCP 47, such as `en`, `fj`, `hi` or `ur`).

## Required approval before publication

A resource can be published only when all these checks are satisfied:

1. **Rights:** exact evidence is recorded; the licence permits the intended use and territories; expiry/review dates are set where applicable.
2. **Educational review:** purpose, factual accuracy, age/level suitability and educational value are reviewed.
3. **Safety review:** child suitability, privacy, external links, embedded media and content advisories are checked.
4. **Accessibility:** format-specific accessibility information is truthful; do not claim captions, transcripts, screen-reader support or offline use unless tested.
5. **Availability:** free/paid/sponsored access and country restrictions are explicit and consistent with the rights evidence.
6. **Curriculum mapping:** use `supplementary` unless a qualified authorised reviewer has verified the exact curriculum, version, level, subject and objective.

The rights status, educational status and safety status are independent. A resource must not be published if any required review is pending, rejected, restricted, disputed or expired.

## Access control rules

- Catalogue visibility is not the same as permission to open or download a resource.
- Enforce every protected resource and media request on a trusted server.
- Determine access from verified identity plus active free, paid or sponsor entitlement, and then apply country, age and rights restrictions.
- Never trust a browser flag, local storage, query parameter or hidden UI control as proof of payment or sponsorship.
- A preview is available only if the rights evidence permits it.
- Do not expose a direct storage URL or reusable media token to unauthorised users.
- When a paid entitlement expires, retain access to resources explicitly marked free and follow the published data-retention policy for bookmarks and progress.

## Daily learning recommendations

Use the optional `dailyLearningLinks[]` to associate a resource with a specific approved activity. Recommendations should match learner level, subject, language, accessibility needs and objective. They supplement, but never replace, the daily activity or teacher instruction. The learner must always be able to skip a recommendation and continue the activity.

Do not mark a resource as curriculum-aligned merely because its subject is similar. The curriculum mapping must have status `verified` and include reviewer evidence. A resource linked to a daily activity must not automatically produce a test mark or count as proof of mastery.

## Learner progress and privacy

Store only necessary learner-selected bookmarks and resume position, under the learner's verified account and with role-scoped access. On shared devices, isolate each account's state and clear private display state on sign-out. Viewing time or completion is not a learning outcome. Do not use children's reading/listening/viewing history for advertising or unrelated profiling.

## Lifecycle and audit

Recommended workflow:

`draft → pending_review → published → quarantined / withdrawn / expired`

- Record who created, reviewed, approved, changed, quarantined or withdrew each item.
- Keep immutable version history and reason for material changes.
- Recheck external links, rights expiry and content advisories on a defined schedule.
- Provide a report action for learner, guardian and teacher.
- Quarantine promptly where a credible safety, rights or privacy complaint needs investigation.
- Never silently replace a resource with a different edition or altered media.

## Bulk import

Before accepting a bulk catalogue import:
- validate every row against the schema;
- reject missing rights evidence and missing review states;
- detect duplicate titles/creators/editions and likely duplicate media hashes;
- scan media files and external destinations;
- require human review before publication;
- retain the import batch ID and a row-level error report.

## Explicit non-goals

This schema and guide do not import books, copy third-party content, create storage objects, stream media, grant subscriptions, process payments, create user accounts, or alter Firebase/production services.
