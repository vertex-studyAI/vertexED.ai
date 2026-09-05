from __future__ import annotations

from dataclasses import dataclass
from itertools import product
from typing import Iterable

import torch
from torch import Tensor, nn
import torch.nn.functional as F

DARCY_GRID_CELLS = 128
PARAMETER_COUNT_CEILING = 500_000
FNO_GRID = {
    "modes": (12, 20),
    "width": (32, 64),
    "layers": (4,),
}
DEEPONET_GRID = {
    "branch_width": (64, 128),
    "trunk_width": (64, 128),
    "hidden_layers": (3,),
    "latent_width": (64,),
}


@dataclass(frozen=True)
class Candidate:
    name: str
    config: dict[str, int]
    parameter_count: int
    within_parameter_ceiling: bool


def count_parameters(model: nn.Module) -> int:
    return sum(parameter.numel() for parameter in model.parameters() if parameter.requires_grad)


def _validate_log_permeability(log_k: Tensor, *, cells: int = DARCY_GRID_CELLS) -> Tensor:
    if log_k.ndim != 2:
        raise ValueError("log_k must have shape [batch, cells]")
    if log_k.shape[1] != cells:
        raise ValueError(f"log_k must have exactly {cells} cells")
    if not torch.isfinite(log_k).all():
        raise ValueError("log_k must contain only finite values")
    return log_k


class SpectralConv1d(nn.Module):
    """Low-mode complex Fourier convolution for a standard 1D FNO block."""

    def __init__(self, in_channels: int, out_channels: int, modes: int):
        super().__init__()
        if in_channels < 1 or out_channels < 1 or modes < 1:
            raise ValueError("in_channels, out_channels and modes must be positive")
        self.in_channels = int(in_channels)
        self.out_channels = int(out_channels)
        self.modes = int(modes)
        scale = 1.0 / max(1, in_channels * out_channels)
        self.weight = nn.Parameter(
            scale * torch.randn(in_channels, out_channels, modes, 2)
        )

    @staticmethod
    def _compl_mul(x_ft: Tensor, weight: Tensor) -> Tensor:
        complex_weight = torch.view_as_complex(weight.contiguous())
        return torch.einsum("bim,iom->bom", x_ft, complex_weight)

    def forward(self, x: Tensor) -> Tensor:
        if x.ndim != 3:
            raise ValueError("spectral input must have shape [batch, channels, length]")
        if x.shape[1] != self.in_channels:
            raise ValueError("spectral input channel count mismatch")
        n = int(x.shape[-1])
        available_modes = n // 2 + 1
        if self.modes > available_modes:
            raise ValueError(
                f"configured modes={self.modes} exceeds rFFT capacity={available_modes} for length={n}"
            )
        x_ft = torch.fft.rfft(x, dim=-1)
        out_ft = torch.zeros(
            x.shape[0],
            self.out_channels,
            available_modes,
            dtype=x_ft.dtype,
            device=x.device,
        )
        out_ft[..., : self.modes] = self._compl_mul(
            x_ft[..., : self.modes], self.weight
        )
        return torch.fft.irfft(out_ft, n=n, dim=-1)


class FNOBlock1d(nn.Module):
    def __init__(self, width: int, modes: int):
        super().__init__()
        self.spectral = SpectralConv1d(width, width, modes)
        self.local = nn.Conv1d(width, width, kernel_size=1)

    def forward(self, x: Tensor) -> Tensor:
        return F.gelu(self.spectral(x) + self.local(x))


class FNO1D(nn.Module):
    """Frozen-family FNO-1D candidate for Darcy v2.

    The model consumes the full 128-cell log-permeability field plus a right-interface coordinate
    channel. It predicts p_1..p_128 and prepends the known fixed left boundary p_0=1.0. The right
    boundary is *not* projected to zero, so its error remains an independently reported diagnostic.
    This geometry is a pre-outcome implementation choice and does not authorize training.
    """

    def __init__(
        self,
        *,
        modes: int,
        width: int,
        layers: int = 4,
        cells: int = DARCY_GRID_CELLS,
    ):
        super().__init__()
        if cells != DARCY_GRID_CELLS:
            raise ValueError(f"Darcy v2 FNO cells are frozen at {DARCY_GRID_CELLS}")
        if modes not in FNO_GRID["modes"] or width not in FNO_GRID["width"]:
            raise ValueError("FNO modes/width must come from the frozen candidate grid")
        if layers not in FNO_GRID["layers"]:
            raise ValueError("FNO layers must come from the frozen candidate grid")
        self.cells = cells
        self.modes = modes
        self.width = width
        self.layers = layers
        self.lift = nn.Linear(2, width)
        self.blocks = nn.ModuleList([FNOBlock1d(width, modes) for _ in range(layers)])
        self.project1 = nn.Linear(width, 128)
        self.project2 = nn.Linear(128, 1)

    def forward(self, log_k: Tensor) -> Tensor:
        log_k = _validate_log_permeability(log_k, cells=self.cells)
        coords = torch.linspace(
            1.0 / self.cells,
            1.0,
            self.cells,
            dtype=log_k.dtype,
            device=log_k.device,
        ).expand(log_k.shape[0], -1)
        features = torch.stack((log_k, coords), dim=-1)
        x = self.lift(features).transpose(1, 2)
        for block in self.blocks:
            x = block(x)
        x = x.transpose(1, 2)
        right_interfaces = self.project2(F.gelu(self.project1(x))).squeeze(-1)
        left = torch.ones(
            log_k.shape[0], 1, dtype=log_k.dtype, device=log_k.device
        )
        return torch.cat((left, right_interfaces), dim=1)


class MLP(nn.Module):
    def __init__(self, sizes: Iterable[int]):
        super().__init__()
        dims = tuple(int(value) for value in sizes)
        if len(dims) < 2 or any(value < 1 for value in dims):
            raise ValueError("MLP sizes must contain at least two positive dimensions")
        layers: list[nn.Module] = []
        for index, (in_features, out_features) in enumerate(zip(dims, dims[1:])):
            layers.append(nn.Linear(in_features, out_features))
            if index < len(dims) - 2:
                layers.append(nn.GELU())
        self.net = nn.Sequential(*layers)

    def forward(self, x: Tensor) -> Tensor:
        return self.net(x)


class DeepONet1D(nn.Module):
    """Branch/trunk DeepONet over the frozen 128 permeability sensors and 129 pressure coordinates."""

    def __init__(
        self,
        *,
        branch_width: int,
        trunk_width: int,
        hidden_layers: int = 3,
        latent_width: int = 64,
        cells: int = DARCY_GRID_CELLS,
    ):
        super().__init__()
        if cells != DARCY_GRID_CELLS:
            raise ValueError(f"Darcy v2 DeepONet cells are frozen at {DARCY_GRID_CELLS}")
        if branch_width not in DEEPONET_GRID["branch_width"]:
            raise ValueError("DeepONet branch_width must come from the frozen candidate grid")
        if trunk_width not in DEEPONET_GRID["trunk_width"]:
            raise ValueError("DeepONet trunk_width must come from the frozen candidate grid")
        if hidden_layers not in DEEPONET_GRID["hidden_layers"]:
            raise ValueError("DeepONet hidden_layers must come from the frozen candidate grid")
        if latent_width not in DEEPONET_GRID["latent_width"]:
            raise ValueError("DeepONet latent_width must come from the frozen candidate grid")
        self.cells = cells
        self.branch_width = branch_width
        self.trunk_width = trunk_width
        self.hidden_layers = hidden_layers
        self.latent_width = latent_width
        self.branch = MLP(
            [cells, *([branch_width] * hidden_layers), latent_width]
        )
        self.trunk = MLP(
            [1, *([trunk_width] * hidden_layers), latent_width]
        )
        self.bias = nn.Parameter(torch.zeros(()))

    def forward(self, log_k: Tensor) -> Tensor:
        log_k = _validate_log_permeability(log_k, cells=self.cells)
        branch = self.branch(log_k)
        coords = torch.linspace(
            0.0,
            1.0,
            self.cells + 1,
            dtype=log_k.dtype,
            device=log_k.device,
        ).unsqueeze(-1)
        trunk = self.trunk(coords)
        return torch.einsum("bl,xl->bx", branch, trunk) + self.bias


def _candidate(name: str, model: nn.Module, config: dict[str, int]) -> Candidate:
    count = count_parameters(model)
    return Candidate(
        name=name,
        config=dict(config),
        parameter_count=count,
        within_parameter_ceiling=count <= PARAMETER_COUNT_CEILING,
    )


def build_fno_candidates() -> tuple[Candidate, ...]:
    candidates: list[Candidate] = []
    for modes, width, layers in product(
        FNO_GRID["modes"], FNO_GRID["width"], FNO_GRID["layers"]
    ):
        config = {"modes": modes, "width": width, "layers": layers}
        model = FNO1D(**config)
        candidates.append(_candidate("FNO1D", model, config))
    return tuple(candidates)


def build_deeponet_candidates() -> tuple[Candidate, ...]:
    candidates: list[Candidate] = []
    for branch_width, trunk_width, hidden_layers, latent_width in product(
        DEEPONET_GRID["branch_width"],
        DEEPONET_GRID["trunk_width"],
        DEEPONET_GRID["hidden_layers"],
        DEEPONET_GRID["latent_width"],
    ):
        config = {
            "branch_width": branch_width,
            "trunk_width": trunk_width,
            "hidden_layers": hidden_layers,
            "latent_width": latent_width,
        }
        model = DeepONet1D(**config)
        candidates.append(_candidate("DeepONet1D", model, config))
    return tuple(candidates)
