# T2424-0025 Results — Robust Readout Mechanism Screen

**Reproduced:** 2026-08-12  
**Frozen repository revision:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**Evidence class:** local reproduced synthetic mechanism screen  
**Claim boundary:** this is not a Transformer-level NGMT result.

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

The original bounded screen uses 30 deterministic seeds. The contamination ablation uses 50 deterministic seeds for every contamination level and every readout. There is no best-seed selection.

## Fresh reproduction

Exact repository source was staged without modifying the experiment and executed locally with Node.js `v22.16.0` on Linux x86_64.

Commands:

```bash
node experiment/run.mjs
node experiment/ablation.mjs
```

Measured wall times in this environment:

- 30-seed screen: `0.15 s`
- 50-seed contamination ablation: `0.91 s`

The generated metrics reproduced the checked-in reference values to machine precision.

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

## Next falsifier for NGMT

Freeze an actual memory mechanism first, then compare a standard/no-memory baseline, a capacity-matched Gaussian/reference memory, and the proposed non-Gaussian memory on heavy-tailed, multimodal, or regime-switching sequence tasks. Archive the Transformer-level mechanism claim if the proposed memory has no reproducible advantage over those controls.
