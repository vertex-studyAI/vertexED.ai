# T2424-0028 — Residual Event Tokenization

A Project 2424 minimum experiment for converting dense scalar time series into sparse **residual-triggered event tokens** with deterministic reconstruction.

## Question

Can a simple predictive event codec reduce the number of stored observations while enforcing an explicit reconstruction-error threshold?

This package tests that question with two causal predictors:

- `hold`: zero-order hold from the latest event;
- `linear`: extrapolation from the two latest events.

At each observation, the encoder predicts the value using only already-emitted tokens. A new token is emitted when the absolute residual reaches the configured threshold. The decoder uses the same predictor and tokens, so the reconstruction is reproducible without access to the original dense series.

## Core invariant

For an encoding produced by this implementation, every non-token observation has absolute reconstruction error **strictly below the emission threshold**; token positions reconstruct exactly.

The repository tests this invariant across both predictors and several thresholds.

## Run the minimum experiment

From the repository root:

```bash
node portfolio/new-projects/residual-event-tokenization/experiment/run.mjs
```

The experiment uses a deterministic synthetic trending series with two injected level defects and reports:

- token count and token ratio;
- compression factor;
- MAE;
- RMSE;
- maximum absolute reconstruction error;
- a threshold sweep for both predictors.

The synthetic experiment is intentionally a mechanics check. It is not evidence of performance on real sensors, finance, language, video, or scientific datasets.

## Run tests

```bash
node --test tests/residualEventTokenization.test.mjs
```

The canonical VertexED test suite also picks up this integration test.

## Files

```text
residual-event-tokenization/
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test:

```text
tests/residualEventTokenization.test.mjs
```

## Falsification / comparison built in

The tests include a clean linear trend where the linear predictor should need only the initial two events while zero-order hold requires many more. They also verify that increasing the residual threshold reduces hold-predictor token density on a monotonic signal.

Those are controlled implementation experiments, not a claim that linear prediction is universally superior.

## Limitations

- scalar series only;
- no entropy coding of token indices or values;
- token payloads currently store full floating-point values;
- predictors are deliberately simple and causal;
- threshold selection is manual;
- no missing-data model;
- no timestamps with irregular spacing;
- no externally grounded benchmark yet.

## Next evidence gate

A research-ready follow-up should freeze at least two real datasets with different dynamics, compare against uniform downsampling and standard change-point/event baselines, count encoded bytes rather than token count alone, and predeclare the rate–distortion metrics before evaluation.
