# Baseline Analysis — T2424-0024

## Frozen baseline / negative control

The baseline is the matched-outcome **overconfident** policy from `PROTOCOL.md`:

- correct confidence: `0.98`;
- error confidence: `0.92`;
- correctness outcomes: exactly the same 20 booleans as the moderate policy;
- confidence ordering: intentionally the same as the moderate policy.

This control isolates calibration behavior from classification accuracy and ranking order.

## Retained comparison

| Metric | Moderate policy | Overconfident baseline |
|---|---:|---:|
| Accuracy | 0.70 | 0.70 |
| Brier score | 0.0400 | 0.2542 |
| 5-bin ECE | 0.2000 | 0.2620 |
| Selective risk @ 25% | 0.0000 | 0.0000 |
| Selective risk @ 50% | 0.0000 | 0.0000 |
| Selective risk @ 75% | 0.0667 | 0.0667 |
| Selective risk @ 100% | 0.3000 | 0.3000 |

## Interpretation

The overconfident baseline is substantially worse on calibration-sensitive metrics while preserving the same outcome accuracy and confidence ranking. The comparison therefore supports only the frozen evaluator-mechanics claim: Brier/ECE respond to probability calibration, while ranking-only selective risk cannot distinguish policies with identical ordering.

It does not establish that either policy describes a real model, that either abstention threshold is optimal, or that the evaluator predicts real-world safety.
