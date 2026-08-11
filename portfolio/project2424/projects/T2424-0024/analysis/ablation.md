# Ablation and sensitivity — T2424-0024

The paired control changes confidence values while holding the 20 correctness outcomes fixed.

Fresh reproduction shows Brier and ECE separate the moderate and overconfident mappings, but the confidence ordering is unchanged: every correct item remains ranked above every incorrect item in both mappings. Therefore their selective-risk curves are identical at the frozen coverage checkpoints.

This is a useful limitation: calibration-sensitive metrics detect the overconfidence change, while ranking-only selective risk does not. The package must not imply that better Brier/ECE automatically means better confidence ranking or selective prediction.

A 5-bin versus 10-bin ECE sensitivity check gives the same values for this constructed control because each confidence level remains isolated in a bin. Real prediction distributions may be substantially more bin-sensitive.
