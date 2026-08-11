# T2424-0029 — Claim

## Falsifiable claim

For the frozen three-mode one-dimensional periodic heat-equation fixture in `PROTOCOL.md`, increasing the predeclared diffusivity sweep will reduce the measured 95%-energy effective sine-mode count from the initial value of 3 and produce the exact sequence:

```text
3 → 2 → 2 → 1 → 1
```

The transition detector must report only adjacent sweep intervals where that measured count changes.

## What would falsify this package-level claim

- the frozen fixture does not produce the predeclared effective-mode sequence;
- sine projection fails to recover known analytic amplitudes within numerical tolerance;
- the transition detector reports a change where the effective-mode count is unchanged;
- invalid diffusivity/grid/energy targets do not fail closed.

## Evidence boundary

Passing this claim validates only the implementation and operational metric on a controlled analytic heat-equation system. It does not establish a universal physical phase transition, a neural representation transition, nonlinear-PDE behavior, learned representation superiority, external validity, or publication novelty.
