#!/usr/bin/env python3
"""Stage 15 deterministic QA runner.

This intentionally mirrors the repository's established prototype-validation
rules and adds the fail-closed production-gate test. It does not authorize
production.
"""
from pathlib import Path
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED_JS = "src/js/src/js/pacificEducationCountryGdpPricingBrokenLineTest.js"

def run(cmd):
    print("$", " ".join(cmd))
    return subprocess.run(cmd, cwd=ROOT, text=True)

def main():
    # JavaScript syntax, matching the established validation workflow.
    js_files = sorted(
        p for p in ROOT.rglob("*.js")
        if ".git" not in p.parts
        and str(p.relative_to(ROOT)) != EXCLUDED_JS
    )
    if not js_files:
        print("No JavaScript files found.")
        return 1
    for p in js_files:
        if run(["node", "--check", str(p)]).returncode != 0:
            print(f"FAIL: JavaScript syntax: {p}")
            return 1

    checks = [
        [sys.executable, "automation/validate_local_script_references.py"],
        [sys.executable, "automation/scan_obvious_secrets.py"],
        [sys.executable, "automation/test_production_release_gate.py"],
    ]
    for cmd in checks:
        if run(cmd).returncode != 0:
            print("FAIL:", " ".join(cmd))
            return 1

    print(f"STAGE 15 QA: PASS — {len(js_files)} JavaScript files and repository validation checks passed.")
    print("Production authorization remains fail-closed.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
