# REVIEWER_ATTACK

**As of:** 2026-08-14 IST  
**Purpose:** identify the cheapest evidence that can kill or strengthen the serious research stories. Reviewers are adversarial to claims, not to preserved evidence.

## LAM-JEPA

### Reviewer 1 — Scientific skeptic

- **Strongest criticism:** the proposed architecture is a stack of established ingredients (joint-embedding prediction, discrete latents, world-model-style transitions, search/planning, EMA targets, memory, verification heads, grokking-oriented training) without evidence that the combination creates a distinct scientific mechanism.
- **Severity:** **HIGH** for a method paper; **LOWER** for a rigorous negative/reproducibility paper.
- **Evidence required:** conservative related-work map; remove novelty claims not tied to evidence; explicitly position the contribution as a frozen negative evaluation/failure analysis.
- **Cheapest decisive work:** manuscript claim scrub + prior-art audit; no new model run.
- **Acceptance threat:** **YES** if submitted as novel architecture; **manageable** if submitted as a bounded negative/reproducibility study with useful failure analysis.

### Reviewer 2 — Experimental skeptic

- **Strongest criticism:** five seeds on one ARC validation setting may be too narrow to support broad conclusions, while opening the locked test now would contaminate the current falsification boundary.
- **Severity:** **HIGH** for broad JEPA/generalization claims; **MODERATE** for exact-configuration negative claim.
- **Evidence required:** raw seedwise results, paired-effect uncertainty, exact baseline matching, negative control, locked-test non-access audit, clear statement that conclusions are configuration-specific.
- **Cheapest decisive work:** independent recomputation of all paper tables and seedwise effect plots from retained raw artifacts.
- **Acceptance threat:** **YES** if claims generalize beyond frozen configuration; **NO** if boundary is kept narrow and provenance is excellent.

### Reviewer 3 — Mechanism skeptic

- **Strongest criticism:** planner/target/quantizer behavior may reflect training instability or prediction-support collapse rather than a theoretically meaningful failure of latent-action reasoning.
- **Severity:** **HIGH** for mechanism interpretation.
- **Evidence required:** failure slicing showing support collapse/trajectory behavior without introducing post-hoc rescue metrics; link any diagnostic to pre-existing retained outputs where possible.
- **Cheapest decisive work:** analyze retained logits/support/trajectory diagnostics; do not run the locked test.
- **Acceptance threat:** **MODERATE**; a paper can survive with a descriptive negative result if mechanism claims are explicitly limited.

**Verdict:** continue paper conversion as **negative/reproducibility**, not architecture-superiority paper.

---

## IRIS / current PABIM mechanism

### Reviewer 1 — Scientific skeptic

- **Strongest criticism:** robust Student-t/Huber filtering and change-aware robust estimation are established; PABIM may be a renamed combination rather than a new mechanism.
- **Severity:** **HIGH**.
- **Evidence required:** closest-prior-work matrix; precise statement of what persistence/opening logic adds; explain why the negative common-harness result is informative even if method novelty is weak.
- **Cheapest decisive work:** prior-art audit and contribution rewrite; no successor experiment.
- **Acceptance threat:** **YES** for positive method paper; **MODERATE** for a negative robustness–adaptation study.

### Reviewer 2 — Experimental skeptic

- **Strongest criticism:** the common harness is synthetic scalar state tracking, so even a correctly frozen negative gate may not justify a broad temporal-learning claim.
- **Severity:** **HIGH**.
- **Evidence required:** transparent condition generation, seed policy, uncertainty, fixed controls, verifier, confirmatory-seed non-access, explicit synthetic limitation.
- **Cheapest decisive work:** independent external rerun of immutable bundle. A real dataset would be a new study, not a rescue of the current result.
- **Acceptance threat:** **YES** for broad claims; **manageable** for bounded negative report.

### Reviewer 3 — Mechanism skeptic

- **Strongest criticism:** the strongest Student-t fixed control dominates adverse MSE and confirmed-streak Huber beats shift recovery, so the apparent localized gains may simply reflect a poorly chosen tradeoff rather than a novel adaptive mechanism.
- **Severity:** **CRITICAL** to any superiority claim.
- **Evidence required:** none to preserve the negative verdict—the current experiment already answers this criticism against PABIM. For a successor, a new mechanism must be motivated by the precise failure decomposition before protocol freeze.
- **Cheapest decisive work:** write the failure decomposition and stop current mechanism.
- **Acceptance threat:** **FATAL** to current superiority paper; **supports** a well-framed negative result.

**Verdict:** current mechanism is closed scientifically. Paper conversion proceeds only if the failure/tradeoff itself clears the information-value bar.

---

## NeuroCAD / T2424-0037

### Reviewer 1 — Scientific skeptic

- **Strongest criticism:** text-to-CAD and executable code generation already exist; typed IR + validation may be sensible software engineering rather than a research contribution.
- **Severity:** **HIGH**.
- **Evidence required:** show that typed IR produces a predeclared reliability/generalization advantage under same-provider/model/budget conditions, not merely different prompt quality.
- **Cheapest decisive experiment:** same-provider direct code generation vs typed-IR pipeline on a frozen held-out OOD/compositional set.
- **Acceptance threat:** **YES** until matched baseline exists.

### Reviewer 2 — Experimental skeptic

- **Strongest criticism:** `20` authored/template cases are too small, deterministic, and potentially tailored to the validator; `19/20` vs `12/20` may not survive broader language, units, part families or adversarial invalid prompts.
- **Severity:** **CRITICAL**.
- **Evidence required:** independently authored or procedurally frozen larger OOD set; syntax validity, semantic accuracy, geometry validity, executable success, invalid rejection, complexity scaling, uncertainty.
- **Cheapest decisive experiment:** freeze V2 with new part families/paraphrases/units/unsafe or invalid cases before any model output.
- **Acceptance threat:** **YES**.

### Reviewer 3 — Mechanism skeptic

- **Strongest criticism:** gains may come from extra compute/tool calls, stricter rejection, or template/retrieval leakage rather than the typed representation itself.
- **Severity:** **CRITICAL**.
- **Evidence required:** compute/token/tool budget match; direct-generation baseline; retrieval/template control; ablation removing type checker/validator; report coverage vs rejection tradeoff.
- **Cheapest decisive experiment:** one V2 factorial comparison under fixed budget: direct, direct+validator, typed-IR without validator, full typed-IR+validator, plus retrieval/template control if available.
- **Acceptance threat:** **YES**, but decisive and tractable.

**Verdict:** highest-value new scientific experiment in the portfolio. Surviving this attack can promote NeuroCAD; failing it cleanly converts the line to product/software value.

---

## APEN — Tier A pre-attack

- **Scientific skeptic:** salience alignment may be a task-specific weighting trick rather than a new memory mechanism. **Severity: HIGH.**
- **Experimental skeptic:** synthetic ridge readout and known salience construction may privilege APEN. **Severity: CRITICAL.**
- **Mechanism skeptic:** magnitude proxy already retains part of the benefit, weakening uniqueness. **Severity: HIGH.**
- **Cheapest decisive experiment:** matched learned recurrent/attention memory on a naturalistic task with frozen salience corruption.
- **Promotion rule:** no Tier-S promotion until this survives.

## Eigen-JEPA — Tier A pre-attack

- **Scientific skeptic:** stronger classical baselines already beat the frozen primary mean point estimate. **Severity: FATAL** to current superiority claim.
- **Experimental skeptic:** single dataset and unresolved `14,895` vs `14,899` row lineage. **Severity: CRITICAL.**
- **Mechanism skeptic:** any secondary metric win may reflect representation/target choice rather than useful spectral mechanism. **Severity: HIGH.**
- **Cheapest decisive work:** provenance reconciliation, then preregistered multi-dataset replication with unchanged metric hierarchy.
- **Promotion rule:** current line remains negative/boundary regardless of post-hoc secondary metrics.

## NPMS — Tier A pre-attack

- **Scientific skeptic:** classification may encode simulator parameters rather than memory dynamics. **Severity: CRITICAL.**
- **Experimental skeptic:** controlled reservoir split may not reflect learned/natural memory. **Severity: HIGH.**
- **Mechanism skeptic:** invariant parameter control within `3.57` pp already explains most headline performance. **Severity: CRITICAL.**
- **Cheapest decisive experiment:** causal intervention or natural task where parameters are controlled/matched and spectra must add incremental predictive value.
- **Promotion rule:** no broad mechanism claim until that test survives.

## Review-to-experiment rule

The next experiment is the cheapest one that can answer a **critical** review, not the experiment most likely to make the method look better. If a criticism is already fatal to a frozen superiority claim, convert it into the paper's limitation/negative result rather than rerunning until it disappears.