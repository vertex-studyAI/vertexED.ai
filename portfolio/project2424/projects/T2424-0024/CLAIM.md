# Claim — T2424-0024 Trust Under Uncertainty

## Falsifiable claim

On the frozen paired synthetic control in `experiment/run.mjs`, where correctness outcomes are identical between policies, the moderate confidence mapping (`0.8` correct / `0.2` incorrect) will produce both:

1. a lower Brier score than the overconfident mapping (`0.98` correct / `0.92` incorrect); and
2. a lower 5-bin expected calibration error than the overconfident mapping.

Failure of either inequality falsifies this minimum implementation claim.

## What this supports if the gate passes

Only that the implemented evaluator responds in the expected direction to a deliberately constructed overconfidence control and that the paired-control mechanics are functioning.

## What this does not support

It does not establish that any real model is calibrated, trustworthy, safe, robust under distribution shift, suitable for deployment, superior to another uncertainty method, or publication-ready.
