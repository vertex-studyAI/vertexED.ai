from __future__ import annotations

import torch
from torch import Tensor


def persistence_forecast(context: Tensor, *, forecast_steps: int) -> Tensor:
    """Return the frozen B0 persistence forecast for a context window.

    Parameters
    ----------
    context:
        Weather states with shape ``[batch, time, channel, height, width]``.
    forecast_steps:
        Number of future time steps to emit. The last observed state is repeated
        unchanged for each future step.

    Notes
    -----
    This is outcome-free baseline plumbing. It does not load data, compute a
    scientific metric, or inspect validation/test/OOD results.
    """

    if not isinstance(context, Tensor):
        raise TypeError("context must be a torch.Tensor")
    if context.ndim != 5:
        raise ValueError("context must have shape [batch, time, channel, height, width]")
    if context.shape[1] <= 0:
        raise ValueError("context must contain at least one time step")
    if not isinstance(forecast_steps, int) or isinstance(forecast_steps, bool):
        raise TypeError("forecast_steps must be an integer")
    if forecast_steps <= 0:
        raise ValueError("forecast_steps must be positive")

    last_state = context[:, -1:, ...]
    return last_state.expand(-1, forecast_steps, -1, -1, -1).clone()


def persistence_error_smoke(context: Tensor, target: Tensor) -> dict[str, float]:
    """Engineering-only finite-error smoke helper for non-scientific fixtures.

    This helper exists so unit tests can verify shape/error plumbing without
    invoking the preregistered Weather-JEPA metric stack. It must not be used as
    the v1 scientific evaluation implementation.
    """

    if not isinstance(target, Tensor):
        raise TypeError("target must be a torch.Tensor")
    if target.ndim != 5:
        raise ValueError("target must have shape [batch, time, channel, height, width]")
    prediction = persistence_forecast(context, forecast_steps=target.shape[1])
    if prediction.shape != target.shape:
        raise ValueError("persistence prediction and target shapes must match")
    error = prediction - target
    return {
        "rmse_smoke": float(torch.sqrt(torch.mean(error.pow(2))).detach().cpu()),
        "mae_smoke": float(torch.mean(error.abs()).detach().cpu()),
    }
