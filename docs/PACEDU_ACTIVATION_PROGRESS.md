# Pacific Education (Pacedu) — Activation Progress and Verification Rules

Last updated: 2026-10-09 UTC
Repository: https://github.com/terubea82-eng/Pacific-education-
Pilot page: https://terubea82-eng.github.io/Pacific-education-/src/index.html

## Mandatory working rule

Do not guess that a Pacedu feature works because its label, HTML ID, CSS rule, or JavaScript file exists. Every change must be traced from the real HTML element through the responsible JavaScript handler and target, tested in CI, then checked on the deployed page and supported devices before being marked complete.

## Unified ChatGPT command-to-activation model

The product goal is one plain-language command in the Pacedu ChatGPT conversation that starts one coordinated change workflow across every relevant connected development surface. Example: “PACEDU ACTIVATE: connect every Back and Next button across all pages, website, Android and computers; preserve #856 voice.”

Treat each instruction as a **change request**, not as proof that execution has already happened.

1. **Interpret:** Extract the requested action (activate, change, add, repair, verify, or delete), target feature, affected platforms, and locked constraints.
2. **Resolve:** Read the latest repository source and current commit. Identify the responsible HTML, CSS, JavaScript, feature engines, tests, and workflows. Do not guess paths or edit stale versions.
3. **Plan:** Build a scoped change list and identify dependencies and regression risks. Reuse shared controller/feature logic where appropriate rather than making platform-specific duplicate behaviour.
4. **Protect:** Preserve the installed and user-confirmed #856 voice system, registration protections, pilot/payment boundaries, and unrelated working features. For destructive code or data deletion, identify the exact target and preview the effect; require explicit confirmation when the target or consequences are ambiguous or irreversible.
5. **Change:** Use authenticated GitHub/repository tools to commit only the scoped changes when those tools and permissions are available. If a required external builder, app, credential, or permission is unavailable, report that dependency instead of claiming it was updated.
6. **Test:** Add or update regression tests; run relevant source, behaviour, security, build and preservation checks through GitHub Actions. A green build alone is not behavioural proof.
7. **Deploy/build:** Deploy the web version and produce an Android artifact only through the relevant workflows, and associate results with the exact commit SHA. Existing installed APKs do not update just because Pages deploys.
8. **Verify:** Record separately whether source inspection, automated tests, deployment, APK creation, real-phone testing, computer/browser testing, and feature-behaviour testing are complete.
9. **Report:** Return the commit, changed files, check statuses, deployment/APK links when verified, remaining failures, and the next required user action. Never say “active everywhere” if any required platform or behaviour remains unverified.

### Command meanings

- **Activate / repair / connect:** implement the requested behaviour, wire it to the correct shared controller and UI, test, and deploy/build when possible.
- **Add / update:** make a scoped source change, preserve unrelated working behaviour, and test it.
- **Delete / remove:** identify exactly what will be removed; do not silently delete ambiguous, shared, protected, or user data. Confirm before irreversible or broad destructive actions.
- **Check / verify:** inspect current source and evidence without claiming unperformed changes.
- **Release:** verify the exact commit's CI, deployment and APK artifact before presenting it as ready.

### Cross-platform truth rule

“Every platform” means every relevant platform that is actually wired to the workflow. The website, Android APK, and computer browser may share source requirements but have distinct deployment/runtime checks. GitHub Actions can run automated tests and builds; it cannot prove every physical phone or computer works without real-device/browser evidence. External building apps are not automatically connected simply because they are mentioned in a ChatGPT message: each needs an authenticated integration or repository workflow.

## Locked requirements

- Keep the installed and user-confirmed #856 voice behaviour protected. Do not replace the voice engine during navigation repairs.
- AI Playback is a two-person conversation about Pacific Education's purpose and importance, not only single-voice text-to-speech.
- Keep the agreed Welcome → Vision → Rules → Registration → learning selectors → daily activity → practice → assessment → coverage → teacher/review/workspace flow.
- Keep Next and Back controls connected to actual page IDs. Keep the active-page-only flow and the user's agreed visual/accessibility rules.
- Math, English, and Phonics activities must be verified by behaviour, not just by element presence.
- Preserve accessibility controls, voice navigation, progress and review functions, role workspaces, offline-first behaviour, and app-scoped tunnel design.
- Buy Plans remains a front-page notice only during the controlled pilot. Do not unlock real payments or production without the agreed verification and Owner approval.
- Requirements in the conversation contract are authoritative for product behaviour; this document tracks verification progress. Neither file is a complete transcript of ChatGPT conversations.

## Source-of-truth files

- `src/index.html`: HTML IDs, CSS, script references, page shell, responsive rules.
- `src/js/pacificEducationSingleNavigationController.js`: one-page-at-a-time navigation, Next/Back and feature wiring audit.
- `src/js/pacificEducationConversationContract.js`: structured locked requirements and runtime ID audit.
- `src/js/pacificEducation856BoxActivation.js`: #856-compatible user-box activation and ordinary pilot-link repair.
- `src/js/pacificEducationSpeechVoice.js`: protected voice engine; do not casually rewrite.
- `tests/controller-navigation-wiring.test.js`: source-alignment regression tests.
- `.github/workflows/pilot-preflight.yml`: runs the controller wiring regression test.
- `.github/workflows/deploy-pilot-pages.yml` and `.github/workflows/pacedu-feature-preservation.yml`: source/script wiring and protected-feature checks.

## Verification states — never combine these

1. **Source checked**: expected IDs, script references and handlers were inspected in the repository.
2. **Automated checks passed**: relevant GitHub Actions and regression tests passed for the exact commit SHA.
3. **Deployed**: GitHub Pages deployment succeeded for that exact SHA.
4. **Device-tested**: the actual live flow was tapped through on a named phone/browser and/or computer/browser.
5. **Feature behaviour verified**: the real action succeeded, such as registration save, Math/English/Phonics activity completion, assessment progression, voice playback, or sign-out.

An element-presence audit is not a behavioural test. CI success is not proof that every phone or computer works. Do not state “all features active” until relevant behavioural tests are recorded.

## Current progress record (2026-10-09)

- Source inspected: main HTML includes the single navigation controller, conversation contract, #856 voice engine, and many separate feature engines.
- Controller source corrected in commit `ca759ccc4e6e065f39c932ff663ae4a9b17f3068`: removed the stale Welcome entry from the guided STEPS map and removed the duplicate Coverage Next mapping; dedicated gateway and coverage handlers remain.
- Added `tests/controller-navigation-wiring.test.js` in commit `d94db052897abefd5fe96b57febf43235846b974`.
- Added the test to `npm test` in commit `97baa3bb39d2f5da45d64ddcdf6a4160a557fcc6`.
- Refreshed the controller cache reference in commit `a6d0289098fa67047ebfd8c8783e1a0a31ce2d09`.
- Added the test to mandatory pilot preflight in commit `841cc5c48c34f412ae17ac357a466ac6a0082d2b`.
- Earlier exact revision `a6d0289098fa67047ebfd8c8783e1a0a31ce2d09`: Android Pilot Build, Pages deployment, protected voice lock, pilot preflight/recheck, feature preservation, prototype validation, user readiness, CodeQL and mandatory change audit were reported successful by GitHub Actions.
- Latest revision `841cc5c48c34f412ae17ac357a466ac6a0082d2b`: new CI runs were queued when this document was written; final outcomes must be checked before calling the latest revision verified.
- Actual on-device click-through for all steps and features: **not yet evidenced by this record**.
- Added the unified command-to-activation model in this document. This records the intended process; it does not by itself connect external apps or make every future ChatGPT message execute automatically.

## Required checklist for every future change

- [ ] Read the current source and latest commit before editing.
- [ ] Identify the exact UI element, handler, target ID and feature owner.
- [ ] Check all navigation and feature links affected by the change.
- [ ] Add or update a regression test for the specific failure.
- [ ] Keep the #856 voice engine and pilot/payment boundaries protected unless the Owner explicitly authorizes a scoped change.
- [ ] Update cache-busting references when a loaded JavaScript file changes.
- [ ] Run relevant tests and inspect GitHub Actions for the exact commit SHA.
- [ ] Confirm Pages deployment and, when an APK is involved, the Android build artifact for that SHA.
- [ ] Test the actual live page on the target phone; test a computer/browser separately when claiming computer support.
- [ ] Record evidence, failures, unresolved items, and next action here.
- [ ] Never call a feature “active” based only on source presence or successful compilation.
