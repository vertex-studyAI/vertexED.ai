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

CSV loading uses `pandas.read_csv(usecols=...)` with float32 telemetry and uint8 annotation dtypes. This allows the lightweight channel presets to avoid loading every mission channel into RAM.

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

## Official ESA event metrics

The upstream Mission 1 / Mission 2 experiments use `ESAScores`, `ChannelAwareFScore`, and `ADTQC`, with beta `0.5`, and report both:

- `Category = Anomaly`
- `Category = {Anomaly, Rare Event}`

The current Space-JEPA head emits one global anomaly score per timestep. It can therefore be evaluated honestly with the official **ESAScores event metric**. It does **not** claim ChannelAwareFScore or ADTQC yet because those require meaningful per-channel ranking/timing outputs.

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
- do not describe repository-native AUROC/F1 as the official ESA-ADB score.

## Current limitation / next research head

ESA-ADB's channel-aware ranking and ADTQC metrics are scientifically valuable, but a global latent score cannot satisfy their intended semantics. The next architecture should add a predeclared per-channel prediction-error or probe head and validate that head independently before ChannelAwareFScore/ADTQC are reported.
