# T2424-1767 — Resource-Bounded Mixture-of-Experts Benchmark

This is a **cheap falsification screen**, not a scientific-ML performance claim.

## Question

Can a learned top-1 mixture of two affine experts outperform a single affine baseline on a simple piecewise system while evaluating only one expert per sample?

## Falsifiable claim

On the included noisy piecewise-linear benchmark, the learned threshold MoE should improve mean held-out RMSE by more than 70% across 10 deterministic seeds while activating 1/2 experts per sample.

A globally linear task is included as a negative control. The MoE is **not** expected to show a large improvement there.

## Method

- Generate deterministic noisy 1D data.
- Fit one global affine baseline.
- Fit a two-expert affine MoE.
- Learn the routing threshold by scanning valid train-set split points and minimizing train SSE.
- Evaluate on held-out samples.
- Repeat across seeds.
- Run the same protocol on a globally linear negative-control task.

The gate is deliberately small enough to run on CPU with only Python's standard library.

## Run

```bash
python -m pip install -e .
pytest -q
python -m resource_bounded_moe.benchmark --seeds 20
```

## Interpretation boundary

Passing this benchmark means only that learned sparse routing is useful for this synthetic piecewise task. It does **not** establish novelty, superiority on real scientific datasets, scaling behavior, or publication readiness.

The next gate is a real small scientific dataset with:
1. a stronger nonlinear baseline;
2. fixed train/validation/test protocol;
3. compute/runtime accounting;
4. routing ablations;
5. independent reproduction.
