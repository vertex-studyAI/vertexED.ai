# T2424-0024 — Result and Verdict

## Observed result

On the frozen matched-outcome synthetic records:

- moderate Brier score: `0.0400`;
- overconfident Brier score: `0.2542`;
- moderate 5-bin ECE: `0.2000`;
- overconfident 5-bin ECE: `0.2620`;
- both policies have accuracy `0.70`;
- selective risk is identical at the frozen 25%, 50%, 75% and 100% coverage points because the two policies induce the same confidence ordering.

At thresholds `0.7` (moderate) and `0.95` (overconfident), both accept the same 14 correct records, yielding 70% coverage and zero accepted risk. That is an intentionally narrow synthetic consequence, not an optimal-threshold claim.

## Interpretation

Brier score and ECE correctly penalize the matched-outcome overconfident policy. Ranking-only selective risk does not distinguish the two because confidence ordering is preserved. This is useful evidence about the evaluator: calibration-sensitive and ordering-sensitive metrics answer different questions and should not be conflated.

## Verdict

**GO — evaluator mechanics only.**

Proceed to real held-out prediction records and stronger calibration baselines. Do not promote this result to a real-model trustworthiness claim.

## Missing certification gates

- immutable external data/source identity for a real benchmark;
- real baseline model predictions;
- bootstrap uncertainty / subgroup error analysis;
- external or independently generated predictions;
- real-world decision-cost analysis.

The package is therefore not research-complete or Certified complete.
