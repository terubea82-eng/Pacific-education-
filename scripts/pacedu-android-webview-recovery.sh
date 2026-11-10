#!/usr/bin/env bash
set -Eeuo pipefail
echo WEBVIEW_WRITE_GATE=REQUIRED
echo PHASE=EMULATOR_DEVICE_READY_WAIT
timeout 120s adb wait-for-device
timeout 180s bash -c "until [ \"\$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d \"\\r\")\" = \"1\" ]; do sleep 2; done"
echo PHASE=EMULATOR_BOOT_CONFIRMED
adb shell settings put global package_verifier_enable 0
adb shell settings put global verifier_verify_adb_installs 0

echo PHASE=INDEXEDDB_WRITE_TEST_START
timeout --signal=TERM --kill-after=30s 15m gradle -p android --no-daemon --console=plain :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=fj.pacificeducation.app.PaceduAndroidWebViewPersistenceTest#writeRecordBeforeProcessRestart
echo PHASE=INDEXEDDB_WRITE_TEST_PASSED
echo WEBVIEW_WRITE_GATE=PASSED_WRITE_OK

echo "PHASE=INSPECT_INSTALLED_PACKAGES_AFTER_WRITER"
echo "EMULATOR_ALL_PACKAGES_BEGIN"
adb shell pm list packages | tr -d '\r' | sort
echo "EMULATOR_ALL_PACKAGES_END"
echo "EMULATOR_THIRD_PARTY_PACKAGES_BEGIN"
adb shell pm list packages -3 | tr -d '\r' | sort
echo "EMULATOR_THIRD_PARTY_PACKAGES_END"
echo "EMULATOR_INSTRUMENTATION_PACKAGES_BEGIN"
adb shell pm list instrumentation | tr -d '\r' | sort
echo "EMULATOR_INSTRUMENTATION_PACKAGES_END"
echo "EMULATOR_PACKAGES_WITH_APK_PATHS_BEGIN"
adb shell pm list packages -f | tr -d '\r' | sort
echo "EMULATOR_PACKAGES_WITH_APK_PATHS_END"

APK_METADATA="android/app/build/outputs/apk/debug/output-metadata.json"
if [[ ! -f "$APK_METADATA" ]]; then
  echo "::error::Gradle debug APK output metadata is missing: $APK_METADATA"
  exit 1
fi
read -r APP_ID APK_OUTPUT < <(python3 -c 'import json,sys; m=json.load(open(sys.argv[1], encoding="utf-8")); e=m["elements"][0]; print(m["applicationId"], e["outputFile"])' "$APK_METADATA")
if [[ -z "$APP_ID" || -z "$APK_OUTPUT" ]]; then
  echo "::error::Gradle debug APK metadata did not provide applicationId and outputFile."
  exit 1
fi
APK_PATH="android/app/build/outputs/apk/debug/$APK_OUTPUT"
echo "GRADLE_DEBUG_APK_APPLICATION_ID=$APP_ID"
echo "GRADLE_DEBUG_APK_PATH=$APK_PATH"
if [[ ! -f "$APK_PATH" ]]; then
  echo "::error::Gradle debug APK file is missing: $APK_PATH"
  exit 1
fi
if command -v aapt >/dev/null 2>&1; then
  echo "GRADLE_DEBUG_APK_BADGING_BEGIN"
  aapt dump badging "$APK_PATH" | head -n 3
  echo "GRADLE_DEBUG_APK_BADGING_END"
else
  echo "AAPT_NOT_AVAILABLE=YES"
fi
echo "PHASE=VERIFY_DEBUG_PACKAGE_INSTALLED"
ALL_PACKAGES="$(adb shell pm list packages | tr -d '\r')"
if ! grep -Fxq "package:$APP_ID" <<< "$ALL_PACKAGES"; then
  echo "::error::Gradle debug APK applicationId $APP_ID is absent from the complete emulator package inventory."
  echo "DIAGNOSTIC_BASE_PACKAGE=fj.pacificeducation.app"
  adb shell pm path fj.pacificeducation.app || true
  echo "DIAGNOSTIC_DEBUG_PACKAGE=$APP_ID"
  adb shell pm path "$APP_ID" || true
  exit 1
fi
adb shell pm path "$APP_ID"
if ! adb shell pidof "$APP_ID" >/dev/null 2>&1; then
  echo "::error::Expected Android debug package $APP_ID has no running process before force-stop."
  exit 1
fi

echo PHASE=PACEDU_APP_FORCE_STOP_START
adb shell am force-stop "$APP_ID"
stopped=false
for attempt in {1..15}; do
  if ! adb shell pidof "$APP_ID" >/dev/null 2>&1; then
    stopped=true
    break
  fi
  sleep 1
done
if [[ "$stopped" != true ]]; then
  echo "::error::PacEdu app process did not stop after force-stop."
  exit 1
fi
echo PHASE=PACEDU_APP_PROCESS_STOPPED

echo PHASE=INDEXEDDB_READ_TEST_START
timeout --signal=TERM --kill-after=30s 15m gradle -p android --no-daemon --console=plain :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=fj.pacificeducation.app.PaceduAndroidWebViewPersistenceTest#readRecordAfterProcessRestart
echo PHASE=INDEXEDDB_READ_TEST_PASSED
echo WEBVIEW_RECOVERY_GATE=PASSED_READ_OK
