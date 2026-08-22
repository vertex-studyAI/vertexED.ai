from __future__ import annotations

from dataclasses import dataclass
from copy import deepcopy
from typing import Iterable

import torch
from torch import Tensor, nn


@dataclass(frozen=True)
class WeatherJEPAConfig:
    input_channels: int = 5
    embed_dim: int = 64
    spatial_patch: int = 4
    predictor_depth: int = 2
    mask_ratio: float = 0.5
    ema_decay: float = 0.996
    learning_rate: float = 3e-4
    weight_decay: float = 1e-4
    seed: int = 101

    def validate(self) -> None:
        if self.input_channels <= 0:
            raise ValueError("input_channels must be positive")
        if self.embed_dim <= 0:
            raise ValueError("embed_dim must be positive")
        if self.spatial_patch <= 0:
            raise ValueError("spatial_patch must be positive")
        if self.predictor_depth <= 0:
            raise ValueError("predictor_depth must be positive")
        if not 0.0 < self.mask_ratio < 1.0:
            raise ValueError("mask_ratio must be in (0, 1)")
        if not 0.0 <= self.ema_decay < 1.0:
            raise ValueError("ema_decay must be in [0, 1)")


class _Encoder(nn.Module):
    def __init__(self, channels: int, dim: int, patch: int) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Conv3d(
                channels,
                dim,
                kernel_size=(1, patch, patch),
                stride=(1, patch, patch),
            ),
            nn.GELU(),
            nn.Conv3d(dim, dim, kernel_size=3, padding=1),
            nn.GroupNorm(1, dim),
        )

    def forward(self, x: Tensor) -> Tensor:
        return self.net(x)


class _Predictor(nn.Module):
    def __init__(self, dim: int, depth: int) -> None:
        super().__init__()
        layers: list[nn.Module] = []
        for _ in range(depth):
            layers.extend(
                [
                    nn.Conv3d(dim, dim, kernel_size=3, padding=1),
                    nn.GELU(),
                    nn.GroupNorm(1, dim),
                ]
            )
        self.net = nn.Sequential(*layers)

    def forward(self, z: Tensor) -> Tensor:
        return self.net(z)


class WeatherJEPAModel(nn.Module):
    """Compact pre-outcome Weather-JEPA reference implementation.

    Inputs and targets use [batch, time, channel, height, width].
    This implementation is a research scaffold, not a validated weather forecaster.
    """

    def __init__(self, config: WeatherJEPAConfig) -> None:
        super().__init__()
        config.validate()
        self.config = config
        torch.manual_seed(config.seed)

        self.context_encoder = _Encoder(
            config.input_channels, config.embed_dim, config.spatial_patch
        )
        self.target_encoder = deepcopy(self.context_encoder)
        self.predictor = _Predictor(config.embed_dim, config.predictor_depth)
        self.decoder = nn.ConvTranspose3d(
            config.embed_dim,
            config.input_channels,
            kernel_size=(1, config.spatial_patch, config.spatial_patch),
            stride=(1, config.spatial_patch, config.spatial_patch),
        )

        for parameter in self.target_encoder.parameters():
            parameter.requires_grad_(False)

    @staticmethod
    def _to_conv_layout(x: Tensor) -> Tensor:
        if x.ndim != 5:
            raise ValueError("expected [batch, time, channel, height, width]")
        return x.permute(0, 2, 1, 3, 4).contiguous()

    @staticmethod
    def _from_conv_layout(x: Tensor) -> Tensor:
        return x.permute(0, 2, 1, 3, 4).contiguous()

    def _validate_pair(self, context: Tensor, target: Tensor) -> None:
        if context.shape != target.shape:
            raise ValueError("context and target windows must have identical shapes")
        if context.shape[2] != self.config.input_channels:
            raise ValueError("channel count does not match WeatherJEPAConfig")
        patch = self.config.spatial_patch
        if context.shape[-2] % patch or context.shape[-1] % patch:
            raise ValueError("height and width must be divisible by spatial_patch")

    def _mask(self, latent: Tensor, generator: torch.Generator | None = None) -> Tensor:
        # One mask value per spatiotemporal latent token, shared across channels.
        shape = (latent.shape[0], 1, latent.shape[2], latent.shape[3], latent.shape[4])
        random = torch.rand(shape, device=latent.device, generator=generator)
        return random < self.config.mask_ratio

    @torch.no_grad()
    def _ema_update_target_encoder(self) -> None:
        decay = self.config.ema_decay
        for target, online in zip(
            self.target_encoder.parameters(), self.context_encoder.parameters()
        ):
            target.mul_(decay).add_(online, alpha=1.0 - decay)

    def latent_loss(
        self,
        context: Tensor,
        target: Tensor,
        *,
        generator: torch.Generator | None = None,
    ) -> Tensor:
        self._validate_pair(context, target)
        context_3d = self._to_conv_layout(context)
        target_3d = self._to_conv_layout(target)

        context_latent = self.context_encoder(context_3d)
        with torch.no_grad():
            target_latent = self.target_encoder(target_3d)

        predicted_latent = self.predictor(context_latent)
        mask = self._mask(target_latent, generator=generator).expand_as(target_latent)
        squared_error = (predicted_latent - target_latent).pow(2)
        masked = squared_error.masked_select(mask)
        if masked.numel() == 0:
            raise RuntimeError("mask selected zero latent elements")
        return masked.mean()

    def forward(self, context: Tensor) -> Tensor:
        context_3d = self._to_conv_layout(context)
        latent = self.predictor(self.context_encoder(context_3d))
        decoded = self.decoder(latent)
        return self._from_conv_layout(decoded)

    @torch.no_grad()
    def predict(self, context: Tensor) -> Tensor:
        self.eval()
        return self(context)

    def fit(
        self,
        batches: Iterable[tuple[Tensor, Tensor]],
        *,
        epochs: int = 1,
        device: str | torch.device = "cpu",
    ) -> list[float]:
        if epochs <= 0:
            raise ValueError("epochs must be positive")

        # A one-shot iterator (for example, a generator expression) is exhausted
        # after the first pass. Silently accepting it with epochs > 1 would report
        # a multi-epoch request while actually training for only one epoch.
        if epochs > 1 and iter(batches) is batches:
            raise ValueError(
                "epochs > 1 requires a re-iterable batch source; "
                "materialize the batches or provide a DataLoader-like iterable"
            )

        self.to(device)
        optimizer = torch.optim.AdamW(
            [p for p in self.parameters() if p.requires_grad],
            lr=self.config.learning_rate,
            weight_decay=self.config.weight_decay,
        )
        generator = torch.Generator(device=device)
        generator.manual_seed(self.config.seed)
        losses: list[float] = []
        self.train()

        for _ in range(epochs):
            for context, target in batches:
                context = context.to(device)
                target = target.to(device)
                optimizer.zero_grad(set_to_none=True)
                loss = self.latent_loss(context, target, generator=generator)
                loss.backward()
                optimizer.step()
                self._ema_update_target_encoder()
                losses.append(float(loss.detach().cpu()))
        return losses

    @torch.no_grad()
    def evaluate(self, batches: Iterable[tuple[Tensor, Tensor]]) -> dict[str, float]:
        self.eval()
        squared_error_sum = 0.0
        absolute_error_sum = 0.0
        element_count = 0
        for context, target in batches:
            prediction = self.predict(context)
            error = prediction - target
            squared_error_sum += float(error.pow(2).sum().cpu())
            absolute_error_sum += float(error.abs().sum().cpu())
            element_count += error.numel()
        if element_count == 0:
            raise ValueError("evaluate received no elements")
        return {
            "rmse": (squared_error_sum / element_count) ** 0.5,
            "mae": absolute_error_sum / element_count,
        }
