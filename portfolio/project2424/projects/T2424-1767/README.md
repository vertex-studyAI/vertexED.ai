# T2424-1767 — Resource-Bounded Mixture-of-Experts Operator for Scientific ML Benchmarking

**Track:** E — Cheap falsification screen  
**Package type:** deterministic developer/research tool prototype  
**Claim boundary:** this package tests a resource-routing algorithm on a synthetic scalar task. It does not establish Scientific-ML benchmark superiority, model novelty, or publication readiness.

## Problem

A conventional mixture-of-experts router can select experts without enforcing an explicit per-sample resource budget. That makes comparisons hard to audit when experts have different costs.

This package implements a small, dependency-free operator that:

1. receives one router score per expert;
2. assigns every expert an explicit positive cost;
3. ranks candidates by score-per-cost with deterministic tie-breaking;
4. selects at most `topK` experts without exceeding a hard budget;
5. combines selected scalar predictions with softmax weights;
6. fails closed as `exhausted` when no expert fits the requested budget.

## Files

```text
T2424-1767/
├── README.md
├── STATUS.md
├── src/
│   └── resourceBoundedMoe.mjs
└── experiment/
    └── syntheticBenchmark.mjs
```

Repository regression coverage lives in:

```text
tests/project2424T1767ResourceBoundedMoe.test.mjs
```

## API

```js
import { executeResourceBoundedMoe } from './src/resourceBoundedMoe.mjs';

const experts = [
  { id: 'cheap', cost: 1, predict: ({ x }) => x },
  { id: 'specialist', cost: 3, predict: ({ x }) => x * x },
];

const result = executeResourceBoundedMoe({
  sample: { x: 2 },
  experts,
  router: () => [1.0, 4.0],
  budget: 3,
  topK: 2,
});

console.log(result);
```

The returned object contains:

- `prediction`: weighted scalar prediction or `null` if exhausted;
- `selectedExperts`: ordered expert IDs actually executed;
- `weights`: normalized mixture weights;
- `cost`: total executed expert cost;
- `exhausted`: whether the budget admitted no expert.

## Run the deterministic benchmark

From the repository root:

```bash
node portfolio/project2424/projects/T2424-1767/experiment/syntheticBenchmark.mjs
```

The benchmark creates a fixed three-regime scalar task with three specialists of costs `1`, `2`, and `4`, then reports a cost/error frontier for budgets `1`, `2`, `4`, and `7` plus a uniform full-ensemble reference.

The benchmark is deliberately synthetic. Its purpose is to falsify basic operator properties cheaply:

- does measured execution cost stay within the declared budget?
- does impossible routing fail closed?
- does increasing the budget expose a meaningful resource/performance frontier?
- is the routing output deterministic for fixed inputs?

## Run tests

The package is included in the repository test glob:

```bash
npm test
```

Or run only this package's regression suite:

```bash
node --test tests/project2424T1767ResourceBoundedMoe.test.mjs
```

Tests cover numerical stability, hard budget enforcement, `topK`, impossible-budget behavior, weighted execution, deterministic benchmark output shape, finite metrics, lower-cost operating points, and invalid expert contracts.

## Limitations

- scalar expert outputs only;
- router scores are supplied by the caller rather than learned;
- costs are abstract units, not measured wall-clock/GPU energy;
- greedy score-per-cost routing is not globally optimal for every utility function;
- the synthetic benchmark does not represent a real Scientific-ML workload;
- no learned gating, load balancing, capacity factor, expert parallelism, or distributed execution is implemented.

## Next evidence gate

The next scientifically useful step is to freeze one real small Scientific-ML workload, measure actual expert latency/memory costs, compare this greedy operator with full-ensemble and top-score-only baselines, and report the full accuracy/cost Pareto frontier without changing the routing rule after observing results.
