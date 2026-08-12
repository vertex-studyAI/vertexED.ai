# RESULTS

Executed locally on 10 August 2026 and independently replayed in GitHub Actions on 12 August 2026.

## Predeclared gate

- mean held-out RMSE improvement over persistence: >75%
- learned coefficient near 0.18
- 3-point local stencil on a 32-point grid
- zero-diffusion control shows no material gain

The >75% threshold is frozen and was not relaxed after observing the result.

## Reproduction environment

Fresh replay evidence:

- source SHA: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`
- Actions run: `31411517815`, attempt 3, job `94262839511`
- Ubuntu `24.04.4` LTS, runner image `ubuntu-24.04` version `20260720.247.2`
- Python `3.11.15`
- pip `26.2.1`
- pytest `9.1.1`
- CPU execution

## Test command

```bash
python -m pytest -q
```

Fresh independent result:

```text
4 passed in 0.18s
```

## Benchmark command

```bash
python -m local_diffusion_operator.benchmark --seeds 20
```

Fresh independent result:

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

The operator recovered the planted coefficient and substantially reduced error, but `67.777%` is below the predeclared `>75%` effect-size gate. The zero-diffusion control shows no material benefit. The negative gate outcome reproduced unchanged on a fresh hosted runner.

## Uncertainty

The current benchmark summary reports 20-seed aggregate means but does not expose per-seed standard deviation, variance, or a confidence interval. This is an evidence gap, not permission to infer significance. A future reporting-only extension should retain per-seed metrics and calculate dispersion without changing the frozen hypothesis or threshold.

## Limitations

Synthetic one-step diffusion only; scalar learned coefficient; no long rollout; no real PDE data; no strong neural-operator baseline; no comprehensive runtime/memory comparison beyond the local stencil; no claim of FNO/DeepONet superiority.

See `REPRODUCE.md` and `experiment_metadata.json` for the frozen command/environment/seed record.
