# NGMT Results

**Wave date:** 2026-08-12  
**Source revision audited:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**Status:** mechanism not frozen; Transformer-level experiment not yet reproducible.

## Hypothesis

A future Non-Gaussian Memory Transformer (NGMT) mechanism would need to show that an explicitly non-Gaussian memory state/read/update rule improves performance on sequence tasks where Gaussian or standard-memory assumptions are limiting, while holding parameter count, compute, training data, and evaluation policy approximately matched.

A defensible provisional prediction is improved predictive likelihood, delayed recall, or corruption robustness on heavy-tailed, multimodal, or regime-switching sequence processes relative to both ordinary memory and a capacity-matched Gaussian/reference-memory implementation.

## Current implementation status

No repository evidence at this revision freezes all of the following as one runnable Transformer-level NGMT mechanism:

- memory state/distribution family;
- memory read operation;
- memory update operation;
- operational non-Gaussian property;
- capacity-matched Gaussian/reference memory;
- standard/no-external-memory comparator;
- predeclared sequence task and falsification gate.

Therefore no Transformer-level NGMT training result is reported in this wave.

## Closest reproduced precursor

T2424-0025 is a bounded synthetic attention-style aggregation experiment comparing arithmetic and robust readouts under Cauchy contamination. It was freshly reproduced in this wave at exact source revision `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.

At 18% contamination across 50 deterministic seeds:

- arithmetic mean MAE: `0.3494393 ± 0.3472034`;
- weighted median MAE: `0.0170025 ± 0.0048577`;
- 10% trimmed readout MAE: `0.0455063 ± 0.0157134`;
- Huber readout MAE: `0.0309255 ± 0.0067962`.

However, the critical negative control also reproduced. At 0% Cauchy contamination, weighted median MAE (`0.0125699 ± 0.0020831`) is still much lower than arithmetic mean MAE (`0.0246469 ± 0.0023116`).

## Result

The current defensible result is:

> Robust readouts help on the bounded synthetic aggregation task, but the experiment does not isolate a uniquely non-Gaussian memory mechanism and does not establish NGMT.

This is an inconclusive/negative result for the stronger NGMT mechanism interpretation, and it is retained as such.

## Required baselines for the first real NGMT experiment

- **B0 — simple baseline:** no external memory / ordinary sequence model.
- **B1 — standard architecture baseline:** standard or windowed memory under the same backbone/training budget.
- **B2 — Gaussian/reference memory:** explicit capacity-matched reference memory with a Gaussian or otherwise conventional state/update assumption.
- **B3 — proposed NGMT:** frozen non-Gaussian memory mechanism.
- **Ablations:** remove/replace the non-Gaussian state parameterization and separately remove any robust readout so the source of gains can be localized.

## Seed and statistics policy

For any learned NGMT gate:

- freeze at least five paired training seeds before observing final validation results;
- reuse the same data splits and evaluation rows across methods;
- report per-seed rows, mean, sample SD, sample count, and paired deltas;
- add bootstrap intervals or a suitable paired test only if predeclared and appropriate to the metric distribution;
- do not claim significance from overlapping or non-overlapping error bars alone;
- preserve failed or divergent seeds rather than silently replacing them.

## Falsification rule

If the frozen proposed NGMT does not show a reproducible advantage over B0–B2 on the predeclared non-Gaussian sequence tasks under a matched budget, archive the Transformer-level mechanism claim. T2424-0025 may remain as a bounded robust-aggregation result.

## Limitations

The current precursor is synthetic, deterministic, not a learned Transformer, and does not uniquely identify non-Gaussian memory. No parameter-matched Transformer baseline, real sequence dataset, likelihood benchmark, delayed-recall task, or independent reproduction exists yet for NGMT.
