# Pacific Education — Controlled Pilot Build Preflight

## Verified repository state
- Main branch is the controlled pilot source.
- GitHub Pages remains the prototype delivery surface.
- Production authorization remains fail-closed.
- Android workflow builds debug APK, unsigned release APK, and unsigned release AAB.
- Signing credentials are intentionally external to the repository.

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
