from __future__ import annotations

import numpy as np
import pytest

from space_jepa.metrics import (
    class_balanced_multiclass_log_loss,
    paired_class_balanced_log_loss_deltas,
    paired_hierarchical_log_loss_bootstrap,
    plasticc_primary_decision,
)


LABELS = (0, 1)
Y = np.array([0, 0, 0, 1, 1, 1], dtype=np.int64)


def _probabilities(correct_probability: float, *, seeds: int = 5) -> np.ndarray:
    rows = []
    for label in Y:
        if label == 0:
            rows.append([correct_probability, 1.0 - correct_probability])
        else:
            rows.append([1.0 - correct_probability, correct_probability])
    one_seed = np.asarray(rows, dtype=np.float64)
    return np.repeat(one_seed[None, :, :], seeds, axis=0)


def test_class_balanced_log_loss_matches_true_class_nll_and_renormalizes_rows() -> None:
    probabilities = np.array(
        [
            [9.0, 1.0],
            [8.0, 2.0],
            [7.0, 3.0],
            [1.0, 9.0],
            [2.0, 8.0],
            [3.0, 7.0],
        ],
        dtype=np.float64,
    )
    observed = class_balanced_multiclass_log_loss(Y, probabilities, LABELS)
    class0 = np.mean(-np.log([0.9, 0.8, 0.7]))
    class1 = np.mean(-np.log([0.9, 0.8, 0.7]))
    expected = float(np.mean([class0, class1]))
    assert observed == pytest.approx(expected)


def test_class_balanced_log_loss_fails_closed_on_invalid_probability_or_class_surface() -> None:
    probabilities = _probabilities(0.8, seeds=1)[0]
    with pytest.raises(ValueError, match="non-negative"):
        bad = probabilities.copy()
        bad[0, 0] = -0.1
        class_balanced_multiclass_log_loss(Y, bad, LABELS)
    with pytest.raises(ValueError, match="no confirmatory objects"):
        class_balanced_multiclass_log_loss(np.zeros(6, dtype=np.int64), probabilities, LABELS)
    with pytest.raises(ValueError, match="absent from class_labels"):
        class_balanced_multiclass_log_loss(np.array([0, 0, 0, 1, 1, 2]), probabilities, LABELS)


def test_paired_delta_direction_is_agnostic_minus_aware() -> None:
    aware = _probabilities(0.9)
    agnostic = _probabilities(0.6)
    deltas = paired_class_balanced_log_loss_deltas(Y, aware, agnostic, LABELS)
    expected = float(np.log(0.9 / 0.6))
    np.testing.assert_allclose(deltas, np.repeat(expected, 5), rtol=0.0, atol=1e-12)
    assert np.all(deltas > 0.0)


def test_hierarchical_bootstrap_is_deterministic_and_paired() -> None:
    aware = _probabilities(0.9)
    agnostic = _probabilities(0.6)
    a = paired_hierarchical_log_loss_bootstrap(
        Y, aware, agnostic, LABELS, replicates=200, bootstrap_seed=20260906
    )
    b = paired_hierarchical_log_loss_bootstrap(
        Y, aware, agnostic, LABELS, replicates=200, bootstrap_seed=20260906
    )
    np.testing.assert_array_equal(a, b)
    assert a.shape == (200,)
    assert np.all(a > 0.0)


def test_primary_decision_requires_effect_ci_and_four_of_five_positive_seeds() -> None:
    aware = _probabilities(0.9)
    agnostic = _probabilities(0.6)
    positive = plasticc_primary_decision(
        Y,
        aware,
        agnostic,
        LABELS,
        replicates=200,
        bootstrap_seed=20260906,
    )
    assert positive["primary_success"] is True
    assert positive["positive_seed_count"] == 5
    assert positive["mean_seed_delta"] >= 0.02
    assert positive["bootstrap_95pct_lower"] > 0.0

    mixed_aware = aware.copy()
    mixed_agnostic = agnostic.copy()
    # Four seeds now favor the time-agnostic arm. Even if another descriptive
    # quantity looked attractive, the frozen 4/5 seed-consistency gate fails.
    mixed_aware[1:] = _probabilities(0.55, seeds=4)
    mixed_agnostic[1:] = _probabilities(0.9, seeds=4)
    failed = plasticc_primary_decision(
        Y,
        mixed_aware,
        mixed_agnostic,
        LABELS,
        replicates=200,
        bootstrap_seed=20260906,
    )
    assert failed["positive_seed_count"] == 1
    assert failed["primary_success"] is False
