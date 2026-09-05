from __future__ import annotations

import hashlib
import json
from pathlib import Path


HERE = Path(__file__).resolve().parent
PREREG = HERE / "manifest_v3_preregistered.json"
AUTH = HERE / "AUTHORIZATION_V3.json"

EXPECTED_PREREG_COMMIT = "a3fc8fb13c600ec5a7b5a3bc4379b88c80a11c7a"
EXPECTED_PREREG_BLOB = "3adc92ebf9203f20319582e33c98ba570f9d884c"
EXPECTED_PREREG_CI_RUN = 33281085988
EXPECTED_PREREG_STATUS = "PREREGISTERED_BEFORE_OUTCOME_ACCESS_EXECUTION_NOT_AUTHORIZED"
EXECUTION_STATUS = "FROZEN_BEFORE_OUTCOME_ACCESS"


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


def git_blob_sha(path: Path) -> str:
    payload = path.read_bytes()
    header = f"blob {len(payload)}\0".encode("ascii")
    return hashlib.sha1(header + payload).hexdigest()


def materialize_execution_manifest(prereg: dict, authorization: dict) -> dict:
    execution = json.loads(json.dumps(prereg))
    execution["status"] = EXECUTION_STATUS
    execution["execution_authorized"] = True
    return execution


def main() -> None:
    prereg = read_json(PREREG)
    authorization = read_json(AUTH)

    if prereg.get("status") != EXPECTED_PREREG_STATUS:
        raise RuntimeError("Preregistration manifest status drifted from the outcome-free frozen state.")
    if prereg.get("execution_authorized") is not False:
        raise RuntimeError("Preregistration manifest must remain execution_authorized=false.")

    if authorization.get("protocol_id") != prereg.get("protocol_id"):
        raise RuntimeError("Authorization protocol_id does not match preregistration.")
    if authorization.get("authorized_preregistration_commit") != EXPECTED_PREREG_COMMIT:
        raise RuntimeError("Authorization does not bind the exact verified preregistration commit.")
    if authorization.get("authorized_manifest_path") != str(PREREG.relative_to(Path.cwd())):
        raise RuntimeError("Authorization manifest path does not resolve to the frozen preregistration manifest.")
    if authorization.get("authorized_manifest_blob_sha") != EXPECTED_PREREG_BLOB:
        raise RuntimeError("Authorization records the wrong preregistration blob SHA.")
    observed_blob = git_blob_sha(PREREG)
    if observed_blob != EXPECTED_PREREG_BLOB:
        raise RuntimeError(f"Preregistration blob drift: expected {EXPECTED_PREREG_BLOB}, observed {observed_blob}.")
    if authorization.get("preregistration_ci_run") != EXPECTED_PREREG_CI_RUN:
        raise RuntimeError("Authorization references the wrong preregistration CI run.")
    if authorization.get("preregistration_ci_conclusion") != "success":
        raise RuntimeError("Authorization requires a successful exact-head preregistration CI run.")

    gate = authorization.get("dataset_only_gate", {})
    expected_gate = {
        "admissible_intent_count": 50,
        "minimum_cell_count": 15,
        "encoder_instantiated": False,
        "model_outcomes_accessed": False,
    }
    if gate != expected_gate:
        raise RuntimeError(f"Outcome-free dataset gate drifted: {gate!r}")

    if authorization.get("authorization_status") != "AUTHORIZED_FOR_ONE_FROZEN_OUTCOME_EXECUTION":
        raise RuntimeError("Authorization status must permit exactly one frozen outcome execution.")

    required_prohibitions = {
        "rescue tuning",
        "seed changes",
        "threshold movement",
        "dataset or encoder swapping",
        "control deletion",
        "outcome-dependent intent selection",
        "hyperparameter search",
        "superiority claims unsupported by matched baselines",
    }
    if set(authorization.get("prohibited_after_authorization", [])) != required_prohibitions:
        raise RuntimeError("Post-authorization prohibitions are incomplete or altered.")

    execution = materialize_execution_manifest(prereg, authorization)
    changed = {
        key
        for key in set(prereg) | set(execution)
        if prereg.get(key) != execution.get(key)
    }
    if changed != {"status", "execution_authorized"}:
        raise RuntimeError(f"Execution materialization changed scientific fields: {sorted(changed)}")
    if execution["status"] != EXECUTION_STATUS or execution["execution_authorized"] is not True:
        raise RuntimeError("Execution manifest did not materialize the authorized state transition.")

    for locked_field in (
        "hypothesis",
        "claim_boundary",
        "dataset",
        "encoder",
        "seeds",
        "primary_probe",
        "comparator_family",
        "transforms",
        "metrics",
        "statistics",
        "predeclared_success_gate",
        "predeclared_falsifiers",
        "compute_budget",
        "stop_rules",
        "environment",
        "artifacts",
        "scientific_integrity",
    ):
        if execution.get(locked_field) != prereg.get(locked_field):
            raise RuntimeError(f"Scientific field drifted during authorization: {locked_field}")

    print("PASS: v3 authorization is bound to the verified preregistration and changes only execution state")


if __name__ == "__main__":
    main()
