# ESA-ADB ranking-metric semantics — pinned pre-outcome review v0

This note pins the upstream implementation semantics that Space-JEPA must satisfy before any channel-aware ESA-ADB outcome is inspected. It is a source review and execution contract, not a benchmark result.

## Upstream source identity

Repository: `kplabs-pl/ESA-ADB`

Pinned source commit reviewed: `aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33`

Reviewed Git blob identities at that commit:

- `mission1_experiments.py`: `255578f0aaeb53880818ce4c266f22ca7d2cbc44`
- `timeeval/metrics/ranking_metrics.py`: `ded09a56bcccf01375c98889d1b4b7e19f71d621`
- `timeeval/metrics/latency_metrics.py`: `bfe6d88a5e6c6668e202f756566aa81c06480400`
- `timeeval/core/experiments.py`: `c0e4a42c3efa5bd53df3833565d3984801add2d6`

`evaluate_esa_channel_fscore.py` verifies those Git blob identities from raw bytes **before importing the metric**. A retained official-metric run must use this exact source identity or explicitly freeze and review a successor upstream commit before outcome access.

## Mission-1 ranking metric declaration

The pinned Mission-1 experiment declares beta `0.5` and two label selections:

1. `Category = Anomaly`
2. `Category in {Rare Event, Anomaly}`

It declares `ChannelAwareFScore` and `ADTQC` as ranking metrics and passes official `labels.csv` plus `84_months.test.csv` into TimeEval. The experiment can use either the six-channel lightweight subset (`channel_41` through `channel_46`) or the larger target-channel list.

## ChannelAwareFScore input semantics

The pinned `ChannelAwareFScore` implementation does **not** accept continuous anomaly scores (`supports_continuous_scorings()` returns `False`). Its score function expects:

- `y_true`: the ESA label-event table;
- `y_pred`: a dictionary keyed by channel name;
- each channel value: timestamp/binary-indicator pairs, where `0` is nominal and `1` is anomaly;
- optional subsystem mapping.

The TimeEval experiment filters ground truth to configured `target_channels`, constructs one binary prediction series per channel, and passes subsystem metadata to `ChannelAwareFScore`. The metric evaluates channel detection per anomaly ID and averages event-level precision/recall/F-beta; with subsystem metadata it also evaluates subsystem detection.

### Consequence for Space-JEPA

A continuous per-channel residual alone is insufficient. Space-JEPA freezes a **train-only** conversion to binary channel predictions: one `0.995` residual quantile per channel, fit only from covered training residuals, followed by `score >= threshold` on test residuals. The same train-only quantile/comparison rule is applied to the matched robust-z and one-step persistence channel comparators.

This is a Space-JEPA/comparator decision rule, not a claim that TimeEval itself selects the 0.995 quantile.

## ADTQC semantics and correction

The pinned `ADTQC` class also declares that continuous scorings are unsupported and accepts timestamp/binary-indicator series. However, the pinned **TimeEval experiment orchestration does not run ADTQC as a per-channel ranking metric**. In `Experiment.evaluate()` it:

1. constructs a single `global` binary prediction series from the maximum score across channels;
2. rewrites the filtered ground-truth `Channel` field to `global`;
3. evaluates ADTQC on that global series;
4. explicitly skips ADTQC inside the later per-channel ranking loop.

Therefore the Space-JEPA per-channel probe is directly required for `ChannelAwareFScore`, but must **not** be advertised as an ADTQC head. ADTQC remains a separate global timing-evaluation path.

## Frozen adapter

`evaluate_esa_channel_fscore.py` now provides the exact fail-closed evaluation adapter for the pinned `ChannelAwareFScore` path. It is deliberately incapable of silently evaluating arbitrary source/data combinations:

- verifies all four pinned upstream Git blob identities before metric import;
- requires explicit expected SHA-256 values for `labels.csv`, `anomaly_types.csv`, and `channels.csv`, and aborts on byte drift;
- verifies the retained channel-probe receipt is the matched three-method, annotation-blind status;
- verifies every retained Space-JEPA/robust-z/persistence channel CSV against the SHA-256 in that receipt;
- requires exact identical timestamps and ordered channels across all three methods;
- requires binary 0/1 `<channel>_pred` values and finite continuous scores;
- filters official event ground truth to the frozen channel set and prediction time range;
- constructs subsystem mapping from the hash-bound `channels.csv`;
- imports `ChannelAwareFScore` only from the verified pinned ESA-ADB tree;
- evaluates all three frozen methods through the same beta `0.5`, `Anomaly` and `{Anomaly, Rare Event}` category selections;
- refuses to overwrite an existing retained result;
- records source/data/receipt identities and the claim boundary in the result JSON.

The adapter writes real official metric outcomes when executed, so **it has not been run against held-out ESA labels by this pre-outcome implementation work**.

## Thresholding boundary

The pinned TimeEval orchestration rescales algorithm score columns and casts ranking-metric inputs to `uint8`, but does not provide a benchmark-wide train-only threshold-selection rule appropriate to this external continuous channel-residual head. Space-JEPA therefore retains its own threshold provenance rather than reverse-engineering a favorable binary conversion from test labels.

Frozen v0 channel decision rule for Space-JEPA and matched comparators:

- fit surface: each method's training channel scores only;
- quantile: `0.995` independently per channel;
- test decision: `score >= channel_threshold`;
- anomaly/rare-event labels: never read by the channel-surface exporter;
- no test-label tuning and no favorable threshold sweep.

## Remaining authorization gate

The implementation and upstream-semantics gaps are now closed. Outcome inspection is still blocked until the **actual benchmark metadata bytes are prospectively frozen** by recording the exact expected SHA-256 values for:

- `labels.csv`;
- `anomaly_types.csv`;
- `channels.csv`.

After those three hashes are independently reviewed and retained, run the adapter for every frozen seed `17,29,43,71,101`, keep all three methods and all adverse outcomes, and do not reinterpret ChannelAwareFScore as causal attribution or root-cause identification.
