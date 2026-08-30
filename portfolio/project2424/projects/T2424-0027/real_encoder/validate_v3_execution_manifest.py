from __future__ import annotations

import copy
import hashlib
import json
from pathlib import Path

HERE = Path(__file__).resolve().parent
PREREG = HERE / "manifest_v3_preregistered.json"
EXECUTION = HERE / "manifest_v3_execution.json"
AUTH = HERE / "AUTHORIZATION_V3.json"


def read(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def git_blob_sha(path: Path) -> str:
    payload = path.read_bytes()
    header = f"blob {len(payload)}\0".encode("ascii")
    return hashlib.sha1(header + payload).hexdigest()


def main() -> None:
    prereg = read(PREREG)
    execution = read(EXECUTION)
    auth = read(AUTH)

    assert auth["authorization_status"] == "AUTHORIZED_FOR_ONE_FROZEN_OUTCOME_EXECUTION"
    assert auth["protocol_id"] == prereg["protocol_id"] == execution["protocol_id"]
    assert auth["authorized_manifest_path"].endswith("manifest_v3_preregistered.json")
    assert git_blob_sha(PREREG) == auth["authorized_manifest_blob_sha"]
    assert prereg["status"] == "PREREGISTERED_BEFORE_OUTCOME_ACCESS_EXECUTION_NOT_AUTHORIZED"
    assert prereg["execution_authorized"] is False

    expected = copy.deepcopy(prereg)
    expected["status"] = "FROZEN_BEFORE_OUTCOME_ACCESS"
    expected["execution_authorized"] = True
    if execution != expected:
        keys = sorted(set(execution) | set(expected))
        drift = [key for key in keys if execution.get(key) != expected.get(key)]
        raise RuntimeError(f"Execution manifest has scientific/configuration drift: {drift}")

    assert execution["seeds"] == [2401, 2402, 2403, 2404, 2405]
    assert execution["dataset"]["expected_intent_count"] == 50
    assert execution["dataset"]["examples_per_locale_intent_per_split"] == 15
    assert execution["encoder"]["fine_tuning"] is False
    assert execution["compute_budget"]["gpu_hours"] == 0
    assert execution["compute_budget"]["hyperparameter_search"] == "forbidden"

    print("PASS: execution manifest differs from authorized preregistration only in the two authorized execution-state fields")


if __name__ == "__main__":
    main()
