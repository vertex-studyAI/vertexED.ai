# Space-JEPA ESA per-channel probe amendment — pre-outcome v0

## Scope

This amendment adds a **secondary, pre-outcome per-channel score and binary-prediction surface** to the existing frozen Space-JEPA ESA-ADB experiment. It does not replace or alter the primary global latent-error score, the frozen seeds, global threshold rule, train/test split, baselines, or the claim boundary in `PROTOCOL.md`.

The purpose is narrow: make a channel-resolved signal available for later `ChannelAwareFScore` evaluation without using anomaly labels to fit the representation, probe, comparator transformations, or channel thresholds. `ESA_CHANNEL_METRIC_SEMANTICS_V0.md` separately pins the reviewed upstream metric implementation and records that the pinned TimeEval orchestration evaluates ADTQC globally rather than through the per-channel ranking loop.

## Frozen Space-JEPA probe construction

For each already-trained Space-JEPA run:

1. reload the exact checkpoint and resolved model config retained by that run;
2. verify the provided train/test CSV bytes against the SHA-256 identities retained in `run.json`;
3. recover the exact ordered channel list retained in `run.json` and fail closed on missing or duplicate identities;
4. read **only** those telemetry columns (plus test timestamps) from the interleaved official CSVs; annotation columns are never loaded by this exporter;
5. refit the same robust scaler on **training telemetry only** and transform train/test telemetry with those frozen statistics;
6. fit a linear ridge decoder from **predicted target latents** to normalized telemetry targets using training windows only;
7. compute squared residuals independently for every telemetry channel on overlapping training target windows;
8. fit one threshold per channel as the **0.995 quantile of covered training residuals only**;
9. warm-start test scoring only with the final training context, exactly as the global Space-JEPA score does;
10. average overlapping residuals at each target timestep and export both continuous per-channel scores and `score >= threshold` binary channel predictions.

The ridge fit is implemented from streaming sufficient statistics, so it does not materialize all ESA-ADB windows in memory.

## Frozen numerical settings

- ridge penalty alpha: **1.0**
- probe-fit window stride: **4**
- train/test residual-score stride: **1**
- scoring/fitting batch size: **128**
- per-channel threshold quantile: **0.995**, fit independently on covered training residuals only
- binary decision: **`score >= channel_threshold`**
- Space-JEPA score for channel `c`: squared residual between normalized observed telemetry and the ridge decode of the predicted JEPA target latent for channel `c`, averaged across overlapping target windows
- intercept is unregularized; latent coefficients are ridge-regularized

These constants are hard-coded in `run_esa_channel_probe.py` for v0. They are not tuning knobs after any held-out outcome access. The 0.995 quantile is a Space-JEPA predeclared decision rule chosen to mirror the existing global train-only threshold quantile; it is **not** claimed to be an upstream TimeEval threshold-selection rule.

## Matched per-channel comparators

The same exporter now retains two matched comparator surfaces so a future channel-aware comparison does not compare Space-JEPA against no baseline or against post-hoc comparator definitions.

### Robust z-score

- fit a `RobustScaler` on training telemetry only;
- score each channel independently as the absolute robust-scaled telemetry value;
- fit one 0.995 quantile threshold per channel from training scores only;
- apply the same `score >= threshold` binary rule on test scores.

### One-step persistence

- use the same train-only normalized telemetry surface as Space-JEPA;
- score each channel independently as the absolute one-step residual `|x_t - x_{t-1}|`;
- exclude the first training row from threshold fitting because it has no predecessor;
- fit one 0.995 quantile threshold per channel from covered training residuals only;
- warm-start the test partition with **only the final normalized training row**;
- apply the same `score >= threshold` binary rule on all test rows.

The exporter writes separate `space_jepa_channels.csv`, `robust_zscore_channels.csv`, and `persistence_channels.csv` artifacts. Each contains the same timestamps and ordered channels, with continuous `<channel>_score` and binary `<channel>_pred` columns. The receipt hashes all three artifacts and records every method-specific threshold.

These comparators are deliberately simple and already exist in global form in the frozen primary experiment. Their channel-wise forms do not create a new favorable model family after outcome access.

## Leakage and provenance boundary

The probe, comparator, and threshold APIs accept telemetry-derived arrays only and have no anomaly-label argument. The exporter uses a telemetry-only `usecols` read so the `is_anomaly_*` columns interleaved in official ESA-ADB preprocessing are not parsed or materialized at all. Regression coverage deliberately places nonnumeric garbage in annotation columns and requires the telemetry-only read to succeed, which would fail if those columns were consumed.

The exporter therefore does not read or consume channel labels, binary labels, anomaly types, ground-truth events, official metric thresholds, or official metric outputs. The source files themselves are still exact-byte verified against the parent run before selective reading.

The retained receipt records:

- source `run.json` SHA-256;
- checkpoint SHA-256;
- train/test CSV SHA-256;
- exact ordered channels;
- `annotation_columns_loaded: false` and `anomaly_label_access: false`;
- probe constants and learned weights/biases;
- method-specific score definitions;
- threshold quantile, comparison rule, and every learned channel threshold for Space-JEPA and both comparators;
- SHA-256 for every channel-surface CSV;
- exact code commit when available.

The exporter refuses to overwrite an existing output directory.

## Scientific interpretation

A per-channel residual or binary-prediction artifact is **not** itself a scientific result. It does not establish that Space-JEPA identifies causal channels, improves localization, improves ChannelAwareFScore, improves timing quality, or beats either comparator.

The pinned upstream review establishes that `ChannelAwareFScore` expects binary timestamped predictions keyed by channel and does not accept continuous scorings. It also establishes that the pinned TimeEval `Experiment.evaluate()` path computes ADTQC from a global max-across-channels binary series and explicitly skips ADTQC in the per-channel ranking loop. The per-channel probe should therefore be described as a `ChannelAwareFScore` compatibility head, not an ADTQC head.

The remaining official channel-aware outcome gate is now the exact pinned metric adapter plus benchmark metadata provenance. No official channel-aware outcome should be inspected until the adapter is bound to the reviewed upstream source and the exact labels/anomaly-types/channel-subsystem files are hashed. When evaluation is authorized, all frozen seeds and adverse outcomes must be retained.

The original global-score primary comparison remains authoritative unless a separately preregistered successor protocol changes that hierarchy before outcome access.
