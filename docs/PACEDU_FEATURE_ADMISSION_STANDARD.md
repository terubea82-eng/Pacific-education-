# Pacedu Feature Admission and Release Standard

**Status:** Mandatory development control for the controlled pilot. This standard does not authorize production release.

## Non-negotiable rule

A feature is not admitted to main, the published Pages pilot, or an installable pilot build merely because its code was written or an APK compiled. It must pass applicable automated gates, preserve unrelated working features, and carry a traceable test result. No process guarantees zero defects; this standard makes failures more detectable and prevents known failures from being waved through.

## Required path for every feature

1. Record the user-visible problem, expected behaviour, affected files, and rollback plan in a GitHub issue or pull request.
2. Make the smallest focused change. Do not mix navigation, speech, VPN, registration, security, and unrelated feature rewrites in one change.
3. Add a regression test that fails before the fix and passes after it. Include a negative/failure-path test, not only a happy path.
4. Open a pull request against main. Do not treat a local edit, successful command-router response, or APK artifact as approval.
5. Require the Pacedu Feature Admission Gate, Cross-Device Browser Tests, Feature Preservation Gate, and Pilot Preflight to pass where applicable. Any red, skipped, missing, or inconclusive required check means do not merge.
6. For Android changes, review the debug APK build result and test artifact. Signed release publication is a separate, owner-controlled operation.
7. After merge, verify the exact main commit was deployed to GitHub Pages. Check cache/version updates when changing cached assets.
8. Run the physical-device checklist for any change affecting WebView startup, navigation, touch, accessibility, storage, offline/network behaviour, permissions, VPN, audio, or Android packaging. Attach evidence tied to the exact commit/APK hash. CI/browser tests do not prove physical-device behaviour.
9. If a gate fails, fix the cause on the same PR and rerun checks. Do not disable a failing test or weaken a safety gate merely to obtain green checks.
10. Keep a rollback path: identify the last known-good commit/APK and do not replace a known-good installed build until the candidate has passed its required device checks.

## Required regression coverage

- Startup and first paint: no blank screen; visible recovery if startup fails; no stale overlay.
- Guided flow: Welcome → Vision/Mission/Purpose → Rules & Conditions → Registration; only one guided page visible; Back/Next remain correct.
- Registration handoff: saved country/language/role leads to the correct role workspace; no duplicate/ghost pages.
- Role lifecycle: role-specific workspace, reopen/sign-in, and Sign Out without stale role panels.
- Learning workflow: level/subject/term/capability/lesson/practice/assessment progression does not skip required steps.
- Offline/service worker: cache version changes, query-string assets, offline shell, reconnect, retries, and stale-cache recovery.
- Accessibility and voice: focus/touch target behaviour, reduced motion, page-specific instructions, Stop Speech, and no welcome narration after Page 1.
- Security/pilot boundaries: no real child-sensitive data, no secrets in source, no client-side claim of production authentication/payment approval, Guardian/Technician remain pilot-only.
- Android packaging: expected package identity, build output integrity, and signing verification for a signed release.
- VPN, when implemented: truthful connection status, explicit permission, disconnect/failure handling, scoped routing, and offline learning when disconnected.

## Protected components and change boundaries

- The known-good #856 voice architecture files src/js/pacificEducationMandatoryVoiceNavigation.js and src/js/pacificEducationSpeechVoice.js are protected. Do not modify them in routine feature PRs. A necessary future voice change requires an explicitly scoped owner-approved PR, baseline comparison, targeted tests, and physical audio verification before replacing the known-good APK.
- Keep owner-controlled release/signing secrets out of source, issues, logs, artifacts, and screenshots. Never commit VPN keys, credentials, keystores, or child records.
- Browser role selection and localStorage are prototype conveniences, not authentication or authorization.
- Do not mark current-affairs content approved automatically; teacher review remains a separate control.
- Do not describe a feature as fixed until its relevant evidence exists.

## Merge and release policy

Repository administrators should configure a main branch ruleset to require pull requests and the named status checks, dismiss stale approvals where applicable, block force-push/deletion, and restrict bypass. If repository settings do not enforce required checks, this document alone cannot prevent a direct merge.

GitHub Pages publication, Android build success, physical-device verification, and production approval are separate states. A green workflow does not imply that all four have occurred. Production remains blocked until the existing legal, privacy, child-safeguarding, security, authentication, data, curriculum, accessibility, and independent-review gates are separately satisfied.

## Evidence record

For each release candidate record:
- PR and merge commit
- workflow links and conclusions
- Pages deployment commit and cache/version details
- APK artifact/release URL and SHA-256 when applicable
- device model/Android version, exact test steps, pass/fail, date, and tester
- unresolved defects and rollback decision

Never record passwords, private keys, authentication tokens, or real learner-sensitive data in evidence.
