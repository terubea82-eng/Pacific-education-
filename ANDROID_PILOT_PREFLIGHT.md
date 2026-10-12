# Pacific Education — Controlled Pilot Build Preflight

## Verified repository state
- Main branch is the controlled pilot source.
- GitHub Pages remains the prototype delivery surface.
- Production authorization remains fail-closed.
- Android workflow builds debug APK, unsigned release APK, and unsigned release AAB.
- Signing credentials are intentionally external to the repository.

## Owner / developer links — Page 4 repair and build chain

These links are shortcuts to the actual project surfaces; opening a console is not the same as integrating or configuring a service.

- **Live web pilot:** https://terubea82-eng.github.io/Pacific-education-/src/index.html
- **Source repository:** https://github.com/terubea82-eng/Pacific-education-
- **Page 4 repair PR #73 (draft):** https://github.com/terubea82-eng/Pacific-education-/pull/73
- **GitHub Actions:** https://github.com/terubea82-eng/Pacific-education-/actions
- **Android pilot APK build workflow:** https://github.com/terubea82-eng/Pacific-education-/actions/workflows/android-pilot-build.yml
- **Earlier browser baseline run (17 tests; predates the newest Page 4 wording changes):** https://github.com/terubea82-eng/Pacific-education-/actions/runs/38209070439
- **Firebase project console:** https://console.firebase.google.com/project/pacedu-fe868/overview

The Owner / Technician Technical Workspace in `src/index.html` links to these same surfaces. The Firebase link is only a console shortcut; it does not prove that authentication, database rules, hosting, or backend services are configured or connected to the app.

## Achievable integration and verification order

1. **Repair branch first:** keep Page 4 changes in PR #73; run the browser regression workflow against the latest PR commit. Require passing Page 4 isolation, role selection, save/Next, and page-by-page navigation tests.
2. **Phone confirmation:** install only a verified pilot build or open the pilot URL on the Android phone. Check Page 4, speaker output, Stop Speech, and Next. Browser CI alone cannot verify the physical speaker or device behavior.
3. **Android packaging:** use the Android Pilot Build workflow and inspect the exact run/commit and artifact before installing. Unsigned release artifacts are not ready for store publication.
4. **Firebase integration (separate task):** connect the Firebase service through the authorized account, inspect project `pacedu-fe868`, and inventory Authentication, Firestore/Database, security rules, App Check and environment configuration before changing anything. Add only the minimum required backend wiring in a separate reviewed PR. Do not put service credentials, API secrets, or signing keys in HTML or Git.
5. **Security and data boundary:** use test-only records; do not enter real sensitive child data. Validate least-privilege rules and backend-side authorization before any production data or role-based access is enabled.
6. **Deployment gate:** do not merge or deploy until the latest browser tests pass, phone checks are recorded, feature-preservation/protected-voice gates pass, and the owner explicitly approves. Production remains blocked until privacy, safeguarding, security, curriculum, accessibility, hosting/database and payment requirements are independently addressed.

## Status labels

- **Linked:** a navigable URL is present.
- **Tested:** an identified test run completed on a specified commit.
- **Integrated:** app code is configured to use the service and a functional end-to-end test passed.
- **Production-ready:** all required independent and owner approval gates are complete.

Do not use “integrated” or “production-ready” merely because a service's console link exists.

## Preflight gates
1. Prototype publication: repository/PWA content can be demonstrated, subject to owner-controlled pilot procedures.
2. Android packaging: workflow configuration is present; CI result must be checked from GitHub Actions before treating an artifact as build-verified.
3. Curriculum: official Fiji curriculum evidence is required before any curriculum record is represented as verified or production-approved.
4. Test matrix: local prototype evidence may be recorded, but evidence is not equivalent to independent security, privacy, safeguarding, accessibility, hosting, database, or payment approval.
5. Google Play: Play Console setup, privacy/data-safety information, app signing, store assets, and required testing are external release steps.
6. Production: remains BLOCKED until the external/authorized requirements are actually closed.

## Android artifacts
The workflow is intended to produce:
- pacific-education-debug-apk
- pacific-education-release-apk-unsigned
- pacific-education-release-aab-unsigned

The unsigned AAB is a packaging artifact only. It is not a Play-ready signed release.

## Do not commit
- Keystores or signing passwords
- Service-account private keys
- Production credentials
- Payment secrets
- Real child personal information
- Sensitive production database exports
