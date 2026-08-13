# Reproduce T2424-0029

## Frozen scientific command

From the repository root:

```bash
node portfolio/project2424/projects/T2424-0029/experiment/run.mjs
node --test tests/pdeRepresentationTransitions.test.mjs
```

The frozen protocol is `portfolio/project2424/projects/T2424-0029/PROTOCOL.md`. Do not modify the energy threshold, diffusivity sweep, injected modes, grid size, time, or expected effective-mode sequence after observing the result.

## Reproduced revision

Fresh retained reproduction:

- commit: `1a69e1919f64295f46f231ad487beee91a54f05e`;
- Actions run: `31653397825`;
- artifact: `9163421118`;
- artifact digest: `sha256:5864fad98c8f202e24ffa060cafe89a7b92548420373dc0b4fc6b8ffa5f26608`.

Environment:

```text
Ubuntu 24.04.4 x86_64
kernel 6.17.0-1020-azure
Node v22.23.1
Git 2.54.0
```

## Expected primary output

The `sweep[*].effectiveModeCount` values must be exactly:

```json
[3, 2, 2, 1, 1]
```

and `transitions` must contain exactly:

```json
[
  {"fromDiffusivity":0,"toDiffusivity":0.0002,"fromModeCount":3,"toModeCount":2},
  {"fromDiffusivity":0.001,"toDiffusivity":0.005,"fromModeCount":2,"toModeCount":1}
]
```

The focused test suite must report `5` passed and `0` failed.

## Retained evidence

The workflow retains:

```text
reproducibility-wave/commit.txt
reproducibility-wave/node-version.txt
reproducibility-wave/uname.txt
reproducibility-wave/raw/T2424-0029-pde-transitions.json
reproducibility-wave/T2424-0029-tests.log
```

Hashes from the fresh run:

```text
c190aa3e54d6cda008e7e29a89b387e596904075b225cb7f511ac61acb80f5e4  T2424-0029-pde-transitions.json
580ecc2f9f1d1d83dfb57d2e03d15122bd104aca11331f5a16eb43e94a9db9c4  T2424-0029-tests.log
```

## Runtime

The combined experiment and focused tests occupied approximately `0.150 s` in the hosted-runner log. The test runner itself reported `74.626758 ms`. The experiment command was not separately timed, so do not quote a more precise standalone experiment runtime.

## Failure handling

If the sequence, transition intervals, analytic invariants, or fail-closed input checks differ, retain the failed output and environment before changing code. If the cause is an implementation bug, document the bug, fix it in a new commit, and rerun. Keep the invalid and corrected runs distinct.

## Claim boundary

A successful reproduction establishes only the frozen deterministic analytic heat-equation screen. It does not establish neural representation phase transitions, nonlinear-PDE generalization, or learned representation superiority.