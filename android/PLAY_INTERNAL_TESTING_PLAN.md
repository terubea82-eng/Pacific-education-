# Pacific Education — Google Play Internal Testing Plan

## Purpose
This file records the controlled Android testing step for Pacific Education.

- Track: Google Play Internal Testing
- Purpose: allow a limited group of testers to install the pilot build, try the app, and report feedback.
- This does not authorize production release.
- Production authorization remains fail-closed until all required external evidence and protected authorization are completed.

## Build requirements
The Android pilot workflow must produce:
- debug APK for local/device testing
- unsigned release APK
- unsigned release AAB

The AAB is a packaging artifact and is not a Play-ready signed production release. Signing credentials remain outside the repository.

## Tester feedback
Testers should report:
- installation or update problems
- crashes or broken screens
- lesson/progress problems
- assessment problems
- accessibility or usability issues
- curriculum/content issues
- privacy or safeguarding concerns
- other suggestions

Do not enter real sensitive child information, passwords, payment credentials, or exact child location during the controlled pilot.

## Guardian traceability
Any changes to the Android build/release path must remain subject to Pacific Guardian change traceability and the fail-closed production release controls.
