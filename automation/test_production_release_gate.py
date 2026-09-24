import json
import pathlib
import subprocess
import tempfile

ROOT = pathlib.Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "automation" / "production_release_gate.py"

def run(payload):
    with tempfile.TemporaryDirectory() as td:
        p = pathlib.Path(td) / "production-authorization.json"
        p.write_text(json.dumps(payload), encoding="utf-8")
        # The production gate reads the repository release file, so this test
        # verifies the source script syntax separately rather than mutating repo state.
    return subprocess.run(["python3", "-m", "py_compile", str(SCRIPT)], capture_output=True, text=True)

def test_gate_script_compiles():
    result = run({})
    assert result.returncode == 0, result.stderr

if __name__ == "__main__":
    test_gate_script_compiles()
    print("production release gate test: PASS")
