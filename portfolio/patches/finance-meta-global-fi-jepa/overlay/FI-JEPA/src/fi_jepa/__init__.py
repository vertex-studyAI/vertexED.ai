"""Executable FI-JEPA research baseline."""

from .data import WindowedSplit, chronological_windows, make_synthetic_market
from .model import FIJEPA, ProbeMetrics, fit_ridge_probe

__all__ = [
    "FIJEPA",
    "ProbeMetrics",
    "WindowedSplit",
    "chronological_windows",
    "fit_ridge_probe",
    "make_synthetic_market",
]
