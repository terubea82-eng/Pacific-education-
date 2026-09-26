#!/usr/bin/env python3
"""Pacific Education Stage 15 repository QA checks.

Runs syntax/static checks that can be executed without production credentials,
real user data, or external services.
"""
from pathlib import Path
import py_compile
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]

def run(cmd):
    print("$", " ".join(cmd))
    return subprocess.run(cmd, cwd=ROOT, text=True, capture_output=True)

def main():
    failures = []

    # Python syntax checks for repository automation/tests.
    for p in sorted(ROOT.rglob("*.py")):
        if any(part in {".git", "node_modules"} for part in p.parts):
            continue
        try:
            py_compile.compile(str(p), doraise=True)
        except Exception as exc:
            failures.append(f"PYTHON SYNTAX: {p}: {exc}")

    # JavaScript syntax checks. Node is available in GitHub Actions.
    js_files = [
        p for p in sorted(ROOT.rglob("*.js"))
        if not any(part in {".git", "node_modules"} for part in p.parts)
    ]
    for p in js_files:
        r = run(["node", "--check", str(p)])
        if r.returncode != 0:
            failures.append(f"JAVASCRIPT SYNTAX: {p}: {r.stdout}{r.stderr}")

    # Existing production-gate test is intentionally expected to pass as a
    # test while the production gate itself remains fail-closed.
    gate_test = ROOT / "automation" / "test_production_release_gate.py"
    if gate_test.exists():
        r = run([sys.executable, str(gate_test)])
        if r.returncode != 0:
            failures.append(f"RELEASE-GATE TEST: {r.stdout}{r.stderr}")

    if failures:
        print("\nSTAGE 15 QA: FAIL")
        for failure in failures:
            print(failure)
        return 1

    print(f"STAGE 15 QA: PASS — checked {len(js_files)} JavaScript files and all repository Python files.")
    print("Production release authorization remains fail-closed.")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
