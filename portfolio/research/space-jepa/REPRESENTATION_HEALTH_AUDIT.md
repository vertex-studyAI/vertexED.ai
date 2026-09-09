# Space-JEPA representation-health audit

## Why this exists

The current Space-JEPA loss combines cosine future-latent prediction with a coordinate-wise variance penalty on online context embeddings. That is useful but mathematically insufficient to rule out low-rank representation collapse.

A counterexample is a rank-one latent process

\[
z_i = a_i v,
\]

where the scalar coefficient \(a_i\) varies over samples and every coordinate of \(v\) is non-zero. Every latent coordinate can therefore have substantial standard deviation while the entire representation still occupies only a one-dimensional subspace. A loss that checks only per-coordinate standard deviation can miss this failure mode.

This audit adds label-free covariance-spectrum diagnostics so the implementation can expose that pathology before any official ESA held-out outcome is inspected.

## Added diagnostics

`space_jepa.diagnostics.representation_health` reports:

- effective rank: entropy exponent of covariance eigenvalue mass;
- effective-rank fraction: effective rank divided by latent dimension;
- participation ratio: `tr(C)^2 / tr(C^2)`;
- mean absolute off-diagonal correlation;
- minimum / median / maximum per-coordinate standard deviation;
- count of near-constant dimensions.

The regression suite contains the key falsifier: a synthetic rank-one representation in which **every coordinate varies strongly** must still be diagnosed as effectively rank one and highly correlated. This specifically tests the weakness that a coordinate-wise variance floor cannot detect.

## Scientific boundary

This is an **audit-only pre-outcome extension**. It does not change:

- the frozen ESA endpoint;
- model architecture or loss;
- seeds, context/target lengths, optimizer, thresholds, baselines, comparators, or metrics;
- held-out outcome authorization;
- any current manuscript performance claim.

For the frozen first pass, representation-health statistics should be recorded only on nominal training embeddings and treated descriptively. They must not become a post-hoc reason to tune the model after seeing ESA held-out outcomes. If the audit reveals severe collapse before outcome access, halt the current execution and preregister a successor model/ablation rather than silently modifying the frozen first-pass method.

## Recommended artifact for the retained run

Before outcome access, retain one JSON record per seed for the following training-only tensors:

1. online context encoder latents;
2. EMA target encoder future latents;
3. predictor future latents.

Each record should include exact commit SHA, seed, tensor role, sample count, latent dimension, and the complete `RepresentationHealth.to_dict()` payload. Sampling must be deterministic and drawn only from the allowed training partition.

## Interpretation discipline

These statistics are diagnostics, not success metrics. A high effective rank does not prove a useful representation, and a low rank does not by itself prove that anomaly detection will fail. Their role is narrower: falsify the assumption that the anti-collapse term necessarily prevents a degenerate low-dimensional solution.

No numeric cutoff is frozen here for scientific success or failure. Any future decision rule that uses these statistics to alter model selection must be declared before held-out outcome access as a separate protocol amendment or successor study.
