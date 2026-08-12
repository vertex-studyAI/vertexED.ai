# Reproduce T2424-1863

## Frozen scope

This document reproduces the bounded synthetic local-diffusion operator screen. It does not establish a learned neural-operator result or superiority over FNO/DeepONet-class models.

## Environment

Fresh independent GitHub Actions replay on 12 August 2026 used:

- repository source SHA: `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`
- Ubuntu `24.04.4` LTS, `ubuntu-24.04` runner image `20260720.247.2`
- CPython `3.11.15`
- pip `26.2.1`
- pytest `9.1.1`
- package installed editable from this directory
- CPU execution

## Commands

From this project directory:

```bash
python -m pip install --upgrade pip
python -m pip install pytest
python -m pip install -e .
pytest -q
python -m local_diffusion_operator.benchmark --seeds 20
```

The dedicated workflow is `.github/workflows/project2424-1863-local-diffusion-operator.yml`.

## Seed policy

The benchmark uses the fixed deterministic 20-seed protocol implemented by `local_diffusion_operator.benchmark`. Do not substitute a hand-selected subset after observing outcomes.

## Expected retained outcome

The frozen benchmark currently yields:

- diffusion persistence RMSE: `0.015610`
- diffusion operator RMSE: `0.005023`
- relative improvement: `67.777%`
- learned coefficient: `0.179689`
- zero-diffusion relative improvement: `-0.029%`
- focused regression tests: `4 passed`

Predeclared success required mean held-out RMSE improvement `>75%`. Therefore the scientific verdict remains `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

## Failure policy

If a future run differs, retain the command, source SHA, environment, seed policy, logs and changed metrics before debugging. If an implementation bug is found, document the invalid run, make the smallest fix, rerun the same frozen protocol, and keep pre-fix and post-fix evidence distinct. Do not relax the >75% threshold after observing a result.

## Limitations

This is synthetic one-step scalar diffusion on a 32-point grid with a 3-point stencil. It has no long-rollout study, real PDE dataset, learned neural operator, matched FNO/DeepONet baseline, or comprehensive compute/memory comparison.
