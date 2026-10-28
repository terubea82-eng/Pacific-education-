#!/usr/bin/env python3
"""Generate versioned draft activity/revision/assessment scaffolds from verified outcomes.

This is deterministic scaffolding, not AI curriculum authoring. It preserves official
outcome text and creates four differentiated pathways plus revision and assessment
templates. Output remains draft until reviewed and explicitly approved.
"""
import argparse
import json
import re
from datetime import datetime, timezone
from pathlib import Path

COUNTRY_RE = re.compile(r"^[A-Z]{2,3}$")


def validate_source(data):
    if not isinstance(data, dict):
        raise ValueError("Input must be a JSON object.")
    country = str(data.get("countryCode", "")).upper()
    if not COUNTRY_RE.fullmatch(country):
        raise ValueError("countryCode must be a two- or three-letter ISO-style code.")
    if not str(data.get("frameworkVersion", "")).strip():
        raise ValueError("frameworkVersion is required.")
    if not data.get("officialSourceUrl", "").startswith("https://"):
        raise ValueError("An HTTPS officialSourceUrl is required.")
    if data.get("releaseStatus") not in ("draft", "review-required"):
        raise ValueError("Generator only accepts draft/review-required input; it cannot approve or publish content.")
    subjects = data.get("subjects")
    if not isinstance(subjects, list) or not subjects:
        raise ValueError("At least one mapped subject is required.")
    for subject in subjects:
        if not subject.get("subjectName") or not subject.get("classLevel"):
            raise ValueError("Each subject mapping needs subjectName and classLevel.")
        outcomes = subject.get("outcomes")
        if not isinstance(outcomes, list) or not outcomes:
            raise ValueError("Each subject needs at least one verified outcome.")
        for outcome in outcomes:
            for field in ("outcomeId", "outcomeText", "sourcePage"):
                if not str(outcome.get(field, "")).strip():
                    raise ValueError("Every outcome needs outcomeId, exact outcomeText and sourcePage.")
            if outcome.get("verificationStatus") != "verified":
                raise ValueError("Only outcomes explicitly marked verified can be used as generator inputs.")


def generate(data):
    validate_source(data)
    result = {
        "schemaVersion": 1,
        "countryCode": data["countryCode"].upper(),
        "frameworkVersion": str(data["frameworkVersion"]),
        "frameworkName": data.get("frameworkName", "National curriculum framework"),
        "releaseStatus": "draft",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "officialSourceUrl": data["officialSourceUrl"],
        "approvalRequired": True,
        "subjects": []
    }
    for subject in data["subjects"]:
        subject_pack = {"classLevel": subject["classLevel"], "subjectName": subject["subjectName"], "outcomes": []}
        for outcome in subject["outcomes"]:
            outcome_pack = {
                "outcomeId": outcome["outcomeId"],
                "outcomeText": outcome["outcomeText"],
                "sourcePage": outcome["sourcePage"],
                "verificationStatus": "verified-source-input-review-still-required",
                "dailySequence": [
                    {"day": 1, "type": "diagnostic", "task": "Check prior knowledge relevant to this outcome; adapt the prompt to the class and subject."},
                    {"day": 2, "type": "teach-and-model", "task": "Teach the exact outcome using an age-appropriate local example and a worked demonstration."},
                    {"day": 3, "type": "guided-practice", "task": "Practise the outcome with feedback, then gradually remove prompts."},
                    {"day": 4, "type": "independent-application", "task": "Apply the outcome independently in a familiar context; require evidence appropriate to the subject."},
                    {"day": 5, "type": "checkpoint-and-correction", "task": "Check the outcome, correct errors and assign a next step."}
                ],
                "abilityPathways": {
                    "supported-start": {"adaptation": "Concrete example, vocabulary preview, small steps and guided first item; keep the same learning goal where appropriate."},
                    "developing": {"adaptation": "Prompts, partial examples and moderate practice, gradually removing support."},
                    "working-at-class-goal": {"adaptation": "Independent class-level practice and explanation of the response or method."},
                    "extension": {"adaptation": "Multi-step transfer, comparison, justification, investigation or creation."}
                },
                "revision": {"schedule": ["next lesson", "weekly checkpoint", "end of unit", "term review"], "task": "Retrieve and apply this outcome alongside previously taught outcomes."},
                "practiceAssessment": {"label": "PacEdu practice assessment — not an official examination paper", "items": [], "authoringStatus": "questions-and-mark-scheme-required"},
                "markingRubric": {"status": "rubric-required", "criteria": ["accuracy", "method or evidence", "explanation where appropriate"], "doNotInventGradeBoundaries": True}
            }
            subject_pack["outcomes"].append(outcome_pack)
        result["subjects"].append(subject_pack)
    return result


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True, help="JSON with verified official outcome mappings")
    parser.add_argument("--output", required=True, help="Output draft JSON path")
    args = parser.parse_args()
    source = json.loads(Path(args.input).read_text(encoding="utf-8"))
    output = generate(source)
    path = Path(args.output)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"status": "draft-generated", "output": str(path), "outcomeCount": sum(len(s["outcomes"]) for s in output["subjects"])}))


if __name__ == "__main__":
    main()
