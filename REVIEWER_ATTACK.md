# REVIEWER_ATTACK

**Date:** 2026-08-14  
**Purpose:** attack the current Tier-S research stories before new confirmatory compute. These are deliberately adversarial reviews; they do not imply rejection or failure unless the evidence supports it.

---

# LAM-JEPA

## Reviewer 1 — Scientific skeptic

- **Strongest criticism:** The architecture combines established JEPA, latent-action/world-model, quantization, planning and verification ideas. On the one benchmark with frozen evidence, the proposed mechanisms do not show the required contribution. Why is this a research paper rather than a well-documented failed prototype?
- **Severity:** **HIGH** for an architecture paper; **MEDIUM** for a falsification/reproducibility paper.
- **Evidence required to answer:** a conservative related-work map; precise source-verified module description; explanation of why the negative result teaches something beyond “this model did not work”; immutable artifact/protocol chain.
- **Cheapest decisive work:** finish the negative manuscript around matched controls, adverse-result retention, trainability-versus-generalization separation, and the locked-test stop rule. Do not run rescue experiments.
- **Acceptance threat:** **CRITICAL** if submitted as a new-method paper; manageable if venue/story explicitly values reproducibility/negative results.

## Reviewer 2 — Experimental skeptic

- **Strongest criticism:** Five validation seeds on one small multiple-choice benchmark are narrow; the bounded pretrained comparison is not a final strong baseline study; shuffled-label performance is unexpectedly competitive and may indicate optimization instability or a weak signal rather than an informative representation-learning test.
- **Severity:** **HIGH**.
- **Evidence required to answer:** exact per-seed outputs, eligibility/exclusion records, matched active-parameter accounting, confidence intervals, trainability diagnostics, independent metric recomputation, and a clear statement that the DeBERTa result is characterization only.
- **Cheapest decisive work:** independently regenerate all manuscript tables/intervals from retained raw artifacts and surface the shuffled-label result in the main analysis rather than hiding it.
- **Acceptance threat:** **HIGH**. More benchmarks could improve breadth, but they must be a new preregistered study rather than a post-hoc rescue of this hypothesis.

## Reviewer 3 — Mechanism skeptic

- **Strongest criticism:** The planner ablation is near zero and the no-target configuration is numerically better. The claimed JEPA/planning mechanism therefore has no demonstrated causal role in the current ARC result.
- **Severity:** **CRITICAL** for mechanism claims.
- **Evidence required to answer:** none can retroactively create a positive mechanism result. The current paper must accept the falsification.
- **Cheapest decisive work:** rewrite the method/discussion so architecture description is separated from empirically supported contribution; mark planner/target benefit as unsupported.
- **Acceptance threat:** **CRITICAL** to superiority/mechanism framing; **LOW** to the integrity of a negative-result paper.

### LAM decision

**Keep Tier S only as a paper-conversion/reproducibility effort. Do not allocate scientific rescue compute.**

---

# NeuroCAD

## Reviewer 1 — Scientific skeptic

- **Strongest criticism:** Text-to-parametric-CAD, CAD-program generation, and programmatic geometric validation are already established. A deterministic grammar/validator for rectangular plates may be useful software but does not by itself establish research novelty.
- **Severity:** **HIGH**.
- **Evidence required to answer:** a clear reliability-first question, contemporary prior-work comparison, and evidence that typed fail-closed compilation changes the reliability/coverage tradeoff beyond a trivial grammar advantage.
- **Cheapest decisive experiment:** freeze a same-prompt comparison between the typed/validated pipeline and a competent model-based direct/program-generation system, scoring execution, exact dimensions/constraints, unsupported-input rejection, semantic correctness, latency/cost and coverage.
- **Acceptance threat:** **HIGH** for a general text-to-CAD paper; **MEDIUM** for a constrained-reliability/system paper.

## Reviewer 2 — Experimental skeptic

- **Strongest criticism:** The current 20-case held-out benchmark covers one part family and the direct flat-extraction baseline is weak. The observed 19/20 versus 12/20 gap could be almost entirely determined by benchmark construction and hand-coded validation.
- **Severity:** **CRITICAL**.
- **Evidence required to answer:** broader part families and paraphrases, held-out compositional structures, contemporary learned/program-generation baseline, frozen prompt set, real kernel execution, syntax/geometry/semantic metrics, uncertainty/failure frequencies, and independent metric recomputation.
- **Cheapest decisive experiment:** before expansion, run one frozen dangerous-baseline set on the existing 20 cases plus a separately frozen OOD family. Do not expand after seeing baseline errors.
- **Acceptance threat:** **CRITICAL** until addressed.

## Reviewer 3 — Mechanism skeptic

- **Strongest criticism:** The improvement may come from a deterministic parser plus validation checks, not from the typed intermediate representation itself. “Typed IR” may be a label for standard compiler discipline.
- **Severity:** **HIGH**.
- **Evidence required to answer:** component ablations: parser-only/direct structured extraction; typed IR without validation; validation without typed normalization where feasible; full compiler; possibly constrained direct generation using the same validator.
- **Cheapest decisive experiment:** freeze four systems under identical prompts/backend and measure where each valid/invalid case changes verdict. The current retained negative-width failure must remain in v1.
- **Acceptance threat:** **HIGH** for a mechanism paper; lower for an engineering reliability report.

### NeuroCAD decision

**Keep Tier S, but paper promotion is conditional on a dangerous learned/direct baseline and component ablation. Current positive result remains bounded and valid.**

---

# IRIS

## Reviewer 1 — Scientific skeptic

- **Strongest criticism:** Robust changepoint detection under outliers and heavy tails is an established literature, and very recent work studies online mean-change detection under both heavy-tailedness and Huber contamination. The current “robust memory” framing risks renaming a known robust filtering/change-detection problem.
- **Severity:** **CRITICAL**.
- **Evidence required to answer:** explicit distinction between detection and state estimation/tracking; closest robust-online-change baselines; a question that is not already answered by robust detection theory; conservative mechanism claim.
- **Cheapest decisive work:** make the scientific object the **false-open / recovery / post-change-estimation Pareto frontier**, and compare simple robust detector+estimator systems before designing another learned architecture.
- **Acceptance threat:** **CRITICAL** to novelty if ignored.

## Reviewer 2 — Experimental skeptic

- **Strongest criticism:** Current evidence is synthetic-heavy, the learned mechanism does not beat strong Huber/static controls, and strong learned robust/change-aware recurrent/state-space baselines are not yet in one matched harness. The successor gate already failed.
- **Severity:** **CRITICAL**.
- **Evidence required to answer:** matched Huber, confirmed-change, robust switching, dual-timescale, current IRIS, recurrent/state-space controls; parameter/FLOP/runtime accounting; external chronological datasets; frozen transition and false-open metrics; untouched confirmatory seeds.
- **Cheapest decisive experiment:** no successor model. First freeze and evaluate a simple non-learned robust detector + robust state estimator at a predeclared false-open budget on existing development/stress seeds.
- **Acceptance threat:** **CRITICAL** until the baseline frontier is known.

## Reviewer 3 — Mechanism skeptic

- **Strongest criticism:** Faster recovery can be purchased by opening a change gate more often. The observed adaptation may therefore be threshold behavior rather than a new memory mechanism; current evidence already shows this confound with robust CUSUM-style switching.
- **Severity:** **CRITICAL**.
- **Evidence required to answer:** recovery conditioned on comparable false-open behavior; transition-window normalized error; right-censored recovery; stable post-change error; gate-state traces; fixed threshold/protocol; oracle and component controls.
- **Cheapest decisive experiment:** a preregistered false-open-constrained comparison or Pareto analysis using the already frozen adaptation metrics, without touching confirmatory seeds.
- **Acceptance threat:** **CRITICAL** to a mechanism claim, but this can become a useful negative/tradeoff paper if preserved.

### IRIS decision

**Do not authorize a new successor architecture yet. Preserve the negative/mixed v0.2 package. The next scientific unit is a baseline-frontier experiment, not a renamed model.**

---

# Percy

## Reviewer 1 — Scientific skeptic

- **Strongest criticism:** Artifact hashing, durable queues, leases, DAGs, provider routing, task deduplication and reproducibility bundles are individually standard systems patterns. What is the new systems question?
- **Severity:** **HIGH** for publication; low for product engineering.
- **Evidence required:** precise comparative question and baseline systems.
- **Cheapest decisive work:** real-host qualification first; publication protocol later.
- **Acceptance threat:** **CRITICAL** if submitted before empirical comparison.

## Reviewer 2 — Experimental skeptic

- **Strongest criticism:** Logical agent counts and registry size do not establish throughput, fault tolerance or correctness. Live queue/process truth is currently unavailable from the connected surface.
- **Severity:** **CRITICAL**.
- **Evidence required:** preserved DB/WAL snapshot, crash/restart, stale lease, provider failure, duplicate-dispatch, soak, throughput/cost and resource measurements.
- **Cheapest decisive experiment:** `PERCY-STATE-001` on the existing host, then a bounded fault matrix with preserved state.
- **Acceptance threat:** **CRITICAL** until real-host evidence exists.

## Reviewer 3 — Mechanism skeptic

- **Strongest criticism:** Any apparent reliability gain could come from conservative serialization or reduced concurrency rather than evidence-native task semantics.
- **Severity:** **HIGH**.
- **Evidence required:** matched workload and concurrency comparison with/without evidence/claim gating, measuring duplicated work, unverifiable completion, recovery and throughput.
- **Cheapest decisive experiment:** deferred until host qualification; first establish a stable measured baseline.
- **Acceptance threat:** **HIGH**.

### Percy decision

**Tier S as infrastructure only. Research-paper promotion remains blocked on real-host qualification and matched-system evidence.**

---

# Experiments authorized by this review

This review **does not authorize** confirmatory/rescue runs for LAM-JEPA, IRIS v0.2 or NGMT v0.1.

The only currently justified new major scientific experiment remains the NeuroCAD dangerous-baseline/OOD experiment **after** its complete protocol is frozen. IRIS may run a future baseline-frontier development experiment only after a new immutable protocol specifies methods, seeds, false-open budget/metric hierarchy, falsifier and stop rule; confirmatory seeds remain quarantined.
