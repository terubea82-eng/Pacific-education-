import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "automation" / "production_release_gate.py"


def test_current_release_record_is_fail_closed():
    result = subprocess.run(
        [sys.executable, str(SCRIPT)],
        cwd=ROOT,
        capture_output=True,
        text=True,
    )
    assert result.returncode != 0, (
        "Gate unexpectedly passed while production authorization is incomplete"
    )
    output = result.stdout + result.stderr
    assert "BLOCKED" in output
    assert "explicit protected production authorization" in output


if __name__ == "__main__":
    test_current_release_record_is_fail_closed()
    print("production release gate fail-closed test: PASS")
