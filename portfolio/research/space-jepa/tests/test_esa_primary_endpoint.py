from __future__ import annotations

import copy

import pytest

from space_jepa.esa_primary import (
    FROZEN_BASELINES,
    FROZEN_SEEDS,
    FROZEN_SURFACES,
    esa_primary_decision,
)


def _records(
    *,
    space: float = 0.8,
    robust_z: float = 0.6,
    persistence: float = 0.7,
) -> list[dict[str, object]]:
    values = {
        "space_jepa": space,
        "robust_zscore": robust_z,
        "persistence": persistence,
    }
    rows = []
    for surface in FROZEN_SURFACES:
        for seed in FROZEN_SEEDS:
            for method in ("space_jepa", *FROZEN_BASELINES):
                rows.append(
                    {
                        "surface": surface,
                        "seed": seed,
                        "method": method,
                        "scores": {
                            "anomaly_only": {
                                "EW_F_0.50": values[method],
                                "AFF_F_0.50": 0.99,
                            },
                            "anomaly_plus_rare_event": {"EW_F_0.50": 0.99},
                        },
                    }
                )
    return rows


def _find(rows: list[dict[str, object]], surface: str, seed: int, method: str) -> dict[str, object]:
    return next(
        row
        for row in rows
        if row["surface"] == surface and row["seed"] == seed and row["method"] == method
    )


def test_primary_success_requires_both_surfaces_and_four_of_five_strict_seed_wins() -> None:
    result = esa_primary_decision(_records())
    assert result["primary_success"] is True
    assert result["secondary_metrics_can_rescue"] is False
    for surface in FROZEN_SURFACES:
        assert result["surfaces"][surface]["surface_success"] is True
        assert result["surfaces"][surface]["positive_seed_count"] == 5
        assert result["surfaces"][surface]["mean_paired_delta"] == pytest.approx(0.1)


def test_strongest_matched_baseline_is_selected_conservatively_per_seed() -> None:
    rows = _records(space=0.8, robust_z=0.79, persistence=0.2)
    result = esa_primary_decision(rows)
    for surface in FROZEN_SURFACES:
        for seed_row in result["surfaces"][surface]["seeds"]:
            assert seed_row["strongest_baseline"] == "robust_zscore"
            assert seed_row["paired_delta"] == pytest.approx(0.01)


def test_one_surface_failure_fails_overall_even_if_secondary_metrics_are_large() -> None:
    rows = _records()
    for seed in FROZEN_SEEDS[:2]:
        row = _find(rows, "mission2-lite", seed, "space_jepa")
        row["scores"]["anomaly_only"]["EW_F_0.50"] = 0.69
        row["scores"]["anomaly_only"]["AFF_F_0.50"] = 1.0
        row["scores"]["anomaly_plus_rare_event"]["EW_F_0.50"] = 1.0
    result = esa_primary_decision(rows)
    assert result["surfaces"]["mission1-lite"]["surface_success"] is True
    assert result["surfaces"]["mission2-lite"]["positive_seed_count"] == 3
    assert result["surfaces"]["mission2-lite"]["surface_success"] is False
    assert result["primary_success"] is False


def test_ties_are_not_seed_wins() -> None:
    rows = _records(space=0.7, robust_z=0.6, persistence=0.7)
    result = esa_primary_decision(rows)
    assert result["primary_success"] is False
    for surface in FROZEN_SURFACES:
        assert result["surfaces"][surface]["positive_seed_count"] == 0
        assert result["surfaces"][surface]["mean_paired_delta"] == pytest.approx(0.0)


def test_missing_duplicate_or_nonfinite_records_fail_closed() -> None:
    rows = _records()
    with pytest.raises(ValueError, match="missing frozen ESA primary records"):
        esa_primary_decision(rows[:-1])

    duplicate = copy.deepcopy(rows)
    duplicate.append(copy.deepcopy(rows[0]))
    with pytest.raises(ValueError, match="duplicate ESA primary record"):
        esa_primary_decision(duplicate)

    bad = copy.deepcopy(rows)
    bad[0]["scores"]["anomaly_only"]["EW_F_0.50"] = float("nan")
    with pytest.raises(ValueError, match="must be finite"):
        esa_primary_decision(bad)


def test_unfrozen_surface_seed_method_or_missing_primary_metric_fails_closed() -> None:
    rows = _records()
    rows[0]["surface"] = "mission1-target"
    with pytest.raises(ValueError, match="outside frozen ESA primary surface"):
        esa_primary_decision(rows)

    rows = _records()
    rows[0]["seed"] = 999
    with pytest.raises(ValueError, match="outside frozen ESA primary surface"):
        esa_primary_decision(rows)

    rows = _records()
    rows[0]["method"] = "new_posthoc_baseline"
    with pytest.raises(ValueError, match="outside frozen ESA primary surface"):
        esa_primary_decision(rows)

    rows = _records()
    del rows[0]["scores"]["anomaly_only"]["EW_F_0.50"]
    with pytest.raises(ValueError, match="EW_F_0.50"):
        esa_primary_decision(rows)
