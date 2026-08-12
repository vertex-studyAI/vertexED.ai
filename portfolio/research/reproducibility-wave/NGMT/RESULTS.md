# NGMT — RESULTS

Evidence date: 2026-08-12
Status: **NO DEFENSIBLE TRANSFORMER-LEVEL RESULT YET**

## Proposed research hypothesis

A future frozen NGMT mechanism would test whether explicitly non-Gaussian memory improves predictive likelihood, delayed recall and corruption robustness under heavy-tailed, multimodal or regime-switching sequences relative to capacity-matched standard and Gaussian/reference memory baselines.

This remains a **provisional hypothesis**, not a validated mechanism.

## Existing evidence

The only directly relevant executed precursor currently connected is Project 2424 `T2424-0025`, an attention-addressed **synthetic memory-aggregation screen**, not a Transformer.

That precursor was freshly reproduced in GitHub Actions run `31616573215` and shows:

- weighted median and other robust readouts strongly outperform an arithmetic mean under Cauchy contamination;
- the same robust readouts also outperform the mean in the 0% contamination control;
- therefore the present evidence supports generic robust aggregation/smoothing on the fixture, not a uniquely non-Gaussian learned-memory mechanism.

At 18% Cauchy contamination in the 50-seed sweep:

- mean MAE `0.3494393 ± 0.3472034`;
- weighted-median MAE `0.0170025 ± 0.0048577`;
- Huber MAE `0.0309255 ± 0.0067962`;
- trimmed-mean MAE `0.0455063 ± 0.0157134`.

At 0% contamination:

- mean MAE `0.0246469 ± 0.0023116`;
- weighted-median MAE `0.0125699 ± 0.0020831`.

The clean-control result is a mechanism-identification problem, not something to hide.

## Required baseline ladder for a real NGMT experiment

1. B0 — no external memory / matched standard sequence model;
2. B1 — standard learned/window memory;
3. B2 — Gaussian/reference probabilistic memory;
4. B3 — proposed non-Gaussian memory only after its equations and parameterization are frozen;
5. ablations separating distributional representation, robust readout, routing/addressing and memory capacity.

All learned comparisons must be capacity/training-budget matched.

## Required task conditions

A frozen benchmark should include at minimum:

- clean Gaussian sequences;
- delayed/noisy recall;
- heavy-tailed corruption;
- two-mode mixtures;
- regime switching;
- nonstationary mixture weights.

## Falsification criterion

If a preregistered learned benchmark cannot distinguish the frozen proposed mechanism from B0–B2 under the conditions it is designed to address, the Transformer-level NGMT claim should be archived. The robust-readout precursor may remain as a bounded negative/positive mechanics result.

## Limitations / current blocker

- NGMT equations/mechanism are not yet sufficiently frozen for a fair learned experiment;
- no full Transformer result is connected;
- no learned sequence benchmark has been run in this wave;
- no architecture-level superiority, significance, novelty or publication claim is justified.