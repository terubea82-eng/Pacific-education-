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


def validate_school_calendar(calendar):
    """Validate approved teaching dates; missing calendars deliberately remain unscheduled."""
    if calendar is None:
        return None
    if not isinstance(calendar, dict):
        raise ValueError("schoolCalendar must be an approved calendar object.")
    for field in ("schoolYear", "calendarVersion", "approvedBy", "approvedAt", "teachingDays"):
        if not calendar.get(field):
            raise ValueError("schoolCalendar is missing required field: " + field)
    if calendar.get("approvalStatus") != "approved":
        raise ValueError("schoolCalendar must have approvalStatus=approved.")
    if not isinstance(calendar["teachingDays"], list) or not calendar["teachingDays"]:
        raise ValueError("schoolCalendar.teachingDays must be a non-empty list.")
    try:
        datetime.fromisoformat(str(calendar["approvedAt"]).replace("Z", "+00:00"))
    except ValueError as error:
        raise ValueError("schoolCalendar.approvedAt must be an ISO timestamp.") from error
    indexed, seen_dates, previous_date = {}, set(), None
    for entry in calendar["teachingDays"]:
        if not isinstance(entry, dict):
            raise ValueError("Every school calendar teaching day must be an object.")
        for field in ("date", "term", "week", "day"):
            if field not in entry:
                raise ValueError("School calendar teaching day is missing " + field)
        try:
            lesson_date = date.fromisoformat(str(entry["date"]))
        except (TypeError, ValueError) as error:
            raise ValueError("School calendar dates must use YYYY-MM-DD.") from error
        term, week, day = entry["term"], entry["week"], entry["day"]
        if any(not isinstance(value, int) or isinstance(value, bool) or value < 1 for value in (term, week, day)):
            raise ValueError("School calendar term, week and day must be positive integers.")
        if term not in (1, 2, 3) or week > (9 if term in (1, 2) else 5) or day > 5:
            raise ValueError("School calendar term/week/day is outside configured planning bounds.")
        key = (term, week, day)
        if key in indexed or lesson_date.isoformat() in seen_dates:
            raise ValueError("School calendar contains a duplicate teaching day or date.")
        if previous_date and lesson_date <= previous_date:
            raise ValueError("School calendar teaching dates must be in strictly increasing order.")
        indexed[key] = lesson_date.isoformat()
        seen_dates.add(lesson_date.isoformat())
        previous_date = lesson_date
    return {"schoolYear": calendar["schoolYear"], "calendarVersion": calendar["calendarVersion"],
            "approvedBy": calendar["approvedBy"], "approvedAt": calendar["approvedAt"], "dates": indexed}

def scheduled_sequence(calendar_index, term, week):
    sequence = []
    activities = [
        ("diagnostic", "Check prior knowledge relevant to this outcome; adapt the prompt to the class and subject."),
        ("teach-and-model", "Teach the exact outcome using an age-appropriate local example and a worked demonstration."),
        ("guided-practice", "Practise the outcome with feedback, then gradually remove prompts."),
        ("independent-application", "Apply the outcome independently in a familiar context; require evidence appropriate to the subject."),
        ("checkpoint-and-correction", "Check the outcome, correct errors and assign a next step.")
    ]
    for day_number, (lesson_type, task) in enumerate(activities, 1):
        lesson_date = calendar_index["dates"].get((term, week, day_number)) if calendar_index else None
        sequence.append({"term": term, "week": week, "day": day_number, "lessonDate": lesson_date,
                         "schedulingStatus": "scheduled" if lesson_date else "unscheduled-calendar-date-required",
                         "type": lesson_type, "task": task})
    return sequence

def generate(data):
    validate_source(data)
    calendar_index = validate_school_calendar(data.get("schoolCalendar"))
    result = {
        "schemaVersion": 1,
        "countryCode": data["countryCode"].upper(),
        "frameworkVersion": str(data["frameworkVersion"]),
        "frameworkName": data.get("frameworkName", "National curriculum framework"),
        "releaseStatus": "draft",
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "school": data.get("school", {}),
        "schoolCalendar": ({"schoolYear": calendar_index["schoolYear"], "calendarVersion": calendar_index["calendarVersion"], "approvalStatus": "approved", "approvedBy": calendar_index["approvedBy"], "approvedAt": calendar_index["approvedAt"]} if calendar_index else None),
        "schedulingStatus": "calendar-approved" if calendar_index else "setup-required-school-calendar-missing",
        "setupWarnings": [] if calendar_index else ["Add an approved school calendar; lessons remain unscheduled and no dates have been inferred."],
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
                "dailySequence": scheduled_sequence(calendar_index, 1, 1),
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
