# T2424-0026 — Counterfactual Defect Worlds

A Project 2424 minimum experiment for measuring how one **localized causal intervention** changes an otherwise identical deterministic world.

The current world model is deliberately simple: a one-dimensional elementary cellular automaton with radius-one local dynamics and fixed-zero boundaries. The point is to make intervention, counterfactual comparison, divergence and causal propagation fully inspectable before applying the idea to larger learned world models.

## Frozen claim and protocol

See:

- [`CLAIM.md`](./CLAIM.md) for the falsifiable claim and evidence boundary;
- [`PROTOCOL.md`](./PROTOCOL.md) for the frozen minimum experiment contract.

The minimum gate requires:

- zero divergence before the intervention;
- zero cells outside the predeclared radius-one causal cone after intervention.

## Run the minimum experiment

```bash
node portfolio/project2424/projects/T2424-0026/experiment/run.mjs
```

The deterministic example runs Rule 110 on an 81-cell single-seed state for 40 steps, injecting one flip at step 10. It reports the frozen protocol, divergence summary, causal-cone violations and an explicit GO/STOP verdict.

This verifies simulation/intervention mechanics only. It does **not** claim Rule 110 is a scientific world model or that the result transfers to neural simulators.

## Run tests

```bash
node --test tests/counterfactualDefectWorlds.test.mjs
```

The canonical repository test suite imports only the public functions from this package path.

## What the tests certify

- two unperturbed deterministic worlds reproduce exactly;
- divergence is zero before intervention and exactly one cell at the intervention step;
- a radius-one model never propagates influence outside its causal cone;
- the frozen Rule-110 run satisfies the declared minimum gate;
- Rule 0 erases a finite binary state in one update;
- malformed states, rules and intervention coordinates fail closed.

## Files

```text
portfolio/project2424/projects/T2424-0026/
├── CLAIM.md
├── PROTOCOL.md
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
