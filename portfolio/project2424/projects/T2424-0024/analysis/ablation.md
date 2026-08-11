# Ablation / negative-control analysis

The overconfident policy is the negative control. Both policies preserve the same confidence ranking: correct examples remain above incorrect examples. Therefore their selective-risk curves at the frozen coverage points are identical even though their calibration differs substantially.

This demonstrates that ranking/selective-risk evidence alone is insufficient to establish calibrated probabilities. The controlled experiment intentionally checks both calibration-sensitive metrics (Brier/ECE) and ranking-sensitive selective risk.
