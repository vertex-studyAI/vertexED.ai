# RESULTS

Executed locally on 10 August 2026 and independently replayed in GitHub Actions on 12 August 2026. A reporting-only reproducibility pass on 13 August 2026 re-executed the unchanged deterministic 20-seed protocol and retained dispersion from the per-seed records already emitted by the benchmark's `--json` mode.

## Predeclared gate

- mean held-out RMSE improvement over persistence: >75%
- learned coefficient near 0.18
- 3-point local stencil on a 32-point grid
- zero-diffusion control shows no material gain

The >75% threshold is frozen and was not relaxed after observing the result.

## Reproduction environment

Fresh hosted replay evidence:

- scientific source SHA: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`
- Actions run: `31411517815`, attempt 3, job `94262839511`
- Ubuntu `24.04.4` LTS, runner image `ubuntu-24.04` version `20260720.247.2`
- Python `3.11.15`
- pip `26.2.1`
- pytest `9.1.1`
- CPU execution

Reporting-only uncertainty recomputation on 13 August 2026 used Linux x86_64 / CPython `3.13.5` and the unchanged source equations, fixed seeds `0..19`, 140 samples/seed, 70/30 split, grid size 32, noise standard deviation `0.005`, and the frozen diffusion coefficient-generating task. This recomputation changes no scientific protocol or threshold.

## Test command

```bash
python -m pytest -q
```

Fresh independent hosted result:

```text
4 passed in 0.18s
```

## Benchmark commands

Human-readable frozen benchmark:

```bash
python -m local_diffusion_operator.benchmark --seeds 20
```

Machine-readable per-seed output:

```bash
python -m local_diffusion_operator.benchmark --seeds 20 --json > raw_metrics.json
```

## Results

| Condition / metric | Mean | Sample SD | n |
|---|---:|---:|---:|
| diffusion learned coefficient | 0.1796885855 | 0.0013561664 | 20 |
| diffusion persistence RMSE | 0.0156104849 | 0.0005888038 | 20 |
| diffusion operator RMSE | 0.0050231824 | 0.0000875845 | 20 |
| diffusion relative improvement | 0.6777662111 | 0.0137478064 | 20 |
| zero-diffusion learned coefficient | -0.0003114145 | 0.0013561664 | 20 |
| zero-diffusion persistence RMSE | 0.0050217549 | 0.0000887767 | 20 |
| zero-diffusion operator RMSE | 0.0050231824 | 0.0000875845 | 20 |
| zero-diffusion relative improvement | -0.0002886259 | 0.0007887086 | 20 |

The diffusion relative-improvement range across the frozen 20 seeds is `0.6543635307` to `0.7058142471`. The zero-diffusion relative-improvement range is `-0.0025955863` to `0.0015816472`.

## Verdict

`NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`

The operator recovered the planted coefficient and substantially reduced one-step error, but mean improvement `67.7766%` is below the predeclared `>75%` gate. No individual retained seed exceeds roughly `70.58%`, and the zero-diffusion control remains centered near zero benefit. The new dispersion calculation therefore strengthens the negative/boundary characterization rather than rescuing the hypothesis.

No significance claim is made. The statistics above describe deterministic repeated synthetic trials; they are not evidence of external validity or neural-operator superiority.

## Limitations

Synthetic one-step diffusion only; scalar learned coefficient; no long rollout; no real PDE data; no strong neural-operator baseline; no comprehensive runtime/memory comparison beyond the local stencil; no claim of FNO/DeepONet superiority.

See `REPRODUCE.md` and `experiment_metadata.json` for the frozen command/environment/seed record.
