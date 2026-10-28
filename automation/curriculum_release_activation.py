#!/usr/bin/env python3
"""Activate an already-reviewed curriculum release when its official effective date arrives.

A source-page change alone can never activate a framework. A release record and a
fully reviewed student-ready content pack are required. The script is idempotent.
"""
import argparse
import json
import re
import sys
from datetime import date, datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
MANIFEST = ROOT / "src" / "data" / "curriculum" / "active-frameworks.json"
REGISTRY = ROOT / "automation" / "education-change-sources.json"
RELEASE_DIR = ROOT / "automation" / "curriculum-releases"
COUNTRY_RE = re.compile(r"^[A-Z]{2,3}$")


def read_json(path):
    return json.loads(path.read_text(encoding="utf-8"))


def allowed_hosts(registry, country):
    hosts = set()
    for profile in registry.get("curriculumProfiles", []):
        if str(profile.get("countryCode", "")).upper() != country:
            continue
        framework_url = profile.get("framework", {}).get("sourceUrl", "")
        if urlparse(framework_url).scheme == "https":
            hosts.add(urlparse(framework_url).hostname)
        for source in profile.get("sources", []):
            parsed = urlparse(source.get("url", ""))
            if parsed.scheme == "https" and parsed.hostname:
                hosts.add(parsed.hostname)
    return hosts


def validate_release(record, registry, today):
    country = str(record.get("countryCode", "")).upper()
    if not COUNTRY_RE.fullmatch(country):
        raise ValueError("countryCode must be a two- or three-letter code")
    if record.get("verificationStatus") != "verified" or record.get("releaseStatus") != "approved":
        raise ValueError("release must be verified and approved")
    for field in ("frameworkName", "frameworkVersion", "effectiveDate", "officialNoticeUrl",
                  "officialPublisher", "reviewedBy", "approvedBy", "reviewedAt",
                  "schoolAdoptionStatus", "approvedContentPackPath"):
        if not str(record.get(field, "")).strip():
            raise ValueError("missing required field: " + field)
    if record.get("reviewedBy") == record.get("approvedBy"):
        raise ValueError("reviewer and approver must be different people")
    try:
        effective = date.fromisoformat(record["effectiveDate"])
    except ValueError as error:
        raise ValueError("effectiveDate must use YYYY-MM-DD") from error
    if effective > today:
        return {"ready": False, "reason": "effective date is in the future"}
    if record.get("schoolAdoptionStatus") not in ("nationally-in-force", "adopted-by-school"):
        raise ValueError("schoolAdoptionStatus must confirm national commencement or school adoption")
    parsed = urlparse(record["officialNoticeUrl"])
    if parsed.scheme != "https" or parsed.hostname not in allowed_hosts(registry, country):
        raise ValueError("officialNoticeUrl must be HTTPS on an allowlisted official source host")
    try:
        datetime.fromisoformat(str(record["reviewedAt"]).replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("reviewedAt must be an ISO timestamp") from error
    pack_rel = Path(record["approvedContentPackPath"])
    if pack_rel.is_absolute() or ".." in pack_rel.parts or not str(pack_rel).startswith("src/data/curriculum/"):
        raise ValueError("approvedContentPackPath must remain inside src/data/curriculum/")
    pack_path = (ROOT / pack_rel).resolve()
    if ROOT.resolve() not in pack_path.parents:
        raise ValueError("content pack path escaped repository root")
    if not pack_path.is_file():
        raise ValueError("approved content pack file does not exist")
    pack = read_json(pack_path)
    if (str(pack.get("countryCode", "")).upper() != country or
            str(pack.get("frameworkVersion", "")) != str(record["frameworkVersion"]) or
            pack.get("releaseStatus") != "approved" or pack.get("studentReady") is not True):
        raise ValueError("content pack country/version/status/studentReady does not match release")
    lessons = pack.get("dailyLessons")
    if not isinstance(lessons, list) or not lessons:
        raise ValueError("approved content pack needs dailyLessons")
    for lesson in lessons:
        if lesson.get("approvedForStudents") is not True or not isinstance(lesson.get("worksheet"), dict):
            raise ValueError("every live lesson must be explicitly approvedForStudents and include worksheet content")
        for field in ("classLevel", "subjectName", "term", "week", "day", "ability"):
            if field not in lesson:
                raise ValueError("live lesson is missing " + field)
    subjects = pack.get("subjects")
    if not isinstance(subjects, list) or not subjects:
        raise ValueError("content pack must include mapped subjects and outcomes")
    for subject in subjects:
        if not subject.get("classLevel") or not subject.get("subjectName") or not subject.get("outcomes"):
            raise ValueError("every live subject needs class, subject and outcomes")
        for outcome in subject["outcomes"]:
            for field in ("outcomeId", "outcomeText", "sourcePage"):
                if not str(outcome.get(field, "")).strip():
                    raise ValueError("every live outcome needs " + field)
    return {"ready": True, "effectiveDate": effective.isoformat(), "pack": pack, "packUrl": "./" + pack_rel.as_posix().removeprefix("src/")}


def activate(today=None, write=True):
    today = today or date.today()
    manifest = read_json(MANIFEST)
    registry = read_json(REGISTRY)
    if not RELEASE_DIR.exists():
        return {"changed": False, "reason": "no curriculum release records", "countriesChanged": []}
    records = []
    rejected = []
    for path in sorted(RELEASE_DIR.glob("*.json")):
        try:
            record = read_json(path)
            checked = validate_release(record, registry, today)
            if checked["ready"]:
                records.append((record, checked, path.name))
        except (ValueError, OSError, json.JSONDecodeError) as error:
            rejected.append({"file": path.name, "reason": str(error)})
    records.sort(key=lambda item: (item[0]["countryCode"], item[1]["effectiveDate"], item[0]["frameworkVersion"]))
    changed_countries = []
    for record, checked, filename in records:
        country = record["countryCode"].upper()
        current = manifest.setdefault("countries", {}).get(country)
        if current and str(current.get("frameworkVersion", "")) == str(record["frameworkVersion"]):
            continue
        history = list(current.get("frameworkHistory", [])) if current else []
        if current:
            history.append({
                "frameworkName": current.get("frameworkName"),
                "frameworkVersion": current.get("frameworkVersion"),
                "effectiveFrom": current.get("effectiveFrom"),
                "supersededAt": checked["effectiveDate"],
                "releaseStatus": current.get("releaseStatus", "baseline")
            })
        profile = {
            "enabled": True,
            "countryName": record.get("countryName") or (current or {}).get("countryName") or country,
            "frameworkName": record["frameworkName"],
            "frameworkVersion": str(record["frameworkVersion"]),
            "frameworkStatus": "officially-in-force",
            "effectiveFrom": checked["effectiveDate"],
            "officialSourceUrl": record["officialNoticeUrl"],
            "mappingStatus": "verified",
            "releaseStatus": "approved",
            "approvedContentPackUrl": checked["packUrl"],
            "releaseRecord": filename,
            "reviewedBy": record["reviewedBy"],
            "approvedBy": record["approvedBy"],
            "reviewedAt": record["reviewedAt"],
            "frameworkHistory": history
        }
        manifest["countries"][country] = profile
        changed_countries.append({"countryCode": country, "frameworkVersion": profile["frameworkVersion"], "effectiveFrom": checked["effectiveDate"]})
    if changed_countries and write:
        MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return {"changed": bool(changed_countries), "countriesChanged": changed_countries, "rejected": rejected, "checkedAt": datetime.now(timezone.utc).isoformat()}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--check-only", action="store_true", help="Validate release records without writing active manifest")
    args = parser.parse_args()
    try:
        result = activate(write=not args.check_only)
    except (OSError, ValueError, json.JSONDecodeError) as error:
        print(json.dumps({"status": "error", "error": str(error)}))
        return 2
    print(json.dumps(result, ensure_ascii=False))
    if result.get("rejected"):
        return 2
    return 0


if __name__ == "__main__":
    sys.exit(main())
