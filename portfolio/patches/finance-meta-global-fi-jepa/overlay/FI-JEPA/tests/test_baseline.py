from __future__ import annotations

import numpy as np

from fi_jepa.cli import run
from fi_jepa.data import chronological_windows, make_synthetic_market
from fi_jepa.model import FIJEPA, fit_ridge_probe


def test_synthetic_market_is_deterministic() -> None:
    first = make_synthetic_market(seed=11)
    second = make_synthetic_market(seed=11)
    different = make_synthetic_market(seed=12)
    np.testing.assert_allclose(first, second)
    assert not np.allclose(first, different)
    assert np.isfinite(first).all()


def test_chronological_split_has_no_shared_observations() -> None:
    series = make_synthetic_market(observations=320, seed=3)
    split = chronological_windows(series, context_length=20, target_length=5)
    train_last_observation = int(split.train_indices.max() + 20 + 5 - 1)
    validation_first_observation = int(split.validation_indices.min())
    assert train_last_observation < split.split_index
    assert validation_first_observation >= split.split_index
    assert train_last_observation < validation_first_observation


def test_jepa_optimization_reduces_training_objective() -> None:
    series = make_synthetic_market(observations=360, seed=5)
    split = chronological_windows(series, context_length=18, target_length=4)
    model = FIJEPA(features=series.shape[1], target_length=4, seed=5)
    losses = model.fit(split.train_context, split.train_target, epochs=80)
    assert np.isfinite(losses).all()
    assert losses[-1] < losses[0] * 0.92
    embeddings = model.encode(split.validation_context)
    assert embeddings.shape == (split.validation_context.shape[0], 12)
    assert float(np.var(embeddings)) > 1e-5


def test_probe_and_cli_report_finite_metrics() -> None:
    series = make_synthetic_market(observations=360, seed=9)
    split = chronological_windows(series, context_length=18, target_length=4)
    model = FIJEPA(features=series.shape[1], target_length=4, seed=9)
    model.fit(split.train_context, split.train_target, epochs=30)
    metrics = fit_ridge_probe(
        model,
        split.train_context,
        split.train_target,
        split.validation_context,
        split.validation_target,
    )
    assert metrics.mse >= 0
    assert metrics.persistence_mse >= 0
    assert 0 <= metrics.directional_accuracy <= 1

    report = run(seed=9, epochs=8)
    assert report["status"] == "synthetic_baseline_only"
    assert report["train_windows"] > 0
    assert report["validation_windows"] > 0
    assert report["final_loss"] < report["initial_loss"]
