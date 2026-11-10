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
WRITER_LOG="${RUNNER_TEMP:-/tmp}/pacedu-writer-instrumentation.log"
timeout --signal=TERM --kill-after=30s 15m gradle -p android --no-daemon --console=plain :app:connectedDebugAndroidTest -Pandroid.testInstrumentationRunnerArguments.class=fj.pacificeducation.app.PaceduAndroidWebViewPersistenceTest#writeRecordBeforeProcessRestart 2>&1 | tee "$WRITER_LOG"
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
RUNTIME_PACKAGE="$(sed -n 's/.*PACEDU_TARGET_PACKAGE=//p' "$WRITER_LOG" | tail -n 1)"
RUNTIME_APK_PATH="$(sed -n 's/.*PACEDU_TARGET_APK_PATH=//p' "$WRITER_LOG" | tail -n 1)"
TEST_PACKAGE="$(sed -n 's/.*PACEDU_TEST_PACKAGE=//p' "$WRITER_LOG" | tail -n 1)"
echo "INSTRUMENTATION_TARGET_PACKAGE=$RUNTIME_PACKAGE"
echo "INSTRUMENTATION_TARGET_APK_PATH=$RUNTIME_APK_PATH"
echo "INSTRUMENTATION_TEST_PACKAGE=$TEST_PACKAGE"
if [[ -z "$RUNTIME_PACKAGE" || -z "$RUNTIME_APK_PATH" ]]; then
  echo "::error::Writer instrumentation did not emit its in-process target package identity."
  echo "WRITER_LOG_PACKAGE_MARKERS_BEGIN"
  grep -E 'PACEDU_(TARGET_PACKAGE|TARGET_APK_PATH|TEST_PACKAGE|INSTRUMENTATION_PACKAGE_ENTRY)' "$WRITER_LOG" || true
  echo "WRITER_LOG_PACKAGE_MARKERS_END"
  exit 1
fi
if [[ "$RUNTIME_PACKAGE" != "$APP_ID" ]]; then
  echo "::error::Instrumentation target package $RUNTIME_PACKAGE does not match Gradle APK applicationId $APP_ID."
  exit 1
fi
echo "PACKAGE_IDENTITY_GATE=PASSED"
echo "PHASE=VERIFY_DEBUG_PACKAGE_INSTALLED"
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
