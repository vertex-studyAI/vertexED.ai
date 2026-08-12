# NPMS — fresh reproducibility result

**Wave:** 2026-08-12  
**Source package:** `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`  
**Source archive SHA-256:** `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`  
**Experiment source SHA-256:** `b4658727dc66dbdd68a8ba0f487c6e064f7b2c0611bea676381606224a83c51d`  
**Fresh command:** `python -m projects.npms.experiment`  
**Fresh wall runtime:** `5.39 s`

## Hypothesis

Functional memory spectra should remain stable under orthogonal coordinate changes while retaining information that distinguishes reservoir memory regimes better than raw recurrent-parameter geometry.

## Dataset / task

Four controlled reservoir regimes vary spectral radius and leak. Seven base reservoirs are generated per regime. Each is evaluated in its original coordinates plus three random orthogonal transforms. Delay spectra use 24 functional probes and chronological train/test splits.

## Baselines and controls

- raw recurrent-parameter geometry/similarity;
- between-regime spectrum similarity as a control against a constant descriptor;
- leave-one-reservoir-out regime classification.

## Fresh result

- within-coordinate spectrum cosine similarity: `0.9959606006`;
- within-coordinate raw-parameter absolute cosine similarity: `0.0992706397`;
- between-regime spectrum cosine similarity: `0.9530792787`;
- leave-one-reservoir-out regime classification accuracy: `0.9285714286`;
- total reservoir realizations: `112`.

## Uncertainty

For the paired invariance comparison, within-spectrum minus raw-parameter similarity is `+0.89668996` with bootstrap 95% CI `[0.878534, 0.913118]`, `n=84`. Within-regime minus between-regime spectrum similarity is `+0.0440143` with bootstrap 95% CI `[0.039961, 0.048339]`, `n=28`.

The retained package also records paired t-tests, Wilcoxon signed-rank tests, median differences and standardized effects. No claim is promoted beyond the controlled protocol.

## Integrity

The experiment source hash matched before and after execution. No scientific implementation was changed after observing the result.

## Claim boundary

This is a controlled reservoir diagnostic, not evidence of general neural-memory interpretability, forecasting superiority, or real-world transfer. The next meaningful gate is a frozen learned sequence-model checkpoint or naturalistic task with stronger memory diagnostics and independent reproduction.