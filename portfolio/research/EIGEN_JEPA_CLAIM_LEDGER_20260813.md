# Eigen-JEPA claim ledger and next replication gate — 13 August 2026

**Evidence base:** `portfolio/research/evidence/atlas-v4-memory-spectral-repro-20260813.json`  
**Recovered archive:** `BU1LD_Research_Atlas_Flagships_v4_REPRO_CORRECTED_2026-08-12.zip`  
**Archive SHA-256:** `500e4c6b3e6f1be16ef78c9b55e62f647efefd92e8a27eeadef1190a50352b48`  
**Current promotion:** `REPRODUCED_REAL_DATA_MIXED_NEGATIVE`

## Frozen question

On chronologically held-out covariance forecasting, does the Eigen-JEPA spectral representation improve predictive quality over strong direct covariance forecasts without relying on a post-hoc choice of metric?

## Current real-data protocol

- official Fama-French daily factor data;
- cleaned date range: 1963-07-01 through 2022-08-31;
- 14,895 daily rows;
- 20-day covariance blocks;
- four historical blocks of context;
- 744 covariance blocks total;
- chronological 70/15/15 split;
- 111 held-out test targets.

Methods already compared under the recovered protocol:

1. persistence;
2. raw-matrix ridge;
3. log-matrix ridge;
4. Cholesky ridge;
5. Eigen-JEPA spectral representation + ridge.

## Reproduced result table

| Method | Matrix MSE ↓ | Log distance ↓ | Eigenvalue MSE ↓ | Subspace distance ↓ |
|---|---:|---:|---:|---:|
| Raw ridge | **5.773438397e-9** | 0.194598 | 2.49744e-8 | 1.034889 |
| Log ridge | 5.789608912e-9 | **0.150606** | 2.645526e-8 | 0.973015 |
| Eigen-JEPA | 5.831822565e-9 | 0.159502 | 2.631929e-8 | 1.019740 |
| Cholesky ridge | 5.876249e-9 | 0.173030 | **2.452712e-8** | 1.006703 |
| Persistence | 7.770831532e-9 | 0.169472 | 3.625432e-8 | **0.894613** |

Paired matrix-MSE comparisons across `n=111` held-out targets:

- Eigen-JEPA − persistence: mean `-1.939e-9`, bootstrap 95% interval `[-6.8566e-9, 8.537e-10]`, retained t-test `p=0.40085`;
- Eigen-JEPA − log ridge: mean `+4.221e-11`, bootstrap 95% interval `[2.224e-11, 6.725e-11]`, retained t-test `p=0.0003518`;
- Eigen-JEPA − raw ridge: mean `+5.838e-11`, bootstrap 95% interval `[-2.356e-10, 4.174e-10]`, retained t-test `p=0.724`.

## Claim ledger

### Supported

- the recovered Eigen-JEPA implementation executes on a real chronological market-factor dataset;
- its matrix-MSE point estimate is better than persistence;
- strong direct covariance baselines remain competitive or better depending on metric;
- the result is reproducibly mixed/negative rather than a clear superiority result.

### Not supported

- general forecasting superiority;
- superiority over raw or log-space ridge forecasting;
- superiority on subspace distance;
- a publication claim that selects matrix MSE only because it is friendlier to Eigen-JEPA;
- financial alpha, trading profitability, portfolio improvement, or deployment claims.

## Metric freeze

No current metric is promoted post hoc as the sole headline metric. A successor replication must designate one primary metric before execution and report all four existing metrics regardless of outcome.

For a covariance-forecasting successor, the default primary metric should be **matrix MSE** only if that choice is justified and frozen before seeing the successor results. Subspace distance remains a mandatory secondary metric because persistence currently wins it. Log distance and eigenvalue MSE remain mandatory secondary metrics as well.

## Distinct-lineage problem

The recovered Atlas V4 real-data line and the compact `MODEL-003` Eigen-JEPA lineage are separate evidence lineages. The compact lineage reportedly has a predeclared projector-distance result that is negative against persistence. They must not be merged into one apparent experiment until source identity, protocol identity and metric identity are reconciled.

## Next replication gate — freeze before execution

A valid next experiment must be versioned separately and frozen before result access with:

- at least one additional real covariance dataset or market universe;
- chronological walk-forward or fixed chronological train/validation/test splits with no random leakage;
- the same baseline family: persistence, raw ridge, log ridge and Cholesky ridge;
- an explicitly frozen primary metric plus the full four-metric panel above;
- preprocessing, shrinkage, block length, context length and regularization selection specified before evaluation;
- multiple seeds only where the learned/stochastic component actually varies; deterministic baselines must not be given fake seed replication;
- paired target-level uncertainty for the primary comparison;
- compute/runtime and parameter-count reporting;
- a stop rule that archives the superiority hypothesis if Eigen-JEPA does not beat the strongest direct baseline on the frozen primary metric without a material regression on mandatory secondary metrics.

## Falsification rule

Do not promote Eigen-JEPA if the successor result requires changing the primary metric after observation, excluding an adverse direct baseline, changing the chronological split after seeing test performance, or combining favorable results from distinct lineages while omitting their negative controls.

## Current conclusion

Eigen-JEPA is currently a useful **negative/mixed real-data research result**. The evidence supports continuing only through a separately frozen multi-dataset replication with strong direct forecasting controls; it does not support a superiority manuscript today.
