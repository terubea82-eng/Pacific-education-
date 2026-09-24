#!/usr/bin/env python3
"""Pacific Education production release gate.

CI control only. A passing build/preflight never authorizes production.
The gate is fail-closed and requires explicit, externally verified evidence
and explicit protected authorization before publication.
"""
from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[1]
AUTH = ROOT / "release" / "production-authorization.json"

REQUIRED = [
    "release_packet_generated",
    "curriculum_verified",
    "owner_approval_recorded",
    "database_verified",
    "authentication_verified",
    "hosting_verified",
    "security_reviewed",
    "privacy_reviewed",
    "safeguarding_reviewed",
    "accessibility_reviewed",
    "pilot_user_testing_completed",
    "payments_verified",
    "independent_release_authorization",
]


def fail(message):
    print(f"BLOCKED: {message}")


if not AUTH.is_file():
    fail("release/production-authorization.json is missing.")
    sys.exit(1)

try:
    data = json.loads(AUTH.read_text(encoding="utf-8"))
except (OSError, json.JSONDecodeError) as exc:
    fail(f"authorization record is invalid: {exc}")
    sys.exit(1)

if data.get("productionApproved") is not True:
    fail("explicit protected production authorization has not been recorded.")
    sys.exit(1)

if data.get("productionEligible") is not True:
    fail("productionEligible is not true in the protected authorization record.")
    sys.exit(1)

missing = [key for key in REQUIRED if data.get("evidence", {}).get(key) is not True]
if missing:
    print("Pacific Education production release gate")
    print("STATUS: BLOCKED / FAIL-CLOSED")
    print("Missing verified evidence:")
    for key in missing:
        print(f" - {key}")
    sys.exit(1)

if data.get("authorization_source") != "protected-authorized-release-process":
    fail("authorization_source is not the protected authorized release process.")
    sys.exit(1)

if data.get("release_status") != "APPROVED_FOR_RELEASE":
    fail("release_status is not APPROVED_FOR_RELEASE.")
    sys.exit(1)

print("STATUS: APPROVED_FOR_RELEASE evidence record present.")
print("NOTE: deployment must still use the protected production deployment workflow.")
