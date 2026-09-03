from __future__ import annotations

from dataclasses import asdict, dataclass
from typing import Any


@dataclass(frozen=True)
class SpaceJEPAConfig:
    n_features: int
    context_length: int = 64
    target_length: int = 16
    d_model: int = 96
    n_heads: int = 4
    n_layers: int = 3
    predictor_layers: int = 2
    ff_mult: int = 4
    dropout: float = 0.1
    ema_decay: float = 0.996
    variance_weight: float = 0.05

    def validate(self) -> "SpaceJEPAConfig":
        if self.n_features < 1:
            raise ValueError("n_features must be >= 1")
        if self.context_length < 2 or self.target_length < 1:
            raise ValueError("invalid context/target lengths")
        if self.d_model % self.n_heads:
            raise ValueError("d_model must be divisible by n_heads")
        if not 0.0 < self.ema_decay < 1.0:
            raise ValueError("ema_decay must be in (0, 1)")
        return self

    def to_dict(self) -> dict[str, Any]:
        return asdict(self)
