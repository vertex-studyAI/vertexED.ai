# Space-JEPA ESA per-channel probe amendment — pre-outcome v0

## Scope

This amendment adds a **secondary, pre-outcome per-channel score surface** to the existing frozen Space-JEPA ESA-ADB experiment. It does not replace or alter the primary global latent-error score, the frozen seeds, global threshold rule, train/test split, baselines, or the claim boundary in `PROTOCOL.md`.

The purpose is narrow: make a channel-resolved signal available for later compatibility testing with ESA-ADB's channel-aware metrics without using anomaly labels to fit the representation or probe.

## Frozen probe construction

For each already-trained Space-JEPA run:

1. reload the exact checkpoint and resolved model config retained by that run;
2. verify the provided train/test CSV bytes against the SHA-256 identities retained in `run.json`;
3. recover the exact ordered channel list retained in `run.json` and fail closed on missing or duplicate identities;
4. read **only** those telemetry columns (plus test timestamps) from the interleaved official CSVs; annotation columns are never loaded by this exporter;
5. refit the same robust scaler on **training telemetry only** and transform train/test telemetry with those frozen statistics;
6. fit a linear ridge decoder from **predicted target latents** to normalized telemetry targets using training windows only;
7. compute squared residuals independently for every telemetry channel on overlapping target windows;
8. warm-start test scoring only with the final training context, exactly as the global Space-JEPA score does;
9. average overlapping residuals at each target timestep and export continuous per-channel scores.

The ridge fit is implemented from streaming sufficient statistics, so it does not materialize all ESA-ADB windows in memory.

## Frozen numerical settings

- ridge penalty alpha: **1.0**
- probe-fit window stride: **4**
- retained test-score stride: **1**
- scoring/fitting batch size: **128**
- score for channel `c` at a target timestep: squared residual between normalized observed telemetry and the ridge decode of the predicted JEPA target latent for channel `c`, averaged across overlapping target windows
- intercept is unregularized; latent coefficients are ridge-regularized

These constants are hard-coded in `run_esa_channel_probe.py` for v0. They are not tuning knobs after any held-out outcome access.

## Leakage and provenance boundary

The probe API accepts telemetry only and has no anomaly-label argument. The exporter uses a telemetry-only `usecols` read so the `is_anomaly_*` columns interleaved in official ESA-ADB preprocessing are not parsed or materialized at all. Regression coverage deliberately places nonnumeric garbage in annotation columns and requires the telemetry-only read to succeed, which would fail if those columns were consumed.

The exporter therefore does not read or consume channel labels, binary labels, anomaly types, ground-truth events, thresholds, or official metric outputs. The source files themselves are still exact-byte verified against the parent run before selective reading.

The retained receipt records:

- source `run.json` SHA-256;
- checkpoint SHA-256;
- train/test CSV SHA-256;
- exact ordered channels;
- `annotation_columns_loaded: false` and `anomaly_label_access: false`;
- probe constants and learned weights/biases;
- channel-score CSV SHA-256;
- exact code commit when available.

The exporter refuses to overwrite an existing output directory.

## Scientific interpretation

A per-channel residual artifact is **not** itself a scientific result. It does not establish that Space-JEPA identifies causal channels, improves localization, improves ChannelAwareFScore, improves ADTQC, or beats any baseline.

Official channel-aware metrics remain blocked until their exact upstream input semantics are independently verified against the pinned ESA-ADB environment and a comparator policy is frozen. If those metrics are later run, all frozen seeds and adverse outcomes must be retained.

The original global-score primary comparison remains authoritative unless a separately preregistered successor protocol changes that hierarchy before outcome access.
