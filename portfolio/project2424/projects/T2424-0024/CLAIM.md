# T2424-0024 — Frozen Claim

## Falsifiable claim

On the frozen 20-outcome synthetic control set, a confidence policy that assigns `0.8` to correct predictions and `0.2` to errors must have both lower Brier score and lower 5-bin expected calibration error than a matched-outcome overconfident policy assigning `0.98` to correct predictions and `0.92` to errors.

The two policies intentionally preserve the same correctness outcomes and the same confidence ordering. Therefore a second expected observation is that confidence-ranked selective-risk curves are identical even though calibration metrics differ.

## Claim boundary

Passing this claim validates evaluator mechanics on a deterministic synthetic paired control only. It does not establish that any real model is calibrated, trustworthy, safe to deploy, or optimally thresholded.
