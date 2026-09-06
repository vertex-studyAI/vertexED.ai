import numpy as np

from space_jepa.baselines import persistence_error_channels, robust_zscore_channels
from space_jepa.channel_probe import apply_channel_thresholds, fit_channel_thresholds


def test_robust_zscore_channels_uses_train_only_scaling_and_preserves_geometry():
    train = np.array(
        [[0.0, 10.0], [1.0, 20.0], [2.0, 30.0], [3.0, 40.0], [4.0, 50.0]],
        dtype=np.float32,
    )
    test = np.array([[5.0, 60.0], [6.0, 70.0]], dtype=np.float32)
    train_scores, test_scores = robust_zscore_channels(train, test)
    assert train_scores.shape == train.shape
    assert test_scores.shape == test.shape
    assert np.all(train_scores >= 0)
    assert np.all(test_scores >= 0)

    thresholds = fit_channel_thresholds(
        train_scores,
        np.ones(len(train_scores), dtype=np.int64),
        quantile=0.8,
    )
    preds = apply_channel_thresholds(test_scores, thresholds)
    assert preds.shape == test.shape
    assert preds.dtype == np.uint8


def test_persistence_channel_scores_exclude_uncovered_first_train_row_and_warm_start_test():
    train = np.array([[0.0, 0.0], [1.0, 2.0], [3.0, 5.0], [6.0, 9.0]], dtype=np.float32)
    test = np.array([[10.0, 14.0], [15.0, 20.0]], dtype=np.float32)

    train_scores, train_coverage = persistence_error_channels(train)
    assert train_coverage.tolist() == [0, 1, 1, 1]
    assert np.isnan(train_scores[0]).all()
    np.testing.assert_allclose(train_scores[1:], [[1.0, 2.0], [2.0, 3.0], [3.0, 4.0]])

    thresholds = fit_channel_thresholds(train_scores, train_coverage, quantile=0.5)
    np.testing.assert_allclose(thresholds, [2.0, 3.0])

    warmed_scores, warmed_coverage = persistence_error_channels(
        np.concatenate([train[-1:], test], axis=0)
    )
    test_scores = warmed_scores[1:]
    test_coverage = warmed_coverage[1:]
    assert np.all(test_coverage == 1)
    np.testing.assert_allclose(test_scores, [[4.0, 5.0], [5.0, 6.0]])
    np.testing.assert_array_equal(
        apply_channel_thresholds(test_scores, thresholds),
        np.ones_like(test_scores, dtype=np.uint8),
    )


def test_per_channel_comparators_fail_closed_on_nonfinite_or_geometry_drift():
    train = np.ones((4, 2), dtype=np.float32)
    bad_test = np.ones((2, 3), dtype=np.float32)
    try:
        robust_zscore_channels(train, bad_test)
    except ValueError as exc:
        assert "channel count" in str(exc)
    else:
        raise AssertionError("comparator channel drift must fail closed")

    bad = train.copy()
    bad[2, 1] = np.nan
    try:
        persistence_error_channels(bad)
    except ValueError as exc:
        assert "finite" in str(exc)
    else:
        raise AssertionError("nonfinite comparator telemetry must fail closed")
