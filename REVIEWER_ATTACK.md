# REVIEWER_ATTACK

**Date:** 2026-08-14  
**Purpose:** adversarial review of the current high-priority research stories using the latest canonical evidence. Reviewer criticism is not evidence by itself; where a decisive experiment has already fired, this file accepts the result instead of keeping the old hypothesis alive.

---

# LAM-JEPA

## Reviewer 1 — Scientific skeptic
- **Strongest criticism:** JEPA for language/reasoning and latent-action/world-model ingredients are established directions; the frozen ARC experiment does not demonstrate planner/target contribution.
- **Severity:** **HIGH** for a new-method paper; **MEDIUM** for a falsification/reproducibility paper.
- **Evidence required:** source-grounded method map, closest-work comparison, immutable artifact/protocol chain, and a clear statement that the contribution is negative empirical evidence rather than first-method novelty.
- **Cheapest decisive work:** finish the negative manuscript/release package. **Do not run rescue experiments or unlock the held-out test.**
- **Acceptance threat:** **CRITICAL** if framed as architecture superiority; manageable if framed narrowly as reproducibility/falsification.

## Reviewer 2 — Experimental skeptic
- **Strongest criticism:** five validation seeds on one benchmark are narrow, the pretrained characterization is bounded, and shuffled-label performance is unexpectedly competitive.
- **Severity:** **HIGH**.
- **Evidence required:** exact per-seed outputs, confidence intervals, active-parameter accounting, trainability diagnostics, independent metric/table/figure regeneration, and explicit scope limitations.
- **Cheapest decisive work:** `LAM-VERIFY-002`, using retained artifacts only.
- **Acceptance threat:** **HIGH** if conclusions generalize beyond the frozen configuration.

## Reviewer 3 — Mechanism skeptic
- **Strongest criticism:** planner ablation is near zero and no-target is numerically better; the named planner/target mechanisms therefore have no demonstrated causal role in the current ARC result.
- **Severity:** **CRITICAL** for mechanism claims.
- **Evidence required:** none can retroactively create a positive mechanism result.
- **Cheapest decisive work:** keep the unsupported mechanism claims out of title/abstract/conclusion and preserve the null/negative result.
- **Acceptance threat:** low to the integrity of a negative-result paper, critical to a mechanism-success paper.

### LAM decision
**Tier S as paper-conversion/reproducibility work. No scientific rescue compute.**

---

# IRIS v0.2

## Reviewer 1 — Scientific skeptic
- **Strongest criticism:** robust changepoint handling under outliers/heavy tails is established; “robust memory” risks renaming a known robust filtering/change-detection problem.
- **Severity:** **CRITICAL**.
- **Evidence required:** explicit detection-vs-state-estimation distinction, closest robust-online-change baselines, and a residual question centered on a false-open/recovery/error frontier.
- **Cheapest decisive work:** recover the exact frozen baseline-frontier source/raw data; do not invent a new successor architecture.
- **Acceptance threat:** **CRITICAL** to novelty if ignored.

## Reviewer 2 — Experimental skeptic
- **Strongest criticism:** the evidence is synthetic/development-heavy, the successor misses its frozen `>=10%` adaptation gate, and strong simple controls already expose a robustness/adaptation tradeoff.
- **Severity:** **CRITICAL** for a positive paper.
- **Evidence required:** exact frozen frontier methods/parameters, fixed false-open budget or preregistered Pareto metric, external chronological data only if a residual survives, untouched seeds `1000–1029`.
- **Cheapest decisive work:** `IRIS-FRONTIER-SOURCE-001`; if canonical source/raw trajectories cannot be recovered, remain source-blocked.
- **Acceptance threat:** manageable for a bounded negative/tradeoff report; critical for successor-superiority claims.

## Reviewer 3 — Mechanism skeptic
- **Strongest criticism:** faster recovery can be purchased simply by opening a change gate more often. Current robust-CUSUM behavior already exhibits this confound.
- **Severity:** **CRITICAL**.
- **Evidence required:** recovery/error compared under a matched false-open constraint or preregistered Pareto frontier, with fixed thresholds and oracle/component controls.
- **Cheapest decisive work:** the already frozen development-only frontier—if its exact source can be recovered.
- **Acceptance threat:** **CRITICAL** to any claimed new-memory mechanism.

### IRIS decision
**D — NEGATIVE RESULT. No successor architecture is authorized. Reserved confirmatory seeds remain quarantined.**

---

# NeuroCAD

## Decisive evidence update
Frozen v1 remains historical evidence: typed/validated `19/20` versus original direct `12/20`, with `12/12` valid cases producing non-empty STL and the O018 negative-width failure preserved.

The later component protocol was frozen before execution and produced:
- current typed + validation: `20/20`;
- original direct: `12/20`;
- direct + matched fail-closed validation: `20/20`;
- validation recovery fraction: `1.00`;
- remaining gap: `0`;
- frozen interpretation: **`VALIDATION_DOMINANT`**.

## Reviewer 1 — Scientific skeptic
- **Strongest criticism:** text-to-CAD, executable CAD-program generation and programmatic validation are established; current evidence supports a bounded software tool, not a new typed-IR mechanism.
- **Severity:** **CRITICAL** for a mechanism paper; low for productization.
- **Evidence required:** none can rescue the current typed-parser causal claim on these cases. Any new research claim must be separately versioned and use fresh broader tasks and competent contemporary baselines.
- **Cheapest decisive work:** product validation/release qualification, not another current-version mechanism experiment.
- **Acceptance threat:** **current typed-IR mechanism paper is not supported.**

## Reviewer 2 — Experimental skeptic
- **Strongest criticism:** the reused 20-case plate family is too narrow for general text-to-CAD conclusions.
- **Severity:** **CRITICAL** for generality.
- **Evidence required:** only for a future distinct research project: fresh part families/OOD/compositional tasks, same-provider learned direct/program and constrained generation baselines, execution/semantic/coverage metrics and independent replay.
- **Cheapest decisive work now:** keep those claims out of the current product/release story.
- **Acceptance threat:** high to any general research claim.

## Reviewer 3 — Mechanism skeptic
- **Strongest criticism:** the old gap may be entirely validation rather than typed IR/parser structure.
- **Severity:** **RESOLVED AGAINST THE MECHANISM.**
- **Evidence:** the frozen matched-validation ablation closes 100% of the gap (`1.00` vs `1.00`).
- **Cheapest decisive experiment:** already done.
- **Acceptance threat:** typed-IR/parser-specific causal claim rejected on this diagnostic.

### NeuroCAD decision
**B — PRODUCTIZE. Preserve v1 and v2; do not revive the falsified typed-parser mechanism. A future research successor must be separately versioned/frozen and earn its own state.**

---

# Percy

## Reviewer 1 — Scientific skeptic
- **Strongest criticism:** hashing, durable queues, leases, DAGs, provider routing, deduplication and reproducibility bundles are individually standard systems patterns. The scientific novelty question is not yet isolated.
- **Severity:** **HIGH** for publication; low for product engineering.
- **Evidence required:** a precise comparative question and competent orchestration/workflow baselines.
- **Cheapest decisive work:** real-host qualification first; publication protocol later.
- **Acceptance threat:** **CRITICAL** if submitted before comparative evidence.

## Reviewer 2 — Experimental skeptic
- **Strongest criticism:** 16,256 logical identities do not establish physical concurrency, throughput, fault tolerance or correctness; current live host counters remain unobserved here.
- **Severity:** **CRITICAL**.
- **Evidence required:** preserved DB/WAL/checkpoint snapshot, crash/restart, stale lease, duplicate-claim, provider-failure, interrupted-artifact, soak, throughput/cost and resource measurements.
- **Cheapest decisive work:** `PERCY-STATE-001`, then disposable fault fixtures from `PERCY_RELIABILITY_PLAN.md`.
- **Acceptance threat:** critical until real-host evidence exists.

## Reviewer 3 — Mechanism skeptic
- **Strongest criticism:** apparent reliability may come from lower concurrency or conservative serialization, not evidence-native semantics.
- **Severity:** **HIGH**.
- **Evidence required:** matched workload/concurrency comparison with and without evidence/claim gating after host qualification.
- **Cheapest decisive work:** first establish a stable measured host baseline and concurrency knee.
- **Acceptance threat:** high to any systems-research mechanism claim.

### Percy decision
**B — PRODUCTIZE, Tier S as enabling infrastructure. Research-paper promotion remains blocked on real-host qualification and matched-system evidence.**

---

# Experiment authorization from this review

This review authorizes **no rescue or confirmatory run** for LAM-JEPA, IRIS v0.2, NeuroCAD's falsified typed-parser mechanism, NGMT v0.1, Eigen-JEPA or T2424-1863.

Current next work is recovery/verification/protocol closure. Darcy and JEPA×time-series may become runnable only after their separately frozen protocols and source prerequisites pass the canonical queue gates. Unused compute should remain unused rather than being filled by speculative experiments.
