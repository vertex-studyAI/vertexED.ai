from __future__ import annotations

from pathlib import Path
import sys

import pytest
import torch

PROJECT_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PROJECT_ROOT))

from learned import (  # noqa: E402
    DARCY_GRID_CELLS,
    PARAMETER_COUNT_CEILING,
    DeepONet1D,
    FNO1D,
    SpectralConv1d,
    build_deeponet_candidates,
    build_fno_candidates,
    count_parameters,
)


def test_spectral_convolution_exact_identity_when_all_modes_are_retained():
    torch.manual_seed(1)
    x = torch.randn(3, 2, 64)
    layer = SpectralConv1d(2, 2, modes=33)
    with torch.no_grad():
        layer.weight.zero_()
        layer.weight[0, 0, :, 0] = 1.0
        layer.weight[1, 1, :, 0] = 1.0
    reconstructed = layer(x)
    assert torch.allclose(reconstructed, x, atol=2e-6, rtol=2e-6)


def test_frozen_candidate_grid_and_parameter_ceiling_are_mechanical():
    candidates = build_fno_candidates()
    assert len(candidates) == 4
    assert {tuple(sorted(row.config.items())) for row in candidates} == {
        (("layers", 4), ("modes", 12), ("width", 32)),
        (("layers", 4), ("modes", 12), ("width", 64)),
        (("layers", 4), ("modes", 20), ("width", 32)),
        (("layers", 4), ("modes", 20), ("width", 64)),
    }
    over_budget = [row for row in candidates if not row.within_parameter_ceiling]
    assert len(over_budget) == 1
    assert over_budget[0].config == {"modes": 20, "width": 64, "layers": 4}
    assert over_budget[0].parameter_count > PARAMETER_COUNT_CEILING
    assert all(row.parameter_count > 0 for row in candidates)


def test_all_deeponet_grid_candidates_fit_frozen_parameter_ceiling():
    candidates = build_deeponet_candidates()
    assert len(candidates) == 4
    assert all(row.within_parameter_ceiling for row in candidates)
    assert max(row.parameter_count for row in candidates) < PARAMETER_COUNT_CEILING


def test_fno_forward_has_frozen_pressure_geometry_and_unprojected_right_boundary():
    torch.manual_seed(3)
    model = FNO1D(modes=12, width=32, layers=4)
    log_k = torch.randn(2, DARCY_GRID_CELLS)
    pressure = model(log_k)
    assert pressure.shape == (2, DARCY_GRID_CELLS + 1)
    assert torch.all(pressure[:, 0] == 1.0)
    assert torch.isfinite(pressure).all()
    assert count_parameters(model) <= PARAMETER_COUNT_CEILING


def test_deeponet_forward_predicts_all_129_pressure_coordinates():
    torch.manual_seed(5)
    model = DeepONet1D(
        branch_width=64,
        trunk_width=64,
        hidden_layers=3,
        latent_width=64,
    )
    pressure = model(torch.randn(2, DARCY_GRID_CELLS))
    assert pressure.shape == (2, DARCY_GRID_CELLS + 1)
    assert torch.isfinite(pressure).all()
    assert count_parameters(model) <= PARAMETER_COUNT_CEILING


def test_both_operator_paths_have_finite_gradients_on_trivial_operator_smoke():
    torch.manual_seed(7)
    inputs = torch.zeros(4, DARCY_GRID_CELLS)
    x = torch.linspace(0.0, 1.0, DARCY_GRID_CELLS + 1)
    target = (1.0 - x).unsqueeze(0).expand(4, -1)

    models = [
        FNO1D(modes=12, width=32, layers=4),
        DeepONet1D(
            branch_width=64,
            trunk_width=64,
            hidden_layers=3,
            latent_width=64,
        ),
    ]
    for model in models:
        prediction = model(inputs)
        loss = torch.mean((prediction - target) ** 2)
        assert torch.isfinite(loss)
        loss.backward()
        gradients = [
            parameter.grad
            for parameter in model.parameters()
            if parameter.requires_grad and parameter.grad is not None
        ]
        assert gradients
        assert all(torch.isfinite(gradient).all() for gradient in gradients)
        assert sum(float(gradient.abs().sum()) for gradient in gradients) > 0.0


def test_operator_paths_reduce_loss_on_trivial_constant_pressure_operator():
    torch.manual_seed(11)
    inputs = torch.zeros(8, DARCY_GRID_CELLS)
    x = torch.linspace(0.0, 1.0, DARCY_GRID_CELLS + 1)
    target = (1.0 - x).unsqueeze(0).expand(8, -1)

    models = [
        FNO1D(modes=12, width=32, layers=4),
        DeepONet1D(
            branch_width=64,
            trunk_width=64,
            hidden_layers=3,
            latent_width=64,
        ),
    ]
    for model in models:
        optimizer = torch.optim.AdamW(model.parameters(), lr=1e-3, weight_decay=1e-4)
        with torch.no_grad():
            initial = float(torch.mean((model(inputs) - target) ** 2))
        for _ in range(12):
            optimizer.zero_grad(set_to_none=True)
            loss = torch.mean((model(inputs) - target) ** 2)
            loss.backward()
            optimizer.step()
        with torch.no_grad():
            final = float(torch.mean((model(inputs) - target) ** 2))
        assert final < initial


def test_nonfinite_or_wrong_shape_inputs_fail_closed():
    fno = FNO1D(modes=12, width=32, layers=4)
    with pytest.raises(ValueError, match="exactly 128"):
        fno(torch.zeros(1, 127))
    invalid = torch.zeros(1, DARCY_GRID_CELLS)
    invalid[0, 2] = float("nan")
    with pytest.raises(ValueError, match="finite"):
        fno(invalid)
