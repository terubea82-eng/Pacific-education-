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

APP_ID="fj.pacificeducation.app.debug"
echo "PHASE=VERIFY_DEBUG_PACKAGE_INSTALLED"
if ! adb shell pm path "$APP_ID" | grep -q '^package:'; then
  echo "::error::Expected Android debug package $APP_ID is not installed."
  exit 1
fi
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
