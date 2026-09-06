from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

import numpy as np
import torch


@dataclass(frozen=True)
class RidgeChannelProbe:
    """Train-only linear decoder from predicted JEPA latents to telemetry channels.

    The probe is fit only on predicted target latents and normalized telemetry targets from the
    training partition. It is intended to provide per-channel residual scores without changing the
    JEPA training objective or consuming anomaly labels.
    """

    weights: np.ndarray
    bias: np.ndarray
    ridge_alpha: float

    def __post_init__(self) -> None:
        weights = np.asarray(self.weights, dtype=np.float64)
        bias = np.asarray(self.bias, dtype=np.float64)
        if weights.ndim != 2 or weights.shape[0] < 1 or weights.shape[1] < 1:
            raise ValueError("weights must have shape [latent_dim, channels]")
        if bias.shape != (weights.shape[1],):
            raise ValueError("bias shape must match channel count")
        if not np.isfinite(weights).all() or not np.isfinite(bias).all():
            raise ValueError("probe parameters must be finite")
        if not np.isfinite(self.ridge_alpha) or self.ridge_alpha <= 0:
            raise ValueError("ridge_alpha must be positive and finite")
        object.__setattr__(self, "weights", weights)
        object.__setattr__(self, "bias", bias)

    @property
    def latent_dim(self) -> int:
        return int(self.weights.shape[0])

    @property
    def n_channels(self) -> int:
        return int(self.weights.shape[1])

    def predict(self, predicted_latents: np.ndarray) -> np.ndarray:
        z = np.asarray(predicted_latents, dtype=np.float64)
        if z.ndim < 2 or z.shape[-1] != self.latent_dim:
            raise ValueError(
                f"predicted_latents last dimension must equal latent_dim={self.latent_dim}"
            )
        return z @ self.weights + self.bias

    def to_dict(self) -> dict[str, object]:
        return {
            "schema_version": 1,
            "probe_type": "train_only_ridge_decoder",
            "ridge_alpha": float(self.ridge_alpha),
            "latent_dim": self.latent_dim,
            "n_channels": self.n_channels,
            "weights": self.weights.tolist(),
            "bias": self.bias.tolist(),
        }


def _as_telemetry(x: np.ndarray) -> np.ndarray:
    array = np.asarray(x, dtype=np.float32)
    if array.ndim != 2 or array.shape[0] < 1 or array.shape[1] < 1:
        raise ValueError("telemetry must have shape [time, channels]")
    if not np.isfinite(array).all():
        raise ValueError("telemetry must be finite before channel-probe fitting/scoring")
    return array


def _window_starts(n_rows: int, context_length: int, target_length: int, stride: int) -> np.ndarray:
    if context_length < 1 or target_length < 1 or stride < 1:
        raise ValueError("context_length, target_length and stride must be positive")
    total = context_length + target_length
    if n_rows < total:
        raise ValueError(f"need at least {total} timesteps, got {n_rows}")
    return np.arange(0, n_rows - total + 1, stride, dtype=np.int64)


def _batched(values: np.ndarray, batch_size: int) -> Iterable[np.ndarray]:
    if batch_size < 1:
        raise ValueError("batch_size must be positive")
    for start in range(0, len(values), batch_size):
        yield values[start : start + batch_size]


def _materialize_batch(
    x: np.ndarray,
    starts: np.ndarray,
    context_length: int,
    target_length: int,
) -> tuple[torch.Tensor, torch.Tensor]:
    contexts = np.stack([x[s : s + context_length] for s in starts], axis=0)
    targets = np.stack(
        [x[s + context_length : s + context_length + target_length] for s in starts],
        axis=0,
    )
    return torch.from_numpy(contexts), torch.from_numpy(targets)


@torch.no_grad()
def fit_channel_probe(
    model: object,
    x_train: np.ndarray,
    *,
    ridge_alpha: float = 1.0,
    stride: int = 4,
    batch_size: int = 128,
    device: str = "cpu",
) -> RidgeChannelProbe:
    """Fit a streaming ridge decoder using training telemetry only.

    Only O(latent_dim^2 + latent_dim*channels) sufficient statistics are retained; target windows
    are materialized one batch at a time. Anomaly labels are not accepted by this API.
    """

    if not np.isfinite(ridge_alpha) or ridge_alpha <= 0:
        raise ValueError("ridge_alpha must be positive and finite")
    x = _as_telemetry(x_train)
    cfg = model.cfg
    starts = _window_starts(len(x), int(cfg.context_length), int(cfg.target_length), stride)
    model = model.to(device)
    model.eval()

    xtx: np.ndarray | None = None
    xty: np.ndarray | None = None
    n_rows = 0
    latent_dim: int | None = None
    channels = int(x.shape[1])

    for batch_starts in _batched(starts, batch_size):
        context, target = _materialize_batch(
            x, batch_starts, int(cfg.context_length), int(cfg.target_length)
        )
        predicted, _ = model.latent_pairs(context.to(device), target.to(device))
        z = predicted.detach().cpu().numpy().astype(np.float64, copy=False)
        y = target.numpy().astype(np.float64, copy=False)
        if z.ndim != 3 or z.shape[:2] != y.shape[:2]:
            raise ValueError("model predicted latent geometry does not match target window geometry")
        if y.shape[2] != channels:
            raise ValueError("target channel count changed during probe fitting")
        if latent_dim is None:
            latent_dim = int(z.shape[2])
            xtx = np.zeros((latent_dim + 1, latent_dim + 1), dtype=np.float64)
            xty = np.zeros((latent_dim + 1, channels), dtype=np.float64)
        elif z.shape[2] != latent_dim:
            raise ValueError("model latent dimension changed during probe fitting")
        design = np.concatenate(
            [z.reshape(-1, latent_dim), np.ones((z.shape[0] * z.shape[1], 1), dtype=np.float64)],
            axis=1,
        )
        response = y.reshape(-1, channels)
        assert xtx is not None and xty is not None
        xtx += design.T @ design
        xty += design.T @ response
        n_rows += int(len(response))

    if xtx is None or xty is None or latent_dim is None or n_rows < 1:
        raise ValueError("no training windows available for channel-probe fitting")
    penalty = np.eye(latent_dim + 1, dtype=np.float64) * float(ridge_alpha)
    penalty[-1, -1] = 0.0
    solution = np.linalg.solve(xtx + penalty, xty)
    return RidgeChannelProbe(
        weights=solution[:-1],
        bias=solution[-1],
        ridge_alpha=float(ridge_alpha),
    )


@torch.no_grad()
def score_channel_errors(
    model: object,
    probe: RidgeChannelProbe,
    x: np.ndarray,
    *,
    stride: int = 1,
    batch_size: int = 128,
    device: str = "cpu",
) -> tuple[np.ndarray, np.ndarray]:
    """Return aligned squared prediction residuals for every telemetry channel."""

    telemetry = _as_telemetry(x)
    if telemetry.shape[1] != probe.n_channels:
        raise ValueError(
            f"telemetry has {telemetry.shape[1]} channels but probe expects {probe.n_channels}"
        )
    cfg = model.cfg
    starts = _window_starts(
        len(telemetry), int(cfg.context_length), int(cfg.target_length), stride
    )
    model = model.to(device)
    model.eval()
    scores = np.zeros((len(telemetry), probe.n_channels), dtype=np.float64)
    counts = np.zeros(len(telemetry), dtype=np.int64)

    for batch_starts in _batched(starts, batch_size):
        context, target = _materialize_batch(
            telemetry, batch_starts, int(cfg.context_length), int(cfg.target_length)
        )
        predicted, _ = model.latent_pairs(context.to(device), target.to(device))
        z = predicted.detach().cpu().numpy().astype(np.float64, copy=False)
        decoded = probe.predict(z)
        truth = target.numpy().astype(np.float64, copy=False)
        residual_sq = np.square(decoded - truth)
        for offset in range(int(cfg.target_length)):
            indices = batch_starts + int(cfg.context_length) + offset
            np.add.at(scores, indices, residual_sq[:, offset, :])
            np.add.at(counts, indices, 1)

    valid = counts > 0
    scores[valid] /= counts[valid, None]
    scores[~valid] = np.nan
    return scores, counts


def fit_channel_thresholds(
    train_scores: np.ndarray,
    coverage: np.ndarray,
    *,
    quantile: float = 0.995,
) -> np.ndarray:
    """Freeze one threshold per channel from covered training scores only."""

    scores = np.asarray(train_scores, dtype=np.float64)
    counts = np.asarray(coverage)
    if scores.ndim != 2 or scores.shape[0] < 1 or scores.shape[1] < 1:
        raise ValueError("train_scores must have shape [time, channels]")
    if counts.shape != (scores.shape[0],):
        raise ValueError("coverage must have shape [time]")
    if not 0.0 < quantile < 1.0:
        raise ValueError("quantile must be strictly between 0 and 1")
    valid = counts > 0
    if not np.any(valid):
        raise ValueError("no covered training scores available for threshold fitting")
    covered = scores[valid]
    if not np.isfinite(covered).all():
        raise ValueError("covered training scores must be finite")
    thresholds = np.quantile(covered, quantile, axis=0)
    if thresholds.shape != (scores.shape[1],) or not np.isfinite(thresholds).all():
        raise ValueError("threshold fitting produced invalid channel thresholds")
    return thresholds.astype(np.float64, copy=False)


def apply_channel_thresholds(scores: np.ndarray, thresholds: np.ndarray) -> np.ndarray:
    """Convert covered finite channel scores to binary anomaly indicators."""

    values = np.asarray(scores, dtype=np.float64)
    limits = np.asarray(thresholds, dtype=np.float64)
    if values.ndim != 2 or values.shape[1] < 1:
        raise ValueError("scores must have shape [time, channels]")
    if limits.shape != (values.shape[1],):
        raise ValueError("threshold count must match channel count")
    if not np.isfinite(values).all() or not np.isfinite(limits).all():
        raise ValueError("scores and thresholds must be finite before binarization")
    return (values >= limits[None, :]).astype(np.uint8)
