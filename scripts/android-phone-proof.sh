#!/data/data/com.termux/files/usr/bin/bash
# Run in Termux on the physical Android phone.
# Usage: bash scripts/android-phone-proof.sh FULL_40_CHAR_COMMIT /path/to/candidate.apk
set -euo pipefail
TARGET_COMMIT="${1:-}"
APK="${2:-}"
[[ "$TARGET_COMMIT" =~ ^[0-9a-f]{40}$ ]] || { echo "BLOCKED: provide the exact lowercase 40-character commit SHA"; exit 2; }
[[ -s "$APK" ]] || { echo "BLOCKED: APK path missing or empty"; exit 2; }
command -v adb >/dev/null || { echo "BLOCKED: run pkg install android-tools"; exit 2; }
command -v python >/dev/null || { echo "BLOCKED: run pkg install python"; exit 2; }
command -v aapt >/dev/null || { echo "BLOCKED: aapt is required to read the APK application ID"; exit 2; }
DEVICE_LINES="$(adb devices | awk 'NR>1 && $2=="device" {print $1}')"
DEVICE_COUNT="$(printf '%s\n' "$DEVICE_LINES" | awk 'NF {n++} END {print n+0}')"
[[ "$DEVICE_COUNT" -eq 1 ]] || { echo "BLOCKED: need exactly one authorized ADB device. Check Android Developer options > Wireless debugging and run adb pair/connect using the on-screen ports. Never share the pairing code."; adb devices -l; exit 3; }
SERIAL="$(printf '%s\n' "$DEVICE_LINES" | awk 'NF {print $1}')"
[[ "$SERIAL" != emulator-* ]] || { echo "BLOCKED: emulator rejected"; exit 3; }
MODEL="$(adb -s "$SERIAL" shell getprop ro.product.model | tr -d '\r')"
PRODUCT_DEVICE="$(adb -s "$SERIAL" shell getprop ro.product.device | tr -d '\r')"
SDK="$(adb -s "$SERIAL" shell getprop ro.build.version.sdk | tr -d '\r')"
case "$MODEL $PRODUCT_DEVICE" in *sdk_gphone*|*emulator*|*goldfish*|*ranchu*) echo "BLOCKED: emulator identity rejected"; exit 3;; esac
[[ -n "$MODEL" && -n "$PRODUCT_DEVICE" && -n "$SDK" ]] || { echo "BLOCKED: could not read device identity"; exit 3; }
APK_SHA="$(sha256sum "$APK" | awk '{print $1}')"
APP_ID="$(aapt dump badging "$APK" | sed -n "s/^package: name='\([^']*\)'.*/\1/p" | head -n1)"
[[ -n "$APP_ID" ]] || { echo "BLOCKED: could not read APK application ID"; exit 3; }
OUT="pacedu-device-evidence-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$OUT"
adb -s "$SERIAL" install -r "$APK"
adb -s "$SERIAL" shell monkey -p "$APP_ID" 1
sleep 5
adb -s "$SERIAL" shell dumpsys activity activities > "$OUT/activities.txt"
grep -F "$APP_ID" "$OUT/activities.txt" >/dev/null || { echo "FAIL: launch not visible in device activity output"; exit 4; }
adb -s "$SERIAL" exec-out screencap -p > "$OUT/android-screen.png"
test -s "$OUT/android-screen.png"
printf '%s  %s\n' "$APK_SHA" "$(basename "$APK")" > "$OUT/apk-sha256.txt"
NOW="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
python - "$OUT/evidence.json" "$NOW" "$TARGET_COMMIT" "$SERIAL" "$MODEL" "$PRODUCT_DEVICE" "$SDK" "$APP_ID" "$APK_SHA" <<'PY'
import json,sys
path,now,commit,serial,model,product,sdk,app_id,apk_sha=sys.argv[1:]
record={"schema":"pacedu-physical-device-evidence/v1","status":"PASS","device_class":"android-phone","physical_device":True,"connection_method":"Termux ADB over Android Wireless debugging","session_timestamp_utc":now,"device":{"serial":serial,"model":model,"product_device":product,"sdk":sdk},"build":{"commit":commit,"application_id":app_id,"apk_sha256":apk_sha},"test_action":{"name":"install-launch-and-screenshot","result":"PASS","device_originated":True},"artifacts":["android-screen.png","activities.txt","apk-sha256.txt"]}
with open(path,"w",encoding="utf-8") as f:
 json.dump(record,f,indent=2)
 f.write("\n")
print(json.dumps(record,indent=2))
PY
echo "DEVICE TEST PASS: evidence saved locally in $OUT/"
echo "This proves install/launch/screenshot only, not audible AI Playback or desktop behavior."
echo "Review screenshots before sharing; do not upload personal or child information."
