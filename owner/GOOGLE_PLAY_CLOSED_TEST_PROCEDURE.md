# Google Play Closed-Test Procedure — Pacific Education

## Purpose
This document defines the controlled Google Play closed-testing procedure for the Pacific Education pilot. It does not authorize production release.

## Current technical state
- GitHub Actions Android Pilot Build: PASS
- Debug APK: produced
- Unsigned release APK: produced
- Unsigned release AAB: produced
- A signed Play-upload AAB is not stored in this repository.
- Production approval remains fail-closed.

## Google Play closed-test requirement
For a new personal Google Play developer account created after 13 November 2023:
1. Complete the required Play Console app setup.
2. Upload a signed AAB to a closed-testing track.
3. Have at least 12 testers opted in.
4. Keep those testers continuously opted in for at least 14 days.
5. Monitor tester feedback and app reliability during the test.
6. Keep records of feedback and actions taken.
7. When the requirement is satisfied, use Play Console's Apply for production access process.
8. Production access is subject to Google's review and does not follow automatically from completing the test.

## Security and signing
- Never commit a private signing key, keystore password, service-account secret, payment credential, or child data to this repository.
- Use a protected signing environment or Google Play App Signing workflow.
- The repository's unsigned AAB is a build artifact, not a production-approved release.

## Pilot boundary
The Pacific Education owner-controlled pilot is separate from Google's testing requirement.
- Initial controlled pilot period: 21 September 2026 – 21 October 2026.
- The owner may explicitly extend the controlled pilot up to a total of three months if genuine need arises.
- An extension does not authorize production release.
- Do not enter real child sensitive information, passwords, payment credentials, or exact child location into the prototype.

## Tester instructions
Testers should:
- install only the version distributed through the Play closed-test track;
- remain opted in continuously for the full required testing period;
- exercise the main learning, assessment, accessibility, and navigation flows;
- report crashes, broken screens, incorrect behaviour, accessibility problems, and confusing instructions;
- avoid entering real sensitive child information;
- report issues through the owner's designated feedback channel.

## Release gate
Build PASS -> Signed AAB -> Closed Test -> 12+ continuous testers / 14 days -> Production-access application -> Google review -> Production access

A successful build or completed closed test does not itself mean that Pacific Education is approved for production.

## Owner control
Pacific Education remains owner-controlled. Technical assistance, testing, infrastructure, distribution, or funding does not by itself transfer platform ownership, equity, shares, partnership, or control.
