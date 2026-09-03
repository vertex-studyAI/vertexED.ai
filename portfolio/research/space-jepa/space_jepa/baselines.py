from __future__ import annotations

import numpy as np

from .data import RobustScaler


def robust_zscore(train: np.ndarray, test: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Per-timestep maximum robust z-score; scaler is fit on the training prefix only."""
    scaler = RobustScaler.fit(train)
    train_score = np.max(np.abs(scaler.transform(train)), axis=1)
    test_score = np.max(np.abs(scaler.transform(test)), axis=1)
    return train_score, test_score


def persistence_error(x: np.ndarray) -> np.ndarray:
    """Simple one-step persistence baseline."""
    x = np.asarray(x, dtype=np.float32)
    score = np.zeros(len(x), dtype=np.float32)
    if len(x) > 1:
        score[1:] = np.sqrt(np.mean((x[1:] - x[:-1]) ** 2, axis=1))
    return score
