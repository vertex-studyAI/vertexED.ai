# IRIS v0.2 — SCIENTIFIC CLAIM FREEZE

**Freeze date:** 2026-08-14  
**State:** `D — NEGATIVE / MIXED RESULT`  
**Current package authority:** `IRIS_REPRO_STATUS_20260813.md`, `IRIS_BASELINE_AUDIT_20260813.md`, frozen evidence archives referenced there, and `IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md`.  
**Rule:** this file freezes interpretation; it does not create a new positive successor result and does not authorize confirmatory seeds.

## QUESTION

Can a history-conditioned bounded-influence recurrent write improve robustness to isolated heavy-tailed observation corruption over strong robust controls **without sacrificing clean tracking or adaptation to persistent location shifts**, and does that effect transfer from the corrected scalar diagnostic into a matched learned recurrent setting?

## HYPOTHESIS — v0.2 family

A useful IRIS/HTAM-style mechanism should jointly satisfy all three conditions:

1. improve isolated heavy-tail/corruption tracking relative to a matched Huber-class robust update;
2. preserve clean performance within a predeclared non-inferiority boundary;
3. remain competitive under persistent regime changes rather than treating persistent change as an outlier indefinitely.

A learned successor must preserve the same tradeoff in a matched recurrent setting rather than relying on a scalar-only effect.

## MECHANISM

The tested v0.2 family uses **history-conditioned bounded influence**: incoming evidence is robustly downweighted when it looks like an isolated outlier, with history/persistence signals intended to distinguish transient corruption from a persistent state change.

The tested learned family includes:

- **HTAM** — the history-conditioned bounded-influence write;
- **PABIM** — a persistence-aware bounded-influence mixture intended to move the write rule toward a more permissive branch when prior evidence indicates a persistent shift.

This mechanism creates an unavoidable scientific tension: opening rapidly to persistent change can improve regime adaptation while increasing false opens under isolated heavy-tailed corruption. The stronger development baselines confirm that this tradeoff, not raw recovery speed alone, is the central question.

## NOVELTY BOUNDARY

### Established / prior-art categories

Not novel merely by inclusion:

- robust bounded-influence estimation;
- Huber-style robust updates;
- changepoint detection / switching filters;
- recurrent learned state updates;
- dual-timescale or adaptive online estimators;
- persistence/change gates.

### Implementation novelty

Potentially useful but not a scientific claim by itself:

- the exact recovered HTAM/PABIM implementation and reproducible benchmark package;
- byte-/hash-addressed result regeneration and retained failure evidence;
- explicit false-open/recovery metric freeze for future successor testing.

### Combination novelty

**Plausible, not yet audited externally.** The exact history-conditioned bounded-influence + persistence-aware recurrent write may be a distinctive combination, but a novelty audit against robust filtering, adaptive estimation, changepoint and learned-memory literature is still required.

### Mechanism novelty

**Not established.** The current learned result does not beat strong simple controls consistently, so no causal mechanism advantage is supported.

### Theoretical novelty

**Not established.** No theorem or derived optimality/generalization result is claimed.

### Empirical novelty

**Bounded and potentially useful:** a corrected scalar heavy-tail advantage coexists with a regime-shift failure and fails to transfer cleanly into the current learned recurrent family. The false-open/adaptation tradeoff is a defensible empirical failure observation within the frozen synthetic tasks.

## PRIMARY CLAIM — CURRENTLY SUPPORTED

IRIS v0.2 is a reproducible **mixed/negative synthetic result**:

1. In the corrected scalar EXP-004 screen against common-scale Huber cap-4, HTAM shows localized heavy-tail gains:
   - Student-t(2): `+30.27%` relative MSE improvement, bootstrap 95% CI `[28.71%, 31.80%]`;
   - Student-t(3): `+19.33%`, CI `[17.66%, 21.00%]`.
2. The universal shift claim is falsified in the same scalar family:
   - abrupt regime: HTAM `-7.27%` relative improvement, i.e. worse than Huber, CI `[-9.18%, -5.24%]`.
3. Scalar-to-learned transfer is not supported by EXP-003:
   - HTAM is materially worse than Huber-4 on clean and regime MSE;
   - PABIM improves the regime failure relative to HTAM but remains ~`25.1%` worse than Huber-4 on clean MSE and ~`43.0%` worse on regime MSE in the retained learned comparison.
4. Stronger development baselines raise the bar further:
   - confirmed-change Huber improves abrupt-regime MSE by `7.77%` versus plain Huber while paying a `5.32%` Student-t(2) degradation;
   - a robust CUSUM-style switch reduces abrupt recovery from `23.1` to `13.8` steps but false-opens aggressively under Student-t(2), contamination and spikes (`0.4072`, `0.4559`, `0.4221`).

The result is therefore scientifically about a **robustness–adaptation tradeoff**, not broad IRIS superiority.

## DEVELOPMENT SUCCESSOR CANDIDATE — FROZEN NEGATIVE STATE

A later development candidate recorded approximately `5.33–5.36%` abrupt-regime improvement over fixed HTAM, below a frozen `>=10%` promotion gate. It did not cleanly beat Huber on the relevant abrupt comparison, and coherent burst outliers remained adverse.

**Verdict:** candidate `RED / DEVELOPMENT GATE FAILED`.

This candidate must not be promoted by opening a reserved confirmatory block or by lowering the `>=10%` gate after observation.

## NON-CLAIMS

Current evidence does **not** establish:

- universal distribution-shift robustness;
- a new robust-filtering architecture;
- superiority to Huber-class estimators overall;
- superiority to strong robust changepoint/switching filters;
- learned-memory superiority;
- external real-world time-series benefit;
- novelty;
- publication readiness;
- confirmatory significance;
- production usefulness.

## FALSIFIER

For the broad v0.2 hypothesis, any of the following defeats promotion:

1. heavy-tail gains disappear against a fair common-scale robust baseline;
2. clean performance violates the frozen non-inferiority boundary;
3. persistent-shift adaptation remains materially worse than a strong simple robust/change-aware baseline;
4. a faster gate achieves apparent shift performance only by unacceptable false-open behavior under isolated corruption;
5. the effect fails to transfer into the matched learned recurrent setting.

The current evidence triggers conditions 3 and 5, and exposes condition 4 as a central successor risk. Therefore v0.2 is closed as mixed/negative.

## DANGEROUS BASELINES FOR ANY SUCCESSOR

Before any positive successor claim, a common matched harness should include, where task-appropriate:

1. plain Huber / static robust update;
2. confirmed-change Huber or equivalent simple robust change-aware estimator;
3. robust CUSUM / changepoint / switching filter;
4. clipped or non-stationary robust online estimator;
5. current frozen HTAM/PABIM mechanism;
6. matched GRU/LSTM;
7. compact state-space model when compute and task make it fair;
8. oracle-reset or oracle-change control only as an upper-bound diagnostic, never as a deployable comparator.

A successor that only beats fixed HTAM is not scientifically sufficient.

## FROZEN ADAPTATION METRICS FOR A FUTURE SUCCESSOR

The later sequence-level metric freeze remains authoritative for future sequence adaptation work:

- `TWMSE25` — normalized MSE over the first 25 post-change samples;
- `recovery_steps` — first time within 10% of jump magnitude for 5 consecutive samples, with non-recovery right-censored;
- `POST_MSE50PLUS` — stable post-change MSE after sample 50 when eligible;
- `false_open_rate` on no-persistent-change conditions for gate-bearing methods.

Recovery speed cannot be interpreted alone; recovery fraction, false-open rate and stable post-change error must accompany it.

## CONFIRMATORY-SEED AUTHORITY RECONCILIATION

Two historical documents refer to different future blocks:

- the recovered v0.2 package **suggests** `200–219` as a future untouched block;
- the later explicit sequence-adaptation metric freeze **quarantines `1000–1029`** and forbids access until the successor mechanism, baseline family, metrics, statistic, thresholds and falsifier are frozen.

To remove ambiguity without rewriting history:

1. `200–219` remains an **unused historical suggestion**, not an authorized confirmatory block;
2. `1000–1029` is the **current reserved sequence-successor confirmatory block** because it is named by the later explicit preregistration/freeze;
3. **neither block may be accessed now**;
4. any different block requires a new versioned protocol written before access;
5. no seed block may be used to select metric constants, mechanism variants or thresholds.

## SUCCESSOR ADVANCEMENT GATE

A successor may reach confirmatory evaluation only if a new versioned protocol is frozen **before** accessing `1000–1029` and development/stress evidence jointly shows:

- clean non-inferiority under an explicit threshold;
- isolated heavy-tail/corruption performance competitive with the strongest robust controls;
- false-open behavior inside a frozen acceptable boundary;
- persistent-shift performance competitive on both `TWMSE25` and recovery behavior against strong change-aware baselines;
- acceptable `POST_MSE50PLUS`;
- matched parameter/training/runtime/memory accounting;
- all mechanism ablations required to attribute the effect;
- a predeclared primary effect statistic and promotion threshold;
- an explicit stop rule if development fails.

The existing ~`5.33–5.36%` candidate does not satisfy this gate and remains frozen negative.

## REPRODUCIBILITY BOUNDARY

The recovered package archive `IRIS_v0.2_research_package(1).zip`, SHA-256 `5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`, reproduced with:

- package integrity PASS;
- 4 tests passed;
- scalar and learned runs exit 0;
- raw/summary/paired CSVs byte-identical to packaged evidence in the cited clean rerun;
- regenerated figures/tables hash-identical;
- runtime-bearing manifests changed only in runtime fields.

A separate reproduction showed only low-order learned floating-point drift with unchanged conclusions. Therefore the supported claim is reproducibility of the scientific result/evidence package, not universal byte identity across every environment.

## EXTERNAL VALIDATION BOUNDARY

Still required before any external/generalization claim:

- at least two chronological external temporal datasets;
- independent non-author reproduction;
- novelty audit against close robust-filtering/changepoint/online-estimation prior art;
- canonical Git source revision for the original IRIS source package;
- external reviewer attack of baseline fairness and adaptation metrics.

## FINAL v0.2 STATE

`GREEN — REPRODUCIBLE MIXED/NEGATIVE EVIDENCE`  
`RED — POSITIVE MECHANISM / SUPERIORITY CLAIM`  
`RED — SUCCESSOR PROMOTION`  
`LOCKED — CONFIRMATORY SEEDS`  
`BLOCKED_EXTERNAL — REAL-DATA / INDEPENDENT VALIDATION`
