# Reproduce Eigen-JEPA

## Source identity

- package: `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`
- SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`

Verify the checksum before execution and record a new identity if the archive changes.

## Environment used in this wave

Linux x86_64 CPU, Python 3.13.5, NumPy 2.3.5, pandas 2.2.3, SciPy 1.17.0, scikit-learn 1.8.0, PyTorch 2.10.0+cpu, Matplotlib 3.10.8, pytest 9.0.2.

## Commands

From the extracted Atlas package root:

```bash
pytest -q
python -m projects.eigen_jepa.experiment
```

The full-suite result was `39 passed`.

## Frozen evaluation protocol

Use the bundled Fama-French five-factor daily file, 20-day non-overlapping covariance blocks, four prior blocks as context, chronological train/validation/test splits, and the packaged validation-based regularization selection. Do not change the target metric after reading test results.

Compared methods are persistence, raw ridge, log ridge, Cholesky representation and Eigen-JEPA.

## Required retained artifacts

Keep the completion JSON, full per-test-block results CSV, summary CSV, volatility-regime summary, statistical-analysis JSON and figures. The test set contains 111 covariance targets in this source package.

## Failure policy

Any source/data/parsing bug found after observing the result must leave the old result labeled invalid, be fixed in a separately versioned source, and be rerun from the beginning. Do not tune representation choices on the held-out test.

## Determinism note

The numerical CSV/JSON results and PNG figure reproduced exactly. Generated PDF byte differences caused by Matplotlib `CreationDate` metadata are presentation-artifact nondeterminism rather than metric drift.
