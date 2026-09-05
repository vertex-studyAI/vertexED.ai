from __future__ import annotations

import torch
from torch import nn


class SpectralConv1d(nn.Module):
    """Low-frequency Fourier convolution for the frozen FNO-1D baseline."""

    def __init__(self, in_channels: int, out_channels: int, modes: int):
        super().__init__()
        self.in_channels = in_channels
        self.out_channels = out_channels
        self.modes = modes
        scale = 1.0 / max(1, in_channels * out_channels)
        self.weight = nn.Parameter(
            scale * torch.randn(in_channels, out_channels, modes, dtype=torch.cfloat)
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        # x: [batch, channels, n]
        n = x.shape[-1]
        x_ft = torch.fft.rfft(x, dim=-1)
        max_modes = min(self.modes, x_ft.shape[-1])
        out_ft = torch.zeros(
            x.shape[0],
            self.out_channels,
            x_ft.shape[-1],
            device=x.device,
            dtype=torch.cfloat,
        )
        out_ft[:, :, :max_modes] = torch.einsum(
            "bim,iom->bom",
            x_ft[:, :, :max_modes],
            self.weight[:, :, :max_modes],
        )
        return torch.fft.irfft(out_ft, n=n, dim=-1)


class FNO1d(nn.Module):
    """Frozen-grid 1D FNO mapping 128 log-k sensors to 129 pressure interfaces.

    The final right Dirichlet boundary p(1)=0 is appended exactly. The network
    predicts p(x_0)..p(x_127); boundary errors are still reported separately.
    """

    def __init__(self, modes: int = 12, width: int = 32, layers: int = 4):
        super().__init__()
        self.modes = modes
        self.width = width
        self.layers = layers
        self.lift = nn.Linear(2, width)
        self.spectral = nn.ModuleList(
            [SpectralConv1d(width, width, modes) for _ in range(layers)]
        )
        self.local = nn.ModuleList([nn.Conv1d(width, width, 1) for _ in range(layers)])
        self.norms = nn.ModuleList([nn.GroupNorm(1, width) for _ in range(layers)])
        self.head = nn.Sequential(
            nn.Linear(width, 64),
            nn.GELU(),
            nn.Linear(64, 1),
        )

    def forward(self, logk_std: torch.Tensor) -> torch.Tensor:
        if logk_std.ndim != 2 or logk_std.shape[1] != 128:
            raise ValueError("FNO1d expects [batch, 128] standardized log-permeability")
        batch, n = logk_std.shape
        coord = torch.arange(n, device=logk_std.device, dtype=logk_std.dtype) / n
        coord = coord.expand(batch, n)
        x = torch.stack([logk_std, coord], dim=-1)
        x = self.lift(x).transpose(1, 2)
        for index, (spectral, local, norm) in enumerate(
            zip(self.spectral, self.local, self.norms)
        ):
            x = norm(spectral(x) + local(x))
            if index + 1 != self.layers:
                x = torch.nn.functional.gelu(x)
        out = self.head(x.transpose(1, 2)).squeeze(-1)
        right = torch.zeros(batch, 1, device=out.device, dtype=out.dtype)
        return torch.cat([out, right], dim=1)


class DeepONet(nn.Module):
    """DeepONet with a branch network over 128 log-k sensors and coordinate trunk."""

    def __init__(
        self,
        branch_width: int = 64,
        trunk_width: int = 64,
        hidden_layers: int = 3,
        latent_width: int = 64,
    ):
        super().__init__()

        def mlp(in_dim: int, width: int, depth: int, out_dim: int) -> nn.Sequential:
            if depth < 1:
                raise ValueError("hidden_layers must be >= 1")
            layers: list[nn.Module] = [nn.Linear(in_dim, width), nn.GELU()]
            for _ in range(depth - 1):
                layers.extend([nn.Linear(width, width), nn.GELU()])
            layers.append(nn.Linear(width, out_dim))
            return nn.Sequential(*layers)

        self.branch = mlp(128, branch_width, hidden_layers, latent_width)
        self.trunk = mlp(1, trunk_width, hidden_layers, latent_width)
        self.bias = nn.Parameter(torch.zeros(()))

    def forward(self, logk_std: torch.Tensor) -> torch.Tensor:
        if logk_std.ndim != 2 or logk_std.shape[1] != 128:
            raise ValueError("DeepONet expects [batch, 128] standardized log-permeability")
        branch = self.branch(logk_std)
        coords = torch.linspace(
            0,
            1,
            129,
            device=logk_std.device,
            dtype=logk_std.dtype,
        ).unsqueeze(-1)
        trunk = self.trunk(coords)
        return torch.einsum("bl,nl->bn", branch, trunk) + self.bias


def parameter_count(model: nn.Module) -> int:
    return sum(parameter.numel() for parameter in model.parameters())
