# Baseline and negative control — T2424-0027

The raw synthetic vectors intentionally contain two separable signals:

- concept identity in the first four dimensions;
- language identity in the next three dimensions.

On the frozen train/test split, nearest-centroid classification yields:

| Condition | Concept accuracy | Language accuracy |
|---|---:|---:|
| Raw baseline | 1.0000 | 1.0000 |
| Language-centroid removal | 1.0000 | 0.3611 |
| Global-centering negative control | — | 1.0000 |

With three balanced languages, chance accuracy is `1/3`. The centered language probe is therefore slightly above chance, not exactly at chance. Relative to the raw excess above chance, the normalized language-leakage reduction is `0.9583333333333334` (95.83%), above the frozen 90% success gate.

The global-centering negative control is critical: it retains perfect language predictability, showing that generic mean subtraction does not automatically create the observed leakage reduction in this construction.

This result is deliberately easy because the synthetic generator injects explicit language coordinates and balances concept/sample structure across languages. It validates the measurement/centering mechanics; it is not evidence about naturally learned multilingual representations.
