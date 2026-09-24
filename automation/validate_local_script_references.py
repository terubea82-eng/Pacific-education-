#!/usr/bin/env python3
from pathlib import Path
import re
import sys

ROOT = Path(".").resolve()
EXCLUDED_HTML = {
    ROOT / "src/pacificEducationCountryGdpPricingBrokenLineTest.html",
    ROOT / "src/src/pacificEducationCountryGdpPricingBrokenLineTest.html",
    ROOT / "src/pacificEducationCentralBridgeTestRunner.html",
    ROOT / "src/pacificEducationCentralBridgeFailureRecoveryTest.html",
    ROOT / "src/pacificEducationCentralBridgeIntegrationTestRunner.html",
    ROOT / "src/pacificEducationCentralBridgeFailureRecoveryTestRunner.html",
}
EXCLUDED_SUFFIXES = ("Test.html", "TestRunner.html", "BrokenLineTest.html", "TestPage.html")
SCRIPT_RE = re.compile(r'<script\\b[^>]+src=["\']([^"\']+)["\']', re.IGNORECASE)

missing = []
checked_files = 0
checked_refs = 0

for html in sorted(ROOT.rglob("*.html")):
    if ".git" in html.parts or html in EXCLUDED_HTML or html.name.endswith(EXCLUDED_SUFFIXES):
        continue
    checked_files += 1
    text = html.read_text(encoding="utf-8", errors="strict")
    for ref in SCRIPT_RE.findall(text):
        if "://" in ref or ref.startswith("//") or ref.startswith("data:"):
            continue
        checked_refs += 1
        clean_ref = ref.split("?", 1)[0].split("#", 1)[0]
        target = (html.parent / clean_ref).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            missing.append((html.relative_to(ROOT), ref, target))
            continue
        if not target.is_file():
            missing.append((html.relative_to(ROOT), ref, target.relative_to(ROOT)))

if missing:
    print("Missing or invalid local script references:")
    for html, ref, target in missing:
        print(f"- {html}: {ref} -> {target}")
    sys.exit(1)

print(f"Validated {checked_refs} local script references across {checked_files} HTML files.")
print("Intentionally broken fixture pages are excluded from this path check.")
