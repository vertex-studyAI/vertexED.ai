# T2424-0027 — reproducibility results

## Frozen question

Can language-centroid subtraction suppress an explicitly injected synthetic language coordinate while preserving an independently injected concept coordinate, while a global-centering negative control fails to remove language leakage?

## Task and controls

- deterministic synthetic latent diagnostic;
- 4 concepts × 3 language labels × 6 samples = 72 records;
- first 3 samples/cell fit centroids; last 3 evaluate;
- baseline: raw representation;
- proposed transform: subtract train-only language centroid;
- negative control: subtract one global train centroid;
- metrics: nearest-centroid concept accuracy, language accuracy, normalized excess language-leakage reduction.

## Fresh exact-head reproduction

Workflow run: `31659677450`  
Execution commit: `f439498fa6aaf86bb9c0cb37002fcfaa2156c925`  
Environment: Node `v22.22.0`, Ubuntu runner kernel `Linux 6.17.0-1022-azure x86_64`, 4 CPUs.  
Experiment runtime: `0.04 s` real.  
Focused tests: `8/8` passed.  
Independent verifier: passed.

| Metric | Result |
|---|---:|
| raw concept accuracy | 1.0000 |
| raw language accuracy | 1.0000 |
| language-centered concept accuracy | 1.0000 |
| language-centered language accuracy | 0.361111 |
| chance language accuracy | 0.333333 |
| normalized language-leakage reduction | 0.958333 |
| global-centering language accuracy | 1.0000 |

Verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`.

Raw result SHA-256: `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`.  
Verifier-log SHA-256: `1a354c5ef26de30bc99a8b5ace22087e125b865db7326abe48e3bef6cbe7f6c3`.

## Uncertainty

The frozen construction is deterministic and contains no seed sweep, so a sampling SD is not meaningful for this minimum experiment. That is itself a limitation; any real-model follow-up needs multiple seeds/resamples and confidence intervals.

## Claim boundary

This demonstrates only the mechanics of a known-causal synthetic representation. It does **not** test linguistic relativity, real multilingual encoders, translation, semantic universals, external validity, novelty, or research completeness.
