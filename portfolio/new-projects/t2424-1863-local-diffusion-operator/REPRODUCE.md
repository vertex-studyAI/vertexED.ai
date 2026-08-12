# Reproduce T2424-1863

## Frozen scope

This document reproduces the bounded synthetic local-diffusion operator screen. It does not establish a learned neural-operator result or superiority over FNO/DeepONet-class models.

## Environment

Fresh independent GitHub Actions replay on 12 August 2026 used:

- scientific source SHA: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`
- Ubuntu `24.04.4` LTS, `ubuntu-24.04` runner image `20260720.247.2`
- CPython `3.11.15`
- pip `26.2.1`
- pytest `9.1.1`
- package installed editable from this directory
- CPU execution

A reporting-only uncertainty recomputation on 13 August 2026 used Linux x86_64 / CPython `3.13.5`. It reused the unchanged equations, fixed seed set and dataset-generation protocol. No model, split, threshold, metric, or scientific gate was modified.

## Commands

From this project directory:

```bash
python -m pip install --upgrade pip
python -m pip install pytest
python -m pip install -e .
pytest -q
python -m local_diffusion_operator.benchmark --seeds 20
```

Retain the raw per-seed machine-readable output with:

```bash
python -m local_diffusion_operator.benchmark --seeds 20 --json > raw_metrics.json
```

The dedicated workflow is `.github/workflows/project2424-1863-local-diffusion-operator.yml`.

## Seed policy

The benchmark uses seeds `0..19`, deterministically selected before observing results. Each seed generates 140 transitions; the first 70% are training transitions and the remaining 30% are held out. Do not substitute a hand-selected subset after observing outcomes.

## Expected retained outcome

The frozen benchmark yields:

- diffusion persistence RMSE: `0.0156104849 ± 0.0005888038` sample SD, `n=20`
- diffusion operator RMSE: `0.0050231824 ± 0.0000875845`, `n=20`
- relative improvement: `0.6777662111 ± 0.0137478064`, `n=20`
- learned coefficient: `0.1796885855 ± 0.0013561664`, `n=20`
- zero-diffusion relative improvement: `-0.0002886259 ± 0.0007887086`, `n=20`
- focused regression tests: `4 passed`

Predeclared success required mean held-out RMSE improvement `>75%`. Therefore the scientific verdict remains `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

## Failure policy

If a future run differs, retain the command, source SHA, environment, seed policy, logs and changed metrics before debugging. If an implementation bug is found, document the invalid run, make the smallest fix, rerun the same frozen protocol, and keep pre-fix and post-fix evidence distinct. Do not relax the >75% threshold after observing a result.

## Reporting policy

The benchmark already exposes each seed's trial record in `--json` mode. Reporting code may calculate descriptive statistics from those retained records, but doing so must not alter the experiment, seed set, or success threshold. No statistical-significance or external-validity claim follows merely from the small within-simulation dispersion.

## Limitations

This is synthetic one-step scalar diffusion on a 32-point grid with a 3-point stencil. It has no long-rollout study, real PDE dataset, learned neural operator, matched FNO/DeepONet baseline, or comprehensive compute/memory comparison.
