# T2424-0028 Results — Residual Event Tokenization

**Fresh rerun:** 12 August 2026  
**Audited head:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**Boundary:** deterministic synthetic compression/reconstruction experiment only.

## Experiment contract

**Hypothesis.** Residual-triggered event tokens with a simple linear predictor can reduce token count on a smooth trend with sparse level defects while keeping reconstruction error bounded by the frozen threshold tradeoff.

**Task.** 120-point deterministic synthetic trend with smooth sinusoidal variation and two injected level defects.

**Baselines / controls.** Linear-predictor residual encoding is compared against hold-predictor residual encoding across frozen thresholds `0.1`, `0.25`, `0.5`, `1`, `2`.

**Metrics.** Token count, token ratio, compression factor, MAE, RMSE, maximum absolute error.

**Seed policy.** No random seed; fixture is deterministic. Repeating it does not create statistical uncertainty.

## Exact-source provenance

- `src/core.mjs`: `af93f210b6c922b87281091a28bb8ad4d5ad864a`;
- `experiment/run.mjs`: `a238e5f984b4eee5a525c08416cb5f72754bfa10`.

Fresh environment: Node.js `v22.16.0`, Linux x86_64 kernel `6.18.35`. Runtime: `0.03 s`.

## Primary frozen result

Primary configuration: threshold `0.5`, linear predictor.

- observations: `120`;
- tokens: `8`;
- token ratio: `0.0666666667`;
- compression factor: `15×`;
- MAE: `0.1728128635`;
- RMSE: `0.2232590424`;
- max absolute error: `0.4885704680`.

## Threshold tradeoff

| Threshold | Linear tokens | Linear compression | Linear MAE | Hold tokens | Hold compression | Hold MAE |
|---:|---:|---:|---:|---:|---:|---:|
| 0.10 | 18 | 6.667× | 0.034587 | 120 | 1× | 0 |
| 0.25 | 10 | 12× | 0.074674 | 60 | 2× | 0.089576 |
| 0.50 | 8 | 15× | 0.172813 | 38 | 3.158× | 0.202995 |
| 1.00 | 6 | 20× | 0.364747 | 21 | 5.714× | 0.443182 |
| 2.00 | 6 | 20× | 0.510708 | 12 | 10× | 0.907651 |

## Interpretation

The fresh rerun reproduces a clear compression–error frontier on this deterministic fixture. At the primary threshold, the linear predictor uses far fewer tokens than the hold predictor and has lower MAE. This is evidence for the implemented encoding behavior only, not for learned tokenization, downstream task quality or natural-data compression.

## Limitations / next gate

1. deterministic synthetic univariate signal;
2. no noise, missingness or multivariate structure;
3. no byte-level or entropy-coded storage accounting;
4. no learned tokenizer or downstream model;
5. no natural time-series/audio/event dataset;
6. no repeated-instance uncertainty distribution.

**Verdict:** fresh exact-source bounded analytic/synthetic reproduction; external-data and learned-model claims remain unsupported.
