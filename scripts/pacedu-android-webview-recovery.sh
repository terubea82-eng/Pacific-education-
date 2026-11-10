#!/usr/bin/env bash
set -Eeuo pipefail

echo WEBVIEW_WRITE_GATE=REQUIRED
echo PHASE=EMULATOR_DEVICE_READY_WAIT
timeout 120s adb wait-for-device
timeout 180s bash -c "until [ \"\$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d \"\\r\")\" = \"1\" ]; do sleep 2; done"
echo PHASE=EMULATOR_BOOT_CONFIRMED
adb shell settings put global package_verifier_enable 0
adb shell settings put global verifier_verify_adb_installs 0

echo PHASE=BUILD_DEBUG_AND_INSTRUMENTATION_APKS
timeout --signal=TERM --kill-after=30s 15m gradle -p android --no-daemon --console=plain :app:assembleDebug :app:assembleDebugAndroidTest

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
APP_APK="android/app/build/outputs/apk/debug/$APK_OUTPUT"
if [[ ! -f "$APP_APK" ]]; then
  echo "::error::Gradle debug APK file is missing: $APP_APK"
  exit 1
fi

ANDROID_TEST_APK_DIR="android/app/build/outputs/apk/androidTest/debug"
mapfile -t TEST_APKS < <(find "$ANDROID_TEST_APK_DIR" -maxdepth 1 -type f -name '*-androidTest.apk' -print 2>/dev/null | sort)
if [[ "${#TEST_APKS[@]}" -ne 1 ]]; then
  echo "::error::Expected exactly one debug instrumentation APK in $ANDROID_TEST_APK_DIR; found ${#TEST_APKS[@]}."
  printf '%s\n' "${TEST_APKS[@]}"
  exit 1
fi
TEST_APK="${TEST_APKS[0]}"
echo "GRADLE_DEBUG_APK_APPLICATION_ID=$APP_ID"
echo "GRADLE_DEBUG_APK_PATH=$APP_APK"
echo "GRADLE_DEBUG_ANDROID_TEST_APK_PATH=$TEST_APK"

echo PHASE=INSTALL_DEBUG_APP_APK
adb install -r "$APP_APK"
echo PHASE=INSTALL_DEBUG_INSTRUMENTATION_APK
adb install -r "$TEST_APK"

echo PHASE=VERIFY_BOTH_PACKAGES_INSTALLED
adb shell pm path "$APP_ID"
INSTRUMENTATION_LINE="$(adb shell pm list instrumentation | tr -d '\r' | grep -F "$APP_ID" | head -n 1 || true)"
if [[ -z "$INSTRUMENTATION_LINE" ]]; then
  echo "::error::No Android instrumentation component was registered for target package $APP_ID."
  adb shell pm list instrumentation
  exit 1
fi
INSTRUMENTATION_COMPONENT="${INSTRUMENTATION_LINE#instrumentation:}"
INSTRUMENTATION_COMPONENT="${INSTRUMENTATION_COMPONENT%% *}"
TEST_PACKAGE="${INSTRUMENTATION_COMPONENT%%/*}"
if [[ -z "$TEST_PACKAGE" || "$TEST_PACKAGE" == "$INSTRUMENTATION_COMPONENT" ]]; then
  echo "::error::Could not parse instrumentation package/component: $INSTRUMENTATION_LINE"
  exit 1
fi
adb shell pm path "$TEST_PACKAGE"
echo "INSTRUMENTATION_COMPONENT=$INSTRUMENTATION_COMPONENT"
echo "INSTRUMENTATION_TEST_PACKAGE=$TEST_PACKAGE"

LOGCAT_LOG="android/app/build/outputs/logs/pacedu-webview-logcat.txt"
WRITER_LOG="android/app/build/outputs/logs/pacedu-writer-instrumentation.log"
READER_LOG="android/app/build/outputs/logs/pacedu-reader-instrumentation.log"
REPORT_DIR="android/app/build/outputs/androidTest-results/connected/debug"
mkdir -p "$(dirname "$LOGCAT_LOG")" "$REPORT_DIR"
adb logcat -c
echo PHASE=ANDROID_LOGCAT_CAPTURE_START
adb logcat -v threadtime -s PacEduWebViewPersistence:I '*:S' > "$LOGCAT_LOG" 2>&1 &
LOGCAT_PID=$!
cleanup_logcat() {
  if kill -0 "$LOGCAT_PID" 2>/dev/null; then
    kill "$LOGCAT_PID" 2>/dev/null || true
    wait "$LOGCAT_PID" 2>/dev/null || true
  fi
}
trap cleanup_logcat EXIT
sleep 2
if ! kill -0 "$LOGCAT_PID" 2>/dev/null; then
  echo "::error::Android Logcat capture did not remain running."
  exit 1
fi

write_junit_report() {
  local log_file="$1"
  local report_file="$2"
  local test_name="$3"
  local exit_code="$4"
  python3 - "$log_file" "$report_file" "$test_name" "$exit_code" <<'PY'
import sys
import xml.etree.ElementTree as ET
from pathlib import Path

log_path, report_path, test_name, exit_code = sys.argv[1:]
output = Path(log_path).read_text(encoding="utf-8", errors="replace")
passed = exit_code == "0" and "OK (1 test)" in output
suite = ET.Element("testsuite", {
    "name": "fj.pacificeducation.app.PaceduAndroidWebViewPersistenceTest",
    "tests": "1",
    "failures": "0" if passed else "1",
    "errors": "0",
    "skipped": "0",
})
case = ET.SubElement(suite, "testcase", {
    "classname": "fj.pacificeducation.app.PaceduAndroidWebViewPersistenceTest",
    "name": test_name,
    "time": "0",
})
if not passed:
    failure = ET.SubElement(case, "failure", {
        "message": f"Instrumentation failed (exit code {exit_code})",
        "type": "InstrumentationFailure",
    })
    failure.text = output[-12000:]
Path(report_path).parent.mkdir(parents=True, exist_ok=True)
ET.ElementTree(suite).write(report_path, encoding="utf-8", xml_declaration=True)
print(f"JUNIT_REPORT={report_path}")
PY
}

run_instrumentation_test() {
  local method="$1"
  local log_file="$2"
  local report_file="$3"
  local exit_code=0
  echo "PHASE=INSTRUMENTATION_START_$method"
  if timeout --signal=TERM --kill-after=30s 15m adb shell am instrument -w -e class "fj.pacificeducation.app.PaceduAndroidWebViewPersistenceTest#$method" "$INSTRUMENTATION_COMPONENT" 2>&1 | tee "$log_file"; then
    exit_code=0
  else
    exit_code=$?
  fi
  write_junit_report "$log_file" "$report_file" "$method" "$exit_code"
  if [[ "$exit_code" -ne 0 ]] || ! grep -Fq 'OK (1 test)' "$log_file"; then
    echo "::error::Instrumentation test $method did not report exactly one passing test."
    return 1
  fi
  echo "PHASE=INSTRUMENTATION_PASSED_$method"
}

echo PHASE=INDEXEDDB_WRITE_TEST_START
run_instrumentation_test \
  "writeRecordBeforeProcessRestart" \
  "$WRITER_LOG" \
  "$REPORT_DIR/TEST-writeRecordBeforeProcessRestart.xml"

RUNTIME_PACKAGE="$(sed -n 's/.*PACEDU_TARGET_PACKAGE=//p' "$LOGCAT_LOG" | tail -n 1)"
RUNTIME_APK_PATH="$(sed -n 's/.*PACEDU_TARGET_APK_PATH=//p' "$LOGCAT_LOG" | tail -n 1)"
RUNTIME_TEST_PACKAGE="$(sed -n 's/.*PACEDU_TEST_PACKAGE=//p' "$LOGCAT_LOG" | tail -n 1)"
echo "INSTRUMENTATION_TARGET_PACKAGE=$RUNTIME_PACKAGE"
echo "INSTRUMENTATION_TARGET_APK_PATH=$RUNTIME_APK_PATH"
echo "INSTRUMENTATION_TEST_PACKAGE=$RUNTIME_TEST_PACKAGE"
if [[ "$RUNTIME_PACKAGE" != "$APP_ID" || "$RUNTIME_TEST_PACKAGE" != "$TEST_PACKAGE" || -z "$RUNTIME_APK_PATH" ]]; then
  echo "::error::Writer runtime package identity does not match the two installed APK package identities."
  grep -E 'PACEDU_(TARGET_PACKAGE|TARGET_APK_PATH|TEST_PACKAGE|INSTRUMENTATION_PACKAGE_ENTRY)' "$LOGCAT_LOG" || true
  exit 1
fi
echo PACKAGE_IDENTITY_GATE=PASSED
echo WEBVIEW_WRITE_GATE=PASSED_WRITE_OK

echo PHASE=VERIFY_DEBUG_PACKAGE_REMAINS_INSTALLED
adb shell pm path "$APP_ID"
adb shell pm path "$TEST_PACKAGE"

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
run_instrumentation_test \
  "readRecordAfterProcessRestart" \
  "$READER_LOG" \
  "$REPORT_DIR/TEST-readRecordAfterProcessRestart.xml"
echo WEBVIEW_RECOVERY_GATE=PASSED_READ_OK

echo PHASE=VERIFY_PACKAGES_REMAIN_INSTALLED_AFTER_READER
adb shell pm path "$APP_ID"
adb shell pm path "$TEST_PACKAGE"
cleanup_logcat
trap - EXIT
echo PHASE=ANDROID_LOGCAT_CAPTURE_COMPLETE
echo PACEDU_ANDROID_WEBVIEW_PROCESS_RESTART=PASSED
