#!/usr/bin/env python3
from pathlib import Path
import re
import sys

PATTERN = re.compile(
    r"(BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY|"
    r"sk_live_[A-Za-z0-9]+|"
    r"sk_test_[A-Za-z0-9]+|"
    r"AIza[0-9A-Za-z_-]{20,}|"
    r"password\s*=\s*[\"'][^\"']+[\"'])",
    re.IGNORECASE,
)

findings = []
for path in Path(".").rglob("*"):
    if not path.is_file() or ".git" in path.parts:
        continue
    if path.suffix.lower() not in {".html", ".js", ".json", ".yml", ".yaml", ".properties", ".gradle", ".kts"}:
        continue
    if path.name == "prototype-validation.yml":
        continue
    text = path.read_text(encoding="utf-8", errors="ignore")
    for line_no, line in enumerate(text.splitlines(), 1):
        if PATTERN.search(line):
            findings.append(f"{path}:{line_no}: {line.strip()}")

if findings:
    print("Potential obvious committed secret patterns found:")
    print("\n".join(findings))
    sys.exit(1)

print("No obvious committed secret patterns found.")
