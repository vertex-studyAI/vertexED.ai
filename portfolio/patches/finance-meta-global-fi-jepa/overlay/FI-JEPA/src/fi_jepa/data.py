from __future__ import annotations

from dataclasses import dataclass

import numpy as np
from numpy.typing import NDArray

FloatArray = NDArray[np.float64]
IntArray = NDArray[np.int64]


@dataclass(frozen=True)
class WindowedSplit:
    train_context: FloatArray
    train_target: FloatArray
    validation_context: FloatArray
    validation_target: FloatArray
    train_indices: IntArray
    validation_indices: IntArray
    split_index: int


def make_synthetic_market(
    *, observations: int = 640, features: int = 6, seed: int = 7
) -> FloatArray:
    """Create a deterministic, regime-switching return panel for smoke experiments."""
    if observations < 80:
        raise ValueError("observations must be at least 80")
    if features < 2:
        raise ValueError("features must be at least 2")

    rng = np.random.default_rng(seed)
    series = np.zeros((observations, features), dtype=np.float64)
    loadings = rng.normal(0.15, 0.04, size=features)
    idiosyncratic_scale = np.linspace(0.35, 0.75, features)
    factor = 0.0

    for t in range(1, observations):
        regime = 0.55 if (t // 80) % 2 == 0 else -0.25
        factor = regime * factor + rng.normal(0.0, 0.8)
        autoregressive = 0.35 * series[t - 1]
        cross_section = loadings * factor
        noise = rng.normal(0.0, idiosyncratic_scale)
        series[t] = autoregressive + cross_section + noise

    means = series.mean(axis=0, keepdims=True)
    scales = series.std(axis=0, keepdims=True)
    return (series - means) / np.where(scales < 1e-12, 1.0, scales)


def chronological_windows(
    series: FloatArray,
    *,
    context_length: int = 24,
    target_length: int = 6,
    train_fraction: float = 0.7,
) -> WindowedSplit:
    """Create disjoint train/validation windows with targets strictly after context."""
    values = np.asarray(series, dtype=np.float64)
    if values.ndim != 2:
        raise ValueError("series must have shape [time, features]")
    if context_length < 2 or target_length < 1:
        raise ValueError("invalid window lengths")
    if not 0.5 <= train_fraction < 0.9:
        raise ValueError("train_fraction must be in [0.5, 0.9)")

    total = values.shape[0]
    split_index = int(total * train_fraction)
    starts = np.arange(0, total - context_length - target_length + 1, dtype=np.int64)
    context_end = starts + context_length
    target_end = context_end + target_length

    train_mask = target_end <= split_index
    validation_mask = starts >= split_index
    if not train_mask.any() or not validation_mask.any():
        raise ValueError("not enough observations for disjoint chronological windows")

    def build(indices: IntArray) -> tuple[FloatArray, FloatArray]:
        contexts = np.stack([values[i : i + context_length] for i in indices])
        targets = np.stack(
            [values[i + context_length : i + context_length + target_length] for i in indices]
        )
        return contexts, targets

    train_indices = starts[train_mask]
    validation_indices = starts[validation_mask]
    train_context, train_target = build(train_indices)
    validation_context, validation_target = build(validation_indices)

    return WindowedSplit(
        train_context=train_context,
        train_target=train_target,
        validation_context=validation_context,
        validation_target=validation_target,
        train_indices=train_indices,
        validation_indices=validation_indices,
        split_index=split_index,
    )
