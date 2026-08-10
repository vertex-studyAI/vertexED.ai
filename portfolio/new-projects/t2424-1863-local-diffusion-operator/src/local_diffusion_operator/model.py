from __future__ import annotations

from dataclasses import dataclass
from typing import Sequence


def periodic_laplacian(state: Sequence[float]) -> list[float]:
    if len(state) < 3:
        raise ValueError("state must contain at least three points")
    n = len(state)
    return [
        state[(i - 1) % n] - 2.0 * state[i] + state[(i + 1) % n]
        for i in range(n)
    ]


@dataclass(frozen=True)
class LocalDiffusionOperator:
    coefficient: float

    @property
    def stencil_width(self) -> int:
        return 3

    def predict(self, state: Sequence[float]) -> list[float]:
        lap = periodic_laplacian(state)
        return [u + self.coefficient * l for u, l in zip(state, lap)]


def fit_local_operator(
    states: Sequence[Sequence[float]],
    next_states: Sequence[Sequence[float]],
) -> LocalDiffusionOperator:
    if len(states) != len(next_states):
        raise ValueError("states and next_states must have equal length")
    if not states:
        raise ValueError("at least one transition is required")

    numerator = 0.0
    denominator = 0.0

    for state, nxt in zip(states, next_states):
        if len(state) != len(nxt):
            raise ValueError("state and next_state sizes must match")
        lap = periodic_laplacian(state)
        for u, v, l in zip(state, nxt, lap):
            numerator += l * (v - u)
            denominator += l * l

    coefficient = numerator / denominator if denominator > 1e-12 else 0.0
    return LocalDiffusionOperator(coefficient)


def rmse(
    truth: Sequence[Sequence[float]],
    pred: Sequence[Sequence[float]],
) -> float:
    if len(truth) != len(pred):
        raise ValueError("truth and pred must have equal length")
    squared = []
    for a, b in zip(truth, pred):
        if len(a) != len(b):
            raise ValueError("trajectory shapes must match")
        squared.extend((x - y) ** 2 for x, y in zip(a, b))
    if not squared:
        raise ValueError("at least one value is required")
    return (sum(squared) / len(squared)) ** 0.5
