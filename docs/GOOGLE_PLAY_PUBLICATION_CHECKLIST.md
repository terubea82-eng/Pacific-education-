# Google Play Publication Pack — Pacific Education

**Prepared:** September 23, 2026
**Release:** 1.0.1-pilot / versionCode 2
**Package:** fj.pacificeducation.app
**Pilot:** Controlled one-month pilot, September 21–October 21, 2026
**Maximum pilot extension:** owner-approved total of three months, through December 21, 2026

## A. Repository and Android release

- [x] Current main branch consolidated after superseding PR #3 and PR #4.
- [x] Android targetSdk 36 (Android 16), meeting the current new-app target requirement.
- [x] Version code 2 / version 1.0.1-pilot.
- [x] HTTPS-only web destination and cleartext traffic disabled.
- [x] WebView back navigation uses the retained WebView instance.
- [x] Pilot network/offline boundary documented.
- [x] Unsigned build workflow explicitly validation-only.
- [x] Signed AAB workflow prepared.
- [ ] Configure the real release keystore as GitHub Actions/secure build secrets.
- [ ] Verify the final AAB certificate fingerprint and application ID before upload.
- [ ] Run the final signed AAB on physical Android devices, including a low-bandwidth Fiji test.
- [ ] Review the final pre-launch report in Play Console.

## B. Play Console testing

Google Play requires a closed test for new personal developer accounts created after November 13, 2023: at least 12 opted-in testers continuously for at least 14 days before applying for production access.

- [ ] Complete Play Console app setup.
- [ ] Upload the signed AAB to internal testing first.
- [ ] Fix installation/runtime issues.
- [ ] Move to closed testing.
- [ ] Obtain at least 12 testers who opt in.
- [ ] Keep the required testers continuously opted in for at least 14 days.
- [ ] Collect and retain testing feedback.
- [ ] Record bugs, fixes, tester engagement and final test conclusions.
- [ ] Apply for production access only after the closed-test requirement is met.

## C. App content / policy declarations

- [ ] Privacy policy URL active and reachable.
- [ ] Privacy policy linked inside the app/website.
- [ ] Complete Data safety form from the actual final AAB and actual data practices.
- [ ] Complete Target audience and content accurately.
- [ ] Because the learning product includes children, complete the applicable Families/child-safety declarations.
- [ ] Complete content rating questionnaire.
- [ ] Declare ads accurately. Current pilot is intended to have no third-party advertising SDK.
- [ ] Review requested permissions. Current Android manifest intentionally requests INTERNET only.
- [ ] Provide reviewer access instructions if any restricted functionality exists.
- [ ] If reviewer credentials are required, create dedicated test credentials only; never provide production credentials.
- [ ] Complete any additional Play policy declarations shown by Play Console.

## D. Store listing draft

### App name
Pacific Education

### Short description
Learning, assessment and education support for Pacific school communities.

### Full description
Pacific Education is an education platform prototype designed to support learning, assessment, teacher workflows, parent/education relationships and curriculum-alignment work for school communities.

The current Google Play release is a controlled pilot. It is intended for authorized testing, demonstration, curriculum-alignment work and feedback while the production system is being completed.

Key pilot capabilities include:
- Learning activities and daily lessons
- Student learning-progress demonstrations
- Assessment and progression demonstrations
- Teacher dashboard and planning workflows
- Parent/education relationship workflow demonstrations
- Accessibility controls
- Curriculum-alignment and verification workflows
- Prototype low-bandwidth/offline behavior testing

Important: this pilot is not a production education service. Do not enter real sensitive child information, passwords, payment credentials or exact child location information.

Official Fiji curriculum prescriptions and achievement indicators require authoritative source mapping and verification before production use.

### Suggested category
Education

### Ads
No third-party advertising is intended for the current pilot release.

### Support/privacy
Privacy policy: https://terubea82-eng.github.io/Pacific-education-/privacy-policy.html
Pilot website: https://terubea82-eng.github.io/Pacific-education-/

## E. Reviewer access notes

Pacific Education currently contains prototype access controls and synthetic test-session behavior. Reviewers should be able to launch the application and inspect the public pilot workflow without production credentials.

The release is explicitly marked as a controlled prototype pilot. It must not be represented as a production authentication, payment or child-data service.

If Play Console requests access to a restricted screen, provide a dedicated test account/session created specifically for review. Do not provide a real child's credentials or production credentials.

## F. Data Safety — developer confirmation required

Before submitting the final Data safety form, compare every answer with the actual final AAB, website scripts, hosting configuration and third-party services.

Current pilot design:
- No intentional collection of real child sensitive information.
- No intentional collection of payment credentials.
- No intentional collection of exact child location.
- Prototype progress/test state may be stored locally on the device/browser.
- HTTPS website hosting is used.
- INTERNET is the only declared Android permission in the current manifest.
- No intentional third-party advertising SDK in the pilot.

**Do not submit these statements blindly. Verify them against the final production artifact.**

## G. Child safety / privacy gate

Production release must remain blocked until:
- privacy review is completed;
- child-safeguarding review is completed;
- data practices are documented;
- secure authentication and server-side authorization are implemented;
- production database/backend controls are implemented;
- curriculum authority/source verification is completed;
- accessibility/device testing is completed;
- payment verification is implemented if payments are enabled;
- required independent/specialist review is completed.

## H. Google Play production-access application preparation

After the closed test, prepare factual answers describing:
1. How testers were recruited.
2. Whether testers used the important features.
3. How tester behavior compared with intended use.
4. What feedback was received and how it was collected.
5. What changes were made because of the test.
6. How production readiness was established.

Do not claim testing, security review, curriculum verification or production readiness that has not actually occurred.

## I. Owner authorization boundary

This repository can prepare code, documentation, release files and publication instructions. Google Play Console account ownership, legal declarations, developer verification, payment profile/tax information, signing-key custody and final submission remain account-owner actions unless an authorized Google Play integration is actually connected.

**Publication must never bypass Google's testing, policy, privacy, child-safety, review or developer-account requirements.**
