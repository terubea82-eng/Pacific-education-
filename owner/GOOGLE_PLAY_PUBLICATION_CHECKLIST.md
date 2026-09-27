# Pacific Education — Google Play Publication Checklist

Updated: 2026-09-24

## Repository / CI completed
- [x] Prototype validation workflow fixed: Python validation moved to a repository script.
- [x] Prototype secret scan fixed: shell quoting replaced with a Python scanner.
- [x] GitHub Actions runners pinned to Ubuntu 24.04.
- [x] actions/checkout upgraded to v6.
- [x] CodeQL upgraded to v4.
- [x] Android release version advanced to versionCode 3 / versionName 1.0.2-pilot.
- [x] GitHub Pages deployment passed.
- [x] Pacific Guardian mandatory audit passed.
- [ ] Signed AAB: requires repository signing secrets to be configured.
- [x] Native Android pilot home + offline Day 1 lesson added to reduce WebView-only dependence; Families-policy review still required.

## GitHub signing setup — owner action required
Create these repository Actions secrets:
- KEYSTORE_BASE64
- KEYSTORE_PASSWORD
- KEY_ALIAS
- KEY_PASSWORD

Do not commit the keystore or passwords to the repository.

After the secrets exist:
1. Run .github/workflows/android-release-signed.yml manually.
2. Confirm the signed AAB artifact is produced.
3. Verify the artifact corresponds to versionCode 3 / versionName 1.0.2-pilot.

## Current release state
- Android package: `fj.pacificeducation.app`
- Current pilot release: versionCode 3 / versionName `1.0.2-pilot`
- Unsigned validation AAB can be built by CI; Play distribution requires a properly signed AAB.

## Google Play Console
1. Create/confirm the Pacific Education app entry.
2. Configure Play App Signing.
3. Upload the signed AAB to Internal testing first.
4. Complete Store listing.
5. Add an active privacy-policy URL and make the same policy accessible inside the app.
6. Complete App content declarations: Data safety, Ads declaration, App access instructions, Target audience and content, Content rating (IARC), and any applicable permissions declarations.
7. Review countries/regions and pricing.
8. Run internal testing and device checks.
9. Create a Closed testing track.

## New personal Play developer accounts
If the developer account is a personal account created after 13 November 2023, Google requires a closed test with at least 12 testers continuously opted in for at least 14 days before production access can be requested.

## Child-directed app review
Pacific Education includes child/learner use cases. Before production publication, verify Google Play Families Policy compliance, including data practices, SDK/API eligibility, privacy policy, and child-directed functionality.

## Important architecture blocker
The current Android wrapper loads the GitHub Pages application in a WebView. Google Play Families Policy says a child-directed app must not merely provide a webview of a website. The production Android architecture therefore requires specialist review and, if necessary, a native/hybrid implementation that provides meaningful app functionality beyond a website wrapper.

## Production service blockers
The repository intentionally keeps production approval fail-closed. Before a production education service is authorized, complete:
- server-side authentication and authorization
- production database/access controls/backups/recovery
- production hosting/monitoring/rollback
- server/provider payment verification
- cybersecurity testing and independent review
- privacy/data-governance review
- child safeguarding review and operational controls
- accessibility and real-device/offline/low-bandwidth testing
- official Fiji curriculum source verification/alignment approval
- owner approval and required authorized external review

## Release boundary
Passing GitHub Actions and obtaining a Play test build do not by themselves authorize production education service publication.
