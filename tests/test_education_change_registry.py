import json
import importlib.util
import subprocess
import sys
import tempfile
import shutil
import unittest
from datetime import date
from pathlib import Path
from urllib.parse import urlparse

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "automation" / "education-change-sources.json"
MONITOR = ROOT / "automation" / "education_change_monitor.py"

class EducationChangeRegistryTests(unittest.TestCase):
    def test_registry_has_fiji_working_framework_and_sources(self):
        data = json.loads(REGISTRY.read_text(encoding="utf-8"))
        self.assertEqual(data["defaultCountry"], "FJ")
        profile = data["curriculumProfiles"][0]
        self.assertEqual(profile["framework"]["version"], "2013")
        self.assertIn("replacement-is-formally-in-force", profile["framework"]["status"])
        self.assertGreaterEqual(len(profile["sources"]), 5)
        for source in profile["sources"]:
            self.assertEqual(urlparse(source["url"]).scheme, "https")
            self.assertTrue(source["id"])
            self.assertTrue(source["publisher"])
            self.assertTrue(source["topics"])


    def test_active_manifest_locks_fiji_baseline_and_is_versioned(self):
        manifest = ROOT / "src" / "data" / "curriculum" / "active-frameworks.json"
        data = json.loads(manifest.read_text(encoding="utf-8"))
        self.assertEqual(data["schemaVersion"], 1)
        self.assertEqual(data["defaultCountry"], "FJ")
        fiji = data["countries"]["FJ"]
        self.assertEqual(fiji["frameworkVersion"], "2013")
        self.assertEqual(fiji["releaseStatus"], "baseline")
        self.assertIsNone(fiji["approvedContentPackUrl"])

    def test_curriculum_generator_creates_draft_not_approved_content(self):
        generator = ROOT / "automation" / "curriculum_pack_generator.py"
        source = {
            "countryCode": "FJ",
            "frameworkName": "Fiji National Curriculum Framework",
            "frameworkVersion": "2013",
            "officialSourceUrl": "https://www.education.gov.fj/",
            "releaseStatus": "draft",
            "subjects": [{
                "classLevel": "Class 1",
                "subjectName": "English",
                "outcomes": [{
                    "outcomeId": "TEST-OUTCOME-1",
                    "outcomeText": "Verified example outcome text",
                    "sourcePage": "Page 12",
                    "verificationStatus": "verified"
                }]
            }]
        }
        with tempfile.TemporaryDirectory() as tmp:
            input_path = Path(tmp) / "input.json"
            output_path = Path(tmp) / "output.json"
            input_path.write_text(json.dumps(source), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(generator), "--input", str(input_path), "--output", str(output_path)],
                capture_output=True, text=True
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            pack = json.loads(output_path.read_text(encoding="utf-8"))
            outcome = pack["subjects"][0]["outcomes"][0]
            self.assertEqual(pack["releaseStatus"], "draft")
            self.assertFalse(pack.get("studentReady", False))
            self.assertEqual(len(outcome["abilityPathways"]), 4)
            self.assertIn("revision", outcome)
            self.assertIn("practiceAssessment", outcome)
            self.assertEqual(outcome["practiceAssessment"]["authoringStatus"], "questions-and-mark-scheme-required")

    def test_curriculum_generator_rejects_unverified_outcomes(self):
        generator = ROOT / "automation" / "curriculum_pack_generator.py"
        source = {
            "countryCode": "FJ",
            "frameworkVersion": "2013",
            "officialSourceUrl": "https://www.education.gov.fj/",
            "releaseStatus": "draft",
            "subjects": [{
                "classLevel": "Class 1",
                "subjectName": "English",
                "outcomes": [{
                    "outcomeId": "PENDING",
                    "outcomeText": "Not yet verified",
                    "sourcePage": "unknown",
                    "verificationStatus": "pending"
                }]
            }]
        }
        with tempfile.TemporaryDirectory() as tmp:
            input_path = Path(tmp) / "input.json"
            output_path = Path(tmp) / "output.json"
            input_path.write_text(json.dumps(source), encoding="utf-8")
            result = subprocess.run(
                [sys.executable, str(generator), "--input", str(input_path), "--output", str(output_path)],
                capture_output=True, text=True
            )
            self.assertNotEqual(result.returncode, 0)
            self.assertIn("verified", result.stderr)

    def test_live_runtime_blocks_other_countries_without_approved_packs(self):
        runtime = ROOT / "src" / "js" / "pacificEducationCurriculumAutoSwitch.js"
        content = runtime.read_text(encoding="utf-8")
        self.assertIn("findApprovedLesson", content)
        self.assertIn("active.content", content)
        self.assertIn("Old-country or old-framework content will not be substituted", content)
        index = (ROOT / "src" / "index.html").read_text(encoding="utf-8")
        self.assertIn("pacificEducationCurriculumAutoSwitch.js", index)

    def test_automation_scripts_compile(self):
        scripts = [
            MONITOR,
            ROOT / "automation" / "curriculum_pack_generator.py",
            ROOT / "automation" / "curriculum_release_activation.py"
        ]
        for script in scripts:
            result = subprocess.run([sys.executable, "-m", "py_compile", str(script)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, str(script) + ": " + result.stderr)
        if shutil.which("node"):
            runtime = ROOT / "src" / "js" / "pacificEducationCurriculumAutoSwitch.js"
            result = subprocess.run(["node", "--check", str(runtime)], capture_output=True, text=True)
            self.assertEqual(result.returncode, 0, result.stderr)


    def test_verified_effective_release_switches_manifest_and_preserves_history(self):
        script = ROOT / "automation" / "curriculum_release_activation.py"
        spec = importlib.util.spec_from_file_location("pacedu_release_activation_test", script)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manifest_path = root / "src/data/curriculum/active-frameworks.json"
            registry_path = root / "automation/education-change-sources.json"
            release_dir = root / "automation/curriculum-releases"
            pack_path = root / "src/data/curriculum/generated/FJ/2027/activities.json"
            for path in (manifest_path.parent, registry_path.parent, release_dir, pack_path.parent):
                path.mkdir(parents=True, exist_ok=True)
            manifest_path.write_text(json.dumps({
                "schemaVersion": 1, "defaultCountry": "FJ",
                "countries": {"FJ": {"enabled": True, "countryName": "Fiji",
                    "frameworkName": "Old framework", "frameworkVersion": "2013",
                    "effectiveFrom": None, "releaseStatus": "baseline"}}
            }), encoding="utf-8")
            registry_path.write_text(json.dumps({"curriculumProfiles": [{
                "countryCode": "FJ",
                "framework": {"sourceUrl": "https://education.example.gov/"},
                "sources": [{"url": "https://education.example.gov/curriculum/"}]
            }]}), encoding="utf-8")
            pack_path.write_text(json.dumps({
                "countryCode": "FJ", "frameworkVersion": "2027",
                "releaseStatus": "approved", "studentReady": True,
                "subjects": [{"classLevel": "Class 1", "subjectName": "English",
                    "outcomes": [{"outcomeId": "E1", "outcomeText": "Exact outcome", "sourcePage": "p. 2"}]}],
                "dailyLessons": [{"classLevel": "Class 1", "subjectName": "English",
                    "term": "T1", "week": 1, "day": 1, "ability": "developing",
                    "approvedForStudents": True, "worksheet": {"questions": [{"prompt": "Approved item"}]}}]
            }), encoding="utf-8")
            (release_dir / "FJ-2027.json").write_text(json.dumps({
                "countryCode": "FJ", "countryName": "Fiji",
                "frameworkName": "New official framework", "frameworkVersion": "2027",
                "effectiveDate": "2026-10-01",
                "officialNoticeUrl": "https://education.example.gov/curriculum/commencement",
                "officialPublisher": "Ministry of Education",
                "verificationStatus": "verified", "releaseStatus": "approved",
                "schoolAdoptionStatus": "nationally-in-force",
                "reviewedBy": "curriculum-reviewer", "approvedBy": "school-approver",
                "reviewedAt": "2026-09-30T09:00:00Z",
                "approvedContentPackPath": "src/data/curriculum/generated/FJ/2027/activities.json"
            }), encoding="utf-8")
            module.ROOT = root
            module.MANIFEST = manifest_path
            module.REGISTRY = registry_path
            module.RELEASE_DIR = release_dir
            result = module.activate(today=date(2026, 10, 28), write=True)
            self.assertTrue(result["changed"])
            self.assertEqual(result["countriesChanged"][0]["frameworkVersion"], "2027")
            self.assertEqual(result["countriesChanged"][0]["effectiveFrom"], "2026-10-01")
            activated = json.loads(manifest_path.read_text(encoding="utf-8"))["countries"]["FJ"]
            self.assertEqual(activated["frameworkVersion"], "2027")
            self.assertEqual(activated["frameworkHistory"][0]["frameworkVersion"], "2013")

    def test_future_release_does_not_activate(self):
        script = ROOT / "automation" / "curriculum_release_activation.py"
        content = script.read_text(encoding="utf-8")
        self.assertIn('if effective > today:', content)
        self.assertIn('return {"ready": False, "reason": "effective date is in the future"}', content)

    def test_activation_without_release_records_does_not_change_baseline(self):
        script = ROOT / "automation" / "curriculum_release_activation.py"
        spec = importlib.util.spec_from_file_location("pacedu_empty_release_activation_test", script)
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            manifest_path = root / "src/data/curriculum/active-frameworks.json"
            registry_path = root / "automation/education-change-sources.json"
            release_dir = root / "automation/curriculum-releases"
            manifest_path.parent.mkdir(parents=True)
            registry_path.parent.mkdir(parents=True)
            manifest_path.write_text(json.dumps({"schemaVersion": 1, "defaultCountry": "FJ", "countries": {}}), encoding="utf-8")
            registry_path.write_text(json.dumps({"curriculumProfiles": []}), encoding="utf-8")
            module.ROOT = root
            module.MANIFEST = manifest_path
            module.REGISTRY = registry_path
            module.RELEASE_DIR = release_dir
            result = module.activate(today=date(2026, 10, 28), write=False)
            self.assertFalse(result["changed"])
            self.assertEqual(result["reason"], "no curriculum release records")


    def test_generator_keeps_missing_calendar_unscheduled(self):
        spec = importlib.util.spec_from_file_location("pacedu_calendar_generator_test", ROOT / "automation" / "curriculum_pack_generator.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        source = {
            "countryCode": "FJ", "frameworkVersion": "2013",
            "officialSourceUrl": "https://www.education.gov.fj/", "releaseStatus": "draft",
            "subjects": [{"classLevel": "Class 1", "subjectName": "English", "outcomes": [{
                "outcomeId": "E1", "outcomeText": "Recognise letters", "sourcePage": "p. 1",
                "verificationStatus": "verified", "term": 1, "week": 1
            }]}]
        }
        pack = module.generate(source)
        outcome = pack["subjects"][0]["outcomes"][0]
        self.assertEqual(pack["schedulingStatus"], "setup-required-school-calendar-missing")
        self.assertIsNone(outcome["dailySequence"][0]["lessonDate"])
        self.assertEqual(outcome["dailySequence"][0]["schedulingStatus"], "unscheduled-calendar-date-required")
        self.assertEqual(outcome["preparationStatus"], "incomplete-draft-content-required")

    def test_generator_uses_only_approved_school_calendar_dates(self):
        spec = importlib.util.spec_from_file_location("pacedu_calendar_generator_valid_test", ROOT / "automation" / "curriculum_pack_generator.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        source = {
            "countryCode": "FJ", "frameworkVersion": "2013",
            "officialSourceUrl": "https://www.education.gov.fj/", "releaseStatus": "draft",
            "schoolCalendar": {
                "schoolYear": "2027", "calendarVersion": "school-2027-v1",
                "approvalStatus": "approved", "approvedBy": "school-principal",
                "approvedAt": "2026-11-01T09:00:00Z",
                "teachingDays": [
                    {"date": "2027-01-25", "term": 1, "week": 1, "day": 1},
                    {"date": "2027-01-26", "term": 1, "week": 1, "day": 2},
                    {"date": "2027-01-27", "term": 1, "week": 1, "day": 3},
                    {"date": "2027-01-28", "term": 1, "week": 1, "day": 4},
                    {"date": "2027-01-29", "term": 1, "week": 1, "day": 5}
                ]
            },
            "subjects": [{"classLevel": "Class 1", "subjectName": "English", "outcomes": [{
                "outcomeId": "E1", "outcomeText": "Recognise letters", "sourcePage": "p. 1",
                "verificationStatus": "verified", "term": 1, "week": 1
            }]}]
        }
        pack = module.generate(source)
        lessons = pack["subjects"][0]["outcomes"][0]["dailySequence"]
        self.assertEqual(pack["schedulingStatus"], "calendar-approved")
        self.assertEqual([item["lessonDate"] for item in lessons],
                         ["2027-01-25", "2027-01-26", "2027-01-27", "2027-01-28", "2027-01-29"])
        self.assertTrue(all(item["schedulingStatus"] == "scheduled" for item in lessons))

    def test_generator_rejects_unapproved_or_duplicate_school_calendar(self):
        spec = importlib.util.spec_from_file_location("pacedu_calendar_generator_invalid_test", ROOT / "automation" / "curriculum_pack_generator.py")
        module = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(module)
        calendar = {
            "schoolYear": "2027", "calendarVersion": "v1",
            "approvalStatus": "pending", "approvedBy": "principal",
            "approvedAt": "2026-11-01T09:00:00Z",
            "teachingDays": [{"date": "2027-01-25", "term": 1, "week": 1, "day": 1}]
        }
        with self.assertRaisesRegex(ValueError, "approvalStatus=approved"):
            module.validate_school_calendar(calendar)
        calendar["approvalStatus"] = "approved"
        calendar["teachingDays"].append({"date": "2027-01-25", "term": 1, "week": 1, "day": 2})
        with self.assertRaisesRegex(ValueError, "duplicate"):
            module.validate_school_calendar(calendar)

if __name__ == "__main__":
    unittest.main()
