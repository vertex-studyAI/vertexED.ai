# Baseline analysis — T2424-0024

The frozen baseline is the deliberately overconfident confidence mapping: `0.98` when correct and `0.92` when incorrect. The candidate mapping uses `0.8` when correct and `0.2` when incorrect. Both mappings use the same 20 outcomes, so accuracy is fixed at `0.70`.

Retained controlled result:

| Metric | Moderate candidate | Overconfident baseline |
|---|---:|---:|
| Accuracy | 0.70 | 0.70 |
| Brier score | 0.04 | 0.2542 |
| ECE, 5 bins | 0.20 | 0.262 |

The paired-control calibration gate passes. The confidence policies preserve the same correctness ordering, so their recorded selective-risk curves are intentionally identical at the frozen coverage points; the supported separation is calibration-sensitive, not ranking-sensitive.

This verifies evaluator behavior on a constructed control only. It does not show calibration, trustworthiness, safety or external validity for a real model.
