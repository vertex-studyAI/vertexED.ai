# T2424-0025 — RESULTS

Evidence date: 2026-08-12
Fresh reproducibility run: GitHub Actions `31616573215`, job `94180746280`
Frozen source base: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`
Execution commit: `db9f470ec68f74a95c6e586d88b27927d734dc44`

## Hypothesis

On the existing attention-addressed synthetic memory fixture, robust value aggregation should degrade less than a weighted arithmetic mean under Cauchy contamination. A stronger non-Gaussian-specific interpretation would additionally require the robust benefit to be meaningfully more specific to non-Gaussian conditions than to the clean control.

## Task

- 24 latent anchor locations on `[0,1]`;
- 7 memory replicas per anchor;
- fixed RBF attention weighting;
- Gaussian clean value noise;
- Cauchy-contaminated conditions;
- retrieval MAE as the primary metric.

## Baselines and proposed readouts

- simple/standard baseline: attention-weighted arithmetic mean;
- proposed robust readout: weighted median;
- ablations/alternatives: 10% weighted trimmed mean and weighted Huber location (`delta=0.15`).

## Seed policy

- reference screen: 30 deterministic seeds, no seed filtering;
- contamination ablation: 50 deterministic seeds per contamination condition, no seed filtering.

## Fresh reference result

| Condition | Mean baseline MAE | Weighted-median MAE | Relative improvement |
|---|---:|---:|---:|
| 18% Cauchy / heavy-tail screen | 0.3615267855 | 0.0165609423 | 95.4192% |
| clean control | 0.0243549670 | 0.0125939627 | 48.2900% |

Heavy-tail minus clean relative-improvement gap: `47.1292` percentage points.

The predeclared bounded heavy-tail screen passes.

## Fresh 50-seed contamination ablation

Mean MAE; parentheses are sample SD.

| Cauchy contamination | Weighted mean | Median | 10% trimmed | Huber |
|---:|---:|---:|---:|---:|
| 0% | 0.0246469 (0.0023116) | 0.0125699 (0.0020831) | 0.0187115 (0.0022061) | 0.0190792 (0.0019665) |
| 5% | 0.1450123 (0.1996837) | 0.0133367 (0.0021542) | 0.0226237 (0.0042661) | 0.0220305 (0.0033708) |
| 10% | 0.3211625 (0.5111811) | 0.0141783 (0.0029325) | 0.0300138 (0.0072377) | 0.0254792 (0.0046659) |
| 18% | 0.3494393 (0.3472034) | 0.0170025 (0.0048577) | 0.0455063 (0.0157134) | 0.0309255 (0.0067962) |
| 25% | 0.4567522 (0.4225194) | 0.0223649 (0.0064166) | 0.0670628 (0.0210941) | 0.0386112 (0.0060222) |
| 35% | 0.8655903 (1.4660585) | 0.0286803 (0.0109628) | 0.1009767 (0.0354171) | 0.0467106 (0.0107741) |

All 10 focused regression tests passed.

## Interpretation

The robust readouts are dramatically less sensitive to Cauchy outliers than the arithmetic mean on this synthetic fixture. However, the 0% control also favors every robust readout; weighted median improves MAE by about 49% even without Cauchy contamination. Therefore the current evidence supports a **robust aggregation/smoothing effect**, not an isolated non-Gaussian-memory mechanism and not a Transformer-level NGMT claim.

The weighted-mean baseline also becomes extremely high-variance under stronger Cauchy contamination, so mean-only summaries are unstable. Future work should retain medians, quantiles and bootstrap intervals as well as mean ± sample SD.

## Limitations

- synthetic retrieval only;
- no learned Transformer;
- no learned memory or attention;
- no sequence-model benchmark;
- one contamination family in the current sweep;
- no real dataset;
- no publication novelty claim;
- no statistical-significance claim.

## Artifact

Fresh run artifact: `project2424-repro-wave-31616573215`; artifact ZIP digest `sha256:79b64ebf31607d158e26ba8f74eb9970f9f22722bf7e8c2212dc4a2781860705`.