# T2424-0025 Results — Robust Readout Mechanism Screen

**Frozen experiment revision:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**Repository-conformant verifier-fix revision:** `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`  
**Latest independently audited retained run:** Actions `31618609967`, attempt `3`, artifact `9162627168`  
**Artifact digest:** `sha256:d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`  
**Evidence class:** reproduced synthetic robust-readout mechanism screen  
**Claim boundary:** **this is not a Transformer-level NGMT result.**

## Reproducibility lineage

The original bounded result was reproduced without altering the experiment. A later Actions run (`31617979117`) failed only because a post-run verifier expected a stale ablation JSON schema. The scientific commands had already emitted their outputs.

The verifier-only repair at `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7` changed no experiment protocol, seeds, contamination grid, metric, threshold, or result gate. The two scientific entry points are byte-identical between the frozen and verifier-fix revisions:

- `experiment/run.mjs`: blob SHA `e5987fb6021fa0ed550166c8c45c8f4acce6fc1e` at both revisions;
- `experiment/ablation.mjs`: blob SHA `ed0e5b600425f67ae3e60e9809d8b9c8378bcaae` at both revisions.

The corrected run succeeded. Attempts 2 and 3 retain byte-identical scientific JSON for the screen, ablation, and canonical verifier. Runtime/timestamp metadata varies as expected.

## Hypothesis

For a deterministic attention-style aggregation task with heavy-tailed value contamination, robust weighted readouts should reduce mean absolute error relative to a weighted arithmetic mean. A mechanism-specific non-Gaussian claim would additionally require that the advantage be substantially tied to the non-Gaussian contamination rather than appearing similarly under clean Gaussian noise.

## Task and data

Synthetic bounded aggregation task with 24 anchor queries on `[0, 1]`, seven replicas per anchor, a deterministic smooth latent signal, small key noise, and value noise. The heavy-tail condition injects Cauchy contamination; the clean control uses Gaussian value noise. Attention weights are deterministic RBF weights.

## Methods

- **Simple baseline:** weighted arithmetic mean.
- **Proposed bounded mechanism:** weighted median.
- **Additional robust references:** 10% weighted trimmed mean and Huber readout (`delta = 0.15`).
- **Negative control:** `0%` Cauchy contamination.
- **Contamination sweep:** `0, 0.05, 0.10, 0.18, 0.25, 0.35`.

Primary metric: mean absolute error (MAE), lower is better.

## Seed policy

The bounded screen uses 30 deterministic seeds. The contamination ablation uses 50 deterministic seeds for every contamination level and every readout. There is no best-seed selection.

## Repository-conformant environment and runtime

Attempt 3 retained:

- Node `v22.22.0`;
- npm `10.9.4`;
- Linux `6.17.0-1022-azure`, x86_64;
- 4 visible CPUs;
- no accelerator or external model/API dependency.

Measured attempt-3 wall times:

- 30-seed screen: `0.12 s`;
- 50-seed ablation: `1.08 s`.

These times are evidence metadata, not throughput claims.

## 30-seed screen

| Condition | Weighted mean MAE | Weighted median MAE | Relative improvement |
|---|---:|---:|---:|
| Heavy-tail contamination | 0.3615267855 | 0.0165609423 | 95.42% |
| Clean Gaussian control | 0.0243549670 | 0.0125939627 | 48.29% |

Difference in relative improvement: `47.1292` percentage points in favor of the heavy-tail condition.

This passes the repository's bounded heavy-tail screen. It does **not** establish a Transformer-level non-Gaussian memory advantage.

## 50-seed contamination ablation

Values below are mean MAE ± sample SD across 50 seeds.

| Cauchy contamination | Mean | Median | 10% trim | Huber |
|---:|---:|---:|---:|---:|
| 0.00 | 0.0246469 ± 0.0023116 | 0.0125699 ± 0.0020831 | 0.0187115 ± 0.0022061 | 0.0190792 ± 0.0019665 |
| 0.05 | 0.1450123 ± 0.1996837 | 0.0133367 ± 0.0021542 | 0.0226237 ± 0.0042661 | 0.0220305 ± 0.0033708 |
| 0.10 | 0.3211625 ± 0.5111811 | 0.0141783 ± 0.0029325 | 0.0300138 ± 0.0072377 | 0.0254792 ± 0.0046659 |
| 0.18 | 0.3494393 ± 0.3472034 | 0.0170025 ± 0.0048577 | 0.0455063 ± 0.0157134 | 0.0309255 ± 0.0067962 |
| 0.25 | 0.4567522 ± 0.4225194 | 0.0223649 ± 0.0064166 | 0.0670628 ± 0.0210941 | 0.0386112 ± 0.0060222 |
| 0.35 | 0.8655903 ± 1.4660585 | 0.0286803 ± 0.0109628 | 0.1009767 ± 0.0354171 | 0.0467106 ± 0.0107741 |

## Negative result / mechanism boundary

The key negative control reproduces: robust readouts outperform the arithmetic mean even with **0% Cauchy contamination**. At 0% contamination, weighted median MAE is `0.0125699` versus `0.0246469` for the mean, a roughly 49% relative reduction.

Therefore the experiment supports a bounded statement about robust/smoothing readouts in this synthetic aggregation task. It does not isolate a uniquely non-Gaussian-memory mechanism, and it does not establish NGMT.

## Cross-rerun evidence

Retained Actions artifacts `9162075012` and `9162627168` contain the same 15-file set. The T2424-0025 screen JSON, ablation JSON and verifier JSON are byte-identical across the two attempts.

Attempt-3 hashes:

- screen JSON: `sha256:7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1`;
- ablation JSON: `sha256:f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e`;
- verifier JSON: `sha256:ba0e73902ef8cd2dabc66995bffbd20476afad7aa23f8302ce4be7e68f736188`.

Full independent audit: `portfolio/research/reproducibility-wave-20260813/PROJECT2424_INDEPENDENT_AUDIT.md` and `project2424_independent_audit.json`.

## Uncertainty

The arithmetic-mean baseline becomes extremely variable under Cauchy contamination (for example sample SD `1.4661` at 35% contamination). Mean ± SD is retained for continuity, but future reporting should add medians, quantiles, and bootstrap intervals rather than relying on Gaussian summaries for heavy-tailed outcomes.

No significance claim is made by this reproduction wave. The 50-seed ablation is an after-the-fact mechanism analysis because the original bounded result was already known.

## Limitations

- synthetic aggregation rather than a learned Transformer;
- deterministic RBF attention and hand-specified noise model;
- robust readouts improve in the Gaussian control, weakening a specific non-Gaussian explanation;
- no capacity-matched learned Gaussian-memory baseline;
- no sequence modeling, delayed recall, likelihood, or real-data benchmark;
- Cauchy-contaminated MAE distributions are highly skewed and unstable for the arithmetic mean.

## NGMT status and next falsifier

**NGMT remains BLOCKED / mechanism not frozen.** Do not rename this robust-readout screen into a Transformer result.

Freeze an actual memory mechanism first, then compare:

- B0: no memory;
- B1: standard memory;
- B2: capacity-matched Gaussian/reference robust memory;
- B3: proposed non-Gaussian memory;

on frozen clean, heavy-tail and regime-shift sequence tasks with matched dimensions/parameters and paired seeds. Archive the Transformer-level mechanism claim if B3 has no reproducible advantage over those controls.
