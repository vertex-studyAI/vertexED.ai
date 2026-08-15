# Weather-JEPA v1

Status: `PARTIAL / PREOUTCOME_PROTOCOL_FROZEN`

This directory defines a bounded first Weather-JEPA study. It does **not** claim that JEPA improves weather forecasting, that any experiment has run, or that any result exists.

## Research question

Can masked latent predictive learning improve long-horizon weather-state forecasting relative to matched-budget direct prediction while preserving calibration, robustness, and reproducibility?

## Hypothesis

A predictor trained to infer masked future latent regions from visible spatiotemporal context will learn representations that retain dynamically useful structure and degrade more slowly with forecast horizon than a matched direct-prediction model.

The hypothesis is falsified for v1 if the full Weather-JEPA model fails to beat the strongest matched-budget learned baseline on the preregistered primary aggregate metric, or if any gain disappears under the no-latent-prediction ablation.

## Scope

The first study is deliberately smaller than a full global operational forecaster. It is an evidence-building experiment, not a GraphCast/Pangu/GenCast replacement claim.

- data family: ERA5 / WeatherBench-compatible gridded reanalysis
- task: deterministic medium-range forecasting on a compact variable set
- lead times: 6 h, 24 h, 72 h, 120 h
- first variables: 2 m temperature, 10 m wind components, geopotential 500 hPa, temperature 850 hPa
- evaluation: latitude-weighted RMSE and anomaly correlation, plus calibration proxy for probabilistic successor work, robustness slices, compute, and ablation effect sizes
- seeds: 5 fixed seeds
- all headline comparisons use identical train/validation/test years and matched preprocessing

## Required baselines

1. persistence
2. climatology
3. linear or ridge autoregressive baseline
4. matched-budget direct neural predictor using the same encoder/backbone capacity as Weather-JEPA
5. optional external reference-only comparison to published WeatherBench-compatible systems; external numbers may not be presented as locally reproduced results

## Required ablations

1. no latent prediction objective: direct future-state prediction only
2. no spatial masking: temporal masking only
3. no temporal masking: spatial masking only
4. frozen/random encoder control if compute permits

## Primary decision rule

The primary comparison is Weather-JEPA versus the matched-budget direct neural predictor across preregistered variables and lead times. Report the mean normalized skill delta with per-seed uncertainty. No post-hoc metric substitution is allowed.

A positive v1 result requires all of:

- improvement on the primary aggregate metric
- no material regression in the longest preregistered horizon slice
- improvement survives the key objective ablation
- all five seeds complete without excluding unfavorable seeds
- exact config, source revision, environment, and raw outputs are retained

Otherwise the result is mixed, negative, inconclusive, or blocked as appropriate.

## Integrity rules

- no retuning after test-set inspection
- no changing seeds after outcomes
- no dropping variables, horizons, regions, or extreme-event slices because they look bad
- no claiming external validation from internal reruns
- no replacing failed experiments with regenerated artifacts
- no scientific outcome run until the implementation and dataset manifests are frozen

## Current next gate

Implement the data manifest, exact split hashes, deterministic preprocessing, matched-budget baseline and Weather-JEPA model, then run smoke tests only. Scientific outcome training remains unauthorized until those artifacts are reviewed and frozen.

## Frontier context

WeatherBench 2 provides a standard evaluation framework for 1-14 day global data-driven forecasting. GraphCast, Pangu-Weather, and FourCastNet demonstrate that learned global forecasters can be competitive with strong numerical systems, but Weather-JEPA v1 is not claiming parity with those systems; they define context and evaluation expectations, not a shortcut baseline.
