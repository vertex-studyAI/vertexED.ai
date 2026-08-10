# RESULTS

Executed locally on 10 August 2026.

## Predeclared gate

- mean held-out RMSE improvement over persistence: >75%
- learned coefficient near 0.18
- 3-point local stencil on a 32-point grid
- zero-diffusion control shows no material gain

## Test command

```bash
python -m pytest -q
```

Result after encoding the original gate as a negative-result regression:

```text
4 passed
```

## Benchmark command

```bash
PYTHONPATH=src python -m local_diffusion_operator.benchmark --seeds 20
```

Result:

```text
diffusion:
  trials=20
  mean learned coefficient=0.179689
  mean persistence RMSE=0.015610
  mean operator RMSE=0.005023
  mean relative improvement=67.777%
  locality=3-point stencil on 32-point grid

zero_diffusion:
  trials=20
  mean learned coefficient=-0.000311
  mean persistence RMSE=0.005022
  mean operator RMSE=0.005023
  mean relative improvement=-0.029%
  locality=3-point stencil on 32-point grid
```

## Verdict

`NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`

The model recovered the planted coefficient and substantially reduced error, but 67.777% is below the predeclared >75% effect-size gate. The gate was not relaxed after observing the data.

## Limitations

Synthetic one-step diffusion only; scalar learned coefficient; no long rollout; no real PDE data; no strong neural-operator baseline; no runtime/memory measurement beyond locality; independent scientific QA pending.
