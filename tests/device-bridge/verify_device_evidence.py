#!/usr/bin/env python3
"""Fail-closed structural validator for Pacedu physical-device evidence."""
import argparse
import datetime as dt
import json
import re
import sys
from pathlib import Path

SHA40 = re.compile(r"^[0-9a-f]{40}$")
SHA256 = re.compile(r"^[0-9a-f]{64}$")
EMULATOR_MARKERS = ("emulator", "sdk_gphone", "goldfish", "ranchu")


def validate(record, expected_commit, evidence_dir, now=None):
    errors = []
    if record.get("schema") != "pacedu-physical-device-evidence/v1": errors.append("unsupported or missing schema")
    if record.get("status") != "PASS": errors.append("status is not PASS")
    if record.get("physical_device") is not True: errors.append("physical_device must be true")
    commit = record.get("build", {}).get("commit", "")
    if not SHA40.fullmatch(commit): errors.append("build.commit must be a full lowercase 40-character SHA")
    if commit != expected_commit: errors.append("build.commit does not match expected candidate")
    try:
        stamp = dt.datetime.fromisoformat(record.get("session_timestamp_utc", "").replace("Z", "+00:00"))
        if stamp.tzinfo is None: raise ValueError("timezone missing")
        age = ((now or dt.datetime.now(dt.timezone.utc)) - stamp.astimezone(dt.timezone.utc)).total_seconds()
        if age < -300 or age > 86400: errors.append("device session is stale or timestamp is in the future")
    except (ValueError, TypeError):
        errors.append("session_timestamp_utc must be timezone-aware ISO timestamp")
    action = record.get("test_action", {})
    if action.get("result") != "PASS" or action.get("device_originated") is not True:
        errors.append("test action lacks device-originated PASS evidence")
    kind, device = record.get("device_class"), record.get("device", {})
    if kind == "android-phone":
        serial = str(device.get("serial", "")).strip()
        model = str(device.get("model", "")).strip().lower()
        product = str(device.get("product_device", "")).strip().lower()
        if not serial or serial.startswith("emulator-"): errors.append("missing physical serial or emulator serial rejected")
        if not model or not product: errors.append("missing device-originated model/product identity")
        if any(marker in model or marker in product for marker in EMULATOR_MARKERS): errors.append("emulator signature rejected")
        if not SHA256.fullmatch(record.get("build", {}).get("apk_sha256", "")): errors.append("build.apk_sha256 must be SHA-256")
    elif kind == "desktop-browser":
        if not device.get("host") or not device.get("os"): errors.append("desktop host and OS identity are required")
    else:
        errors.append("unsupported device_class")
    root = Path(evidence_dir).resolve()
    artifacts = record.get("artifacts", [])
    if not artifacts: errors.append("no evidence artifacts listed")
    for name in artifacts:
        path = (root / name).resolve()
        if root not in path.parents or not path.is_file() or path.stat().st_size == 0:
            errors.append("missing, empty, or unsafe evidence artifact: " + str(name))
    return errors


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--evidence", required=True)
    parser.add_argument("--expected-commit", required=True)
    parser.add_argument("--evidence-dir", required=True)
    args = parser.parse_args()
    if not SHA40.fullmatch(args.expected_commit):
        print("BLOCKED: expected commit must be a full lowercase 40-character SHA", file=sys.stderr)
        return 2
    try:
        record = json.loads(Path(args.evidence).read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        print("BLOCKED: cannot read evidence: " + str(exc), file=sys.stderr)
        return 2
    errors = validate(record, args.expected_commit, args.evidence_dir)
    if errors:
        for error in errors: print("BLOCKED: " + error, file=sys.stderr)
        return 1
    print("STRUCTURE_VALID: candidate and required device evidence fields match.")
    print("NOTE: structural validation is not cryptographic attestation and cannot prove audible speech.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
