from __future__ import annotations

from collections.abc import Iterable, Mapping
from math import isfinite
from typing import Any


FROZEN_SURFACES = ("mission1-lite", "mission2-lite")
FROZEN_SEEDS = (17, 29, 43, 71, 101)
FROZEN_METHOD = "space_jepa"
FROZEN_BASELINES = ("robust_zscore", "persistence")
PRIMARY_VIEW = "anomaly_only"
PRIMARY_SCORE_KEY = "EW_F_0.50"


def _primary_score(record: Mapping[str, Any]) -> float:
    try:
        value = float(record["scores"][PRIMARY_VIEW][PRIMARY_SCORE_KEY])
    except (KeyError, TypeError, ValueError) as exc:
        raise ValueError(
            f"record must contain finite scores.{PRIMARY_VIEW}.{PRIMARY_SCORE_KEY}"
        ) from exc
    if not isfinite(value):
        raise ValueError("primary ESA score must be finite")
    return value


def esa_primary_decision(records: Iterable[Mapping[str, Any]]) -> dict[str, Any]:
    """Evaluate the frozen pre-outcome ESA primary decision rule.

    Each record must contain exactly one frozen mission surface, one frozen seed,
    one frozen method, and the raw official ESAScores payload nested under
    ``scores``. The primary comparison is Space-JEPA against the stronger of
    robust-z and persistence on the same surface and seed.

    This function is deliberately outcome-agnostic plumbing. It does not read
    ESA labels, fit thresholds, run a model, select a metric, or authorize
    scientific execution.
    """

    expected = {
        (surface, seed, method)
        for surface in FROZEN_SURFACES
        for seed in FROZEN_SEEDS
        for method in (FROZEN_METHOD, *FROZEN_BASELINES)
    }
    observed: dict[tuple[str, int, str], float] = {}

    for record in records:
        try:
            surface = str(record["surface"])
            seed = int(record["seed"])
            method = str(record["method"])
        except (KeyError, TypeError, ValueError) as exc:
            raise ValueError("each record requires surface, seed, and method") from exc

        identity = (surface, seed, method)
        if identity not in expected:
            raise ValueError(f"record outside frozen ESA primary surface: {identity!r}")
        if identity in observed:
            raise ValueError(f"duplicate ESA primary record: {identity!r}")
        observed[identity] = _primary_score(record)

    missing = sorted(expected - observed.keys())
    if missing:
        raise ValueError(f"missing frozen ESA primary records: {missing!r}")
    extras = sorted(observed.keys() - expected)
    if extras:
        raise ValueError(f"unexpected frozen ESA primary records: {extras!r}")

    surfaces: dict[str, Any] = {}
    overall_success = True
    for surface in FROZEN_SURFACES:
        seed_rows = []
        deltas = []
        for seed in FROZEN_SEEDS:
            space_score = observed[(surface, seed, FROZEN_METHOD)]
            baseline_scores = {
                baseline: observed[(surface, seed, baseline)]
                for baseline in FROZEN_BASELINES
            }
            strongest_name, strongest_score = max(
                baseline_scores.items(), key=lambda item: (item[1], item[0])
            )
            delta = space_score - strongest_score
            deltas.append(delta)
            seed_rows.append(
                {
                    "seed": seed,
                    "space_jepa": space_score,
                    "robust_zscore": baseline_scores["robust_zscore"],
                    "persistence": baseline_scores["persistence"],
                    "strongest_baseline": strongest_name,
                    "strongest_baseline_score": strongest_score,
                    "paired_delta": delta,
                    "strict_win": delta > 0.0,
                }
            )

        mean_delta = sum(deltas) / len(deltas)
        positive_seed_count = sum(delta > 0.0 for delta in deltas)
        surface_success = mean_delta > 0.0 and positive_seed_count >= 4
        surfaces[surface] = {
            "mean_paired_delta": mean_delta,
            "positive_seed_count": positive_seed_count,
            "required_positive_seed_count": 4,
            "seed_count": len(deltas),
            "surface_success": surface_success,
            "seeds": seed_rows,
        }
        overall_success = overall_success and surface_success

    return {
        "schema": "space-jepa.esa-primary-decision.v0",
        "primary_view": PRIMARY_VIEW,
        "primary_metric": PRIMARY_SCORE_KEY,
        "direction": "higher_is_better",
        "surfaces": surfaces,
        "primary_success": overall_success,
        "decision_rule": "both surfaces require mean paired delta > 0 and >=4/5 strictly positive seed deltas",
        "secondary_metrics_can_rescue": False,
    }
