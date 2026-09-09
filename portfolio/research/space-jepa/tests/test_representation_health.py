from __future__ import annotations

import numpy as np
import pytest

from space_jepa.diagnostics import representation_health


def test_isotropic_latents_have_high_effective_rank_and_low_correlation() -> None:
    rng = np.random.default_rng(17)
    latents = rng.normal(size=(2048, 8))

    health = representation_health(latents)

    assert health.sample_count == 2048
    assert health.dimension == 8
    assert health.effective_rank_fraction > 0.95
    assert health.participation_ratio > 7.0
    assert health.mean_abs_offdiag_correlation < 0.05
    assert health.near_constant_dimensions == 0


def test_rank_one_latents_are_detected_even_when_every_dimension_varies() -> None:
    t = np.linspace(-2.0, 2.0, 1024, dtype=np.float64)
    direction = np.asarray([1.0, -2.0, 0.5, 3.0, -1.5, 0.25], dtype=np.float64)
    latents = t[:, None] * direction[None, :]

    health = representation_health(latents)

    # Every coordinate has substantial variance, so a coordinate-wise variance floor alone would
    # not diagnose this representation. Spectral diagnostics should still expose rank-one collapse.
    assert health.near_constant_dimensions == 0
    assert health.min_std > 0.1
    assert health.effective_rank < 1.01
    assert health.effective_rank_fraction < 0.2
    assert health.participation_ratio < 1.01
    assert health.mean_abs_offdiag_correlation > 0.99


def test_leading_axes_are_flattened_without_changing_dimension() -> None:
    rng = np.random.default_rng(29)
    latents = rng.normal(size=(16, 12, 5))

    health = representation_health(latents)

    assert health.sample_count == 16 * 12
    assert health.dimension == 5


def test_nonfinite_latents_fail_closed() -> None:
    latents = np.ones((8, 4), dtype=np.float64)
    latents[2, 1] = np.nan

    with pytest.raises(ValueError, match="finite"):
        representation_health(latents)


def test_degenerate_constant_representation_reports_zero_spectral_rank() -> None:
    latents = np.ones((32, 4), dtype=np.float64)

    health = representation_health(latents)

    assert health.effective_rank == 0.0
    assert health.participation_ratio == 0.0
    assert health.near_constant_dimensions == 4
