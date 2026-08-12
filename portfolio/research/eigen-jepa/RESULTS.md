# Eigen-JEPA Results

**Wave date:** 2026-08-12  
**Source package:** `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`  
**Source SHA-256:** `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`  
**Result status:** **FRESHLY REPRODUCED BOUNDARY/NEGATIVE COMPARISON**

## Research question

On the frozen real-market covariance forecasting task, does the spectral Eigen-JEPA representation improve next-block covariance prediction relative to persistence and ridge-based raw/log-space baselines?

## Dataset/task

The packaged experiment uses the bundled Fama-French five-factor daily data file. The completed run contains 14,895 daily rows from 1963-07-01 through 2022-08-31. Non-overlapping 20-day covariance blocks are formed, with four previous blocks as context and the next block as target. Splits are chronological; the held-out test contains `n=111` blocks.

## Compared methods

- persistence;
- raw covariance ridge;
- log-covariance ridge;
- Cholesky representation;
- Eigen-JEPA spectral/PCA log-space representation.

Regularization is selected on the validation split under the frozen protocol.

## Fresh held-out result

| Method | Matrix MSE | Log-distance |
|---|---:|---:|
| raw ridge | 5.7734384e-09 | 0.1945980 |
| log ridge | 5.7896089e-09 | 0.1506057 |
| Eigen-JEPA | 5.8318226e-09 | 0.1595020 |
| Cholesky | 5.8762487e-09 | — |
| persistence | 7.7708315e-09 | — |

Paired Eigen-JEPA minus raw-ridge matrix-MSE difference across the 111 test blocks was approximately `+5.8384e-11`; its 95% interval crossed zero (`[-2.3565e-10, 4.1744e-10]`). Eigen-JEPA therefore does not establish superiority over raw ridge. Its primary matrix MSE is also worse than log ridge in this run.

## Interpretation

The spectral representation is a viable modeling choice and improves over persistence on this frozen task, but the strongest simple ridge controls remain competitive or better on the primary covariance-matrix MSE. This wave treats that as legitimate boundary/negative evidence.

## Reproducibility

The full Atlas suite passed `39/39`. The Eigen-JEPA CSV/JSON numerical outputs and PNG figure reproduced exactly. The generated PDF differed only by Matplotlib creation-timestamp metadata.

## Limitations

Single bundled market dataset and fixed historical period; one block construction; no transaction/trading claim; limited baseline family; no evidence of financial alpha; no publication novelty claim. Stronger spectral/time-series baselines and multi-dataset replication are required before promotion.
