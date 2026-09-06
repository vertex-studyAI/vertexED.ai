from __future__ import annotations

from bisect import bisect_right
from dataclasses import dataclass
import random
from typing import Sequence

import numpy as np
import torch
from torch import nn
from torch.utils.data import DataLoader, Dataset

from .model import SpaceJEPA


@dataclass(frozen=True)
class TrainResult:
    losses: list[float]


class TelemetryWindowDataset(Dataset):
    """Lazy context/target windows with O(batch) materialization.

    The original smoke implementation stacked every overlapping window into new arrays. That is
    prohibitively expensive for multi-million-row ESA-ADB telemetry. This dataset stores only the
    source array plus window geometry and slices windows on demand.
    """

    def __init__(self, x: np.ndarray, context_length: int, target_length: int, *, stride: int = 1):
        x = np.asarray(x, dtype=np.float32)
        if x.ndim != 2:
            raise ValueError("x must have shape [time, channels]")
        if context_length < 1 or target_length < 1 or stride < 1:
            raise ValueError("context_length, target_length and stride must be positive")
        total = context_length + target_length
        if len(x) < total:
            raise ValueError(f"need at least {total} timesteps, got {len(x)}")
        self.x = x
        self.context_length = int(context_length)
        self.target_length = int(target_length)
        self.stride = int(stride)
        self.n_windows = (len(x) - total) // stride + 1

    def __len__(self) -> int:
        return self.n_windows

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor, int]:
        if index < 0:
            index += self.n_windows
        if index < 0 or index >= self.n_windows:
            raise IndexError(index)
        start = int(index * self.stride)
        split = start + self.context_length
        end = split + self.target_length
        context = torch.from_numpy(self.x[start:split])
        target = torch.from_numpy(self.x[split:end])
        return context, target, start


class MultiSequenceWindowDataset(Dataset):
    """Lazy windows over independent sequences without crossing object boundaries.

    Astronomy benchmarks contain many distinct light curves. Concatenating them before windowing
    creates scientifically invalid examples whose context belongs to one object and target to the
    next. This dataset keeps every sequence independent, exposes its sequence index in retained
    metadata, and fails closed if a supplied object is too short rather than silently dropping it.
    """

    def __init__(
        self,
        sequences: Sequence[np.ndarray],
        context_length: int,
        target_length: int,
        *,
        stride: int = 1,
    ):
        if context_length < 1 or target_length < 1 or stride < 1:
            raise ValueError("context_length, target_length and stride must be positive")
        if not sequences:
            raise ValueError("at least one sequence is required")
        total = int(context_length + target_length)
        arrays: list[np.ndarray] = []
        cumulative: list[int] = []
        window_counts: list[int] = []
        channels: int | None = None
        running = 0
        for sequence_index, raw in enumerate(sequences):
            x = np.asarray(raw, dtype=np.float32)
            if x.ndim != 2:
                raise ValueError(f"sequence {sequence_index} must have shape [time, channels]")
            if len(x) < total:
                raise ValueError(
                    f"sequence {sequence_index} needs at least {total} timesteps, got {len(x)}"
                )
            if channels is None:
                channels = int(x.shape[1])
            elif int(x.shape[1]) != channels:
                raise ValueError(
                    f"sequence {sequence_index} channel count {x.shape[1]} does not match {channels}"
                )
            count = (len(x) - total) // stride + 1
            arrays.append(x)
            window_counts.append(int(count))
            running += int(count)
            cumulative.append(running)
        self.sequences = tuple(arrays)
        self.context_length = int(context_length)
        self.target_length = int(target_length)
        self.stride = int(stride)
        self.window_counts = tuple(window_counts)
        self.cumulative_windows = tuple(cumulative)
        self.n_windows = int(running)
        self.n_features = int(channels or 0)

    def __len__(self) -> int:
        return self.n_windows

    def __getitem__(self, index: int) -> tuple[torch.Tensor, torch.Tensor, int, int]:
        if index < 0:
            index += self.n_windows
        if index < 0 or index >= self.n_windows:
            raise IndexError(index)
        sequence_index = bisect_right(self.cumulative_windows, index)
        previous = self.cumulative_windows[sequence_index - 1] if sequence_index else 0
        local_window_index = index - previous
        start = int(local_window_index * self.stride)
        split = start + self.context_length
        end = split + self.target_length
        x = self.sequences[sequence_index]
        context = torch.from_numpy(x[start:split])
        target = torch.from_numpy(x[split:end])
        return context, target, int(sequence_index), start


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


def _optimizer(model: SpaceJEPA, *, lr: float) -> torch.optim.AdamW:
    return torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad], lr=lr, weight_decay=1e-4
    )


def _train_batches(
    model: SpaceJEPA,
    loader: DataLoader,
    *,
    epochs: int,
    lr: float,
    device: str,
    multisequence: bool,
) -> TrainResult:
    model = model.to(device)
    opt = _optimizer(model, lr=lr)
    losses: list[float] = []
    for _ in range(epochs):
        model.train()
        for batch in loader:
            if multisequence:
                context, target, _, _ = batch
            else:
                context, target, _ = batch
            context = context.to(device)
            target = target.to(device)
            loss, _ = model.loss(context, target)
            opt.zero_grad(set_to_none=True)
            loss.backward()
            nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()
            model.update_target_encoder()
            losses.append(float(loss.detach().cpu()))
    return TrainResult(losses=losses)


def train_model(
    model: SpaceJEPA,
    x_train: np.ndarray,
    *,
    epochs: int = 3,
    batch_size: int = 64,
    lr: float = 3e-4,
    stride: int = 4,
    seed: int = 17,
    device: str = "cpu",
) -> TrainResult:
    seed_everything(seed)
    cfg = model.cfg
    dataset = TelemetryWindowDataset(
        x_train, cfg.context_length, cfg.target_length, stride=stride
    )
    generator = torch.Generator().manual_seed(seed)
    loader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=True,
        generator=generator,
        num_workers=0,
        drop_last=False,
    )
    return _train_batches(
        model,
        loader,
        epochs=epochs,
        lr=lr,
        device=device,
        multisequence=False,
    )


def train_model_sequences(
    model: SpaceJEPA,
    x_train: Sequence[np.ndarray],
    *,
    epochs: int = 3,
    batch_size: int = 64,
    lr: float = 3e-4,
    stride: int = 4,
    seed: int = 17,
    device: str = "cpu",
) -> TrainResult:
    """Train on independent sequences without creating cross-object windows."""
    seed_everything(seed)
    cfg = model.cfg
    dataset = MultiSequenceWindowDataset(
        x_train,
        cfg.context_length,
        cfg.target_length,
        stride=stride,
    )
    if dataset.n_features != cfg.n_features:
        raise ValueError(
            f"sequence feature count {dataset.n_features} does not match model n_features {cfg.n_features}"
        )
    generator = torch.Generator().manual_seed(seed)
    loader = DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=True,
        generator=generator,
        num_workers=0,
        drop_last=False,
    )
    return _train_batches(
        model,
        loader,
        epochs=epochs,
        lr=lr,
        device=device,
        multisequence=True,
    )


@torch.no_grad()
def score_series(
    model: SpaceJEPA,
    x: np.ndarray,
    *,
    stride: int = 1,
    batch_size: int = 128,
    device: str = "cpu",
) -> tuple[np.ndarray, np.ndarray]:
    """Return target-timestep scores aligned to the series without stacking all windows."""
    model = model.to(device)
    model.eval()
    cfg = model.cfg
    dataset = TelemetryWindowDataset(
        x, cfg.context_length, cfg.target_length, stride=stride
    )
    loader = DataLoader(dataset, batch_size=batch_size, shuffle=False, num_workers=0)
    scores = np.zeros(len(x), dtype=np.float64)
    counts = np.zeros(len(x), dtype=np.int64)

    for context, target, starts in loader:
        batch_scores = model.anomaly_scores(context.to(device), target.to(device)).cpu().numpy()
        starts_np = np.asarray(starts, dtype=np.int64)
        for offset in range(cfg.target_length):
            indices = starts_np + cfg.context_length + offset
            np.add.at(scores, indices, batch_scores[:, offset])
            np.add.at(counts, indices, 1)

    valid = counts > 0
    scores[valid] /= counts[valid]
    scores[~valid] = np.nan
    return scores, counts


@torch.no_grad()
def score_sequences(
    model: SpaceJEPA,
    sequences: Sequence[np.ndarray],
    *,
    stride: int = 1,
    batch_size: int = 128,
    device: str = "cpu",
) -> list[tuple[np.ndarray, np.ndarray]]:
    """Score independent sequences one by one, preserving object boundaries and alignment."""
    return [
        score_series(
            model,
            sequence,
            stride=stride,
            batch_size=batch_size,
            device=device,
        )
        for sequence in sequences
    ]
