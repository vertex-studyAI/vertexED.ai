# T2424-0029 — Representation Phase Transitions for PDEs

A Project 2424 minimum experiment for measuring how a controlled PDE changes the **effective spectral dimension** required to represent its state.

## Controlled system

The package uses the analytic Fourier solution of the one-dimensional periodic heat equation. For sine mode `k` with initial amplitude `a_k`, diffusion evolves the amplitude as:

```text
a_k(t) = a_k(0) × exp(-ν (2πk)^2 t)
```

Higher spatial frequencies therefore decay faster as diffusivity `ν` or time increases.

The implementation samples the state on a periodic grid, projects it back onto sine modes, measures modal energy, and asks for the minimum number of modes required to explain a predeclared fraction of total energy (95% by default).

A **representation transition** in this minimum experiment means only a discrete change in that measured effective-mode count across adjacent points in a diffusivity sweep. It is not automatically a thermodynamic phase transition, a neural-network phase transition, or a universal scientific law.

## Run the experiment

```bash
node portfolio/new-projects/representation-phase-transitions-for-pdes/experiment/run.mjs
```

The deterministic fixture uses modes `k = 1, 5, 12` with amplitudes `1, 0.8, 0.6` and sweeps:

```text
ν = 0, 0.0002, 0.001, 0.005, 0.02
```

It reports:

- total projected spectral energy;
- normalized spectral entropy;
- effective mode count at 95% energy;
- dominant modes;
- discrete effective-rank transition intervals.

## Run tests

```bash
node --test tests/pdeRepresentationTransitions.test.mjs
```

The canonical VertexED test glob includes this integration test.

## What the tests certify

- at `t = 0`, diffusivity cannot change the analytic initial state;
- sine projection recovers known periodic amplitudes;
- on the frozen three-mode fixture, the 95%-energy effective mode count follows `3 → 2 → 2 → 1 → 1` as diffusion increases;
- the transition detector reports only actual count changes;
- invalid grids, diffusivity and energy thresholds fail closed.

## Files

```text
representation-phase-transitions-for-pdes/
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test:

```text
tests/pdeRepresentationTransitions.test.mjs
```

## Limitations

- analytic 1D periodic heat equation only;
- sine-only projection in the current evaluator;
- hand-selected initial modes;
- no learned representation;
- no nonlinear PDE;
- no mesh/refinement study;
- the effective-mode threshold is a chosen metric and can move with the energy fraction;
- discrete rank changes are called representation transitions only operationally within this experiment.

## Next evidence gate

Repeat the frozen representation metric on numerical Burgers, reaction–diffusion or Darcy trajectories, compare Fourier dimension with learned latent dimension under the same reconstruction-error target, and report threshold sensitivity before using stronger “phase transition” language.
