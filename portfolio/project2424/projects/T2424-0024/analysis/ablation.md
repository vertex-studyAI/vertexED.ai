# Metric-Mechanism Ablation — T2424-0024

## Question

What changes when confidence **calibration** changes but correctness outcomes and confidence **ordering** are held fixed?

## Frozen ablation

The moderate and overconfident policies use the same 20 correctness outcomes. Both assign higher confidence to every correct item than to every error, so their confidence ranking is identical. Only the probability magnitudes differ.

```text
moderate:       correct 0.80 / error 0.20
overconfident:  correct 0.98 / error 0.92
```

## Observed mechanism

Calibration-sensitive metrics change:

```text
Brier:  0.0400 -> 0.2542
ECE:    0.2000 -> 0.2620
```

Ranking-only selective-risk points do not change:

```text
coverage 25%:  risk 0
coverage 50%:  risk 0
coverage 75%:  risk 0.0666666667
coverage 100%: risk 0.3
```

## Interpretation

This ablation demonstrates a limitation of ranking-only selective metrics: if confidence order is unchanged, they can remain identical even while probability calibration worsens sharply. Conversely, Brier score and ECE respond to the magnitude change.

This is a deterministic evaluator-mechanics observation, not evidence that one real model is safer or more trustworthy than another. Any real-model extension requires immutable prediction/data identity, a separate calibration split, uncertainty analysis and external or independently generated predictions.
