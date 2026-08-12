# T2424-0035 — RESULTS

Evidence date: 2026-08-12
Fresh run: GitHub Actions `31616573215`, job `94180746280`
Frozen source base: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`

## Hypothesis

The frozen detector should classify a delayed train-to-evaluation transition as delayed generalization while rejecting a matched near-synchronous control and transient evaluation spikes.

## Task

Deterministic synthetic train/evaluation accuracy curves processed by a causal moving average, persistent thresholds, a minimum memorization-to-generalization delay and an evaluation-at-memorization ceiling.

## Baseline / control

- positive fixture: delayed generalization curve;
- matched negative control: near-synchronous train/evaluation transition;
- additional test control: one-row evaluation spike.

## Fresh result

| Condition | Verdict | Memorization step | Generalization step | Delay | Eval at memorization |
|---|---|---:|---:|---:|---:|
| Delayed fixture | `DELAYED_GENERALIZATION_DETECTED` | 4750 | 14250 | 9500 | 0.0806551 |
| Matched control | `NO_DELAYED_GENERALIZATION` | 5750 | 5500 | -250 | 0.9221472 |

All 5 focused tests passed, including the spike-rejection and causal-smoothing checks.

## Seed / uncertainty policy

The fixture is deterministic and no model is trained. A seed sweep is therefore not appropriate for inferential statistics. The evidence is exact detector behavior under frozen positive/negative controls.

## Limitations

This does not establish:

- grokking in a trained neural network;
- a causal mechanism for grokking;
- theoretical phase transitions;
- detector calibration on noisy real training curves;
- robustness across architectures/datasets/hyperparameters;
- publication novelty.

The next scientific gate requires real training traces plus matched non-grokking controls and sensitivity analysis.