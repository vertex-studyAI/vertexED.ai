# Master Portfolio Status

**Updated:** 10 August 2026 — current-main follow-on reconciliation  
**Evidence rule:** only connector-visible repository state, exact-head CI, merged commits and versioned evidence artifacts count as current verification.

| Project | Connector-visible source | State | Current evidence | Main blocker | Best next artifact | Priority |
|---|---|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / SOURCE-CERTIFIED, PRODUCTION-UNVERIFIED | Current main includes prior P0/P1 source fixes plus five merged Project 2424 packages; review branches passed canonical CI | Immutable public production revision + authenticated production journey not proven | Live SHA proof + disposable-account certification | P0 |
| Project 2424 First-100 | portfolio tree in `vertex-studyAI/vertexED.ai`; wider canonical archive not exposed | ACTIVE / 13 VERIFIED IMPLEMENTATIONS | Queue 100/100; 5 distinct packages merged/tested on main; 8 additional distinct packages exact-head-green/review-ready; strict certified count 0/100 | Full project-specific raw/external result, negative/ablation and independent-QA gates remain | Promote strongest package through strict evidence gate | P0 |
| Text-To-Video | `vertex-studyAI/Text-To-Video` | ACTIVE / REVIEW-READY LOCAL PROTOTYPE | PR #8 exact-head CI passed workspace tests/build, FFmpeg smoke, external render-job encoding and production dependency audit | Review/merge; hosted rendering/durable lifecycle intentionally out of scope | Reconcile/merge atomic-output repair after review | P1 |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / NEGATIVE-OR-INCONCLUSIVE GATE | Existing ARC validation remains negative/inconclusive; no positive claim created | Frozen external confirmatory benchmark | Predeclared multi-seed confirmatory protocol | P0 research |
| FinanceMeta | not exposed by current GitHub installation | BLOCKED FOR DIRECT EXECUTION | No fresh target-repository mutation/runtime verification claimed | Canonical repository/runtime access | Connect source + production environment, then execute release gate | P0/P1 |
| The Bu1LD | not exposed by current GitHub installation | BLOCKED FOR DIRECT EXECUTION | No fresh target-repository mutation/runtime verification claimed | Canonical repository/runtime access | Connect source + Supabase/edge environment, then execute role journeys | P0/P1 |
| Atlas | not exposed by current GitHub installation | BLOCKED FOR DIRECT EXECUTION | No fresh orchestration/runtime evidence in follow-on wave | Canonical repository/runtime access | Inspect queue, workers, recovery and evidence collection | P1 |
| Percy | not exposed by current GitHub installation | BLOCKED / RECOVERABLE | Existing control evidence forbids declaring runtime healthy without fresh SQLite/worker proof | Local source/runtime inaccessible to this connector | Repair/verify SQLite compatibility + real worker liveness | P0 |

## Project 2424 — merged verified packages on current main

| ID | Package | Merge / evidence | Current boundary |
|---|---|---|---|
| T2424-0034 | Quant ML Visualizer | PR #166 merged; exact head passed CI `31409366246` | descriptive quantitative tool/demo; no predictive-alpha claim |
| T2424-0036 | Rubik's A* Intelligence | PR #169 merged; exact head passed CI `31409707818` | bounded orientation-free 2×2 corner-permutation A*; not full cube solver |
| T2424-0038 | Obscured Records editorial triage | PR #178 merged; exact head passed CI `31411209123` | deterministic evidence-gated triage; does not verify truth/legal safety or publish autonomously |
| T2424-1767 | Resource-Bounded MoE Operator | PR #162 merged; exact head passed CI `31409012137` | synthetic resource/error tooling screen; no superiority claim |
| T2424-1863 | Resource-Bounded Local Operator | PR #177 merged | retained 20-seed result failed >75% gate at 67.777%; negative/inconclusive verdict preserved |

## Project 2424 — exact-head-green review-ready distinct packages

| ID | Package | PR | Boundary |
|---|---|---:|---|
| T2424-0024 | Trust Under Uncertainty | #172 | calibration/selective-risk evaluator; synthetic controls only |
| T2424-0026 | Counterfactual Defect Worlds | #174 | deterministic local-intervention simulator |
| T2424-0028 | Residual Event Tokenization | #163 | controlled residual-event codec mechanics |
| T2424-0029 | Representation Phase Transitions for PDEs | #176 | analytic heat-equation effective-rank experiment |
| T2424-0035 | Grokking Agent | #167 | synthetic learning-curve delayed-generalization evaluator |
| T2424-0037 | Controlled NLP-to-CAD | #165 | narrow plate grammar to SVG/OpenSCAD; parser regression repaired |
| T2424-0053 | Scientific Motif Dictionary | #179 | deterministic normalized 1D motif indexing mechanics |
| T2424-0054 | Theory-Manifold Experiment Planner | #170 | transparent cost/value/uncertainty/diversity heuristic |

## Noncanonical follow-up

PR #160 is a separate exact-head-green T2424-0034 walk-forward/transaction-cost/no-lookahead implementation created before canonical T2424-0034 merged through #166. It is not double-counted as a new project and should be reconciled into the canonical package rather than merged as a duplicate tree.

## Concrete follow-on repairs

1. **Text-To-Video stale/partial output boundary** — added verified sibling-attempt encoding and atomic final promotion with preservation tests.
2. **NLP-to-CAD diameter/radius parser collision** — CI caught `diameter` matching the single-letter radius token; boundaries repaired and re-certified.
3. **Trust Under Uncertainty invalid calibration control** — CI showed the intended moderate control was not actually better under five-bin ECE; control data repaired without weakening the evaluator/test.
4. **Duplicate T2424-0038 recovery PR** — current evidence showed original #178 had already merged with green exact-head CI; redundant #181 was closed rather than carrying duplicate work.

## Reconciled metrics

- Connected repositories inspected: **3**
- Project 2424 queue entries: **100**
- Distinct First-100 entries with substantive verified implementations: **13**
- Merged verified First-100 packages: **5**
- Exact-head-green review-ready distinct First-100 packages: **8**
- Strict First-100 certified complete: **0**
- Merged synthetic research screens with retained verdict/result evidence: **2**
- Preserved merged negative/inconclusive screen: **1**
- Production deployments intentionally performed by the active follow-on lane: **0**

## Claim boundary

- Green source CI is not immutable production deployment proof.
- Controlled/synthetic experiments are not external scientific results.
- Review-ready PRs are not merged artifacts.
- A merged Project 2424 package is not automatically `Certified complete`.
- No inaccessible repository is represented as freshly inspected or repaired.
- No unsupported LAM-JEPA/Hercules/AGI claim was created.
