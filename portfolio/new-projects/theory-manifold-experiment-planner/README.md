# T2424-0054 — Theory-Manifold Experiment Planner

A Project 2424 research-operations tool for selecting the next experiments under limited compute/time without pretending every interesting idea should run immediately.

## Decision model

Each candidate declares:

- expected value: current estimate that the experiment is worth doing;
- uncertainty: how much useful information remains unresolved;
- novelty: value of exploring a less-understood direction;
- cost in hours;
- research family;
- whether dependencies are actually complete.

The default acquisition score is:

```text
(expected_value + exploration_weight × uncertainty + novelty_weight × novelty)
──────────────────────────────────────────────────────────────────────────────
                         cost_hours ^ cost_exponent
```

Blocked candidates receive no executable score. Batch selection then applies a repeated-family penalty to avoid spending an entire constrained run on near-duplicate experiments.

This is a transparent heuristic, not a theorem or optimal Bayesian experimental-design solver.

## Run the minimum experiment

```bash
node portfolio/new-projects/theory-manifold-experiment-planner/experiment/run.mjs
```

The deterministic example contains several low-cost research follow-ups plus one high-value but dependency-blocked large run. It produces:

- a ranked decision ledger;
- a cost-constrained selected batch;
- blocked and unselected IDs;
- remaining time budget.

The numeric candidate scores in the example are illustrative inputs only. They are not scientific evidence about PI-JEPA, Eigen-JEPA, finance, CAD, or any other research line.

## Run tests

```bash
node --test tests/theoryManifoldExperimentPlanner.test.mjs
```

The canonical VertexED test suite includes this file through the existing root glob.

## What the tests certify

- identical-benefit cheaper experiments receive higher acquisition scores;
- dependency-blocked work cannot be selected;
- a family-diversity penalty can change the optimal batch;
- the time budget is a hard feasibility constraint;
- incoming evidence shifts expected value and contracts uncertainty.

## Files

```text
theory-manifold-experiment-planner/
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test:

```text
tests/theoryManifoldExperimentPlanner.test.mjs
```

## Limitations

- subjective priors are still inputs;
- no correlations between experiment outcomes;
- cost is represented by one scalar hour estimate;
- no GPU-memory, money, queue-time, or human-review resource vector yet;
- evidence updates use a simple weighted contraction rather than a probabilistic posterior;
- diversity is family-label based rather than learned from experiment representations;
- the acquisition rule is heuristic and should be sensitivity-tested.

## Next artifact

Connect the planner to the evidence-backed First-100 queue, replace illustrative priors with recorded scoring provenance, track predicted versus realized cost/value, and calibrate the ranking rule from completed experiments rather than intuition alone.
