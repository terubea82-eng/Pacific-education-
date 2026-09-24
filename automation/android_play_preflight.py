#!/usr/bin/env python3
"""Pacific Education Android Play preflight checks.

Static release checks only. This does not certify Google Play compliance or
production readiness.
"""
from pathlib import Path
import re
import sys
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ANDROID = ROOT / "android"
GRADLE = ANDROID / "app" / "build.gradle.kts"
MANIFEST = ANDROID / "app" / "src" / "main" / "AndroidManifest.xml"
PRIVACY = ROOT / "privacy-policy.html"

errors = []
warnings = []

def require(condition, message):
    if not condition:
        errors.append(message)

gradle = GRADLE.read_text(encoding="utf-8")
manifest_text = MANIFEST.read_text(encoding="utf-8")

require('applicationId = "fj.pacificeducation.app"' in gradle, "Unexpected Android applicationId.")
require("targetSdk = 36" in gradle or re.search(r"targetSdk\s*=\s*(3[5-9]|[4-9]\d)", gradle), "targetSdk must be 35 or higher.")
require("versionCode = 3" in gradle, "Expected pilot versionCode 3.")
require('versionName = "1.0.2-pilot"' in gradle, "Expected pilot versionName 1.0.2-pilot.")
require("isMinifyEnabled=true" in gradle, "Release minification must remain enabled.")
require("isShrinkResources=true" in gradle, "Release resource shrinking must remain enabled.")
require('applicationIdSuffix=".debug"' in gradle, "Debug build must remain separated from release package.")

try:
    root = ET.fromstring(manifest_text)
    android_ns = "{http://schemas.android.com/apk/res/android}"
    permissions = {
        node.attrib.get(android_ns + "name")
        for node in root.findall("uses-permission")
    }
    unexpected = sorted(p for p in permissions if p != "android.permission.INTERNET")
    require(not unexpected, f"Unexpected manifest permissions: {unexpected}")
    require("android.permission.INTERNET" in permissions, "INTERNET permission is required for the full HTTPS platform.")
    require('android:usesCleartextTraffic="false"' in manifest_text, "Cleartext traffic must remain disabled.")
    require("@xml/network_security_config" in manifest_text, "Network security config must remain attached.")
except ET.ParseError as exc:
    errors.append(f"AndroidManifest.xml is not valid XML: {exc}")

require(PRIVACY.is_file(), "privacy-policy.html must exist at repository root.")

# Guard against accidentally introducing common child-directed ad/tracking SDKs
# into the native Android module without an explicit review.
native_files = list((ANDROID / "app").rglob("*"))
native_text = ""
for path in native_files:
    if path.is_file() and path.suffix in {".kt", ".java", ".xml", ".kts", ".gradle"}:
        try:
            native_text += path.read_text(encoding="utf-8", errors="ignore").lower() + "\n"
        except OSError:
            pass

for marker, label in [
    ("com.google.android.gms.ads", "AdMob"),
    ("firebase-analytics", "Firebase Analytics"),
    ("firebase-crashlytics", "Firebase Crashlytics"),
]:
    if marker in native_text:
        warnings.append(f"{label} reference detected; verify Families/Data Safety treatment before release.")

print("Pacific Education Android Play preflight")
print(f"Application: fj.pacificeducation.app")
print(f"Release: 1.0.2-pilot (versionCode 3)")
print(f"Manifest permissions: INTERNET only")
print(f"Privacy policy present: {PRIVACY.is_file()}")
for warning in warnings:
    print(f"WARNING: {warning}")
if errors:
    for error in errors:
        print(f"ERROR: {error}")
    sys.exit(1)
print("PASS: static Android release preflight checks completed.")
