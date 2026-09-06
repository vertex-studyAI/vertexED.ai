# T2424-0025 Figure Audit

Status: **EVIDENCE-DERIVED / DETERMINISTIC REGENERATION PASS; FINAL PDF VISUAL REVIEW OPEN**

## Evidence source

Both manuscript figures are derived only from the retained machine-readable reproduction artifact:

- `../raw_metrics/repro-wave-20260812.json`
- retained evidence blob: `363c22a11abbe8fbb7f0b261054f4e46f9723e24`
- frozen experiment source recorded by that artifact: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`

No experiment runner, model training, outcome regeneration, seed selection, threshold change, or inferential procedure is part of figure generation.

## Deterministic derivation

`generate.mjs` reads the retained JSON and regenerates:

- `figure1_contamination_mae.svg` from the six retained contamination rows and all four retained readouts;
- `figure2_relative_improvement.svg` from `(mean_mae - median_mae) / mean_mae` at each retained contamination fraction;
- `FIGURE_DATA.json` with the exact derived relative-improvement values.

The current-main reconciliation workflow regenerates these three outputs on the exact PR head and requires `git diff --exit-code` to remain empty. This prevents a committed figure or derived-data file from drifting away from the retained evidence while still avoiding any scientific re-execution.

## Claim-critical control

The 0% Cauchy-contamination row is intentionally prominent. Retained MAE is `0.02464691771133496` for the arithmetic mean and `0.012569888975136025` for the weighted median, a derived relative reduction of `0.4900015846867857` (~49.0%). This control prevents attribution of the overall robust-readout advantage to a uniquely heavy-tail or specifically non-Gaussian mechanism.

## Boundary

The figures support only the frozen synthetic robust-readout study. They do **not** establish a Transformer result, learned-memory superiority, external validation, statistical significance, or a uniquely non-Gaussian mechanism.

## Remaining publication check

A final rendered-paper visual inspection remains open after conference-format PDF assembly. That review must check legibility, caption consistency, clipping, overlap, and whether the clean-control interpretation remains visible in the rendered artifact. It is not inferred from CI.
