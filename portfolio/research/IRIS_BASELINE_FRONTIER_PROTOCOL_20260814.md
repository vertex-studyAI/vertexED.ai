# IRIS Baseline-Frontier Protocol — 2026-08-14

**Experiment ID:** `IRIS-FRONTIER-DEV-20260814`  
**State:** `FROZEN_DEVELOPMENT_ONLY / EXECUTION_BLOCKED_ON_CANONICAL_RAW_SOURCE`  
**Purpose:** determine whether a learned/new IRIS successor is scientifically justified at all.  
**Confirmatory seeds `1000–1029`: FORBIDDEN.**

## 1. Decision question

> At a strict false-open budget, do simple robust detector-plus-estimator baselines already occupy the useful recovery/transition-error frontier, or is there a practically meaningful residual gap to the oracle-reset diagnostic that could justify a separately designed learned successor?

This protocol does **not** test a new IRIS architecture. The current IRIS/PABIM result stays negative/mixed.

## 2. Evidence inherited without modification

This freeze inherits the already reproduced development evidence and does not alter its methods, seeds, data or parameterizations:

- development seeds: `0–9`;
- stress seeds: `10–19` only where already defined by the retained package;
- conditions: Gaussian, Student-t(2), contaminated, spikes, abrupt regime, drift, tail shift;
- existing methods: `huber_cap4`, `htam`, `pabim`, `robust_cusum_switch`, `dual_timescale_huber`, `oracle_reset_huber`;
- separately reproduced confirmed-change Huber comparator;
- adaptation metrics frozen in `IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md`.

Previously observed facts are context, not new results: confirmed-change Huber improves abrupt-regime recovery from `23.1` to `17.1` steps while degrading Student-t(2) MSE by about `5.32%`; robust CUSUM recovers in `13.8` steps but false-opens around `0.41–0.46` under isolated corruption. Those observations motivate the anti-confound below and must not be used to retune this protocol.

## 3. Systems in the primary frontier

Use the exact retained implementations/parameters from the reproduced development package:

1. **Huber cap-4** — non-gated robust reference.
2. **Confirmed-change Huber** — simple robust estimator plus persistence/change confirmation.
3. **Robust CUSUM switching** — fast change-aware comparator expected to stress the false-open tradeoff.
4. **Dual-timescale Huber** — simple adaptation comparator.
5. **Current frozen IRIS/PABIM** — reference only; no parameter changes.
6. **Oracle-reset Huber** — diagnostic upper-bound reference using known synthetic changepoint; never described as deployable.

`HTAM` may be retained as historical context but is not required for the primary successor-worthiness decision because the stronger simple controls above already attack the relevant failure mode.

No learned recurrent/state-space model is introduced in this experiment. A learned baseline becomes eligible only after this simple frontier leaves a residual gap.

## 4. Frozen data boundary

### Primary decision set

Use **development seeds `0–9` only** for the primary frontier decision so that the existing reproduced methods can be compared without touching quarantined confirmatory data.

### Stress set

Seeds `10–19` may be used only if the retained package already defines them for the same generator/condition and the exact raw sequences are recoverable without regeneration ambiguity. Stress results are secondary and cannot rescue a failed primary decision.

### Forbidden

- seeds `1000–1029`;
- any new synthetic generator selected after seeing frontier results;
- external real-world datasets in this experiment.

External data belongs to a later validation stage only if a residual scientific question survives.

## 5. Frozen metrics

Use the definitions already frozen in `IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md` without modification:

1. `TWMSE25` — normalized MSE on the first 25 samples from the known abrupt change.
2. recovery fraction.
3. recovery steps, right-censored when recovery is not achieved; report median among recovered sequences plus censoring-aware uncertainty when available.
4. `POST_MSE50PLUS` — persistent post-change tracking error.
5. false-open rate for gate-bearing methods on no-persistent-change conditions.
6. clean/heavy-tail MSE.

Retain seed-level raw rows. Use paired comparisons because methods share generated sequences.

## 6. Frozen false-open eligibility rule

A gate-bearing method is **frontier-eligible** only if, on each of the three isolated-corruption conditions below, its mean false-open rate is at most `0.02`:

- Student-t(2);
- contaminated;
- spikes.

The threshold is per condition, not averaged across conditions.

A method exceeding `0.02` in any one of the three conditions remains reported but is classified `FAST_BY_OVEROPENING` and cannot be used as the winning deployable change-aware baseline.

Non-gated Huber is marked `NOT_APPLICABLE` for false opens and remains eligible as the static reference.

No threshold or gate parameter may be changed to move a method below `0.02` inside this experiment. A threshold sweep would be a separate version with its grid frozen first.

## 7. Primary successor-worthiness statistic

Let `B*` be the frontier-eligible **simple non-oracle** baseline with the lowest mean abrupt-regime `TWMSE25` on seeds `0–9`.

Let `O` be oracle-reset Huber.

Define the oracle residual:

`oracle_residual = (TWMSE25_B* - TWMSE25_O) / max(TWMSE25_B*, 1e-12)`.

Also report:

- `POST_MSE50PLUS_B*` vs oracle;
- recovery fraction and median recovery steps for `B*` vs oracle;
- clean/heavy-tail MSE of `B*` vs Huber;
- all gate-bearing false-open rates.

## 8. Frozen decision rule

### `KILL_LEARNED_SUCCESSOR_THIS_CYCLE`

Declare this if **all** hold:

1. at least one simple change-aware baseline is frontier-eligible under the `0.02` false-open rule;
2. `oracle_residual < 0.10`;
3. `POST_MSE50PLUS_B* <= 1.05 * POST_MSE50PLUS_O`;
4. `B*` recovery fraction is no more than `0.05` below oracle recovery fraction;
5. no clean/isolated-corruption MSE of `B*` is more than `10%` worse than plain Huber.

Interpretation: simple robust methods already close most of the useful oracle gap at acceptable false-open cost, so a learned successor has insufficient residual scientific value for this cycle.

### `RESIDUAL_GAP_EXISTS`

Declare this if the kill rule does not hold **and** the failure is caused by a reproducible residual adaptation gap rather than simple over-opening or a protocol defect. At minimum one of the following must hold for `B*`:

- `oracle_residual >= 0.10`;
- `POST_MSE50PLUS_B* > 1.05 * POST_MSE50PLUS_O`;
- recovery fraction is more than `0.05` below oracle;

while `B*` still satisfies the false-open eligibility rule.

This result only justifies writing a new successor hypothesis. It does not authorize confirmatory seeds.

### `NO_ELIGIBLE_CHANGE_AWARE_BASELINE`

Declare this if every simple gate-bearing change-aware method violates the `0.02` false-open rule. The scientific residual is then specifically **persistent-change detection under a false-open constraint**, not generic robust memory. Any successor must target that residual explicitly.

### `PROTOCOL_BLOCKED`

Declare this if the exact retained raw trajectories, implementations or parameterizations needed to recompute the frozen metrics cannot be recovered. Do not regenerate approximately equivalent data and call it the same experiment.

## 9. Required analyses

For each method retain a table with:

- seed count;
- mean ± sample SD for `TWMSE25` and `POST_MSE50PLUS`;
- recovery fraction;
- median recovery and censoring count;
- false-open rate by no-change condition where applicable;
- clean/heavy-tail MSE;
- runtime and peak memory if the retained execution records them.

For `B*` vs Huber and `B*` vs current IRIS/PABIM, report paired per-seed deltas. Confidence intervals may be reported only from a predeclared paired bootstrap over seeds with **10,000 resamples and RNG seed `20260814`**. With only 10 development seeds, intervals are descriptive and must not be oversold as strong significance evidence.

No p-value is a promotion gate.

## 10. Mechanism interpretation

- If robust CUSUM remains fast but ineligible due to false opens, that supports the existing tradeoff diagnosis; it is not an IRIS win.
- If confirmed-change or dual-timescale Huber closes the oracle gap, the learned-successor direction is killed for this cycle.
- If current IRIS/PABIM is dominated by a simple eligible baseline, preserve that as additional negative evidence.
- If a residual gap remains, the next hypothesis must explain **which residual** it targets: transition error, recovery censoring, post-change bias, or false-open discrimination.

Do not rename the same PABIM mechanism and call it a successor.

## 11. Evidence contract

Before execution, recover and hash:

- canonical raw development trajectories;
- exact implementations for all six primary systems;
- exact retained parameter/config files;
- metric implementation;
- this protocol;
- environment manifest.

After execution retain:

- per-seed/per-condition raw metric rows;
- aggregate tables;
- paired deltas;
- bootstrap outputs if generated;
- stdout/stderr;
- runtime/memory manifest;
- artifact SHA-256;
- independent recomputation verdict.

Any missing source/provenance edge produces `PROTOCOL_BLOCKED`, not an improvised replacement.

## 12. Authorization boundary

At freeze time, this protocol is **not authorized to execute from the GitHub control repo alone** because the canonical raw IRIS development archive/source is not established here as directly runnable. The next action is source/artifact recovery, not reimplementation.

Even after this development frontier executes, seeds `1000–1029` remain forbidden until a **new successor mechanism**, its baseline family, compute budget, primary statistic, minimum effect, falsifier and stop rule are separately frozen.

## 13. Possible outcomes and portfolio action

| Outcome | Portfolio action |
|---|---|
| `KILL_LEARNED_SUCCESSOR_THIS_CYCLE` | IRIS becomes **D — NEGATIVE RESULT / publish-or-archive package**; no significant successor compute for 30 days |
| `RESIDUAL_GAP_EXISTS` | remain **C — CONTINUE EXPERIMENTATION**, but only to design one versioned mechanism aimed at the named residual |
| `NO_ELIGIBLE_CHANGE_AWARE_BASELINE` | continue the question narrowly as constrained change detection; do not claim robust-memory novelty |
| `PROTOCOL_BLOCKED` | mark **F — EXTERNALLY/SOURCE BLOCKED** for new IRIS experimentation while preserving current negative package |

The current v0.2 negative/mixed evidence is unaffected in every outcome.