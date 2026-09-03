from __future__ import annotations

from dataclasses import dataclass
import random

import numpy as np
import torch
from torch import nn

from .data import make_windows
from .model import SpaceJEPA


@dataclass(frozen=True)
class TrainResult:
    losses: list[float]


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
    windows = make_windows(x_train, cfg.context_length, cfg.target_length, stride=stride)
    contexts = torch.from_numpy(windows.context)
    targets = torch.from_numpy(windows.target)
    opt = torch.optim.AdamW(
        [p for p in model.parameters() if p.requires_grad], lr=lr, weight_decay=1e-4
    )
    losses: list[float] = []
    generator = torch.Generator().manual_seed(seed)
    for _ in range(epochs):
        order = torch.randperm(len(contexts), generator=generator)
        model.train()
        for start in range(0, len(order), batch_size):
            idx = order[start : start + batch_size]
            context = contexts[idx].to(device)
            target = targets[idx].to(device)
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
    """Return target-timestep scores and coverage counts aligned to original series."""
    model = model.to(device)
    model.eval()
    cfg = model.cfg
    windows = make_windows(x, cfg.context_length, cfg.target_length, stride=stride)
    scores = np.zeros(len(x), dtype=np.float64)
    counts = np.zeros(len(x), dtype=np.int64)
    contexts = torch.from_numpy(windows.context)
    targets = torch.from_numpy(windows.target)
    for start in range(0, len(contexts), batch_size):
        context = contexts[start : start + batch_size].to(device)
        target = targets[start : start + batch_size].to(device)
        batch_scores = model.anomaly_scores(context, target).cpu().numpy()
        batch_starts = windows.starts[start : start + batch_size]
        for row, s in enumerate(batch_starts):
            a = int(s + cfg.context_length)
            b = a + cfg.target_length
            scores[a:b] += batch_scores[row]
            counts[a:b] += 1
    valid = counts > 0
    scores[valid] /= counts[valid]
    scores[~valid] = np.nan
    return scores, counts
