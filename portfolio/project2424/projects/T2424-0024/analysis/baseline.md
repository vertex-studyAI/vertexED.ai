# Baseline analysis — T2424-0024

The frozen baseline is the deliberately overconfident confidence mapping: `0.98` when correct and `0.92` when incorrect. The candidate mapping uses `0.8` when correct and `0.2` when incorrect. Both mappings use the same 20 outcomes, so accuracy is fixed at `0.70`.

Fresh local reproduction:

| Metric | Moderate candidate | Overconfident baseline |
|---|---:|---:|
| Accuracy | 0.70 | 0.70 |
| Brier score | 0.04 | 0.2542 |
| ECE, 5 bins | 0.20 | 0.262 |

The predeclared paired-control gate passes. This verifies evaluator behavior on a constructed control only; it does not show calibration, trustworthiness, safety or external validity for a real model.
