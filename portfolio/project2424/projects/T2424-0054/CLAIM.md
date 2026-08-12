# Claim — T2424-0054 Theory-Manifold Experiment Planner

## Falsifiable software claim

Given validated candidate records, the planner deterministically ranks feasible experiments with a transparent benefit/uncertainty/novelty score normalized by cost, blocks incomplete dependencies, enforces a hard batch budget, applies a repeat-family diversity penalty, and updates candidate expected value/uncertainty from supplied evidence.

## Success conditions

- equal-benefit cheaper candidate outranks an expensive candidate;
- incomplete dependencies are never selected;
- configured family penalty can diversify a batch;
- selected cost never exceeds the hard budget;
- supplied evidence moves expected value toward the observation and contracts uncertainty.

## Claim boundary

This is a transparent heuristic research-planning tool. It is not optimal Bayesian experimental design, does not establish that illustrative priors or candidate hypotheses are correct, does not authorize compute/spending, and is not scientific validation, research completion, or publication evidence.
