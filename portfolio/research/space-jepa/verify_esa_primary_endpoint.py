from __future__ import annotations

import json
from pathlib import Path

from space_jepa.esa_primary import (
    FROZEN_BASELINES,
    FROZEN_SEEDS,
    FROZEN_SURFACES,
    PRIMARY_SCORE_KEY,
    PRIMARY_VIEW,
)


ROOT = Path(__file__).resolve().parent
FREEZE_PATH = ROOT / "ESA_PRIMARY_ENDPOINT_V0.json"
EXPECTED_UPSTREAM_COMMIT = "aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33"
EXPECTED_ESASCORES_BLOB = "dbfe1e20b121012f1f144cff1303710b98ed0df5"


def verify_freeze(path: Path = FREEZE_PATH) -> dict[str, object]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    errors: list[str] = []

    if payload.get("schema") != "space-jepa.esa-primary-endpoint.v0":
        errors.append("unexpected schema")
    if payload.get("status") != "FROZEN_PRE_OUTCOME_NOT_EXECUTED":
        errors.append("freeze must remain pre-outcome and not executed")

    benchmark = payload.get("benchmark", {})
    if benchmark.get("upstream_commit") != EXPECTED_UPSTREAM_COMMIT:
        errors.append("ESA-ADB upstream commit drift")
    if benchmark.get("esascores_source_git_blob") != EXPECTED_ESASCORES_BLOB:
        errors.append("ESAScores source blob drift")
    if benchmark.get("metric_view") != PRIMARY_VIEW:
        errors.append("primary category-view drift")
    if benchmark.get("metric_key") != PRIMARY_SCORE_KEY:
        errors.append("primary metric-key drift")
    if benchmark.get("beta") != 0.5:
        errors.append("primary beta drift")
    if benchmark.get("direction") != "higher_is_better":
        errors.append("primary direction drift")

    if tuple(payload.get("surfaces", [])) != FROZEN_SURFACES:
        errors.append("primary mission-surface drift")
    if tuple(payload.get("seeds", [])) != FROZEN_SEEDS:
        errors.append("primary seed drift")
    if tuple(payload.get("matched_baselines", [])) != FROZEN_BASELINES:
        errors.append("primary comparator drift")

    comparison = payload.get("comparison", {})
    requirements = comparison.get("surface_success_requires", {})
    if requirements.get("mean_paired_delta_strictly_greater_than") != 0.0:
        errors.append("mean paired-delta gate drift")
    if requirements.get("strictly_positive_seed_deltas_at_least") != 4:
        errors.append("seed-consistency gate drift")
    if requirements.get("required_seed_count") != 5:
        errors.append("required seed count drift")
    if comparison.get("ties_are_wins") is not False:
        errors.append("ties must not count as wins")
    if comparison.get("practical_effect_threshold") is not None:
        errors.append("post-outcome practical-effect threshold is forbidden in v0")
    if comparison.get("significance_test") is not None:
        errors.append("post-outcome significance test is forbidden in v0")

    authorization = payload.get("authorization", {})
    if authorization.get("heldout_label_access_authorized") is not False:
        errors.append("held-out label access must remain unauthorized")
    if authorization.get("model_outcomes_generated") is not False:
        errors.append("freeze cannot claim model outcomes")
    if authorization.get("execution_authorized") is not False:
        errors.append("freeze cannot self-authorize execution")

    if errors:
        raise ValueError("ESA primary endpoint freeze invalid: " + "; ".join(errors))
    return payload


if __name__ == "__main__":
    freeze = verify_freeze()
    print(
        json.dumps(
            {
                "status": "PASS_PRE_OUTCOME_ENDPOINT_FREEZE",
                "schema": freeze["schema"],
                "metric": f"{PRIMARY_VIEW}.{PRIMARY_SCORE_KEY}",
                "surfaces": list(FROZEN_SURFACES),
                "seeds": list(FROZEN_SEEDS),
                "baselines": list(FROZEN_BASELINES),
                "execution_authorized": False,
            },
            indent=2,
        )
    )
