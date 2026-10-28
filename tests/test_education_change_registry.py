import json
import subprocess
import sys
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

    def test_monitor_script_compiles(self):
        result = subprocess.run([sys.executable, "-m", "py_compile", str(MONITOR)], capture_output=True, text=True)
        self.assertEqual(result.returncode, 0, result.stderr)

if __name__ == "__main__":
    unittest.main()
