# Pacedu Physical Device Verification Bridge

## Purpose and limits

This opt-in workflow requires a self-hosted runner on the actual test host. GitHub-hosted CI, emulator/simulator results, phone-sized browser emulation, or simply opening the Pages URL do not count as physical verification.

## Android phone host setup
1. In GitHub repository Settings → Actions → Runners → New self-hosted runner, register a Linux host and assign labels self-hosted, linux, and pacedu-android-device.
2. On that Linux host, install Java 17+, Android SDK platform tools, Android build tools 36, and Gradle 9.7.1.
3. Enable Developer options and USB debugging on the actual phone. Connect by USB and accept the RSA prompt only when you initiated the connection. Confirm adb devices -l lists exactly one authorized device with state device.
4. Keep the host and runner online while the workflow runs. The workflow builds the exact selected commit, installs the APK, launches it, captures Android activity output and a device screenshot, and records the APK SHA-256.

## Desktop browser host setup
1. Register the actual Linux desktop host as a self-hosted runner labelled self-hosted, linux, and pacedu-desktop-device.
2. Install Node.js and Chromium/Chrome on that host. The workflow runs Pacedu's Playwright suite on that host against the exact checked-out commit.

GitHub generates a short-lived runner registration token. Use it only in the runner setup instructions; never commit it or paste it into chat.

## Run it
Open Actions → Pacedu Physical Device Verification Bridge → Run workflow. Enter the full 40-character commit SHA and choose android-phone or desktop-browser. Run both separately if both device classes are to be claimed as verified.

## Fail-closed policy
Missing runner, no/unauthorized/multiple ADB devices, emulator serial or emulator signature, wrong commit, failed install/launch, missing screenshot, or failed browser tests block acceptance. Android evidence proves installation/launch and a device-originated screenshot/activity capture only. It cannot prove audible speech; a human must listen to the protected #856 two-person AI Playback on the actual phone. Desktop and Android are independent gates. No deployment, merge, payment activation, or production authorization is granted by this workflow.

Use synthetic data only. Do not capture child data, passwords, ADB pairing secrets, or tokens. This workflow does not modify the protected #856 voice files.
