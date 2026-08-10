# T2424-1863 — Resource-Bounded Local Operator for Scientific Forecasting

This package turns one First-100 proposal into a **small falsifiable scientific-ML forecasting experiment**.

## Question

Can a learned local 3-point update operator forecast a synthetic 1D diffusion step more accurately than persistence while avoiding a dense grid-to-grid operator?

## Predeclared falsifiable claim

Across 10 deterministic seeds, the learned local operator should improve held-out one-step RMSE by **more than 75%** over persistence on the diffusion task, recover the planted diffusion coefficient near `0.18`, and use only a 3-point local stencil on a 32-point grid.

A zero-diffusion negative control is included. It should learn a coefficient near zero and should not claim a material gain over persistence.

## Result

The original >75% improvement gate **did not pass**. Across 20 seeds the operator improved RMSE by about **67.8%**, while recovering the planted coefficient near `0.18`. The zero-diffusion control showed essentially no gain.

The threshold is not lowered after observing the result. This package therefore records a useful negative/inconclusive screen: the local operator captures the planted physics, but the specified effect-size gate was too strong for this noisy setup.

## Method

The synthetic dynamics are:

```text
u[t+1, i] = u[t, i] + alpha * (u[t,i-1] - 2u[t,i] + u[t,i+1]) + noise
```

The model learns one scalar coefficient from train transitions by least squares. The baseline predicts the next state equals the current state.

This is intentionally tiny and CPU-only. Its purpose is to test whether a resource-bounded local-operator framing is worth advancing, not to stand in for a full neural operator paper.

## Run

```bash
python -m pip install -e .
pytest -q
python -m local_diffusion_operator.benchmark --seeds 20
```

## Interpretation boundary

The result supports coefficient recovery and substantial synthetic error reduction, but **fails the predeclared >75% screen**. It does not establish novelty, real PDE generalization, long-horizon stability, superiority over FNO/DeepONet/PINO, or publication readiness.

Next gate: a public PDE benchmark with train/validation/test splits, stronger baselines, rollout stability, runtime/memory accounting, and independent reproduction.
