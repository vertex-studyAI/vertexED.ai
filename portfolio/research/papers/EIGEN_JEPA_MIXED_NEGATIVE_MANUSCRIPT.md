# Eigen-JEPA: A Mixed/Negative Real-Data Study of Spectral Representation for Covariance Forecasting

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** reproduced real-data mixed/negative comparison; no spectral-superiority, financial-alpha, trading, or deployment claim.

## Abstract

We evaluate whether the project-named Eigen-JEPA spectral representation improves next-block covariance forecasting relative to strong direct statistical baselines on a frozen chronological real-market task. The recovered Atlas V4 experiment uses bundled Fama-French five-factor daily data from 1963-07-01 through 2022-08-31, forms non-overlapping 20-day covariance blocks, uses four preceding blocks as context, and evaluates 111 chronologically held-out test targets. On covariance-matrix mean squared error (MSE), Eigen-JEPA obtains `5.831822565e-9`, improving on persistence (`7.770831532e-9`) but trailing raw ridge (`5.773438397e-9`) and log-space ridge (`5.789608912e-9`). The paired Eigen-JEPA-minus-raw-ridge matrix-MSE interval crosses zero, while log ridge is clearly better on the retained paired comparison. The result is therefore mixed/negative: spectral representation is viable on this bounded task, but superiority over strong direct covariance forecasts is unsupported. The numerical Atlas outputs and figure were reproduced internally; no external replication is claimed. We freeze this result and require any successor to use a separately preregistered multi-dataset protocol with a precommitted metric hierarchy.

## 1. Question

On a chronologically held-out covariance-forecasting task, does the tested Eigen-JEPA spectral representation improve predictive quality over strong direct covariance forecasts without relying on a post-hoc choice of metric?

## 2. Protocol Boundary

The recovered real-data protocol uses:

- official/bundled Fama-French five-factor daily data;
- `14,895` cleaned daily rows from `1963-07-01` through `2022-08-31`;
- non-overlapping `20`-day covariance blocks;
- four prior covariance blocks as context;
- `744` covariance blocks total;
- chronological `70/15/15` train/validation/test partitioning;
- `111` held-out test targets.

The compared methods are persistence, raw covariance ridge, log-covariance ridge, Cholesky representation, and the Eigen-JEPA spectral/PCA log-space representation. Regularization is selected on the validation split under the recovered frozen protocol.

This manuscript reports the recovered Atlas V4 real-data lineage only. A separate compact `MODEL-003` Eigen-JEPA lineage exists in retained records; the two lineages must not be merged into one apparent experiment until source, protocol, and metric identity are formally reconciled.

## 3. Results

### 3.1 Held-out forecasting table

| Method | Matrix MSE ↓ | Log distance ↓ | Eigenvalue MSE ↓ | Subspace distance ↓ |
|---|---:|---:|---:|---:|
| Raw ridge | **`5.773438397e-9`** | `0.194598` | `2.49744e-8` | `1.034889` |
| Log ridge | `5.789608912e-9` | **`0.150606`** | `2.645526e-8` | `0.973015` |
| Eigen-JEPA | `5.831822565e-9` | `0.159502` | `2.631929e-8` | `1.019740` |
| Cholesky ridge | `5.876249e-9` | `0.173030` | **`2.452712e-8`** | `1.006703` |
| Persistence | `7.770831532e-9` | `0.169472` | `3.625432e-8` | **`0.894613`** |

Eigen-JEPA's matrix-MSE point estimate is better than persistence but worse than both raw and log ridge.

### 3.2 Paired target-level comparisons

Across the `111` held-out targets, retained paired matrix-MSE comparisons report:

- Eigen-JEPA minus persistence: mean `-1.939e-9`, bootstrap 95% interval `[-6.8566e-9, 8.537e-10]`, retained t-test `p=0.40085`;
- Eigen-JEPA minus log ridge: mean `+4.221e-11`, bootstrap 95% interval `[2.224e-11, 6.725e-11]`, retained t-test `p=0.0003518`;
- Eigen-JEPA minus raw ridge: mean `+5.838e-11`, bootstrap 95% interval `[-2.356e-10, 4.174e-10]`, retained t-test `p=0.724`.

These comparisons do not support a superiority claim for Eigen-JEPA over the strongest direct baselines. The result also does not justify selecting only the metric or comparator most favorable to the spectral representation.

## 4. Claim Ledger

| Claim | Verdict |
|---|---|
| Recovered Eigen-JEPA executes on a real chronological market-factor dataset | **SUPPORTED** |
| Eigen-JEPA matrix-MSE point estimate improves over persistence | **SUPPORTED, BOUNDED** |
| Eigen-JEPA beats raw ridge | **NOT SUPPORTED** |
| Eigen-JEPA beats log ridge | **NOT SUPPORTED** |
| Strong direct covariance baselines remain competitive or better | **SUPPORTED** |
| General spectral forecasting superiority | **NOT SUPPORTED / NOT CLAIMED** |
| Financial alpha, trading profitability, portfolio improvement, or live-use benefit | **NOT TESTED / FORBIDDEN** |
| External independent reproduction | **NOT COMPLETED** |

## 5. Reproducibility

The retained Atlas suite passed `39/39`. The Eigen-JEPA CSV/JSON numerical outputs and PNG figure reproduced exactly under the retained fresh-run audit. The generated PDF differed only by Matplotlib creation-timestamp metadata. This is internal reproducibility evidence, not an independent outside replication.

## 6. Interpretation

The negative result matters because representation complexity alone does not establish forecasting value. Covariance prediction has strong direct and persistence baselines, and the ranking changes across matrix, log, eigenvalue, and subspace metrics. A defensible successor therefore needs a metric hierarchy frozen before outcome access rather than a post-hoc choice of whichever metric is favorable.

The current evidence supports a narrow conclusion: the recovered Eigen-JEPA representation is a viable bounded real-data modeling choice and improves the matrix-MSE point estimate relative to persistence, but it does not beat the strongest direct ridge controls on the primary matrix-MSE comparison.

## 7. Limitations

- one bundled market-factor dataset and historical period;
- one covariance-block construction and context length;
- limited statistical/spectral baseline family;
- no transaction-cost, portfolio, alpha, or trading evaluation;
- no multi-market or multi-frequency replication;
- no independent outside implementation;
- distinct recovered Eigen-JEPA lineages remain unreconciled and are not combined here.

## 8. Next Scientific Gate

Any successor must be separately versioned and frozen before outcome access with:

- at least one additional real covariance dataset or market universe;
- chronological walk-forward or fixed chronological splits with no random leakage;
- persistence, raw ridge, log ridge, and Cholesky ridge retained as direct controls;
- one explicitly frozen primary metric plus mandatory reporting of matrix MSE, log distance, eigenvalue MSE, and subspace distance;
- preprocessing, shrinkage, block length, context length, and regularization selection fixed before evaluation;
- paired target-level uncertainty for the primary comparison;
- a stop rule that archives superiority if Eigen-JEPA fails to beat the strongest direct baseline on the frozen primary metric without a material regression on mandatory secondary metrics.

## 9. Conclusion

The current recovered Atlas V4 Eigen-JEPA result is a reproducible mixed/negative real-data result. Eigen-JEPA improves over persistence on the matrix-MSE point estimate but does not establish superiority over raw or log-space ridge baselines. The current version remains frozen; a broader claim requires a separately preregistered multi-dataset study with strong direct controls and a metric hierarchy fixed before outcome access.
