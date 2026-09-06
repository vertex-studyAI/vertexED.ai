# ESA-ADB integration contract

This document records the exact external benchmark seams used by Space-JEPA. It is an engineering and evaluation contract, not a result.

## Upstream benchmark

Space-JEPA targets the official **European Space Agency Anomaly Detection Benchmark (ESA-ADB)** repository and its official Mission 1 / Mission 2 preprocessing. The benchmark's preprocessing scripts produce multivariate CSV files with:

- `timestamp`
- telemetry / telecommand feature columns
- one annotation column per feature named `is_anomaly_<channel>`

The annotation encoding used by the upstream preprocessing utilities is:

- `0` — nominal
- `1` — anomaly
- `2` — rare event
- `3` — communication gap
- `4` — invalid

Those annotation columns are **never model inputs**. The ordinary evaluation adapter can separate telemetry from annotations for post-freeze diagnostics, while the pre-outcome channel-probe exporter is stricter: it reads only the exact telemetry columns plus test timestamps and never parses the interleaved `is_anomaly_*` columns.

## Official channel presets

The repository copies the channel subsets declared by the upstream ESA-ADB experiment scripts so runs can be compared on the same input surfaces.

### Mission 1

- `mission1-lite`: channels 41–46, matching the six-channel lightweight subset in `mission1_experiments.py`.
- `mission1-target`: the full target-channel list declared by the upstream experiment script.
- official test artifact after preprocessing: `84_months.test.csv`.

### Mission 2

- `mission2-lite`: channels 18–28, matching the eleven-channel lightweight subset in `mission2_experiments.py`.
- `mission2-target`: the full target-channel list declared by the upstream experiment script.
- official test artifact after preprocessing: `21_months.test.csv`.

The lightweight presets are the recommended first engineering runs on constrained hardware. A retained paper claim must state the exact preset or explicit channel list.

## Memory contract

ESA-ADB can contain millions of timesteps. The Space-JEPA trainer and scorer therefore use `TelemetryWindowDataset`, which slices context/target windows lazily and materializes only the current batch. Do not replace this with an all-window `np.stack` path for retained runs.

The per-channel probe uses streaming ridge sufficient statistics: it materializes only one context/target batch at a time and retains an `(latent_dim + 1) x (latent_dim + 1)` normal-equation matrix plus the latent-to-channel cross-product. It does not stack the full mission's windows.

## Running Space-JEPA on official preprocessed files

From `portfolio/research/space-jepa`:

```bash
python run_esa_adb.py \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.train.csv \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.test.csv \
  --preset mission1-lite \
  --config configs/esa_first_pass.json \
  --seed 17 \
  --device cpu \
  --out-dir artifacts/esa_adb/mission1-lite/seed-17
```

For Mission 2 use `--preset mission2-lite` and the matching preprocessed train/test files.

`run_esa_adb.py`:

1. fits robust normalization on training telemetry only;
2. trains Space-JEPA without consuming annotation labels;
3. fits the frozen global score threshold from valid training scores only;
4. warm-starts test scoring using only the final training context window;
5. computes repository-native diagnostics only after thresholds are frozen;
6. writes `predictions.csv`, `model.pt`, and `run.json` with dataset hashes and provenance.

The local diagnostics are useful engineering checks but are **not** the official ESA-ADB result.

## Pre-outcome per-channel score and binary-prediction surface

`ESA_CHANNEL_PROBE_PROTOCOL_V0.md` freezes a secondary train-only ridge decoder that maps predicted JEPA target latents back to normalized telemetry channels. It produces continuous channel residuals and one binary decision surface suitable for later `ChannelAwareFScore` evaluation, without changing the JEPA objective or reading anomaly labels.

After an ordinary `run_esa_adb.py` run exists, materialize the channel artifact with the exact same dataset bytes:

```bash
python run_esa_channel_probe.py \
  artifacts/esa_adb/mission1-lite/seed-17/run.json \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.train.csv \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.test.csv \
  --device cpu \
  --out-dir artifacts/esa_adb/mission1-lite/seed-17/channel-probe-v0
```

The exporter:

1. verifies the train/test SHA-256 identities retained by the parent run;
2. reloads the exact checkpoint/config and ordered channel list;
3. reads only the frozen telemetry columns plus test timestamps;
4. refits the scaler on training telemetry only;
5. fits the frozen ridge probe on training windows only;
6. scores covered training residuals and freezes one **0.995 quantile threshold per channel** from training residuals only;
7. warm-starts test scoring from the final training context;
8. exports `<channel>_score` and `<channel>_pred`, where the binary rule is `score >= channel_threshold`;
9. refuses to overwrite an existing output directory.

The retained receipt binds the source run, checkpoint, train/test bytes, exact channels, probe parameters, channel thresholds, code commit, and output CSV hash while recording `annotation_columns_loaded: false` and `anomaly_label_access: false`.

This artifact is still **pre-outcome**. It is not an official channel-localization result.

## Pinned official ranking-metric semantics

`ESA_CHANNEL_METRIC_SEMANTICS_V0.md` pins the reviewed ESA-ADB/TimeEval source at commit `aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33`, including exact blob identities for Mission-1 experiment declaration, `ChannelAwareFScore`, `ADTQC`, and TimeEval experiment orchestration.

The source review resolves two important ambiguities before outcome access:

- **ChannelAwareFScore is binary and per-channel.** It does not support continuous anomaly scores. It expects a dictionary keyed by channel, each containing timestamp/binary-indicator pairs. That is why the Space-JEPA compatibility head now retains both continuous residuals and train-thresholded binary predictions.
- **The pinned official ADTQC orchestration is global, not the per-channel ranking loop.** TimeEval builds a single binary `global` series from the maximum score across channels, rewrites the ground-truth channel to `global`, evaluates ADTQC there, and explicitly skips ADTQC in the later per-channel ranking loop. The new channel probe therefore must not be advertised as an ADTQC head.

The upstream Mission-1 experiment uses beta `0.5` and reports both `Category = Anomaly` and `Category in {Anomaly, Rare Event}` views. Those category selections remain frozen for any later official comparison.

The Space-JEPA per-channel `0.995` threshold is a predeclared project decision rule chosen to mirror the existing train-only global threshold policy. It is **not** claimed to be TimeEval's own threshold-selection rule, and it may not be changed after held-out metric access.

## Official ESA event metrics

The frozen primary Space-JEPA path emits one global anomaly score per timestep, so it can be evaluated with official **ESAScores** after the benchmark environment and inputs are frozen. Run the existing adapter only inside the pinned ESA-ADB environment where the modified TimeEval fork is importable:

```bash
python /path/to/vertexED.ai/portfolio/research/space-jepa/evaluate_esa_adb.py \
  artifacts/esa_adb/mission1-lite/seed-17/predictions.csv \
  /path/to/ESA-Mission1/labels.csv \
  /path/to/ESA-Mission1/anomaly_types.csv \
  --prediction-column space_jepa_pred \
  --out artifacts/esa_adb/mission1-lite/seed-17/official_esa_scores.json
```

The evaluator merges `labels.csv` with `anomaly_types.csv`, clips events to the test prediction range, and invokes upstream `ESAScores` for both frozen category selections.

For **ChannelAwareFScore**, the input shape and binary semantics are now source-pinned, but outcome access remains blocked until an exact adapter is retained and matched per-channel comparator predictions are frozen under a predeclared policy. For **ADTQC**, retain the separate pinned global evaluation path; do not route the channel-probe outputs into a post-hoc alternative timing metric.

## Baselines and claim gate

`run_esa_adb.py` already produces frozen-threshold global outputs for:

- Space-JEPA latent prediction error
- robust z-score
- one-step persistence error

Before any result is promoted:

- run every frozen seed: `17, 29, 43, 71, 101`;
- preserve all outcomes, including failures and adverse comparator results;
- retain dataset hashes, exact channel preset, config, commit SHA, hardware/runtime, raw predictions, and thresholds;
- do not tune on official test labels or metric outcomes;
- do not describe repository-native AUROC/F1 as the official ESA-ADB score;
- for ChannelAwareFScore, retain the exact probe receipt and per-channel binary-prediction bytes for every seed and matched per-channel comparator outputs under the same frozen evaluation;
- for ADTQC, preserve the pinned global orchestration rather than silently introducing a channel-wise successor definition;
- do not interpret channel detection as causal attribution or root-cause identification.

## Current limitation / next research head

The repository now has the previously missing **pre-outcome ChannelAwareFScore-compatible prediction head**: provenance-bound per-channel residuals plus train-only binary decisions, with the official ranking-metric input semantics pinned to exact upstream source.

The next hard gate is narrower and executable: implement and freeze the exact `ChannelAwareFScore` adapter against the pinned upstream commit, generate matched per-channel binary comparator outputs under a predeclared train-only policy, bind labels/anomaly-types/channels metadata hashes, and only then run all frozen seeds. No channel-aware benchmark outcome has been generated or inspected by this work.