from __future__ import annotations

import numpy as np
import pytest

from space_jepa.astro import LightCurveFeaturizer, LightCurveSeries
from space_jepa.config import SpaceJEPAConfig
from space_jepa.model import SpaceJEPA
from space_jepa.training import (
    MultiSequenceWindowDataset,
    score_sequences,
    train_model_sequences,
)


def _curve(offset: float, band: str = "g", n: int = 8) -> LightCurveSeries:
    return LightCurveSeries(
        times=np.arange(n, dtype=np.float64) * 2.0 + offset,
        values=(offset + np.linspace(0.0, 1.0, n)).astype(np.float32),
        errors=np.linspace(0.05, 0.10, n).astype(np.float32),
        bands=np.asarray([band] * n, dtype=object),
    ).validate()


def test_fit_many_uses_only_supplied_training_objects_and_unknown_band_bucket():
    train = [_curve(0.0, "g"), _curve(10.0, "r")]
    featurizer = LightCurveFeaturizer.fit_many(train)
    center_before = featurizer.center.copy()
    scale_before = featurizer.scale.copy()
    bands_before = featurizer.bands

    held_out = _curve(1000000.0, "heldout-band")
    transformed = featurizer.transform(held_out)

    assert np.array_equal(featurizer.center, center_before)
    assert np.array_equal(featurizer.scale, scale_before)
    assert featurizer.bands == bands_before == ("g", "r")
    assert transformed.shape == (8, featurizer.n_features)
    # Last one-hot column is the explicit unknown-band bucket.
    assert np.all(transformed[:, -1] == 1.0)
    assert np.all(transformed[:, 3:-1] == 0.0)


def test_fit_many_resets_delta_time_at_each_object_boundary():
    first = _curve(0.0, "g")
    second = _curve(1_000_000.0, "g")
    featurizer = LightCurveFeaturizer.fit_many([first, second])

    parts = np.concatenate(
        [
            LightCurveFeaturizer._continuous(first),
            LightCurveFeaturizer._continuous(second),
        ],
        axis=0,
    )
    expected_center = np.nanmedian(parts, axis=0).astype(np.float32)
    assert np.array_equal(featurizer.center, expected_center)
    # A million-day artificial inter-object gap must never enter the training surface.
    assert float(featurizer.center[2]) < np.log1p(10.0)


def test_multisequence_dataset_never_crosses_object_boundaries():
    a = np.full((9, 3), 1.0, dtype=np.float32)
    b = np.full((10, 3), 100.0, dtype=np.float32)
    ds = MultiSequenceWindowDataset([a, b], 4, 2, stride=2)

    assert ds.window_counts == (2, 3)
    assert len(ds) == 5
    seen_sequences = []
    for i in range(len(ds)):
        context, target, sequence_index, start = ds[i]
        seen_sequences.append(sequence_index)
        expected = 1.0 if sequence_index == 0 else 100.0
        assert np.all(context.numpy() == expected)
        assert np.all(target.numpy() == expected)
        assert start in {0, 2, 4}
    assert seen_sequences == [0, 0, 1, 1, 1]


def test_multisequence_dataset_rejects_silent_object_drop_and_channel_drift():
    good = np.zeros((8, 3), dtype=np.float32)
    short = np.zeros((5, 3), dtype=np.float32)
    with pytest.raises(ValueError, match="needs at least 6 timesteps"):
        MultiSequenceWindowDataset([good, short], 4, 2)

    wrong_channels = np.zeros((8, 4), dtype=np.float32)
    with pytest.raises(ValueError, match="channel count"):
        MultiSequenceWindowDataset([good, wrong_channels], 4, 2)


def test_object_safe_training_and_scoring_smoke():
    rng = np.random.default_rng(123)
    sequences = [rng.normal(size=(12, 4)).astype(np.float32) for _ in range(3)]
    cfg = SpaceJEPAConfig(
        n_features=4,
        context_length=4,
        target_length=2,
        d_model=8,
        n_heads=2,
        n_layers=1,
        predictor_layers=1,
        ff_mult=2,
        dropout=0.0,
    )
    model = SpaceJEPA(cfg)
    result = train_model_sequences(
        model,
        sequences,
        epochs=1,
        batch_size=4,
        lr=1e-3,
        stride=2,
        seed=19,
    )
    assert result.losses
    assert np.all(np.isfinite(result.losses))

    scored = score_sequences(model, sequences, stride=2, batch_size=4)
    assert len(scored) == 3
    for sequence, (scores, counts) in zip(sequences, scored, strict=True):
        assert len(scores) == len(sequence)
        assert len(counts) == len(sequence)
        assert np.all(counts[: cfg.context_length] == 0)
        assert np.all(np.isfinite(scores[counts > 0]))


def test_object_safe_training_rejects_feature_mismatch():
    cfg = SpaceJEPAConfig(
        n_features=5,
        context_length=4,
        target_length=2,
        d_model=8,
        n_heads=2,
        n_layers=1,
        predictor_layers=1,
    )
    model = SpaceJEPA(cfg)
    sequences = [np.zeros((8, 4), dtype=np.float32)]
    with pytest.raises(ValueError, match="does not match model n_features"):
        train_model_sequences(model, sequences, epochs=1)
