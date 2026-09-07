# Eigen-JEPA: A Mixed/Negative Real-Data Study of Spectral Representation for Covariance Forecasting

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** real-data mixed/negative comparison; no spectral-superiority, alpha, trading, or broad-market claim.

## Abstract

We evaluate whether the project-named Eigen-JEPA spectral representation improves next-block covariance forecasting relative to direct statistical baselines on a frozen real-market task. The retained dataset contains 14,895 daily Fama-French five-factor observations from 1963-07-01 through 2022-08-31, aggregated into non-overlapping 20-day covariance blocks with four previous blocks as context and the next block as target. Chronological splitting yields 111 held-out test blocks. On the frozen primary matrix-MSE metric, Eigen-JEPA obtains `5.8318226e-09`, compared with `5.7734384e-09` for raw covariance ridge and `5.7896089e-09` for log-covariance ridge. The retained paired Eigen-JEPA-minus-raw-ridge matrix-MSE difference is approximately `+5.8384e-11`, with a retained 95% interval of `[-2.3565e-10, 4.1744e-10]`, which crosses zero. Eigen-JEPA is better than persistence (`7.7708315e-09`) on this task but does not establish superiority over the stronger ridge controls. We retain this adverse comparison rather than switching the primary metric or selecting a more favorable period after inspection. The result motivates a separately preregistered multi-dataset successor with stronger spectral/statistical controls; it does not justify retuning the current study in place.

## 1. Question

Does the tested spectral/eigen representation improve next-block covariance forecasting over direct statistical baselines on the frozen primary covariance-matrix mean-squared-error metric?

## 2. Retained protocol boundary

The canonical retained evidence is `portfolio/research/eigen-jepa/RESULTS.md`, derived from source package `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip` with source SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`.

The packaged study uses the bundled Fama-French five-factor daily data file. It contains 14,895 daily rows spanning 1963-07-01 through 2022-08-31. Non-overlapping 20-day covariance blocks are formed; four previous blocks provide context and the next block is the forecast target. Splits are chronological, and the retained held-out test contains 111 blocks. Regularization is selected on the validation split under the frozen protocol.

Compared methods are:

- persistence;
- raw covariance ridge;
- log-covariance ridge;
- Cholesky representation;
- Eigen-JEPA spectral/PCA log-space representation.

The primary metric is covariance-matrix MSE. Log-distance is retained as a secondary descriptive metric where available. The study is judged on the frozen primary metric rather than a post-outcome alternative.

## 3. Results

### 3.1 Held-out aggregate results

| Method | Matrix MSE | Log-distance |
|---|---:|---:|
| raw ridge | `5.7734384e-09` | `0.1945980` |
| log ridge | `5.7896089e-09` | `0.1506057` |
| **Eigen-JEPA** | **`5.8318226e-09`** | **`0.1595020`** |
| Cholesky | `5.8762487e-09` | — |
| persistence | `7.7708315e-09` | — |

Lower matrix MSE is better. Eigen-JEPA improves on persistence in this retained run, but raw ridge and log ridge both have lower primary matrix MSE.

### 3.2 Paired primary comparison

For the 111 held-out blocks, the retained paired Eigen-JEPA-minus-raw-ridge matrix-MSE difference is approximately `+5.8384e-11`. Because positive values favor raw ridge under this difference convention, the point estimate does not favor Eigen-JEPA. The retained 95% interval is `[-2.3565e-10, 4.1744e-10]` and crosses zero. This interval is reported as retained evidence; this manuscript does not introduce a new post-outcome significance or practical-effect threshold.

### 3.3 Claim-to-evidence status

| Claim | Verdict | Evidence boundary |
|---|---|---|
| Eigen-JEPA improves the frozen primary covariance-MSE over raw ridge | **UNSUPPORTED** | Eigen-JEPA `5.8318226e-09` vs raw ridge `5.7734384e-09`; paired point difference does not favor Eigen-JEPA and retained interval crosses zero |
| Eigen-JEPA improves the frozen primary covariance-MSE over log ridge | **UNSUPPORTED** | Eigen-JEPA `5.8318226e-09` vs log ridge `5.7896089e-09` |
| Eigen-JEPA improves over persistence on this retained task | **SUPPORTED, NARROWLY** | Eigen-JEPA `5.8318226e-09` vs persistence `7.7708315e-09`; no broader market claim |
| Strong direct/statistical baselines remain competitive | **SUPPORTED** | raw/log ridge are stronger on the primary metric in this run |
| The retained numerical outputs reproduce | **SUPPORTED** | Atlas suite `39/39`; Eigen-JEPA CSV/JSON numerical outputs and PNG reproduced exactly |
| Eigen-JEPA establishes financial alpha, trading value, or universal spectral superiority | **NOT CLAIMED** | not evaluated |

## 4. Interpretation

The negative result is decision-useful because representation complexity alone does not establish forecasting value. Covariance prediction admits strong direct structural and persistence baselines, and any learned spectral representation must beat the strongest relevant controls under a precommitted metric hierarchy before a superiority claim is justified. The present result supports neither a general rejection of spectral representations nor a claim that direct ridge methods will dominate on other markets or frequencies.

The secondary log-distance metric also does not rescue the primary claim. Log ridge has the lowest retained log-distance (`0.1506057`), while Eigen-JEPA records `0.1595020` and raw ridge `0.1945980`. Because covariance-matrix MSE is the frozen primary metric, this secondary ordering is descriptive only.

## 5. Related-work boundary and missing controls

The current study is intentionally narrower than the covariance-estimation and dynamic-correlation literature. Ledoit and Wolf's shrinkage work establishes a classical route to better-conditioned large-dimensional covariance estimation; Engle's dynamic conditional correlation model provides a parsimonious time-varying correlation framework; and Laloux et al. use random-matrix theory to characterize noise in empirical financial correlation spectra. These families are relevant because they represent strong statistical/spectral alternatives that a future Eigen-JEPA superiority study should confront.

Crucially, **none of these methods was executed as a matched comparator in the retained frozen study**. They are literature context, not retroactive baselines. This manuscript therefore does not claim that Eigen-JEPA beats shrinkage covariance estimation, DCC-type models, random-matrix cleaning, or other unexecuted spectral/time-series methods. Adding such baselines after observing the present result would create a new scientific protocol; a successor must freeze them prospectively.

Primary references for this boundary:

1. O. Ledoit and M. Wolf, “A well-conditioned estimator for large-dimensional covariance matrices,” *Journal of Multivariate Analysis*, 88(2):365–411, 2004. DOI: `10.1016/S0047-259X(03)00096-4`.
2. R. Engle, “Dynamic Conditional Correlation: A Simple Class of Multivariate Generalized Autoregressive Conditional Heteroskedasticity Models,” *Journal of Business & Economic Statistics*, 20(3):339–350, 2002. DOI: `10.1198/073500102288618487`.
3. L. Laloux, P. Cizeau, J.-P. Bouchaud, and M. Potters, “Noise Dressing of Financial Correlation Matrices,” *Physical Review Letters*, 83:1467–1470, 1999. DOI: `10.1103/PhysRevLett.83.1467`.

## 6. Reproducibility

The retained Atlas suite passed `39/39`. The Eigen-JEPA CSV/JSON numerical outputs and PNG figure reproduced exactly. The generated PDF differed only by Matplotlib creation-timestamp metadata in the retained reproduction record. This manuscript therefore treats the numerical adverse result as reproducible within the retained source package while keeping external reproduction explicitly unresolved.

Evidence identities retained in the canonical project record:

- source package: `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip`;
- source SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`;
- canonical result surface: `portfolio/research/eigen-jepa/RESULTS.md`;
- canonical reproduction surface: `portfolio/research/eigen-jepa/REPRODUCE.md`.

## 7. Limitations

The retained study covers one bundled real-market dataset and historical period, one covariance-block construction, one chronological split family, and a limited baseline set. It does not span multiple markets, frequencies, transaction-cost settings, live trading, or distribution-shift regimes. Stronger shrinkage, spectral, dynamic-correlation, and time-series comparators remain unexecuted in this frozen study. No external reproduction has been completed, and no claim of publication novelty is made from the current evidence alone.

The retained evidence also includes a separate compact `MODEL-003` Eigen-JEPA lineage in the broader portfolio record. That lineage must not be silently combined with this covariance-forecasting result to manufacture a stronger aggregate claim; cross-lineage synthesis requires explicit provenance reconciliation.

## 8. Next scientific gate

Any successor must be a new preregistration. Before outcome access it should freeze:

1. a multi-dataset or multi-market evaluation hierarchy;
2. the exact primary metric and secondary-metric ordering;
3. stronger direct, shrinkage, dynamic-correlation, spectral/random-matrix, and time-series baselines;
4. chronological train/validation/test identities and OOD periods;
5. seed policy and aggregation rule;
6. practical-effect/statistical decision rules, if any;
7. exact environment, source, and artifact-retention identities;
8. a falsifier under which the Eigen-JEPA superiority claim is rejected.

Metric switching, favorable-period selection, baseline removal, or in-place rescue tuning after observing successor outcomes is prohibited.

## 9. Conclusion

The current Eigen-JEPA study does not establish covariance-forecasting superiority. On the frozen held-out task, Eigen-JEPA records matrix MSE `5.8318226e-09`, compared with `5.7734384e-09` for raw ridge and `5.7896089e-09` for log ridge. The paired primary comparison against raw ridge does not favor Eigen-JEPA and its retained 95% interval crosses zero. Eigen-JEPA is better than persistence on this task, but that narrower observation does not rescue the stronger superiority claim. The current study should remain frozen as mixed/negative real-data evidence; any broader claim requires a separately preregistered successor.
