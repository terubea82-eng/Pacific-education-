import datetime as dt
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

SPEC = importlib.util.spec_from_file_location("verify_device_evidence", Path(__file__).with_name("verify_device_evidence.py"))
MODULE = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(MODULE)
COMMIT = "a" * 40


class EvidenceValidationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        (self.root / "android-screen.png").write_bytes(b"synthetic screenshot")
        (self.root / "activities.txt").write_text("activity fj.pacificeducation.app.debug", encoding="utf-8")
        self.now = dt.datetime.now(dt.timezone.utc)
        self.record = {
            "schema": "pacedu-physical-device-evidence/v1", "status": "PASS", "device_class": "android-phone",
            "physical_device": True, "session_timestamp_utc": self.now.isoformat(),
            "device": {"serial": "R58TEST123", "model": "SM-A065F", "product_device": "a06", "sdk": "36"},
            "build": {"commit": COMMIT, "apk_sha256": "b" * 64},
            "test_action": {"result": "PASS", "device_originated": True},
            "artifacts": ["android-screen.png", "activities.txt"]
        }

    def tearDown(self): self.temp.cleanup()
    def errors(self, record=None): return MODULE.validate(record or self.record, COMMIT, self.root, now=self.now)

    def test_valid_record(self): self.assertEqual([], self.errors())

    def test_disconnected_and_manual_pass_rejected(self):
        record = json.loads(json.dumps(self.record)); record["physical_device"] = False
        self.assertTrue(any("physical_device" in e for e in self.errors(record)))
        record = json.loads(json.dumps(self.record)); record["test_action"]["device_originated"] = False
        self.assertTrue(any("device-originated" in e for e in self.errors(record)))

    def test_emulator_rejected(self):
        record = json.loads(json.dumps(self.record)); record["device"]["serial"] = "emulator-5554"
        self.assertTrue(any("emulator serial" in e for e in self.errors(record)))
        record = json.loads(json.dumps(self.record)); record["device"]["model"] = "sdk_gphone64_x86_64"
        self.assertTrue(any("emulator signature" in e for e in self.errors(record)))

    def test_stale_session_rejected(self):
        record = json.loads(json.dumps(self.record))
        record["session_timestamp_utc"] = (self.now - dt.timedelta(days=2)).isoformat()
        self.assertTrue(any("stale" in e for e in self.errors(record)))

    def test_wrong_commit_rejected(self):
        record = json.loads(json.dumps(self.record)); record["build"]["commit"] = "c" * 40
        self.assertTrue(any("does not match" in e for e in self.errors(record)))

    def test_missing_artifact_rejected(self):
        record = json.loads(json.dumps(self.record)); record["artifacts"].append("missing.png")
        self.assertTrue(any("missing, empty" in e for e in self.errors(record)))

    def test_missing_device_identity_and_bad_checksum_rejected(self):
        record = json.loads(json.dumps(self.record)); record["device"]["model"] = ""; record["build"]["apk_sha256"] = "bad"
        errors = self.errors(record)
        self.assertTrue(any("model/product" in e for e in errors))
        self.assertTrue(any("SHA-256" in e for e in errors))


if __name__ == "__main__":
    unittest.main()
