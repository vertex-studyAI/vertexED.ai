# T2424-0054 — Theory-Manifold Experiment Planner

A transparent deterministic research-operations tool for ranking and selecting candidate experiments under limited time/compute.

## Mechanics

- validates candidate ID/family/value/uncertainty/novelty/cost fields;
- blocks incomplete dependencies;
- scores expected value + exploration uncertainty + novelty, normalized by cost;
- supports deterministic ranking/tie-breaking;
- selects a hard-budget batch;
- penalizes repeated families for configurable diversity;
- updates expected value and contracts uncertainty from supplied evidence;
- emits a decision ledger.

## Run

```bash
node portfolio/project2424/projects/T2424-0054/experiment/run.mjs
```

## Test

```bash
node --test tests/theoryManifoldExperimentPlanner.test.mjs
```

## Provenance

Recovered from legacy head `2e2b602aa75768b4ba1983f30ec27ca36f7419b9`, which passed canonical CI run `31409829495`. This canonical recovery requires fresh exact-head CI.

## Claim boundary

This is a heuristic planning tool, not optimal Bayesian experimental design and not evidence that sample research hypotheses or priors are correct. It does not authorize compute/spending and is not scientific validation, research completion, or Certified-complete status.
