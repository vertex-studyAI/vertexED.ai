# T2424-0036 — Rubik's A* Intelligence

**Track:** C — Existing work → minimum experiment  
**Package type:** deterministic A* search/tool prototype  
**Scope:** 2×2 pocket-cube **corner permutation only**. Corner orientation and sticker state are intentionally omitted.

## What is real here

This package implements a genuine graph-search problem over Rubik-style face moves rather than presenting a title-only AI concept.

It includes:

- an eight-corner permutation state;
- `U`, `R`, and `F` quarter-turn permutations plus inverse moves;
- state and move validation;
- an admissible lower bound `ceil(misplaced corners / 4)`;
- a deterministic binary min-heap frontier;
- A* with best-cost deduplication;
- immediate-inverse move pruning;
- maximum-depth and node-budget limits;
- fail-closed budget/depth outcomes;
- returned-solution verification;
- a fixed six-scramble benchmark;
- root-level regression tests.

## Why the scope is narrow

A complete Rubik's Cube solver must model cubie orientation (and for a 3×3, edge permutation/orientation and additional legality constraints). This package does **not** do that yet. It models the corner-permutation search component so the A* machinery, move group, heuristic discipline, reproducibility, and resource limits can be tested cheaply before expanding the state space.

It must not be described as a full Rubik's Cube solver or as evidence of general intelligence.

## Files

```text
T2424-0036/
├── README.md
├── STATUS.md
├── src/
│   └── rubiksAstar.mjs
└── experiment/
    └── benchmark.mjs
```

Regression coverage:

```text
tests/project2424T0036RubiksAstar.test.mjs
```

## Use the solver

```js
import {
  applyMoves,
  scramble,
  solveAstar,
} from './src/rubiksAstar.mjs';

const state = scramble(['U', 'R', 'F']);
const result = solveAstar(state, {
  maxDepth: 12,
  nodeBudget: 100_000,
});

console.log(result.moves);
console.log(applyMoves(state, result.moves));
```

## Run the fixed benchmark

From repository root:

```bash
node portfolio/project2424/projects/T2424-0036/experiment/benchmark.mjs
```

The benchmark records, for six fixed scrambles:

- scramble sequence and length;
- solver status;
- solution length;
- expanded-node count;
- returned path;
- independent application check that the returned path reaches the solved state.

## Run tests

```bash
node --test tests/project2424T0036RubiksAstar.test.mjs
```

Or use the repository gate:

```bash
npm test
npm run ci
```

Tests check:

- every move/inverse pair restores the starting state;
- four same-face quarter turns are identity;
- the heuristic's one-move lower-bound behavior;
- A* solution verification;
- all fixed benchmark scrambles;
- node-budget fail-closed behavior;
- invalid state/move rejection.

## Limitations

- no corner orientation;
- no 3×3 edges or centers;
- only U/R/F generators and inverses;
- a deliberately weak heuristic;
- no pattern database;
- no bidirectional or IDA* search;
- no learned heuristic or policy;
- bounded benchmark scrambles only.

## Next evidence gate

A defensible next step is to add full 2×2 corner orientation with legality invariants, freeze a scramble-length benchmark set, compare A* against IDA* and a small pattern-database heuristic under equal node/time budgets, and retain solved-rate / optimal-depth / expanded-node evidence. Any learned heuristic should be compared against those deterministic baselines rather than replacing them.
