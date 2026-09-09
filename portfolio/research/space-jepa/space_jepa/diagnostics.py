from __future__ import annotations

from dataclasses import asdict, dataclass

import numpy as np


@dataclass(frozen=True)
class RepresentationHealth:
    """Descriptive latent-space health statistics.

    These diagnostics are intentionally label-free and outcome-free. They are suitable for
    auditing nominal training representations, but they are not an anomaly metric and must not
    be used to tune the frozen ESA endpoint after held-out outcome access.
    """

    sample_count: int
    dimension: int
    effective_rank: float
    effective_rank_fraction: float
    participation_ratio: float
    mean_abs_offdiag_correlation: float
    min_std: float
    median_std: float
    max_std: float
    near_constant_dimensions: int

    def to_dict(self) -> dict[str, int | float]:
        return asdict(self)


def representation_health(
    latents: np.ndarray,
    *,
    std_floor: float = 1e-4,
    eps: float = 1e-12,
) -> RepresentationHealth:
    """Compute scale- and rank-sensitive diagnostics for a latent tensor.

    The final axis is treated as representation dimension and every preceding axis is flattened
    into independent observations. Effective rank uses the entropy of the covariance eigenvalue
    spectrum. Participation ratio is ``tr(C)^2 / tr(C^2)``. Together these detect low-rank
    collapse that a per-dimension variance penalty can miss.
    """

    x = np.asarray(latents, dtype=np.float64)
    if x.ndim < 2:
        raise ValueError("latents must have at least [samples, dimension]")
    if x.shape[-1] < 1:
        raise ValueError("representation dimension must be positive")
    if std_floor < 0:
        raise ValueError("std_floor must be non-negative")
    if eps <= 0:
        raise ValueError("eps must be positive")

    dimension = int(x.shape[-1])
    flat = x.reshape(-1, dimension)
    if flat.shape[0] < 2:
        raise ValueError("at least two latent observations are required")
    if not np.isfinite(flat).all():
        raise ValueError("latents must be finite")

    centered = flat - flat.mean(axis=0, keepdims=True)
    std = centered.std(axis=0, ddof=0)
    covariance = centered.T @ centered / float(flat.shape[0])
    covariance = (covariance + covariance.T) * 0.5

    eigenvalues = np.linalg.eigvalsh(covariance)
    eigenvalues = np.clip(eigenvalues, 0.0, None)
    spectral_mass = float(eigenvalues.sum())
    if spectral_mass <= eps:
        effective_rank = 0.0
        participation_ratio = 0.0
    else:
        probabilities = eigenvalues / spectral_mass
        positive = probabilities > eps
        entropy = -float(np.sum(probabilities[positive] * np.log(probabilities[positive])))
        effective_rank = float(np.exp(entropy))
        squared_mass = float(np.square(eigenvalues).sum())
        participation_ratio = (
            float(spectral_mass * spectral_mass / squared_mass) if squared_mass > eps else 0.0
        )

    usable = std > eps
    if int(usable.sum()) < 2:
        mean_abs_offdiag_correlation = 0.0
    else:
        cov = covariance[np.ix_(usable, usable)]
        denom = np.outer(std[usable], std[usable])
        corr = np.divide(cov, denom, out=np.zeros_like(cov), where=denom > eps)
        mask = ~np.eye(corr.shape[0], dtype=bool)
        mean_abs_offdiag_correlation = float(np.abs(corr[mask]).mean())

    return RepresentationHealth(
        sample_count=int(flat.shape[0]),
        dimension=dimension,
        effective_rank=effective_rank,
        effective_rank_fraction=float(effective_rank / dimension),
        participation_ratio=participation_ratio,
        mean_abs_offdiag_correlation=mean_abs_offdiag_correlation,
        min_std=float(std.min()),
        median_std=float(np.median(std)),
        max_std=float(std.max()),
        near_constant_dimensions=int(np.count_nonzero(std <= std_floor)),
    )
