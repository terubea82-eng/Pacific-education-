# Android release signing setup

## Current release target

- Application ID: `fj.pacificeducation.app`
- Version name: `1.0.1-pilot`
- Version code: `2`
- Compile/target SDK: `36`
- Controlled pilot: 21 September 2026 to 21 October 2026, with owner-approved extension up to 21 December 2026.

Google Play requires submitted new apps and updates to target Android 16 (API 36) or higher from 31 August 2026. citeturn0search0

## Keep signing credentials private

Do **not** put a keystore, private key, Google password, Play Console password, recovery code, or secret in this repository or in ChatGPT messages.

For the GitHub signed-release workflow, the repository owner must configure these GitHub Actions secrets:

- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

The signed workflow will then restore the keystore temporarily on the GitHub runner, build the release AAB, verify its signature, and retain the signed artifact for a limited period.

Google Play App Signing separates the upload key from Google's app-signing key. The upload key is kept securely by the developer and is used to sign the bundle uploaded to Play Console. citeturn0search2

## Owner sign-in step — after repository preparation

When I tell you **READY TO SIGN IN**, do this yourself:

1. Open the official urlGoogle Play Consolehttps://play.google.com/console/.
2. Sign in with the Google account that owns the Pacific Education Play developer account.
3. Enter your Google password **only on Google's sign-in page**.
4. Complete 2-Step Verification if Google requests it.
5. Do **not** send your password, verification code, recovery code, or private signing key to me.
6. Once signed in, tell me only what screen you see (for example: **Play Console Dashboard**, **Create app**, or **App setup**).

Google's release process uses Play Console to create testing or production releases and upload an Android App Bundle. citeturn0search1

## Before uploading

Confirm:

- final signed AAB exists;
- application ID is `fj.pacificeducation.app`;
- version code is `2`;
- target API is 36;
- privacy policy and Data Safety declarations match the actual app;
- target audience/child-safety declarations are accurate;
- controlled pilot wording is accurate;
- physical Android and low-bandwidth Fiji testing has been completed;
- Play testing requirements shown in the account are completed.

The repository preparation cannot create or access your private Play Console password or private signing credentials. Those remain under the account owner's control.
