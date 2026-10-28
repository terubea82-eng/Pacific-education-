#!/usr/bin/env python3
"""Fetch allowlisted education-change sources and detect page changes.

This monitor detects source-page changes only. It does not claim that a curriculum
changed or publish lessons. Human review must classify each alert.
"""
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "automation" / "education-change-sources.json"
STATE = Path(os.environ.get("PACEDU_EDU_MONITOR_STATE", "/tmp/pacedu-education-state.json"))
REPORT = Path(os.environ.get("PACEDU_EDU_MONITOR_REPORT", "/tmp/pacedu-education-report.md"))
USER_AGENT = "PacEdu-EducationChangeMonitor/1.0 (+https://github.com/terubea82-eng/Pacific-education-)"
TIMEOUT_SECONDS = 20
MAX_BYTES = 2_000_000


def clean_html(raw):
    raw = re.sub(r"(?is)<(script|style|noscript).*?>.*?</\\1>", " ", raw)
    raw = re.sub(r"(?s)<!--.*?-->", " ", raw)
    raw = re.sub(r"(?s)<[^>]+>", " ", raw)
    return re.sub(r"\\s+", " ", unescape(raw)).strip()


def main():
    registry = json.loads(REGISTRY.read_text(encoding="utf-8"))
    previous = {}
    if STATE.exists():
        try:
            previous = json.loads(STATE.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            print("Previous monitor state is unreadable; refusing to treat all pages as unchanged.", file=sys.stderr)
            return 2

    new_state = {}
    changed = []
    errors = []
    checked_at = datetime.now(timezone.utc).isoformat()
    for profile in registry.get("curriculumProfiles", []):
        country = profile.get("countryCode", "unknown")
        for source in profile.get("sources", []):
            sid, url = source.get("id"), source.get("url")
            parsed = urlparse(url or "")
            if not sid or parsed.scheme != "https" or not parsed.netloc:
                errors.append({"id": sid or "missing-id", "url": url, "error": "Rejected non-HTTPS or invalid source URL"})
                continue
            req = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
            try:
                with urllib.request.urlopen(req, timeout=TIMEOUT_SECONDS) as response:
                    final_url = response.geturl()
                    final_parsed = urlparse(final_url)
                    if final_parsed.scheme != "https" or final_parsed.hostname != parsed.hostname:
                        raise ValueError("Redirect left the configured HTTPS host")
                    content_type = response.headers.get("Content-Type", "")
                    if "text/html" not in content_type and "application/xhtml+xml" not in content_type:
                        raise ValueError("Source root did not return HTML; configure a verified feed/API endpoint")
                    body = response.read(MAX_BYTES + 1)
                    if len(body) > MAX_BYTES:
                        body = body[:MAX_BYTES]
                    text = clean_html(body.decode("utf-8", errors="replace"))
                    if not text:
                        raise ValueError("No readable page text")
                    digest = hashlib.sha256(text.encode("utf-8")).hexdigest()
                    item = {"countryCode": country, "publisher": source.get("publisher"), "url": url,
                            "finalUrl": final_url, "sha256": digest, "checkedAt": checked_at,
                            "title": text[:180]}
                    new_state[sid] = item
                    old = previous.get(sid)
                    if old and old.get("sha256") != digest:
                        changed.append({"id": sid, "publisher": source.get("publisher"), "countryCode": country,
                                        "url": url, "oldHash": old.get("sha256"), "newHash": digest,
                                        "title": item["title"], "kind": "page-content-changed"})
                    elif not old:
                        changed.append({"id": sid, "publisher": source.get("publisher"), "countryCode": country,
                                        "url": url, "newHash": digest, "title": item["title"], "kind": "baseline-created"})
            except (urllib.error.URLError, TimeoutError, OSError, ValueError) as exc:
                errors.append({"id": sid, "url": url, "error": str(exc)[:300]})
                if sid in previous:
                    new_state[sid] = previous[sid]

    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps(new_state, indent=2) + "\\n", encoding="utf-8")
    lines = ["# PacEdu education-source monitor report", "", f"- Checked at (UTC): {checked_at}",
             f"- Sources configured: {sum(len(p.get('sources', [])) for p in registry.get('curriculumProfiles', []))}",
             f"- Successful checks: {len(new_state)}", f"- Changed/new baseline pages: {len(changed)}", f"- Fetch/validation errors: {len(errors)}", "",
             "## Changes requiring classification", "",
             "A changed page is only a review lead; it is not proof of a curriculum or legal change."]
    if changed:
        for item in changed:
            lines += [f"### {item['publisher']} ({item['countryCode']})", f"- Type: {item['kind']}", f"- Source: {item['url']}", f"- Page sample: {item.get('title', '')}", ""]
    else:
        lines.append("No changed pages detected against the saved baseline.")
    lines += ["## Fetch/validation errors", ""]
    if errors:
        for item in errors:
            lines.append(f"- {item.get('id')}: {item.get('url')} — {item.get('error')}")
    else:
        lines.append("None.")
    lines += ["", "## Safety boundary", "", "This report does not extract full articles, determine policy effective dates, generate lessons, or publish content. A reviewer must verify the authoritative item and classify its status."]
    REPORT.write_text("\\n".join(lines) + "\\n", encoding="utf-8")
    print(json.dumps({"changed": changed, "errors": errors, "statePath": str(STATE), "reportPath": str(REPORT)}))
    return 0 if new_state else 1


if __name__ == "__main__":
    raise SystemExit(main())
