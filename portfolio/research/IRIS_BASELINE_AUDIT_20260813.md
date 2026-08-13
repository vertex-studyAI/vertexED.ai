# IRIS v0.2 — Development Baseline Audit — 13 August 2026

**Purpose:** strengthen the negative-result package with explicit robust/change-aware comparators without changing the frozen v0.2 result or accessing successor confirmatory seeds.

**Evidence archive:** `/Research/IRIS/IRIS_v0.2_repro_addendum_20260813.zip`  
**Archive SHA-256:** `7653c87d5effb08da9068630259802d77b34b930083dd160ccea4ce23311175b`  
**Archive internal checksum validation:** PASS.  
**Promotion:** development baselines reproduced; positive IRIS/PABIM mechanism remains unsupported.

## Why this audit exists

The existing learned IRIS/PABIM result is mixed/negative: scalar heavy-tail effects survive corrected controls, but the learned mechanism does not beat strong Huber/static controls across clean, corruption and regime conditions. A serious successor therefore needs change-aware robust baselines rather than a weaker comparison set.

This audit runs only development experiments already frozen inside the evidence addendum. It does not alter the current IRIS mechanism and does not touch any successor confirmatory seed block.

## Fresh environment

- Python 3.13.5
- NumPy 2.3.5
- SciPy 1.17.0
- Linux 6.18.35 x86_64

## Confirmed-change Huber baseline

Frozen protocol SHA-256:

`f3714263f0923ccced664bf268f515110b6aa339136a89d0e2bfe3cf198d7701`

Frozen script SHA-256:

`b2ed782037faf3350aed6f61da0750b0def5fcbb871f84a7f6963cd53b05cdf6`

Fresh command:

```bash
python dev_baselines/confirmed_change_baseline/run.py
```

Fresh wall time was about `1.86 s`; peak RSS about `170 MB`. `raw.csv`, `summary.csv`, and `paired.csv` reproduced byte-identically. Only the runtime-bearing manifest changed.

### Result

| Condition | Huber MSE | Confirmed-change MSE | Relative MSE change | False-open rate |
|---|---:|---:|---:|---:|
| Gaussian | 0.042641 | 0.042928 | +0.67% | 0.0030 |
| Student-t(2) | **0.069947** | 0.073670 | **+5.32% worse** | 0.0126 |
| Contaminated | 0.053322 | 0.053633 | +0.58% | 0.0029 |
| Spikes | 0.046525 | 0.046825 | +0.64% | 0.0027 |
| Regime | 0.056618 | **0.052218** | **-7.77% better** | 0.0018 |
| Drift | 0.042652 | 0.043070 | +0.98% | 0.0045 |
| Tail shift | 0.056266 | 0.058498 | +3.97% | 0.0084 |

On the abrupt-regime condition, Huber recovery is `23.1` steps versus `17.1` for the confirmed-change comparator. This is a meaningful stronger baseline for persistent changes. It is not a universal winner: it degrades Student-t(2) MSE by about 5.32% and is slightly worse on several non-regime conditions.

**Interpretation:** the baseline bar is higher. A successor IRIS mechanism must beat or complement a simple robust change-aware comparator rather than claiming a shift advantage against plain Huber alone.

## Robust change-aware development screen

Frozen protocol SHA-256:

`cb52be5c1168017e139ffac4c89a0ad9ed95127f707ddce9fdcf5a27f332b8ec`

Frozen script SHA-256:

`05ed6ff6c3b1ac24b47fcd9057c1376f3074c2e6ae127da2d4dd7f7cdb395194`

Fresh command:

```bash
python dev_baselines/robust_change_screen/run_robust_change_baselines.py
```

Development seeds are `0–9`. Conditions are Gaussian, Student-t(2), contaminated, spikes, abrupt regime, drift, and tail shift. Methods are Huber cap-4, HTAM, PABIM, robust CUSUM switching, dual-timescale Huber, and oracle-reset Huber.

Fresh wall time was about `4.48 s`; peak RSS about `170 MB`. The numerical raw, summary and paired-development CSVs reproduced byte-identically; only the runtime-bearing manifest changed.

The preserved v1 analysis defect is important: v1 incorrectly treated smooth drift as repeated changepoints for recovery/oracle diagnostics. The invalid v1 evidence remains retained. v1.1 changes only diagnostic/oracle condition handling; methods, data, seeds and parameters are unchanged.

### Failure taxonomy sharpened

A robust CUSUM-style switch reduces abrupt-regime recovery from `23.1` steps for Huber to `13.8`, but false-opens aggressively under isolated corruption:

- Student-t(2) false-open rate: `0.4072`;
- contaminated false-open rate: `0.4559`;
- spike false-open rate: `0.4221`.

This makes the scientific problem more precise. Faster change adaptation is easy to obtain by opening a gate more often; the hard requirement is distinguishing persistent change from isolated outliers without paying unacceptable clean/heavy-tail cost.

## Reproduction nuance

Two current rerun attempts of the same main v0.2 package now exist. One clean run in this wave regenerated the raw/summary/paired result CSVs byte-identically. A separate parallel reproduction retained in the addendum reports only floating-point-level differences in the learned sequence outputs, with unchanged sign-flip p-values and conclusions.

Both are retained. The defensible claim is semantic/aggregate reproducibility of the scientific conclusion, not universal byte-exact identity across every learned floating-point execution.

## Current IRIS verdict

The stronger baseline work **does not rescue IRIS**. It reinforces a rigorous negative-result interpretation:

1. corrected scalar HTAM heavy-tail advantages exist on the bounded synthetic task;
2. universal distribution-shift advantage is falsified;
3. scalar-to-learned transfer is falsified for the current mechanism family;
4. PABIM improves HTAM's regime failure but remains weaker than strong Huber/static learned controls;
5. simple change-aware Huber improves regime behavior without dominating heavy-tail conditions;
6. naive robust changepoint switching exposes high false-open rates under isolated corruption.

A positive successor requires a newly frozen mechanism that passes clean, isolated-corruption and persistent-shift gates against these stronger baselines before any untouched confirmatory execution.

## Still blocked

- strong learned robust/change-aware baselines in one common matched recurrent harness;
- GRU/LSTM and compact state-space comparison where compute permits;
- full component ablations and false-open/delayed-open taxonomy;
- two chronological external temporal datasets;
- untouched successor confirmatory seeds selected only after freeze;
- parameter/FLOP/runtime/memory accounting;
- canonical Git source revision;
- independent novelty audit.
