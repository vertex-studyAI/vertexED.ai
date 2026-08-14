# REVIEWER_ATTACK

**As of:** 2026-08-14  
**Purpose:** attack the strongest active research stories before new compute. Criticism does not authorize post-hoc retuning; decisive experiments must be frozen first.

## LAM-JEPA

### Reviewer 1 — scientific novelty skeptic

- **Strongest criticism:** the architecture bundles established ideas (JEPA-style latent prediction, latent/action modeling, vector quantization, search/planning, EMA targets, memory/verification) without evidence that a new mechanism is isolated. The current result is negative, so method-novelty language is especially vulnerable.
- **Severity:** **HIGH** for a method paper; **MEDIUM** for a rigorous negative/reproducibility paper.
- **Evidence required:** conservative related-work map; explicit novelty boundary; failure analysis showing an informative phenomenon not explained by trivial implementation failure.
- **Cheapest decisive work:** no new confirmatory ARC test. Re-analyze retained training/evaluation artifacts for prediction support, planner utilization and target-path behavior using frozen metrics; compare with existing ablations.
- **Acceptance threat:** **YES** if framed as a novel superior method; **manageable** if reframed as bounded falsification/reproducibility evidence.

### Reviewer 2 — experimental skeptic

- **Strongest criticism:** five-seed ARC validation and ablations establish the current negative result, but may not establish why it failed; benchmark validity, seed sensitivity, data/protocol details and statistical interpretation must be unambiguous.
- **Severity:** **MEDIUM-HIGH**.
- **Evidence required:** exact seed policy, paired comparison logic, uncertainty, raw-to-table provenance, protocol lock, independent recomputation, clear distinction between validation and untouched locked test.
- **Cheapest decisive work:** independently regenerate every manuscript table/figure from the retained artifact and fail on any unmatched number.
- **Acceptance threat:** **YES** if provenance is incomplete; otherwise the negative conclusion is defensible.

### Reviewer 3 — mechanism/confound skeptic

- **Strongest criticism:** planner/target ablation differences may reflect optimization, capacity, prediction support, or training instability rather than the intended causal role of those components.
- **Severity:** **HIGH** for mechanism claims; **LOW** for the narrower claim that the current components did not produce measurable benefit under the frozen setup.
- **Evidence required:** component-use diagnostics, capacity/compute accounting, learning curves, support/collapse measures, failed-run lineage.
- **Cheapest decisive work:** diagnostic analysis on existing checkpoints/logs only. Any new causal experiment becomes a new version and cannot rescue the frozen claim.
- **Acceptance threat:** **YES** for mechanism interpretation; **NO** for the bounded negative result if language stays narrow.

**LAM decision:** paper lane continues only as **negative-result/reproducibility/failure-analysis** work. No locked-test access or seed reruns are authorized by this review.

---

## IRIS / current PABIM mechanism

### Reviewer 1 — scientific novelty skeptic

- **Strongest criticism:** Student-t robustness, bounded influence and change-aware filtering are established; persistence/opening logic may be an incremental heuristic rather than a novel mechanism.
- **Severity:** **HIGH** for architecture novelty; **MEDIUM** for a failure/tradeoff paper.
- **Evidence required:** closest robust filtering/change-tracking literature, precise mathematical distinction, why the common negative result teaches something beyond “a heuristic lost to stronger baselines.”
- **Cheapest decisive work:** literature/prior-art audit plus failure taxonomy; no new confirmatory seeds.
- **Acceptance threat:** **YES** unless the negative result has clear information value.

### Reviewer 2 — experimental skeptic

- **Strongest criticism:** the current evidence is synthetic scalar tracking; a strong baseline win may simply show the proposed task is too narrow or the mechanism is underpowered, not a general robustness–adaptation law.
- **Severity:** **HIGH**.
- **Evidence required:** exact stress-regime generator, frozen five criteria, seed usage, stronger fixed/change-aware baselines, uncertainty, transparent retained first-attempt plumbing failure.
- **Cheapest decisive work:** re-verify current bundle and produce condition-level error decomposition; do not add data after seeing the result.
- **Acceptance threat:** **YES** for a broad paper; **manageable** for a scoped negative technical report.

### Reviewer 3 — mechanism/confound skeptic

- **Strongest criticism:** PABIM's localized heavy-tail gains may come from effective clipping/Huberization while its persistence logic causes the persistent-shift failure; the claimed mechanism may not be unique.
- **Severity:** **HIGH**.
- **Evidence required:** component/threshold-use diagnostics and comparison to simpler matched robust/change-aware controls.
- **Cheapest decisive experiment:** for the **current version**, none is needed to establish failure. If a successor is scientifically justified, freeze a minimal component-ablation study before any reserved/confirmatory seeds; changed thresholding or opening logic creates a new version.
- **Acceptance threat:** **YES** to mechanism novelty; **NO** to preserving the negative gate.

**IRIS decision:** current version is closed scientifically as a negative/mixed result. A successor is optional and must survive a separate goalpost-movement review before compute.

---

## NeuroCAD / T2424-0037

### Reviewer 1 — scientific novelty skeptic

- **Strongest criticism:** typed IR, validation and executable CAD code are established engineering concepts, while modern Text2CAD/Text-to-CadQuery/CAD-Coder-style systems already perform learned text-to-parametric/executable CAD generation. The current result may be a small grammar/compiler benchmark rather than research novelty.
- **Severity:** **HIGH**.
- **Evidence required:** same-provider direct-vs-typed-IR comparison, explicit distinction from direct CadQuery/code generation, larger compositional/OOD/invalid benchmark, closest prior work.
- **Cheapest decisive experiment:** freeze one matched provider/model/budget protocol comparing direct code, constrained direct generation, retrieval/template control and typed IR on the same authored-before-output OOD set.
- **Acceptance threat:** **YES**; this is the single most important NeuroCAD gate.

### Reviewer 2 — experimental skeptic

- **Strongest criticism:** `19/20` vs `12/20` on a 20-case controlled benchmark is too small and potentially author-coupled; the direct baseline may be artificially weak.
- **Severity:** **CRITICAL** for a paper.
- **Evidence required:** larger held-out set, independent or preregistered prompt authorship, learned direct baseline, execution/geometry/semantic metrics, uncertainty, error taxonomy, repeated stochastic samples if provider output is nondeterministic.
- **Cheapest decisive experiment:** one frozen evaluation package with raw prompts/outputs, exact model/settings, cost/runtime, and independent metric recomputation.
- **Acceptance threat:** **YES — acceptance-threatening until closed**.

### Reviewer 3 — mechanism/confound skeptic

- **Strongest criticism:** any advantage may come from rejecting more inputs, using more tool calls/tokens, narrower language coverage, or deterministic hand-written constraints rather than a generally useful intermediate representation.
- **Severity:** **CRITICAL** for mechanism claim; **LOW** for bounded product reliability.
- **Evidence required:** coverage/rejection tradeoff, budget matching, semantic success conditioned on valid requests, false-rejection rate, complexity scaling, validator ablations, direct constrained-decoding control.
- **Cheapest decisive experiment:** include `typed IR`, `typed IR minus validator`, `direct unconstrained`, `direct constrained`, and retrieval/template controls under the same input set and budget accounting.
- **Acceptance threat:** **YES** for scientific contribution; productization can still proceed if reliability/coverage is acceptable.

**NeuroCAD decision:** this is the only new major scientific experiment authorized by the canonical queue, and only after the dangerous-baseline/OOD protocol is frozen. A baseline loss converts the line to bounded software/product value or a negative scientific result; no retuning around the loss.

---

## Percy systems-paper status

Percy remains Tier-S infrastructure, not a current paper conversion. A three-reviewer systems attack is deferred until `PERCY-STATE-001` produces real-host SQLite/WAL/worker/provider/crash-recovery measurements. Without those measurements, a paper would be architecture narrative rather than evidence.

## Resulting experiment priority

1. **No new LAM confirmatory experiment.** Finish provenance/failure analysis and external review.
2. **No IRIS confirmatory seeds.** Decide negative-package value or freeze a separately justified successor.
3. **NeuroCAD dangerous baseline/OOD attack is the only currently authorized major new scientific run.**
4. Darcy remains protocol-freeze only until the canonical Project 2424 source and matched learned baseline are ready.
