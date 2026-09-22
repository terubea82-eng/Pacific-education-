# Pacific Education Android / Google Play Pilot

The repository now contains a native Android wrapper for the controlled Pacific Education pilot.

## Android project

- Project: `android/`
- Package: `fj.pacificeducation.app`
- Target API: 36
- Compile API: 36
- Minimum API: 24
- Version: 1.0.0-pilot
- Web app origin: `https://terubea82-eng.github.io/Pacific-education-/`
- Cleartext HTTP is disabled.
- WebView file/content access is disabled.
- Mixed content is disabled.
- External URLs are opened outside the app WebView.
- No credentials, payment secrets, or child personal data are embedded in the Android project.

## Build

GitHub Actions can build a debug APK from `.github/workflows/android-pilot-build.yml`.

A Play release still requires a properly signed Android App Bundle (AAB), Play Console configuration, policy declarations, testing, and review. The repository does not contain a signing key.

## Pilot status

This Android wrapper does not change the Pacific Education production approval gate. The app remains a controlled pilot/prototype until the repository's production requirements are independently completed and approved.

Google Play currently requires new apps and updates to target Android 16 / API 36 or higher. This project is configured accordingly.
