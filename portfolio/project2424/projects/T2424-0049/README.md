# T2424-0049 — Multiphase Porous JEPA

A bounded synthetic minimum experiment for the frozen First-100 registry entry `T2424-0049`.

## Registry identity

- **Queue rank:** 42
- **Canonical name:** Multiphase Porous JEPA
- **Track:** C — Existing work → minimum experiment

This package restores the registry identity after an auxiliary portfolio renderer was accidentally merged under the same ID. The renderer is preserved separately at `portfolio/project2424/tools/project24-render/` and is not counted as a First-100 entry.

## Question

Can a deliberately tiny predictive latent surrogate learn useful next-state structure in a conservative heterogeneous porous-flow toy system, rather than merely copying the current latent state?

## Minimum experiment

The package uses:

1. a deterministic periodic 1D heterogeneous porous-flow diffusion surrogate;
2. a fixed two-cell average encoder from 32 state cells to 16 latent cells;
3. a persistence baseline `z(t+1) = z(t)`;
4. a one-parameter predictive latent model `z_hat(t+1) = z(t) + beta * Laplacian(z(t))`;
5. least-squares fitting of `beta` on four training phase conditions;
6. evaluation on four held-out phase conditions;
7. a zero-dynamics negative control;
8. an explicit conservation check.

This is intentionally small enough to falsify cheaply.

## Predeclared gates

The synthetic screen passes only if all of the following hold:

- held-out latent RMSE improves by at least **50%** over persistence;
- the learned transition coefficient is positive and below `0.1`;
- maximum mass drift is at most `1e-12`;
- the zero-dynamics control produces no false predictive gain.

No gate should be weakened after observing the result.

## Run

```bash
node portfolio/project2424/projects/T2424-0049/experiment/run.mjs
```

## Test

```bash
node --test tests/project2424T0049MultiphasePorousJepa.test.mjs
```

## Claim boundary

This package is **not a trained JEPA**. The encoder is fixed, the predictor has one learned scalar, and the benchmark is deterministic synthetic data. It does not establish porous-media realism, neural representation learning, multiphase scientific validity, comparison with FNO/DeepONet/PINO, publication novelty, or research completion.

A passing result means only that this cheap synthetic predictive-latent mechanism clears its frozen screen and is worth a stronger next experiment.

## Next evidence gate

Replace the toy dynamics with a public porous-media dataset or validated simulator, add genuinely learned encoders/predictors, compare against stronger operator baselines, retain raw results, measure compute, and obtain independent scientific QA.
