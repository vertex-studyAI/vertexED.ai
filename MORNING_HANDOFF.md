# WHAT ACTUALLY CHANGED

**Execution date:** 10 August 2026  
**Latest refresh:** follow-on Project 2424 package wave  
**Evidence:** `EXECUTION_EVIDENCE.md` for the earlier merged recovery wave; `FOLLOWON_EXECUTION_EVIDENCE_20260810.md` for this follow-on wave.

This handoff reports only connector-visible GitHub evidence. It does not convert queues into completed projects, synthetic controls into scientific results, green source CI into production deployment, or inaccessible repositories into executed work.

## 1. SHIPPED / COMPLETED

### Earlier recovery wave already recorded in repository history

The existing evidence ledger records the earlier VertexED source fixes, Asteroid Tracklet Baseline, First-100 queue/control package and portfolio evidence/control work. Those records remain preserved in git history and `EXECUTION_EVIDENCE.md`.

### Text-To-Video artifact-integrity fix now review-ready

PR #8 fixes the stale/partial-final-media failure boundary by encoding a unique sibling attempt, verifying it, then promoting it atomically to the requested final path. Failed attempts are removed while an older verified final file is preserved.

Exact-head Actions passed:

- workspace typecheck/tests/web build;
- FFmpeg toolchain verification;
- real MP4 smoke encoding and verification;
- external render-job encoding;
- production dependency audit.

No deployment was performed.

### Eight substantive Project 2424 implementation candidates now review-ready

| ID | Package | PR | Exact-head CI | State |
|---|---|---:|---|---|
| T2424-0024 | Trust Under Uncertainty | #172 | passed | REVIEW_READY |
| T2424-0026 | Counterfactual Defect Worlds | #174 | passed | REVIEW_READY |
| T2424-0028 | Residual Event Tokenization | #163 | passed | REVIEW_READY |
| T2424-0029 | Representation Phase Transitions for PDEs | #176 | passed | REVIEW_READY |
| T2424-0034 | Quant ML Visualizer | #160 | passed | REVIEW_READY |
| T2424-0035 | Grokking Agent evaluator | #167 | passed | REVIEW_READY |
| T2424-0037 | Controlled NLP-to-CAD | #165 | passed | REVIEW_READY |
| T2424-0054 | Theory-Manifold Experiment Planner | #170 | passed | REVIEW_READY |

These are real package branches with implementation, regression tests, README/STATUS evidence boundaries and controlled experiment/demo entry points. They remain open/unmerged to avoid using repository merges as an implicit deployment path without explicit authorization.

## 2. PROJECT 2424

### Strict dashboard

- First-100 queue: **100 / 100 execution-ready entries**
- New substantive package PRs in this follow-on wave: **8**
- Exact-head CI verified: **8 / 8**
- Review-ready: **8 / 8**
- Merged to `main`: **0 / 8**
- Strict certified complete: **0 / 100**

The strict completed count intentionally remains 0 because the First-100 promotion gate requires more than implementation CI: project-appropriate frozen protocol, raw result/baseline evidence, negative or ablation analysis, explicit verdict and independent QA are still required.

### What the eight packages actually contain

**Trust Under Uncertainty** — Brier score, calibration bins/ECE, risk-coverage, abstention, paired confidence controls. Its first CI run caught a bad synthetic calibration fixture; the fixture was repaired rather than weakening the metric.

**Counterfactual Defect Worlds** — deterministic cellular-world simulator, localized interventions, exact divergence tracking and causal-cone locality verification.

**Residual Event Tokenization** — causal hold/linear residual-event encoding, deterministic decoding, threshold sweeps and reconstruction-error contracts.

**Representation Phase Transitions for PDEs** — analytic heat-equation Fourier evolution, sine projection, spectral entropy/effective-mode dimension and diffusivity transition sweep. “Transition” is operational effective-rank change only.

**Quant ML Visualizer** — historical-only walk-forward linear baseline, transaction costs, strategy/benchmark metrics and browser visualizer with a future-data mutation test against lookahead.

**Grokking Agent evaluator** — causal learning-curve smoothing, persistent memorization/generalization thresholds, delayed-generalization classification and matched controls. No real-model grokking claim.

**Controlled NLP-to-CAD** — narrow plate/panel/bracket grammar to validated parametric geometry, SVG and OpenSCAD. Initial CI caught `diameter` being misread as radius via a regex boundary bug; it was repaired and re-certified.

**Theory-Manifold Experiment Planner** — transparent expected-value/uncertainty/novelty versus cost acquisition ranking, dependency blocking, hard budget and diversity penalty.

## 3. CORE PRODUCTS

### VertexED

Follow-on Project 2424 branches passed the repository's canonical build/test gate and the applicable local accessibility/production-browser certification jobs, but that does **not** prove the immutable SHA served by the public production site.

Remaining release gate: identify the live production revision and complete authenticated disposable-account production certification. No external deployment was authorized or performed in this follow-on wave.

### The Bu1LD

No direct canonical repository mutation is claimed. The current GitHub installation does not expose the canonical target repository/runtime.

### FinanceMeta

No direct canonical repository mutation is claimed. The current GitHub installation does not expose the canonical target repository/runtime.

## 4. RESEARCH

The eight Project 2424 branches include controlled deterministic/synthetic experiment entry points and their core regression contracts were exercised by canonical repository CI. Those are implementation mechanics tests, not external scientific benchmark results.

No new standalone LAM-JEPA/Hercules experiment result is claimed in this follow-on wave. LAM-JEPA remains behind its existing negative/inconclusive ARC generalization gate; no unsupported positive result was manufactured.

## 5. ATLAS / PERCY

No fresh Atlas or Percy runtime-health claim is made. Their canonical repositories/local runtime are not exposed by the current GitHub installation. Runtime, SQLite integrity and actual worker-liveness require access to the real host/workspace.

## 6. GITHUB

Repositories visible and inspected through the current installation: **3**.

- `vertex-studyAI/vertexED.ai`
- `vertex-studyAI/LAM-JEPA`
- `vertex-studyAI/Text-To-Video`

Follow-on code/package PRs created: **9**.

- Text-To-Video #8
- VertexED/Project 2424 #160, #163, #165, #167, #170, #172, #174, #176

All nine are review-ready with exact-head CI evidence. None was merged by this follow-on wave.

## 7. FAILURES / BLOCKERS

1. VertexED exact immutable production revision and authenticated release journey remain unverified.
2. Canonical Bu1LD repository/runtime is not exposed by the current connector.
3. Canonical FinanceMeta repository/runtime is not exposed by the current connector.
4. Canonical Atlas repository/runtime is not exposed by the current connector.
5. Percy local source/SQLite/runtime is not exposed by the current connector.
6. Canonical Project 2424 archive/source beyond the evidence already restored into VertexED remains an access/recovery gate.
7. First-100 strict certification still requires project-specific raw/external evidence and independent QA, not just CI.

## 8. TOP 10 NEXT ACTIONS

1. Review the eight Project 2424 candidate PRs; merge only after deciding the deployment implications of changes to `vertexED.ai`.
2. Promote the strongest candidate through the full First-100 evidence gate using frozen external/real data where relevant.
3. T2424-0034: freeze real legally usable market data and chronological train/validation/test periods before any performance claim.
4. T2424-0029: extend the frozen representation metric to a numerical nonlinear PDE before stronger phase-transition language.
5. T2424-0024: evaluate retained real-model predictions with uncertainty intervals and subgroup slices.
6. T2424-0037: validate generated geometry through an actual CAD kernel before broadening supported grammar.
7. Prove the exact VertexED SHA served by production, then run authenticated disposable-account certification.
8. Connect canonical FinanceMeta and Bu1LD repositories/runtimes for direct repair and release work.
9. Expose Atlas/Percy source + runtime so SQLite, worker-liveness, queue recovery and orchestration can be tested rather than inferred.
10. Keep LAM-JEPA behind the negative/inconclusive gate until a frozen confirmatory protocol produces real evidence.

## 9. COMMANDS / INTERVENTION REQUIRED FROM OWNER

No code command is required merely to preserve this wave. The remaining owner-only interventions are access/authorization decisions:

- expose the canonical FinanceMeta, Bu1LD, Atlas, Percy and Project 2424 repositories/workspaces to the connected tooling where applicable;
- explicitly authorize any production deployment before a merge/action intended to publish externally;
- provide secure disposable production identities through the supported account/password-manager flow for authenticated VertexED certification;
- never paste production secrets into chat or GitHub issues.

## FINAL METRICS — FOLLOW-ON WAVE

Repositories inspected: **3**  
Repositories modified: **2** (`vertexED.ai`, `Text-To-Video`)  
New code/package PRs created: **9**  
New Project 2424 substantive packages: **8**  
Project 2424 package PRs exact-head CI verified: **8 / 8**  
Project 2424 package PRs review-ready: **8 / 8**  
Project 2424 package PRs merged by follow-on wave: **0 / 8**  
Strict First-100 certified completed count: **0 / 100**  
New regression test files: **9**  
New explicit regression test cases: **42**  
Concrete defects/failing assumptions caught and repaired: **3**  
Production deployments performed: **0**  
Unsupported research-result claims made: **0**
