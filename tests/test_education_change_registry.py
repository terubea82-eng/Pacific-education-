import json
import subprocess
import sys
import tempfile
import unittest
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
        self.assertIn("takes-effect", profile["framework"]["status"])
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

    def test_monitor_script_compiles(self):
        result = subprocess.run([sys.executable, "-m", "py_compile", str(MONITOR)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

if __name__ == "__main__":
    unittest.main()
