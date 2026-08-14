# IRIS SUCCESSOR DECISION — 2026-08-14

**Decision:** **NO NEW IRIS SUCCESSOR ARCHITECTURE IS AUTHORIZED YET.**  
**Current v0.2 / failed-successor evidence:** preserved unchanged.  
**Reserved confirmatory seeds `1000–1029`:** remain quarantined.

## Why

The current development candidate does not pass its promotion gate:

- abrupt-regime gain is only about `5.33–5.36%` against the frozen `>=10%` target;
- the candidate is not cleanly better than Huber/static controls;
- coherent-burst corruption remains adverse;
- the existing baseline audit shows that a robust CUSUM-style switch can recover abrupt changes faster while false-opening very aggressively under isolated corruption;
- a simple confirmed-change Huber comparator improves abrupt-regime behavior without universally winning heavy-tail conditions.

This is not evidence that the underlying scientific problem is unimportant. It is evidence that the next unit of work must isolate the problem better before another mechanism is named.

## Originality pressure

The external literature audit confirms that robust changepoint detection under outliers/heavy tails is an established problem, and current 2026 work directly studies **online change-point detection under heavy-tailedness and Huber contamination**. Therefore a successor cannot claim novelty merely by combining a robust estimator with a change gate or adaptive memory.

The potentially defensible residual question is narrower:

> **At a controlled false-open budget, can an online state estimator adapt to persistent mean/regime change faster and with lower transition/post-change estimation error than strong robust detector-plus-estimator systems, without sacrificing isolated-corruption or clean-data performance?**

That is an estimation/tracking question with explicit recovery and false-open constraints, not generic “robust memory.”

## Next gate — baseline frontier before learned successor

The next eligible IRIS development experiment is **not** a new architecture. It is a separately frozen baseline-frontier protocol comparing, where feasible in one harness:

1. plain Huber/static robust update;
2. confirmed-change Huber;
3. robust CUSUM/switching baseline;
4. dual-timescale Huber;
5. oracle-reset Huber as a diagnostic upper bound;
6. current frozen IRIS mechanism for reference;
7. a competent learned recurrent/state-space robust baseline only after its budget is matched and frozen.

Primary outputs must use the already frozen adaptation metrics:

- `TWMSE25`;
- right-censored recovery behavior plus recovery fraction;
- `POST_MSE50PLUS`;
- false-open rate for gate-bearing methods;
- clean/heavy-tail MSE;
- parameter/FLOP/runtime/memory accounting when learned models are present.

## Required anti-confound

A successor cannot be promoted because it recovers faster while simply opening more often. Comparisons must either:

- operate at a **predeclared false-open constraint/budget**, or
- report a frozen Pareto analysis in which recovery/transition error is shown jointly with false-open behavior.

Thresholds, sweep ranges, interpolation rules, primary summary statistic and promotion criterion must be specified before viewing the new comparison outputs.

## Falsifier for the research direction

The learned-successor direction should be **killed for this cycle** if a simple robust detector + robust estimator achieves the same or better false-open/recovery/post-change frontier on development/stress conditions and the remaining difference is not practically meaningful.

If the simple baseline frontier exposes a persistent residual failure, a learned successor may be designed only after writing:

- changed hypothesis;
- explicit mechanism intended to address that residual failure;
- closest prior-work distinction;
- frozen baseline family;
- primary statistic and minimum effect;
- falsifier;
- compute budget;
- stop rule;
- external temporal dataset plan.

## Confirmatory boundary

Seeds `1000–1029` remain forbidden until the entire successor mechanism and protocol above are frozen. They cannot be used to choose thresholds, false-open budgets, architectures, loss terms, or baseline variants.

## Current scientific state

- **GREEN — reproducible mixed/negative v0.2 package.**
- **GREEN — stronger development baseline audit complete.**
- **RED — current successor promotion gate.**
- **CLOSED/NOT AUTHORIZED — unfrozen successor architecture search.**
- **NEXT — baseline-frontier protocol, development only, if resources remain after LAM-JEPA/NeuroCAD closure work.**

This decision deliberately reduces active research branching while preserving the scientific question and all failed evidence.
