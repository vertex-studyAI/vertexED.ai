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

Those annotation columns are **never model inputs**. `space_jepa.esa_adb.load_esa_adb_csv()` selects feature columns and their matching annotation columns separately and fails closed if a requested label column is missing.

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

CSV loading for the ordinary evaluation path uses `pandas.read_csv(usecols=...)` with float32 telemetry and uint8 annotation dtypes. This allows the lightweight channel presets to avoid loading every mission channel into RAM. The pre-outcome channel-probe exporter is stricter: it uses a telemetry-only `usecols` read and never loads the interleaved `is_anomaly_*` columns.

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
3. fits the frozen score threshold from valid training scores only;
4. warm-starts test scoring using only the final training context window;
5. computes repository-native diagnostics only after thresholds are frozen;
6. writes `predictions.csv`, `model.pt`, and `run.json` with dataset hashes and provenance.

The local diagnostics are useful engineering checks but are **not** the official ESA-ADB result.

## Pre-outcome per-channel score surface

`ESA_CHANNEL_PROBE_PROTOCOL_V0.md` freezes a secondary train-only ridge decoder that maps predicted JEPA target latents back to normalized telemetry channels. It is designed to produce a meaningful channel-resolved residual surface without changing the JEPA training objective or using anomaly labels for probe fitting.

After an ordinary `run_esa_adb.py` run exists, materialize the channel-score artifact with the exact same dataset bytes:

```bash
python run_esa_channel_probe.py \
  artifacts/esa_adb/mission1-lite/seed-17/run.json \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.train.csv \
  /path/to/data/preprocessed/multivariate/ESA-Mission1-semi-supervised/84_months.test.csv \
  --device cpu \
  --out-dir artifacts/esa_adb/mission1-lite/seed-17/channel-probe-v0
```

The exporter verifies the train/test SHA-256 identities retained by the source run, reloads the exact checkpoint/config and ordered channel list, reads only the frozen telemetry columns plus test timestamps, refits the scaler on training telemetry only, fits the frozen ridge probe on training windows only, warm-starts test scoring from the final training context, and refuses to overwrite an existing output directory. The retained receipt binds the source run, checkpoint, train/test bytes, exact channels, probe parameters, code commit, and channel-score CSV hash while recording `annotation_columns_loaded: false` and `anomaly_label_access: false`.

This artifact is still **pre-outcome**. It is not an official channel-localization result.

## Official ESA event metrics

The upstream Mission 1 / Mission 2 experiments use `ESAScores`, `ChannelAwareFScore`, and `ADTQC`, with beta `0.5`, and report both:

- `Category = Anomaly`
- `Category = {Anomaly, Rare Event}`

The frozen primary Space-JEPA path emits one global anomaly score per timestep, so it can be evaluated honestly with the official **ESAScores event metric**. The new secondary probe also emits continuous per-channel residual scores, but **ChannelAwareFScore and ADTQC remain blocked** until their exact upstream input/ranking/timing semantics are independently verified and a comparator policy is frozen. Merely having per-channel scores does not authorize those claims.

Run the official event metric adapter **inside the official ESA-ADB environment**, where its modified TimeEval fork is importable:

```bash
python /path/to/vertexED.ai/portfolio/research/space-jepa/evaluate_esa_adb.py \
  artifacts/esa_adb/mission1-lite/seed-17/predictions.csv \
  /path/to/ESA-Mission1/labels.csv \
  /path/to/ESA-Mission1/anomaly_types.csv \
  --prediction-column space_jepa_pred \
  --out artifacts/esa_adb/mission1-lite/seed-17/official_esa_scores.json
```

The evaluator merges `labels.csv` with `anomaly_types.csv`, clips events to the test prediction range, and invokes upstream `ESAScores` twice using the two category selections above.

## Baselines and claim gate

`run_esa_adb.py` produces the same frozen-threshold outputs for:

- Space-JEPA latent prediction error
- robust z-score
- one-step persistence error

Before any result is promoted:

- run every frozen seed: `17, 29, 43, 71, 101`;
- preserve all outcomes, including failures;
- run the upstream ESA event metric adapter;
- retain dataset hashes, exact channel preset, config, commit SHA, hardware/runtime, raw predictions, and thresholds;
- do not tune on the official test labels;
- do not describe repository-native AUROC/F1 as the official ESA-ADB score;
- if channel-aware metrics are later authorized, retain the exact probe receipt and channel-score bytes for every seed and provide matched per-channel comparator outputs under the same frozen evaluation.

## Current limitation / next research head

The repository now has a pre-outcome, train-only per-channel prediction-residual probe with provenance-bound export. The remaining channel-aware gap is no longer “invent a channel score”; it is to **pin and validate the official ChannelAwareFScore/ADTQC adapter semantics and freeze matched comparator inputs before any such outcome is inspected**. Until that is done, only the global ESAScores path is authorized for official ESA event-metric reporting.
