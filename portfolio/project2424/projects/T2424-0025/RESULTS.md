# T2424-0025 Results — Robust Readout / NGMT Surrogate

**Fresh rerun date:** 12 August 2026  
**Portfolio head audited:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**Execution class:** fresh exact-source rerun in the reproducibility-wave sandbox  
**Scientific boundary:** robust attention-addressed synthetic memory aggregation only; this is not a Transformer-level NGMT result.

## Hypothesis

On the frozen synthetic memory fixture, robust readouts should resist Cauchy contamination substantially better than the weighted-mean baseline, while the clean control is used to determine how much of the gain is generic robust smoothing rather than contamination-specific advantage.

## Task / data

Deterministically generated one-dimensional latent signal with 24 anchors, seven memory replicas per anchor, Gaussian clean noise, and optional Cauchy contamination. This is a synthetic mechanism screen, not a natural sequence dataset.

## Compared methods

- weighted mean baseline;
- weighted median;
- 10% weighted trimmed mean;
- weighted Huber location.

## Seed policy

- primary screen: seeds `0..29` (30 runs);
- contamination sweep: seeds `0..49` (50 runs per contamination level);
- contamination levels: `0`, `0.05`, `0.10`, `0.18`, `0.25`, `0.35`.

## Fresh execution environment

- runtime: Node.js `v22.16.0`;
- OS/kernel: Linux x86_64, kernel `6.18.35`;
- exact source verified by Git blob hashes before execution;
- `src/core.mjs`: `7826f9ba4577b471250ef13faa8e2c854aae4a73`;
- `src/robust_readouts.mjs`: `badbc9529d04bc851b7782a9848e81d2d3aaf39a`;
- `experiment/run.mjs`: `e5987fb6021fa0ed550166c8c45c8f4acce6fc1e`;
- `experiment/ablation.mjs`: `ed0e5b600425f67ae3e60e9809d8b9c8378bcaae`.

## Primary fresh result

Runtime: `0.13 s` wall-clock.

| Condition | Weighted mean MAE | Robust median MAE | Relative improvement |
|---|---:|---:|---:|
| Heavy-tail | 0.3615267855 | 0.0165609423 | 0.9541916590 |
| Clean | 0.0243549670 | 0.0125939627 | 0.4828996200 |

Non-Gaussian advantage gap: `0.4712920391`.

The existing predeclared synthetic gate returns `PASS_HEAVY_TAIL_MEMORY_SCREEN`.

## 50-seed contamination sweep

Ablation runtime: `0.94 s` wall-clock.

| Contamination | Mean MAE ± SD | Median MAE ± SD | Trimmed MAE ± SD | Huber MAE ± SD |
|---:|---:|---:|---:|---:|
| 0.00 | 0.024647 ± 0.002312 | 0.012570 ± 0.002083 | 0.018711 ± 0.002206 | 0.019079 ± 0.001966 |
| 0.05 | 0.145012 ± 0.199684 | 0.013337 ± 0.002154 | 0.022624 ± 0.004266 | 0.022031 ± 0.003371 |
| 0.10 | 0.321162 ± 0.511181 | 0.014178 ± 0.002933 | 0.030014 ± 0.007238 | 0.025479 ± 0.004666 |
| 0.18 | 0.349439 ± 0.347203 | 0.017003 ± 0.004858 | 0.045506 ± 0.015713 | 0.030926 ± 0.006796 |
| 0.25 | 0.456752 ± 0.422519 | 0.022365 ± 0.006417 | 0.067063 ± 0.021094 | 0.038611 ± 0.006022 |
| 0.35 | 0.865590 ± 1.466059 | 0.028680 ± 0.010963 | 0.100977 ± 0.035417 | 0.046711 ± 0.010774 |

## Interpretation

The fresh rerun confirms that robust readouts strongly outperform the weighted mean as Cauchy contamination rises on this controlled fixture. However, the weighted median also improves the clean 0% condition by about 49% relative to the mean. Therefore the current experiment isolates a **generic robust-readout effect**, not a unique non-Gaussian-memory or Transformer mechanism.

## Uncertainty

The contamination sweep reports sample standard deviation across 50 deterministic seed realizations. No significance claim is made. The distribution of mean errors is strongly variable under heavy-tail contamination, so reporting only a mean would be misleading.

## Limitations / promotion gate

1. no learned Transformer is present;
2. no learned memory state/write mechanism is present;
3. the task is synthetic and low-dimensional;
4. robust estimators help even in the clean control;
5. a Gaussian/reference probabilistic-memory baseline is still required;
6. parameter/FLOP/memory-capacity matching is still required for a Transformer-level claim;
7. natural heavy-tailed, multimodal and regime-switching sequence tasks remain untested.

**Current verdict:** `EXPERIMENTED + ANALYZED`, with a fresh exact-source reproduction of the bounded surrogate. Do not promote to a Transformer-level NGMT mechanism claim.
