from __future__ import annotations

import copy

import torch
from torch import nn
import torch.nn.functional as F

from .config import SpaceJEPAConfig


class TelemetryEncoder(nn.Module):
    def __init__(self, cfg: SpaceJEPAConfig, max_length: int):
        super().__init__()
        self.input = nn.Linear(cfg.n_features, cfg.d_model)
        self.position = nn.Parameter(torch.zeros(1, max_length, cfg.d_model))
        layer = nn.TransformerEncoderLayer(
            d_model=cfg.d_model,
            nhead=cfg.n_heads,
            dim_feedforward=cfg.d_model * cfg.ff_mult,
            dropout=cfg.dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.encoder = nn.TransformerEncoder(layer, num_layers=cfg.n_layers)
        self.norm = nn.LayerNorm(cfg.d_model)
        nn.init.trunc_normal_(self.position, std=0.02)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        if x.ndim != 3:
            raise ValueError("expected [batch, time, channels]")
        if x.shape[1] > self.position.shape[1]:
            raise ValueError("sequence longer than configured positional table")
        z = self.input(x) + self.position[:, : x.shape[1]]
        return self.norm(self.encoder(z))


class TargetPredictor(nn.Module):
    def __init__(self, cfg: SpaceJEPAConfig):
        super().__init__()
        self.target_queries = nn.Parameter(torch.zeros(1, cfg.target_length, cfg.d_model))
        layer = nn.TransformerDecoderLayer(
            d_model=cfg.d_model,
            nhead=cfg.n_heads,
            dim_feedforward=cfg.d_model * cfg.ff_mult,
            dropout=cfg.dropout,
            activation="gelu",
            batch_first=True,
            norm_first=True,
        )
        self.decoder = nn.TransformerDecoder(layer, num_layers=cfg.predictor_layers)
        self.norm = nn.LayerNorm(cfg.d_model)
        nn.init.trunc_normal_(self.target_queries, std=0.02)

    def forward(self, context_latents: torch.Tensor) -> torch.Tensor:
        q = self.target_queries.expand(context_latents.shape[0], -1, -1)
        return self.norm(self.decoder(tgt=q, memory=context_latents))


class SpaceJEPA(nn.Module):
    """JEPA-style latent predictor for multivariate spacecraft telemetry.

    The online encoder sees only context. The EMA target encoder sees only future target samples.
    Training minimizes latent prediction error; anomaly score is target latent prediction error.
    """

    def __init__(self, cfg: SpaceJEPAConfig):
        super().__init__()
        self.cfg = cfg.validate()
        max_len = max(cfg.context_length, cfg.target_length)
        self.encoder = TelemetryEncoder(cfg, max_len)
        self.target_encoder = copy.deepcopy(self.encoder)
        self.predictor = TargetPredictor(cfg)
        for p in self.target_encoder.parameters():
            p.requires_grad_(False)

    @torch.no_grad()
    def update_target_encoder(self) -> None:
        decay = self.cfg.ema_decay
        for target, online in zip(self.target_encoder.parameters(), self.encoder.parameters(), strict=True):
            target.data.mul_(decay).add_(online.data, alpha=1.0 - decay)

    def _latent_triplet(
        self, context: torch.Tensor, target: torch.Tensor
    ) -> tuple[torch.Tensor, torch.Tensor, torch.Tensor]:
        context_z = self.encoder(context)
        predicted = self.predictor(context_z)
        with torch.no_grad():
            target_z = self.target_encoder(target)
        return context_z, predicted, target_z

    def latent_pairs(self, context: torch.Tensor, target: torch.Tensor) -> tuple[torch.Tensor, torch.Tensor]:
        _, predicted, target_z = self._latent_triplet(context, target)
        return predicted, target_z

    def loss(self, context: torch.Tensor, target: torch.Tensor) -> tuple[torch.Tensor, dict[str, float]]:
        context_z, predicted, target_z = self._latent_triplet(context, target)
        pred_n = F.normalize(predicted, dim=-1)
        target_n = F.normalize(target_z, dim=-1)
        cosine_loss = (1.0 - (pred_n * target_n).sum(dim=-1)).mean()

        # Lightweight anti-collapse term: each online embedding dimension should retain variation.
        std = torch.sqrt(context_z.var(dim=(0, 1), unbiased=False) + 1e-4)
        variance_loss = F.relu(1.0 - std).mean()
        total = cosine_loss + self.cfg.variance_weight * variance_loss
        return total, {
            "loss": float(total.detach()),
            "cosine_loss": float(cosine_loss.detach()),
            "variance_loss": float(variance_loss.detach()),
        }

    @torch.no_grad()
    def anomaly_scores(self, context: torch.Tensor, target: torch.Tensor) -> torch.Tensor:
        _, predicted, target_z = self._latent_triplet(context, target)
        predicted = F.normalize(predicted, dim=-1)
        target_z = F.normalize(target_z, dim=-1)
        return 1.0 - (predicted * target_z).sum(dim=-1)
