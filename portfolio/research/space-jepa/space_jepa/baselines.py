from __future__ import annotations

import numpy as np

from .data import RobustScaler


def robust_zscore(train: np.ndarray, test: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Per-timestep maximum robust z-score; scaler is fit on the training prefix only."""
    scaler = RobustScaler.fit(train)
    train_score = np.max(np.abs(scaler.transform(train)), axis=1)
    test_score = np.max(np.abs(scaler.transform(test)), axis=1)
    return train_score, test_score


def robust_zscore_channels(train: np.ndarray, test: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Per-channel absolute robust z-scores with train-only scaling statistics."""

    train_array = np.asarray(train, dtype=np.float32)
    test_array = np.asarray(test, dtype=np.float32)
    if train_array.ndim != 2 or test_array.ndim != 2:
        raise ValueError("train and test telemetry must have shape [time, channels]")
    if train_array.shape[1] != test_array.shape[1] or train_array.shape[1] < 1:
        raise ValueError("train/test telemetry must have the same nonzero channel count")
    if len(train_array) < 1 or len(test_array) < 1:
        raise ValueError("train/test telemetry must be nonempty")
    if not np.isfinite(train_array).all() or not np.isfinite(test_array).all():
        raise ValueError("train/test telemetry must be finite")
    scaler = RobustScaler.fit(train_array)
    return np.abs(scaler.transform(train_array)), np.abs(scaler.transform(test_array))


def persistence_error(x: np.ndarray) -> np.ndarray:
    """Simple one-step persistence baseline."""
    x = np.asarray(x, dtype=np.float32)
    score = np.zeros(len(x), dtype=np.float32)
    if len(x) > 1:
        score[1:] = np.sqrt(np.mean((x[1:] - x[:-1]) ** 2, axis=1))
    return score


def persistence_error_channels(x: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Per-channel one-step absolute persistence residuals plus a coverage mask.

    The first row has no predecessor and is returned as NaN with coverage 0. All later rows have
    coverage 1. Callers can warm-start a held-out partition by prepending the final training row.
    """

    array = np.asarray(x, dtype=np.float32)
    if array.ndim != 2 or array.shape[1] < 1 or len(array) < 1:
        raise ValueError("telemetry must have shape [time, channels] and be nonempty")
    if not np.isfinite(array).all():
        raise ValueError("telemetry must be finite")
    scores = np.full(array.shape, np.nan, dtype=np.float64)
    coverage = np.zeros(len(array), dtype=np.int64)
    if len(array) > 1:
        scores[1:] = np.abs(array[1:].astype(np.float64) - array[:-1].astype(np.float64))
        coverage[1:] = 1
    return scores, coverage
