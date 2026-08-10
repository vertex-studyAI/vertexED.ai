# T2424-0026 — Counterfactual Defect Worlds

A Project 2424 minimum experiment for measuring how one **localized causal intervention** changes an otherwise identical deterministic world.

The current world model is deliberately simple: a one-dimensional elementary cellular automaton with radius-one local dynamics and fixed-zero boundaries. The point is to make intervention, counterfactual comparison, divergence and causal propagation fully inspectable before applying the idea to larger learned world models.

## Experiment contract

Two worlds begin from the exact same binary state and evolve under the exact same cellular-automaton rule.

At a predeclared time and location, the counterfactual world receives one intervention:

- `flip`: change `0 ↔ 1`; or
- `set`: set the cell explicitly to `0` or `1`.

The baseline receives no intervention. Every time step records:

- Hamming distance;
- fraction of cells changed;
- exact differing indices.

Because the update rule has radius one, a defect introduced at `(time=t0, index=x0)` cannot affect a cell farther than `|x-x0| > t-t0`. `causalConeViolations()` makes that locality assumption executable and falsifiable.

## Run the minimum experiment

```bash
node portfolio/new-projects/counterfactual-defect-worlds/experiment/run.mjs
```

The deterministic example runs Rule 110 on an 81-cell single-seed state for 40 steps, injecting one flip at step 10. It prints the divergence trajectory and a summary.

This verifies simulation/intervention mechanics only. It does **not** claim Rule 110 is a scientific world model or that the result transfers to neural simulators.

## Run tests

```bash
node --test tests/counterfactualDefectWorlds.test.mjs
```

The canonical VertexED test glob includes this file.

## What the tests certify

- two unperturbed deterministic worlds reproduce exactly;
- divergence is zero before intervention and exactly one cell at the intervention step;
- a radius-one model never propagates influence outside its causal cone;
- Rule 0 erases a finite binary state in one update;
- malformed states, rules and intervention coordinates fail closed.

## Files

```text
counterfactual-defect-worlds/
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test:

```text
tests/counterfactualDefectWorlds.test.mjs
```

## Limitations

- one-dimensional binary cellular automata only;
- fixed-zero boundary conditions only;
- one intervention per run;
- deterministic dynamics, no stochastic counterfactual coupling;
- Hamming divergence does not capture semantic similarity;
- no learned world model, image environment or physical simulator yet;
- no external dataset.

## Next evidence gate

Add stochastic paired-world support with shared random seeds, multiple defect types and interventions, then reproduce the same causal-cone and divergence analysis on a small physical simulator or learned cellular/world-model benchmark. Preserve identical initial conditions and randomness between baseline and counterfactual runs.
