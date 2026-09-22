# Secure Android Signing Procedure — Pacific Education

## Purpose

This procedure defines how to move the successful unsigned Android release build toward Google Play closed testing without placing private signing material in the public repository.

It does not authorize production release.

## Current build boundary

The repository CI produces:
- debug APK;
- unsigned release APK;
- unsigned release AAB.

The unsigned AAB is not a Play-upload-ready signed release.

## Signing security rules

Never commit or paste into repository files:
- Android keystore files;
- private signing keys;
- keystore or key passwords;
- Play service-account credentials;
- payment credentials;
- child or tester sensitive data.

The repository .gitignore excludes common Android signing and credential file types, but .gitignore is not a security boundary. Secrets must be protected at the storage and access level as well.

## Recommended signing path

1. Keep the source code and unsigned build workflow in GitHub.
2. Use Google Play App Signing where appropriate.
3. Generate or protect the upload key in a secure environment.
4. Keep the private keystore and passwords outside the public repository.
5. Build the release AAB from the reviewed source.
6. Sign/upload through the protected Play Console workflow.
7. Upload the signed AAB to a Google Play closed-testing track.
8. Do not describe the app as production-approved merely because Play closed testing begins.

## Closed-test gate

The controlled pilot and Google Play testing requirements are separate.

Build PASS -> Secure signing -> Signed AAB -> Closed test -> Required testers/testing period -> Production-access application -> Google review

Completion of a closed test does not itself authorize production release.

## Owner control

Pacific Education remains owner-controlled. Signing, testing, distribution, infrastructure, technical assistance, or funding does not by itself transfer platform ownership, equity, shares, partnership, or control.

## Pilot boundary

Initial controlled pilot period: 21 September 2026 – 21 October 2026.

The owner may explicitly extend the controlled pilot up to a total of three months if genuine need arises. An extension does not authorize production release.

During the prototype pilot, do not enter real child sensitive information, passwords, payment credentials, or exact child location.
