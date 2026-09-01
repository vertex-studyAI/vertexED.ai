# GridCast — Competition Experiment Protocol

Status: pre-experiment protocol, 2026-08-28

## Competition concept

**GridCast: shift-robust short-horizon weather and solar forecasting for distributed energy planning.**

This is a competition prototype, not yet a validated scientific result. No performance or robustness claim is authorized before the frozen comparisons below are run.

## Research question

Does predictive representation pretraining retain more downstream forecasting utility than supervised-only training when labels are limited, observations are missing, or deployment geography differs from training geography?

## Data source

Primary prototype source: NASA POWER hourly point API.

NASA POWER documents hourly, analysis-ready solar and meteorological time series from 2001-01-01 to near-real-time, with UTC or Local Solar Time output and up to 15 parameters per request.

Freeze, for every run:
- exact endpoint and query parameters
- latitude/longitude list
- requested parameters
- start/end dates
- time standard
- retrieval timestamp
- raw-response checksum

Do not silently re-download changing near-real-time data inside a supposedly reproducible run.

## Candidate variables

Start with a small defensible feature set and confirm each parameter in the official POWER dictionary before production use:
- temperature at 2m
- relative humidity at 2m
- surface pressure
- wind speed at 10m
- precipitation
- solar irradiance parameter appropriate to the target use case

The data loader must make parameter names configurable rather than baking an unverified list into the scientific protocol.

## Forecast task

Default task:
- context window: previous 168 hourly observations
- horizon: next 24 hourly observations
- target: solar irradiance / derived solar-generation proxy selected before training
- auxiliary weather variables: predictors only unless explicitly evaluated as targets

## Splits

Freeze all locations and dates before fitting models.

### S0 — temporal IID-style holdout
Earlier period train, later period validation/test at seen locations.

### S1 — geographic shift
Hold out complete locations/climate zones from training.

### S2 — missing observations
Apply deterministic missingness masks to evaluation contexts only:
- 10%
- 30%
- 50%

Report the masking seed and whether missingness is MCAR or a structured outage simulation.

### S3 — low-label regime
Train supervised heads with frozen fractions of labeled windows:
- 1%
- 5%
- 10%
- 25%
- 100%

Representation-pretraining data access must be described separately so the comparison is not misleading.

### S4 — regime/extreme slice
Define the slice using a rule chosen before looking at model errors. Examples may include high-temperature or low-irradiance tails. Do not pick a subset after seeing where the preferred model wins.

## Baselines

Minimum ladder:
1. persistence
2. seasonal naive (24h and/or 168h, frozen in advance)
3. linear/ridge regression
4. tree/boosting baseline
5. one standard sequence neural baseline
6. comparable supervised encoder of the proposed architecture
7. proposed representation-pretrained model

A fancy baseline may be omitted for compute reasons only if the limitation is explicit.

## Metrics

Primary:
- MAE
- RMSE
- normalized MAE with a predeclared normalization
- skill relative to persistence

Secondary:
- inference latency
- parameter count
- calibration/interval coverage if probabilistic output is implemented

Report per-location and aggregate metrics. A single pooled average is insufficient for a robustness claim.

## Primary decision rule

The project may claim **improved shift robustness** only if the proposed method beats the strongest comparable supervised baseline on the preregistered primary metric across multiple predefined shift settings, with consistent seed-level evidence rather than one favorable split.

If that criterion fails, report the result as negative/inconclusive and keep the experiment useful through the benchmark/evaluation contribution.

## Seeds

Use at least five training seeds for neural comparisons when compute permits. Freeze the list before final runs. Evaluation masks/splits must be identical across methods.

## Leakage controls

- scaler/normalizer fitted on training data only
- no future timestamps in features
- no test-location data in supervised fitting under S1
- no test labels used for model selection
- test set opened once after development protocol is frozen

## Competition product layer

Judge-facing dashboard:
1. choose a supported location
2. show recent observations
3. show 24h forecast
4. show error/reliability context from held-out evaluation
5. show expected high/low solar-production windows
6. visibly warn when input missingness or deployment shift is outside validated bounds

The dashboard must not describe model confidence as calibrated unless calibration was actually evaluated.

## Evidence package

Every scored run should emit:
- config JSON
- git SHA
- data manifest/checksums
- split manifest
- seed
- metrics JSON + CSV
- predictions
- plots generated from the predictions
- environment/dependency snapshot
- wall-clock/runtime metadata

## First execution gate

Before training the proposed model:
- [ ] loader downloads and freezes one small NASA POWER point sample
- [ ] timestamp continuity audit passes
- [ ] missing-value audit passes
- [ ] persistence baseline runs end-to-end
- [ ] train/validation/test split is serialized
- [ ] evaluation script is method-agnostic

Only then start representation-model work.
