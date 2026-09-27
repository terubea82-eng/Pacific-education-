# Pacific Education — 100-User Controlled APK Pilot

## Purpose
This package is for the controlled prototype pilot only. It is not Google Play publication and it is not production approval.

## Pilot distribution
- Target: up to 100 pilot testers.
- Distribution method: direct APK distribution outside Google Play while Play registration/payment is unresolved.
- Build workflow: `.github/workflows/android-pilot-build.yml`.
- The workflow produces a pilot artifact containing the debug APK, unsigned release APK, unsigned AAB and SHA-256 checksums.
- Pilot artifact retention is 30 days.

## Tester safety
Do not enter:
- real child names or other identifying child information;
- passwords or authentication secrets;
- payment-card or banking information;
- exact child/home/school location information;
- other sensitive personal information.

Use test/demo information only.

## Device installation
1. Download the pilot APK from the GitHub Actions artifact supplied by the owner.
2. On Android, allow installation from the source used to deliver the APK when prompted.
3. Install Pacific Education.
4. Open the app and confirm the pilot notice is displayed.
5. Test the learning flow, lesson completion, assessment gates, dashboards and offline/low-bandwidth behavior that are included in the current pilot build.
6. Report problems and suggestions to the pilot owner.

## Important status
The APK pilot does not remove or bypass the production approval gate. Production authentication, database, hosting, cybersecurity, privacy, child safeguarding, accessibility, curriculum verification, payment verification and other required production evidence remain separate.

## Integrity
For a downloaded pilot package, compare its SHA-256 value with `SHA256SUMS.txt` before wider distribution.

## Google Play
Google Play publication remains a later step. The controlled APK pilot may proceed independently while the Google Play developer registration/payment issue is being resolved.
