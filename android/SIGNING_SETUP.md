# Android release signing setup

This repository must never contain the Pacific Education Android release keystore, private key, or signing passwords.

## GitHub Actions secrets

In the repository, open **Settings → Secrets and variables → Actions** and create these repository secrets:

- `KEYSTORE_BASE64`
- `KEYSTORE_PASSWORD`
- `KEY_ALIAS`
- `KEY_PASSWORD`

The signed-release workflow reads these only at build time. It does not print them and does not commit the keystore.

## Create the keystore

Create the release keystore on a trusted computer or Android/Termux environment using Java `keytool`. Keep the resulting `.jks` file and passwords private.

Example:

```bash
keytool -genkeypair -v \
  -keystore pacific-education-release.jks \
  -alias pacific-education-release \
  -keyalg RSA -keysize 4096 -validity 10000
```

Choose a strong unique keystore password and key password. Record them in a secure password manager.

## Convert the keystore for GitHub

On the trusted machine, create base64 text without uploading the raw keystore:

```bash
base64 -w 0 pacific-education-release.jks > pacific-education-release.jks.b64
```

On systems where `-w 0` is unavailable, use the platform's equivalent single-line base64 command.

Copy the **base64 text** into the GitHub Actions secret `KEYSTORE_BASE64`. Do not paste the keystore password, key password, or private key into an issue, chat, README, source file, or commit.

## Run the signed build

After all four secrets exist:

1. Open **Actions**.
2. Select **Pacific Education Signed Android Release**.
3. Select **Run workflow** on `pilot-1-month-google-play-prep`.
4. Wait for the workflow to finish.
5. Download the `pacific-education-release-signed` artifact.
6. Keep the keystore and passwords backed up securely. Losing the signing key can prevent future updates to the same Play app.

## Important release checks

Signing alone does not make the app ready for Google Play. Before upload, verify the final application ID, Play Console account, privacy/data-safety declarations, target-audience settings, child-safety requirements, store listing, testing track, and the actual web content loaded by the Android wrapper.
