# T2424-0025 — Non-Gaussian Memory Transformer

## Robust Weighted Readout Precursor

This package is a **bounded synthetic memory-aggregation study**. It does not implement or validate a full Transformer architecture, a learned memory controller, or a uniquely non-Gaussian mechanism.

## Frozen question

When similarity-weighted observations contain extreme contamination, how do robust weighted readouts compare with an arithmetic weighted mean, and does the retained effect remain specific to the contaminated regime?

## Frozen setup

- 24 latent anchor locations on `[0, 1]`;
- 7 replicas per anchor;
- smooth deterministic latent signal;
- deterministic Gaussian/RBF similarity weights;
- Gaussian value noise in the clean screen;
- Cauchy contamination in the heavy-tail condition;
- arithmetic weighted mean as the principal reference;
- weighted median as the original robust candidate;
- 10% weighted trimmed mean and Huber readout in the retained contamination ablation.

## Independently reproduced evidence

The precursor was independently reproduced from the retained source lineage. See `REPRODUCE.md`, `RESULTS.md`, and `raw_metrics/repro-wave-20260812.json` for the exact evidence chain.

Thirty-seed screen:

```text
heavy-tail arithmetic-mean MAE: 0.3615267855
heavy-tail weighted-median MAE:  0.0165609423
relative reduction:              95.42%

clean arithmetic-mean MAE:      0.0243549670
clean weighted-median MAE:      0.0125939627
relative reduction:              48.29%
```

The contamination ablation retains 50 seeds per level at contamination fractions `0`, `.05`, `.10`, `.18`, `.25`, and `.35`.

## Central negative control

The weighted median improves substantially even at **0% Cauchy contamination**. In the 50-seed ablation, median MAE is `0.0125699` versus arithmetic-mean MAE `0.0246469`, about a 49% reduction.

That result prevents a uniquely heavy-tail or specifically non-Gaussian interpretation of the overall advantage. The supported conclusion is narrower: robust weighted readouts outperform the arithmetic weighted mean under this frozen synthetic procedure, including contaminated conditions, but the retained evidence does not isolate the reason to a non-Gaussian mechanism.

## Reproduce the frozen precursor

```bash
node portfolio/project2424/projects/T2424-0025/experiment/run.mjs
node portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs
```

Do not tune the frozen precursor to make the mechanism story stronger. Any learned-memory successor must use a separately frozen protocol and evidence lineage.

## Preprint package

The current preprint-conversion branch contains:

- `PREPRINT_READINESS.md` — release gate and claim-to-evidence matrix;
- `MANUSCRIPT.md` — evidence-bounded manuscript draft;
- `RELATED_WORK_AUDIT.md` — primary-source literature audit;
- `CLAIM_AUDIT.md` — sentence-level high-risk claim review;
- `figures/` — deterministic figures generated from retained machine-readable metrics.

## Supported claims

- the frozen synthetic weighted-aggregation result is independently reproducible;
- the robust readouts substantially reduce MAE relative to the arithmetic weighted mean in the retained contaminated conditions;
- the 0% contamination control materially constrains the mechanism interpretation.

## Unsupported claims

Do not use this precursor as evidence for:

- Transformer superiority;
- learned-memory superiority;
- a uniquely non-Gaussian mechanism;
- sequence modeling or long-context language modeling;
- real-world dataset robustness;
- state-of-the-art performance;
- external validation.

## Successor science

A learned successor should be a separate preregistered experiment with no-memory, standard learned-memory, robust-statistics/reference, and proposed-mechanism conditions matched for capacity, data, optimizer, tokens/steps, seeds, and evaluation budget. Negative or null successor results must remain visible.
