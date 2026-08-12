# T2424-0025 — Robust-readout ablation, 12 August 2026

## Evidence class

`LOCAL_REPRODUCED_SYNTHETIC_ABLATION`

This is an exploratory follow-up to the already merged bounded memory-aggregation screen. The original project result was known before this ablation was designed, so this record does not present the follow-up as an independent preregistration.

## Actual implementation under test

The repository implementation is an **attention-addressed synthetic memory aggregation mechanism**, not a complete Transformer. RBF attention weights are held fixed while the value aggregation rule changes.

## Question

How does robust-readout performance change as Cauchy contamination increases when memory construction and attention weighting are otherwise fixed?

## Fixed sweep

- 50 deterministic seeds per condition;
- contamination rates: `0`, `0.05`, `0.10`, `0.18`, `0.25`, `0.35`;
- weighted mean baseline;
- weighted median;
- 10% weighted trimmed mean;
- weighted Huber location (`delta=0.15`);
- primary quantity: mean absolute retrieval error over the same 24 latent anchors used by the existing screen;
- all requested contamination levels retained in the output.

## Local result

Mean MAE across 50 seeds; parentheses show relative improvement over weighted mean.

| Cauchy contamination | Mean | Median | 10% trimmed | Huber |
|---:|---:|---:|---:|---:|
| 0% | 0.024647 | 0.012570 (49.00%) | 0.018711 (24.08%) | 0.019079 (22.59%) |
| 5% | 0.145012 | 0.013337 (90.80%) | 0.022624 (84.40%) | 0.022031 (84.81%) |
| 10% | 0.321162 | 0.014178 (95.59%) | 0.030014 (90.65%) | 0.025479 (92.07%) |
| 18% | 0.349439 | 0.017003 (95.13%) | 0.045506 (86.98%) | 0.030926 (91.15%) |
| 25% | 0.456752 | 0.022365 (95.10%) | 0.067063 (85.32%) | 0.038611 (91.55%) |
| 35% | 0.865590 | 0.028680 (96.69%) | 0.100977 (88.33%) | 0.046711 (94.60%) |

Sample standard deviations of MAE at the 18% condition were:

- mean: `0.347203`;
- median: `0.004858`;
- trimmed: `0.015713`;
- Huber: `0.006796`.

## Focused local regression result

```text
4 tests passed; 0 failed
```

The tests cover weighted trimming, Huber outlier behavior, deterministic sweep preservation and the existing 18% robust-readout property.

## What the ablation supports

Within this exact synthetic mechanism:

- robust aggregation is substantially less sensitive than the arithmetic mean to Cauchy-contaminated memory values;
- the weighted median is the strongest of the tested robust readouts across the entire fixed contamination sweep;
- Huber and trimmed readouts also retain large advantages under contamination, so the effect is not unique to one implementation of a robust statistic.

## Important negative/limiting evidence

The 0% control also favors all three robust readouts, including a 49% median improvement over the mean. Therefore the current task does **not cleanly isolate a uniquely non-Gaussian advantage**. Some of the observed benefit is generic robustness/smoothing under the current noisy-memory construction.

The baseline variance also becomes extremely large under higher Cauchy contamination, which makes mean-of-seed performance sensitive to rare extreme events. Future reporting should include medians/quantiles or bootstrap intervals in addition to mean ± sample standard deviation.

## Not demonstrated

- a Transformer architecture;
- learned memory or learned attention;
- delayed sequence recall;
- regime switching or multimodal sequence memory;
- robustness across multiple contamination families;
- sample-efficiency gains;
- real-world or language-model performance;
- novelty relative to robust-estimation literature;
- paper readiness.

## Next decisive experiment

Build a learned sequence-retrieval benchmark with train/validation/test splits and compare:

1. no external memory;
2. standard learned memory with mean readout;
3. Gaussian/reference memory baseline;
4. the robust readout variants;

under clean noise, Gaussian corruption, Cauchy corruption, multimodal corruption and regime shifts. Predeclare a primary held-out accuracy/calibration metric, record compute/parameters, run multiple seeds and preserve every condition.
