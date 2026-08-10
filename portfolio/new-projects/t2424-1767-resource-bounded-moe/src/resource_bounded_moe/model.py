from __future__ import annotations

from dataclasses import dataclass
import math
from typing import Iterable, Sequence


@dataclass(frozen=True)
class AffineModel:
    slope: float
    intercept: float

    def predict_one(self, x: float) -> float:
        return self.slope * x + self.intercept

    def predict(self, xs: Iterable[float]) -> list[float]:
        return [self.predict_one(x) for x in xs]


def fit_affine(xs: Sequence[float], ys: Sequence[float]) -> AffineModel:
    if len(xs) != len(ys):
        raise ValueError("xs and ys must have the same length")
    if len(xs) < 2:
        raise ValueError("at least two samples are required")

    x_mean = sum(xs) / len(xs)
    y_mean = sum(ys) / len(ys)
    var_x = sum((x - x_mean) ** 2 for x in xs)

    if var_x <= 1e-12:
        return AffineModel(0.0, y_mean)

    cov_xy = sum((x - x_mean) * (y - y_mean) for x, y in zip(xs, ys))
    slope = cov_xy / var_x
    intercept = y_mean - slope * x_mean
    return AffineModel(slope, intercept)


def rmse(y_true: Sequence[float], y_pred: Sequence[float]) -> float:
    if len(y_true) != len(y_pred):
        raise ValueError("y_true and y_pred must have the same length")
    if not y_true:
        raise ValueError("at least one value is required")
    return math.sqrt(sum((a - b) ** 2 for a, b in zip(y_true, y_pred)) / len(y_true))


@dataclass(frozen=True)
class ThresholdMoE:
    threshold: float
    left: AffineModel
    right: AffineModel

    @property
    def active_experts_per_sample(self) -> int:
        return 1

    @property
    def total_experts(self) -> int:
        return 2

    def predict_one(self, x: float) -> float:
        expert = self.left if x <= self.threshold else self.right
        return expert.predict_one(x)

    def predict(self, xs: Iterable[float]) -> list[float]:
        return [self.predict_one(x) for x in xs]


def _sse(xs: Sequence[float], ys: Sequence[float], model: AffineModel) -> float:
    return sum((y - model.predict_one(x)) ** 2 for x, y in zip(xs, ys))


def fit_threshold_moe(
    xs: Sequence[float],
    ys: Sequence[float],
    *,
    min_partition: int = 8,
) -> ThresholdMoE:
    if len(xs) != len(ys):
        raise ValueError("xs and ys must have the same length")
    if len(xs) < 2 * min_partition:
        raise ValueError("not enough samples for the requested min_partition")

    pairs = sorted(zip(xs, ys), key=lambda p: p[0])
    sx = [p[0] for p in pairs]
    sy = [p[1] for p in pairs]

    best = None
    for split in range(min_partition, len(sx) - min_partition + 1):
        if split < len(sx) and sx[split - 1] == sx[split]:
            continue

        left_x, left_y = sx[:split], sy[:split]
        right_x, right_y = sx[split:], sy[split:]

        left = fit_affine(left_x, left_y)
        right = fit_affine(right_x, right_y)
        loss = _sse(left_x, left_y, left) + _sse(right_x, right_y, right)

        threshold = (sx[split - 1] + sx[split]) / 2
        candidate = (loss, threshold, left, right)
        if best is None or candidate[0] < best[0]:
            best = candidate

    if best is None:
        raise ValueError("could not find a valid threshold split")

    _, threshold, left, right = best
    return ThresholdMoE(threshold, left, right)
