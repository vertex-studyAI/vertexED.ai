# Eigen-JEPA: A Mixed/Negative Real-Data Study of Spectral Representation for Covariance Forecasting

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** real-data mixed/negative comparison; no spectral-superiority claim.

## Abstract

We evaluate whether the project-named Eigen-JEPA representation improves covariance forecasting relative to direct statistical baselines on retained real-market data. The primary metric is covariance-matrix mean squared error. Across the retained five-seed package, the result reproduces byte-for-byte and does not establish an advantage for Eigen-JEPA: raw/log ridge and persistence-style comparators remain competitive or stronger on the primary metric. This paper reports the result as a negative comparison rather than switching metrics or selecting a more favorable period after inspection. The outcome motivates a future preregistered multi-dataset study with stronger spectral baselines and a frozen metric hierarchy, but it does not justify retuning the current version in place.

## 1. Question

Does the tested spectral/eigen representation improve covariance forecasting over strong direct statistical baselines on the frozen primary matrix-error metric?

## 2. Protocol Boundary

The retained experiment uses real-market covariance-forecasting data and a five-seed package. The primary metric is covariance-matrix MSE. Raw/log ridge and persistence-style predictors provide direct statistical baselines. The current version is judged on that frozen metric rather than on a post-hoc alternative.

## 3. Results

The retained result is mixed/negative. Direct baselines remain competitive and are stronger on the primary metric in the key comparisons. The five-seed raw result reproduced byte-for-byte, strengthening confidence that the adverse outcome is not a transient execution artifact.

| Claim | Verdict |
|---|---|
| Eigen-JEPA improves primary covariance-MSE | **UNSUPPORTED** |
| Strong direct/statistical baselines remain competitive | **SUPPORTED** |
| Real-data experiment is reproducible | **SUPPORTED** |
| General spectral forecasting is ineffective | **NOT CLAIMED** |

## 4. Interpretation

The negative result matters because representation complexity alone does not establish forecasting value. Covariance prediction has strong structural and persistence baselines; any learned spectral representation must beat those baselines under a precommitted metric to justify a stronger claim.

## 5. Limitations

The retained study covers a limited dataset and setting. Stronger spectral/statistical comparators remain to be evaluated. The study does not span multiple markets, frequencies, or distribution shifts, and no external reproduction has been completed.

## 6. Next Scientific Gate

A future successor must freeze a multi-dataset hierarchy, stronger spectral and direct baselines, seed policy, OOD periods, and the primary metric before execution. Metric switching after observing results is prohibited.

## 7. Conclusion

The current Eigen-JEPA version does not establish covariance-forecasting superiority. Its real-data result is reproducible but mixed/negative, with strong direct baselines remaining competitive or stronger on the frozen primary metric. The current version should remain frozen; a broader successor requires a separately preregistered study.
