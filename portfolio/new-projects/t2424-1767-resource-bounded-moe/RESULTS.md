# RESULTS

Executed locally on 10 August 2026 with Python 3 and the package source under test.

## Test command

```bash
python -m pytest -q
```

Result:

```text
4 passed in 0.30s
```

## Benchmark command

```bash
PYTHONPATH=src python -m resource_bounded_moe.benchmark --seeds 20
```

Result:

```text
piecewise:
  trials=20
  mean baseline RMSE=1.191554
  mean MoE RMSE=0.178297
  mean relative improvement=85.002%
  mean |learned threshold|=0.033571
  routing=1/2 experts active

linear:
  trials=20
  mean baseline RMSE=0.174627
  mean MoE RMSE=0.176285
  mean relative improvement=-1.010%
  mean |learned threshold|=1.650927
  routing=1/2 experts active
```

## Verdict

`PASS_CHEAP_FALSIFICATION_SCREEN`

The synthetic piecewise benchmark clears the >70% improvement gate while evaluating only one expert per sample. The globally linear negative control does not improve, which is retained as evidence against a blanket "MoE always wins" claim.

## Limitations

- synthetic 1D data only;
- affine experts only;
- learned scalar threshold router only;
- no wall-clock or energy benchmark yet;
- no comparison against nonlinear regressors;
- no real scientific dataset;
- no independent reproduction yet.

This result is not publication evidence or a scientific-ML superiority claim.
