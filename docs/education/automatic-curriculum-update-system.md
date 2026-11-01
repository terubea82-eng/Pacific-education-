# PacEdu Automatic Curriculum Update System — implementation and release contract

**Status:** implementation scaffold committed to the proposal branch; not yet merged/deployed. The current app's live content still needs a verified, approved student-ready pack for each class/subject and country before it can switch to that pack.

## What is now implemented on this branch

- A country-specific active curriculum manifest at `src/data/curriculum/active-frameworks.json`. Fiji is locked to the currently working 2013 Fiji National Curriculum Framework baseline until an authorised replacement is formally in force. The manifest does not pretend its outcome mappings are complete.
- A browser runtime loaded by `src/index.html`. It fetches the manifest on startup, when the app returns to focus, and when the page becomes visible. It resolves the selected country, publishes `window.PacEduActiveCurriculum`, emits curriculum lifecycle events, and shows a compact current-framework status line in the teacher workspace.
- A worksheet safety guard. Non-Fiji content is not silently substituted with Fiji worksheets. A new framework without a matching approved pack pauses the affected worksheet and asks for curriculum mapping/approval rather than using stale content.
- `automation/curriculum_pack_generator.py` generates a versioned draft sequence from source records that contain exact, verified official outcomes. It adds a five-day learning sequence, four ability pathways, retrieval/revision points and a practice-assessment/marking-rubric scaffold. It does not invent official outcomes or claim to produce a complete exam paper.
- A regeneration workflow runs when outcome mapping inputs change on `main`, then commits generated draft packs. Draft packs are not student-ready and cannot be activated automatically.
- An activation script and scheduled workflow process a reviewed release record only when its official effective date has arrived. They require a distinct reviewer and approver, an allowlisted official notice, a school/national adoption status, and a matching student-ready content pack. Successful activation updates the manifest; the existing Pages deployment workflow then publishes the manifest, and the app reads it at runtime.
- Validation checks run before the Pages deployment workflow proceeds.

## End-to-end flow

1. The daily source monitor fingerprints allowlisted official sources and opens a review issue when a page changes or cannot be checked. A page hash is a lead, not proof of a framework change.
2. A curriculum reviewer verifies the official notice, new framework/version, effective date, official subject syllabuses, outcome IDs/text/source pages and school adoption requirements.
3. Verified outcome mappings are added to `automation/curriculum-outcomes/` as JSON input records.
4. The regeneration workflow creates draft learning/revision/assessment scaffolds in `src/data/curriculum/generated/<country>/<version>/`.
5. Curriculum specialists write and review the actual questions, answers, accessibility adaptations and marking rubrics. The complete pack must include version-matched `dailyLessons`, each explicitly `approvedForStudents`, and `studentReady: true` only after approval.
6. A release record is placed under `automation/curriculum-releases/` in a reviewed PR. The reviewer and approver must be different people. It must cite an official source and a real effective date.
7. The scheduled activation workflow activates the record only after that date, updates the manifest and pushes a manifest commit. Pages deployment then updates the live site. The browser rechecks the manifest and loads only a matching, approved pack.
8. Previous framework versions and student evidence remain in history; activation must never rewrite historical marks or silently replace an already-assigned assessment.

## Release-record and pack rules

- Example release-record template: `automation/examples/curriculum-framework-release.example.json`.
- Example outcome mapping input: `automation/examples/curriculum-outcome-input.example.json`.
- Do not copy either example into the active release folder without replacing every placeholder and completing review.
- A draft generator output is deliberately not enough to switch the live app. The approved pack must contain complete daily lesson records with questions, answer keys, marking criteria, class, subject, term, week, day, ability band and exact framework version.
- Each non-Fiji country must have its own official source allowlist, framework version, adopted subject list, syllabus mappings, calendar and approved pack. If no profile or pack exists, the app blocks that country's worksheet rather than borrowing Fiji content.
- The app's current older Fiji activity libraries are still available for the locked 2013 baseline, labelled as drafts where their outcomes are not verified. This work does not retroactively make every existing worksheet officially aligned.

## Known limitations before claiming the feature is production-ready

- The current source monitor detects webpage fingerprint changes, not the legal meaning of a publication. Human verification of an official commencement notice remains necessary.
- Only Fiji is configured in the starter active manifest. Additional countries must be onboarded with official sources and curriculum mappings before enabling them.
- The generator creates scaffolds, not fully authored and quality-assured worksheets/exams for every class. Curriculum specialists must complete and approve content.
- The auto-activation workflow has not run against a real new-framework release because no such verified release record and approved pack has been supplied.
- The change is on PR #306's proposal branch. It becomes live only after review, merge to `main`, successful validation and successful GitHub Pages deployment.

## Required tests

- Python syntax checks for monitor, generator and activation script.
- Registry and active manifest schema checks.
- Generator test: verified outcomes create draft-only output with four ability pathways, revision and assessment scaffold.
- Generator rejects outcomes without exact source and verification status.
- Runtime guard test: no Fiji content leaks into another country and no old-framework content appears after a new version is selected without a matching approved pack.
- Activation test: no release record means no change; future effective date does not activate; invalid source host, same reviewer/approver, missing pack or mismatched country/version is rejected; valid effective release updates only the active manifest and retains framework history.
- Browser smoke test on the Pages deployment for country selection, teacher status line, matching pack load, offline/fetch failure and stale content blocking.
