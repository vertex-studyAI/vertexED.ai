# T2424-0029 — Representation Phase Transitions for PDEs

A Project 2424 minimum experiment for measuring how a controlled PDE changes the **effective spectral dimension** required to represent its state.

## Canonical identity

Frozen First-100 identity: `T2424-0029` — **Representation Phase Transitions for PDEs**.

This package is recovered from the previously tested legacy implementation under `portfolio/new-projects/representation-phase-transitions-for-pdes/` into the canonical First-100 path. The legacy source remains historical provenance; this path is the counting authority once exact-head verification and the merge boundary are satisfied.

## Controlled system

The package uses the analytic Fourier solution of the one-dimensional periodic heat equation. For sine mode `k` with initial amplitude `a_k`, diffusion evolves the amplitude as:

```text
a_k(t) = a_k(0) × exp(-ν (2πk)^2 t)
```

Higher spatial frequencies decay faster as diffusivity `ν` or time increases.

The implementation samples the state on a periodic grid, projects it back onto sine modes, measures modal energy, and asks for the minimum number of modes required to explain a predeclared fraction of total energy (95% in the frozen minimum experiment).

A **representation transition** here means only a discrete change in that measured effective-mode count across adjacent points in a diffusivity sweep. It is not automatically a thermodynamic phase transition, a neural-network phase transition, or a universal scientific law.

## Run

```bash
node portfolio/project2424/projects/T2424-0029/experiment/run.mjs
```

Frozen fixture:

```text
points = 128
time = 1
modes = (1, 1.0), (5, 0.8), (12, 0.6)
energy target = 95%
ν = 0, 0.0002, 0.001, 0.005, 0.02
```

The experiment reports projected spectral energy, normalized spectral entropy, effective mode count, dominant modes, and discrete effective-rank transition intervals.

## Test

```bash
node --test tests/pdeRepresentationTransitions.test.mjs
```

The regression suite checks zero-time invariance, exact sine-mode recovery, the frozen `3 → 2 → 2 → 1 → 1` effective-mode sequence, transition semantics, and fail-closed invalid inputs.

## Package

```text
portfolio/project2424/projects/T2424-0029/
├── CLAIM.md
├── PROTOCOL.md
├── README.md
├── STATUS.md
├── experiment/
│   └── run.mjs
└── src/
    └── core.mjs
```

Repository integration test: `tests/pdeRepresentationTransitions.test.mjs`.

## Limitations

- analytic 1D periodic heat equation only;
- sine-only projection in the current evaluator;
- hand-selected initial modes;
- no learned representation;
- no nonlinear PDE;
- no mesh/refinement study;
- the effective-mode threshold is a chosen metric and can move with the energy fraction;
- discrete rank changes are called representation transitions only operationally within this experiment.

## Claim boundary

This package does **not** establish a universal phase transition, a neural representation transition, nonlinear-PDE generalization, learned-latent superiority, external validation, publication novelty, or nine-gate Project 2424 certification.

## Next evidence gate

Repeat the frozen representation metric on at least one numerical nonlinear PDE, add threshold-sensitivity and resolution studies, compare Fourier dimension with learned latent dimension at matched reconstruction error, retain raw outputs, and obtain independent QA before stronger scientific language is used.
