# IRIS v0.2 Reproducibility Addendum — 13 August 2026

**Purpose:** preserve fresh reproduction evidence and development-only baseline work without altering the frozen v0.2 scientific package or touching reserved confirmatory seeds.

## Evidence boundary

The current positive IRIS/PABIM learned-mechanism claim remains **unsupported / falsified by the existing learned-sequence gate**. This addendum does not change that verdict, does not claim novelty, and does not authorize final confirmatory execution.

The v0.2 research package used here is `IRIS_v0.2_research_package(1).zip` with SHA-256:

`5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`

The surfaced Library sidecar refers to a differently named `IRIS_v0.2_bundle.zip`; it therefore does not establish the identity of this research-package archive. The extracted package's own `SHA256SUMS.txt` was checked in full and **all entries passed**.

## Environment

- Python: `3.13.5`
- Platform: `Linux-6.18.35-x86_64-with-glibc2.41`
- NumPy: 2.3.5
- SciPy: 1.17.0
- PyTorch: 2.10.0+cpu
- No confirmatory seeds accessed.

## Package tests

Fresh package test run:

`python -m pytest -q`

Result: **4 passed**. The only warning was inability to write pytest cache metadata in the mounted copy; test execution itself passed.

## Existing v0.2 reproduction

### EXP-004 scalar v2

Command:

`python experiments/run_scalar_v2.py`

Fresh evidence:

- raw CSV: **byte-identical** to canonical package
- summary CSV: **byte-identical**
- paired-statistics CSV: **byte-identical**
- manifest: identical except runtime
- canonical script runtime: `4.333s`
- fresh script runtime: `5.745s`
- external observed wall time: `real 7.81; user 7.59; sys 0.71`

Fresh hashes:

| Artifact | SHA-256 |
|---|---|
| scalar_v2_raw.csv | `661f0afc944954aab1c94f69b04c32834b7e18e1121af08335cf89b25cef0240` |
| scalar_v2_summary.csv | `37337744ccde0db46bf32018091528c9d9d39aee9eaa0985b5ea8c48f23a90ca` |
| scalar_v2_paired_stats.csv | `a6e91174dabe41f0054a02fc536a06d290bcc23b5b6009e23fb2d56443b3c80c` |

**Verdict:** exact reproduction of the retained scalar numeric payload.

### EXP-003 learned sequence v2

Command:

`python experiments/run_sequence_v2.py`

The initial interactive execution call exceeded its response window, but the unchanged script completed and emitted a full `COMPLETE_EXPLORATORY_HELDOUT` manifest plus all expected output rows:

- 240 raw rows
- 48 aggregate rows
- 32 paired-comparison rows
- test seeds 100–104
- 8 conditions × 6 models
- fresh script runtime: `31.792s`

Independent canonical-vs-fresh comparison:

| Artifact | Maximum absolute numeric delta |
|---|---:|
| raw rows | 5.96e-07 |
| summary rows | 1.19e-07 |
| paired derived statistics | 4.3e-05 |

Shapes, columns, condition/model labels and nonnumeric fields match. Sign-flip p-values are unchanged. The small numeric differences are floating-point-level and do not change any scientific verdict.

**Verdict:** semantic/numerical reproduction, **not** byte-for-byte reproduction.

## Development-only baseline screen 1: robust/change-aware comparators

Experiment ID: `EXP-DEV-20260813-ROBUST-CHANGE-BASELINES`

Frozen before execution:
- seeds: 0–9 only
- conditions: Gaussian, Student-t2, contaminated Gaussian, spikes, abrupt regime shift, smooth drift, heavy-tail + shift
- current Huber / HTAM / PABIM plus:
  - naive robust-CUSUM switch
  - dual-timescale Huber
  - oracle reset diagnostic
- no parameter sweep
- final/reserved seed families explicitly forbidden

### Preserved diagnostic bug lineage

The first analysis version incorrectly treated smooth drift as repeated changepoints for recovery/oracle diagnostics. The affected diagnostic fields were invalid, while core MSE/MAE for non-oracle methods were unaffected.

The v1 output is preserved under `invalid_v1/`. The v1.1 fix changed only diagnostic/oracle condition handling; methods, seeds, conditions and parameters were unchanged.

### Main development finding

The naive robust-CUSUM switch shortened abrupt-shift recovery from **23.1** Huber steps to **13.8** steps, but false-open rates rose catastrophically under outlier-heavy conditions:

- Student-t2: about **40.7%**
- contaminated Gaussian: about **45.6%**
- spikes: about **42.2%**

This is direct development evidence for the central outlier-versus-persistent-change ambiguity. It does not support a positive IRIS mechanism claim.

## Development-only baseline screen 2: confirmed-change Huber comparator

Experiment ID: `EXP-DEV-20260813-CONFIRMED-CHANGE-BASELINE`

This comparator was frozen after the first screen's failure analysis, with **no parameter sweep**:

- same Huber slow update as the base comparator
- fast bounded adaptation only after three consecutive same-sign standardized residuals above a fixed threshold
- close after five small residuals
- seeds 0–9 only
- confirmatory seed blocks forbidden

| Condition | Huber MSE | Confirmed-change MSE | Relative change vs Huber | Confirmed false-open |
|---|---:|---:|---:|---:|
| Gaussian | 0.042641 | 0.042928 | +0.67% | 0.30% |
| Student-t2 | 0.069947 | 0.073670 | +5.32% | 1.26% |
| Contaminated | 0.053322 | 0.053633 | +0.58% | 0.29% |
| Spikes | 0.046525 | 0.046825 | +0.64% | 0.27% |
| Abrupt regime | 0.056618 | 0.052218 | -7.77% | 0.18% |
| Drift | 0.042652 | 0.043070 | +0.98% | 0.45% |
| Tail + shift | 0.056266 | 0.058498 | +3.97% | 0.84% |

On abrupt regime shift, mean recovery improved from **23.1** to **17.1** steps, while pre-change false opens remained about **0.18%**.

However, Student-t2 MSE is **5.32% worse** than Huber, so the comparator does not dominate the robustness–adaptation frontier.

**Interpretation:** this is a stronger simple baseline that IRIS must beat. It is not an IRIS result and does not authorize confirmatory seeds.

## Current scientific status

### Evidence-backed GREEN

- package internal checksum integrity
- package tests
- scalar v2 reproduction
- learned sequence v2 numerical reproduction of the existing exploratory held-out result
- preservation of negative HTAM/PABIM learned findings
- development-only robust/change-aware baseline screens
- pre-fix/post-fix diagnostic bug lineage
- confirmatory-seed non-access

### Still BLOCKED / RED for a positive-method submission

- no candidate mechanism yet passes the frozen robustness + clean + shift gates
- no faithful robust BOCPD / generalized-Bayes / AO-IO filter in the common learned harness yet
- no final untouched confirmatory execution
- no two external temporal datasets
- no full mandatory ablation matrix
- no independent clean-clone reproduction by a second operator
- novelty remains high-risk under close robust-filtering/changepoint prior art

## Next scientific action

Implement the strongest explicit change-aware robust baseline in the common learned recurrent harness before designing another named IRIS mechanism. The confirmed-change comparator developed here is a useful lower-complexity control, but it still trades away Student-t2 robustness and therefore does not solve the target problem.

**Do not touch final/reserved confirmatory seeds until code, baselines, hyperparameters and advancement rules are legitimately frozen.**
