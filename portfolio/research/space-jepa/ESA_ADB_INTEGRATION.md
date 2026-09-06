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

`run_esa_adb.py` fits normalization, model parameters, and the global score threshold from training telemetry/scores only; warm-starts test scoring only from the final training context; preserves the global robust-z and persistence comparators; and writes `predictions.csv`, `model.pt`, and `run.json` with dataset/config/provenance identities. Repository-native diagnostics are engineering checks, not official ESA-ADB results.

## Pre-outcome per-channel surfaces

`ESA_CHANNEL_PROBE_PROTOCOL_V0.md` freezes a secondary train-only ridge decoder and matched channel-wise versions of the two already-declared global comparators. After an ordinary `run_esa_adb.py` run exists, materialize all three matched channel surfaces with the exact same data bytes:

```bash
python run_esa_channel_probe.py \
  artifacts/esa_adb/mission1-lite/seed-17/run.json \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.train.csv \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.test.csv \
  --device cpu \
  --out-dir artifacts/esa_adb/mission1-lite/seed-17/channel-probe-v0
```

The exporter verifies exact parent-run train/test hashes, checkpoint/config, and ordered channel identities; reads only telemetry plus timestamps; and refuses to overwrite an existing output directory. It retains three same-timestamp surfaces:

- `space_jepa_channels.csv`: predicted-latent ridge-decode squared residuals;
- `robust_zscore_channels.csv`: absolute per-channel robust z scores using train-only robust scaling;
- `persistence_channels.csv`: absolute one-step per-channel residuals on the normalized surface, warm-started only by the final training row.

Every method uses one **0.995 training-score quantile per channel** and the same `score >= threshold` binary rule. Space-JEPA thresholds use covered training probe residuals; robust-z thresholds use training robust-z scores; persistence excludes the uncovered first training row. Each CSV retains continuous `<channel>_score` plus binary `<channel>_pred` columns. The receipt hashes all three surfaces and records every threshold and method definition while recording `annotation_columns_loaded: false` and `anomaly_label_access: false`.

These artifacts are still **pre-outcome**. They are not official channel-aware results.

## Pinned official ranking-metric semantics

`ESA_CHANNEL_METRIC_SEMANTICS_V0.md` pins the reviewed ESA-ADB/TimeEval source at commit `aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33`, including exact blob identities for Mission-1 experiment declaration, `ChannelAwareFScore`, `ADTQC`, and TimeEval experiment orchestration.

The source review resolves two important ambiguities before outcome access:

- **ChannelAwareFScore is binary and per-channel.** It does not support continuous anomaly scores. It expects a dictionary keyed by channel, each containing timestamp/binary-indicator pairs. The three retained channel surfaces therefore now have the required binary shape for a matched comparison.
- **The pinned official ADTQC orchestration is global, not the per-channel ranking loop.** TimeEval builds a single binary `global` series from the maximum score across channels, rewrites the ground-truth channel to `global`, evaluates ADTQC there, and explicitly skips ADTQC in the later per-channel ranking loop. The channel probe must not be advertised as an ADTQC head.

The upstream Mission-1 experiment uses beta `0.5` and reports both `Category = Anomaly` and `Category in {Anomaly, Rare Event}` views. Those category selections remain frozen for any later official comparison.

The per-channel 0.995 thresholds are a predeclared Space-JEPA/comparator policy, not a claim about TimeEval's threshold selection, and may not be changed after held-out metric access.

## Official ESA event metrics

The frozen primary Space-JEPA path emits one global anomaly score per timestep, so it can be evaluated with official **ESAScores** after the benchmark environment and inputs are frozen. The existing `evaluate_esa_adb.py` adapter is reserved for that global event-metric path.

For **ChannelAwareFScore**, the input semantics and matched Space-JEPA/z-score/persistence binary prediction surfaces are now frozen. Outcome access remains blocked on one remaining engineering/provenance layer: retain an exact adapter bound to the pinned upstream source and bind the official `labels.csv`, `anomaly_types.csv`, and `channels.csv` bytes before evaluation. For **ADTQC**, preserve the separate pinned global orchestration; do not route the per-channel probe into a post-hoc alternative timing definition.

## Claim gate

Before any ESA-ADB result is promoted:

- run every frozen seed: `17, 29, 43, 71, 101`;
- preserve all outcomes, including failures and adverse comparator results;
- retain dataset hashes, exact channel preset, config, commit SHA, hardware/runtime, raw predictions, thresholds, and official benchmark metadata hashes;
- do not tune on official test labels or metric outcomes;
- do not describe repository-native AUROC/F1 as official ESA-ADB scores;
- for ChannelAwareFScore, evaluate Space-JEPA, robust z-score, and persistence through the same pinned adapter/category selections;
- for ADTQC, preserve the pinned global orchestration rather than silently introducing a channel-wise successor definition;
- do not interpret channel detection as causal attribution or root-cause identification.

## Current limitation / next research head

The repository now has the previously missing **pre-outcome ChannelAwareFScore comparison surfaces**: Space-JEPA plus two matched comparators, all provenance-bound and train-thresholded, with the official ranking-metric input semantics pinned to exact upstream source.

The next hard gate is now narrow: implement and freeze the exact `ChannelAwareFScore` adapter against the pinned upstream commit, bind the official labels/anomaly-types/channel-subsystem file hashes, and only then run all frozen seeds. No official channel-aware benchmark outcome has been generated or inspected by this work.
