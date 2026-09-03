from __future__ import annotations

from dataclasses import dataclass
import random

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


def seed_everything(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)


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
    model = model.to(device)
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
    opt = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad], lr=lr, weight_decay=1e-4
    )
    losses: list[float] = []
    for _ in range(epochs):
        model.train()
        for context, target, _ in loader:
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
