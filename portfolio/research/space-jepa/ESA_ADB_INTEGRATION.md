# ESA-ADB integration contract

This document records the exact external benchmark seams used by Space-JEPA. It is an engineering and evaluation contract, not a result.

## Upstream benchmark

Space-JEPA targets the official **European Space Agency Anomaly Detection Benchmark (ESA-ADB)** repository and its official Mission 1 / Mission 2 preprocessing. The benchmark's preprocessing scripts produce multivariate CSV files with `timestamp`, telemetry / telecommand feature columns, and one annotation column per feature named `is_anomaly_<channel>`.

Those annotation columns are **never model inputs**. The pre-outcome global runner and channel-surface exporter select only the exact frozen telemetry columns plus test timestamps, so held-out annotation values are not materialized or exposed to model/scoring code. The source files remain interleaved CSVs, however: the CSV parser still opens and tokenizes those files while projecting the selected columns. Therefore the repository does not claim zero byte-level access to the held-out test source. Label-backed repository diagnostics and official benchmark metrics belong to separate outcome-access-gated evaluation steps.

## Official channel presets

### Mission 1

- `mission1-lite`: channels 41–46, matching the six-channel lightweight subset in `mission1_experiments.py`.
- `mission1-target`: the full target-channel list declared by the upstream experiment script.
- official test artifact after preprocessing: `84_months.test.csv`.

### Mission 2

- `mission2-lite`: channels 18–28, matching the eleven-channel lightweight subset in `mission2_experiments.py`.
- `mission2-target`: the full target-channel list declared by the upstream experiment script.
- official test artifact after preprocessing: `21_months.test.csv`.

A retained paper claim must state the exact preset or explicit channel list.

## Memory contract

ESA-ADB can contain millions of timesteps. Space-JEPA slices context/target windows lazily and materializes only the current batch. The per-channel probe likewise uses streaming ridge sufficient statistics rather than stacking all mission windows.

## Primary global path

`run_esa_adb.py` fits normalization, model parameters, and the global score threshold from training telemetry/scores only; warm-starts test scoring only from the final training context; preserves global robust-z and persistence comparators; and writes `predictions.csv`, `model.pt`, and `run.json` with dataset/config/provenance identities. Its test-data reader projects only the frozen telemetry columns plus timestamps from the interleaved test CSV. The retained receipt therefore records the precise boundary: `test_source_contains_interleaved_annotations: true`, `test_annotation_values_materialized: false`, `test_annotation_values_exposed_to_model: false`, and `test_source_io_scope: INTERLEAVED_CSV_TOKENIZED_TELEMETRY_TIMESTAMP_PROJECTION_ONLY`. It deliberately does **not** claim `heldout_label_access: false` or `test_annotation_columns_loaded: false`, because those names overstate what a column-selecting CSV parser proves. Repository-native label-backed diagnostics are not computed in this runner; official ESA-ADB evaluation remains a separate gated step.

The runner also does not compute a SHA-256 over the complete label-bearing test file during the pre-outcome scoring path. Instead it hashes the already-materialized timestamp + telemetry projection and records `full_source_sha256_status: NOT_COMPUTED_PRE_OUTCOME_TO_AVOID_FULL_FILE_BYTE_READ`. Exact full-file test identities still belong to the independent benchmark-provenance freeze before any authorized official evaluation.

## Pre-outcome per-channel surfaces

`ESA_CHANNEL_PROBE_PROTOCOL_V0.md` freezes a secondary train-only ridge decoder and matched channel-wise versions of the two already-declared global comparators. After an ordinary run exists:

```bash
python run_esa_channel_probe.py \
  artifacts/esa_adb/mission1-lite/seed-17/run.json \
  /path/to/84_months.train.csv \
  /path/to/84_months.test.csv \
  --device cpu \
  --out-dir artifacts/esa_adb/mission1-lite/seed-17/channel-probe-v0
```

The exporter verifies exact parent-run train/test hashes, checkpoint/config, and ordered channel identities; reads only telemetry plus timestamps; and refuses to overwrite an existing output directory. It retains three same-timestamp surfaces:

- `space_jepa_channels.csv`: predicted-latent ridge-decode squared residuals;
- `robust_zscore_channels.csv`: absolute per-channel robust z scores using train-only robust scaling;
- `persistence_channels.csv`: absolute one-step per-channel residuals on the normalized surface, warm-started only by the final training row.

Every method uses one **0.995 training-score quantile per channel** and the same `score >= threshold` binary rule. Each CSV retains continuous `<channel>_score` plus binary `<channel>_pred` columns. The receipt hashes all three surfaces and records every threshold and method definition while recording `annotation_columns_loaded: false` and `anomaly_label_access: false`.

These artifacts are still **pre-outcome**. They are not official channel-aware results.

## Pinned official ranking-metric semantics

`ESA_CHANNEL_METRIC_SEMANTICS_V0.md` pins reviewed ESA-ADB/TimeEval source at commit `aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33`, including exact Git blob identities for Mission-1 declarations, `ChannelAwareFScore`, `ADTQC`, and TimeEval experiment orchestration.

The source review resolves two important ambiguities before outcome access:

- **ChannelAwareFScore is binary and per-channel.** It expects timestamp/binary-indicator pairs keyed by channel and does not support continuous anomaly scores. The retained Space-JEPA, robust-z, and persistence surfaces now satisfy that required shape under a single predeclared threshold policy.
- **The pinned official ADTQC orchestration is global.** TimeEval creates a single binary `global` series from the maximum score across channels and explicitly skips ADTQC in its later per-channel ranking loop. The channel probe must not be advertised as an ADTQC head.

The upstream Mission-1 experiment fixes beta `0.5` and reports both `Category = Anomaly` and `Category in {Anomaly, Rare Event}` views.

## Frozen ChannelAwareFScore adapter

`evaluate_esa_channel_fscore.py` now closes the adapter implementation gap. Before it can score anything, it:

1. verifies exact Git blob identities for the four pinned ESA-ADB/TimeEval source files;
2. requires explicit expected SHA-256 values for official `labels.csv`, `anomaly_types.csv`, and `channels.csv` and aborts on byte drift;
3. verifies the channel receipt and SHA-256 of all three method surfaces;
4. requires identical timestamps/channel ordering and binary 0/1 predictions across the matched surfaces;
5. imports `ChannelAwareFScore` only from the verified pinned source tree;
6. evaluates Space-JEPA, robust z-score, and persistence through the same beta/category selections;
7. refuses to overwrite an existing retained result and records all source/data/receipt identities in its JSON output.

The adapter has **not** been run against held-out ESA labels by this implementation work.

## Claim gate

Before any ESA-ADB result is promoted:

- prospectively freeze SHA-256 identities for `labels.csv`, `anomaly_types.csv`, and `channels.csv`;
- run every frozen seed: `17, 29, 43, 71, 101`;
- preserve all outcomes, including failures and adverse comparator results;
- retain dataset hashes, exact channel preset, config, commit SHA, hardware/runtime, raw predictions, thresholds, and official benchmark metadata hashes;
- do not tune on official test labels or metric outcomes;
- for ChannelAwareFScore, evaluate all three frozen methods through the same pinned adapter/category selections;
- for ADTQC, preserve the pinned global orchestration rather than introducing a channel-wise successor definition;
- do not interpret channel detection as causal attribution or root-cause identification.

## Current limitation / next research head

The global-run annotation-materialization guard, channel-head, matched-comparator, upstream-semantics, and exact-adapter engineering gaps are now closed. The remaining pre-outcome blocker is **real benchmark metadata/data provenance**: independently freeze the exact SHA-256 identities of `labels.csv`, `anomaly_types.csv`, `channels.csv`, and the exact retained train/test source files, together with the runtime receipt required by the frozen primary study. Because the current pre-outcome scorer projects from the interleaved test CSV rather than a separately retained label-free file, it must not be described as providing zero byte-level held-out-source access. Only after those identities are independently reviewed and scientific outcome access is explicitly authorized should any label-backed official adapter be run. No official ESA held-out benchmark outcome has been generated or inspected by this work.
