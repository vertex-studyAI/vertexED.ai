# ESA-ADB ranking-metric semantics — pinned pre-outcome review v0

This note pins the upstream implementation semantics that Space-JEPA must satisfy before any channel-aware ESA-ADB outcome is inspected. It is a source review, not a benchmark result.

## Upstream source identity

Repository: `kplabs-pl/ESA-ADB`

Pinned source commit reviewed: `aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33`

Reviewed Git blob identities at that commit:

- `mission1_experiments.py`: `255578f0aaeb53880818ce4c266f22ca7d2cbc44`
- `timeeval/metrics/ranking_metrics.py`: `ded09a56bcccf01375c98889d1b4b7e19f71d621`
- `timeeval/metrics/latency_metrics.py`: `bfe6d88a5e6c6668e202f756566aa81c06480400`
- `timeeval/core/experiments.py`: `c0e4a42c3efa5bd53df3833565d3984801add2d6`

A retained official-metric run must use this exact source identity or explicitly freeze and review a successor upstream commit before outcome access.

## Mission-1 ranking metric declaration

The pinned Mission-1 experiment declares beta `0.5` and two label selections for both event/ranking reporting:

1. `Category = Anomaly`
2. `Category in {Rare Event, Anomaly}`

It declares `ChannelAwareFScore` and `ADTQC` as ranking metrics and passes the official `labels.csv` plus `84_months.test.csv` into TimeEval. The experiment can use either the six-channel lightweight subset (`channel_41` through `channel_46`) or the larger target-channel list.

## ChannelAwareFScore input semantics

The pinned `ChannelAwareFScore` implementation does **not** accept continuous anomaly scores (`supports_continuous_scorings()` returns `False`). Its score function expects:

- `y_true`: the ESA label-event table;
- `y_pred`: a dictionary keyed by channel name;
- each channel value: timestamp/binary-indicator pairs, where `0` is nominal and `1` is anomaly;
- optional subsystem mapping.

The TimeEval experiment filters the ground-truth label table to the configured `target_channels` before ranking evaluation. It then constructs one prediction series per target channel and passes the subsystem mapping to `ChannelAwareFScore`.

The metric evaluates each anomaly ID over the union of affected-channel intervals, counts whether each configured channel was affected and whether a predicted event overlaps the anomaly interval, suppresses some false detections that overlap a true event for another anomaly, computes per-event channel precision/recall/F-beta, and averages those event-level values. When subsystem metadata is present it repeats an analogous affected/detected calculation at subsystem level.

### Consequence for Space-JEPA

A continuous per-channel residual alone is insufficient for the official metric. Space-JEPA therefore freezes a **train-only** conversion to binary channel predictions: one `0.995` residual quantile per channel, fit only from covered training residuals, followed by `score >= threshold` on test residuals. The threshold is not fit from ESA labels or official metric outcomes.

This choice is a Space-JEPA decision rule, not a claim that TimeEval itself selects the 0.995 quantile.

## ADTQC semantics and an important correction

The pinned `ADTQC` metric class also declares that it does not support continuous scorings and accepts a dictionary of timestamp/binary-indicator series. Its timing curve scores the earliest overlapping detection relative to the global start of each selected anomaly, with an early-detection window based on anomaly duration and spacing from the previous anomaly.

However, the pinned **TimeEval experiment orchestration does not run ADTQC as a per-channel ranking metric**. In `Experiment.evaluate()` it:

1. constructs a single `global` binary prediction series from the maximum score across channels;
2. rewrites the filtered ground-truth `Channel` field to `global`;
3. evaluates ADTQC on that global series;
4. explicitly skips ADTQC inside the later per-channel ranking loop.

Therefore the new Space-JEPA per-channel probe is directly required for `ChannelAwareFScore`, but it should **not** be advertised as necessary for reproducing the pinned official ADTQC orchestration. ADTQC remains a separate global timing-evaluation path.

## Thresholding boundary

The pinned TimeEval orchestration rescales algorithm score columns and casts ranking-metric inputs to `uint8`. That orchestration does not provide a benchmark-wide train-only threshold-selection rule appropriate to a new external model's continuous channel residuals. Space-JEPA must therefore retain its own threshold provenance rather than reverse-engineering a favorable binary conversion from test labels.

Frozen Space-JEPA v0 channel decision rule:

- fit surface: covered training channel-residual scores only;
- quantile: `0.995` independently per channel;
- test decision: `score >= channel_threshold`;
- anomaly/rare-event labels: never read by the channel-probe exporter;
- no test-label tuning, no per-channel favorable threshold sweep.

## Remaining authorization gate

This source review resolves the previously vague question of the official ranking-metric input shape. It does **not** authorize outcome inspection yet.

Before `ChannelAwareFScore` is run on Space-JEPA, retain:

- an adapter pinned to the exact upstream commit above;
- exact mission/preset/channel ordering;
- exact binary prediction CSV and channel-probe receipt for every frozen seed;
- matched per-channel binary outputs for every comparator admitted to the channel-aware comparison;
- exact category selections and beta `0.5`;
- official labels/anomaly-types/channel-subsystem file hashes;
- the full frozen seed set, including adverse outcomes.

Do not reinterpret a channel-aware result as causal attribution or root-cause identification.
