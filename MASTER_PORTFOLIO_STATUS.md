# Master Portfolio Status

**Updated:** 10 August 2026 — current-main reconciliation  
**Evidence rule:** only connector-visible repository state, merged commits, exact-head CI, and versioned evidence artifacts count as current verification.

| Project | Connector-visible source | State | Current evidence | Main blocker | Best next artifact | Priority |
|---|---|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / SOURCE-CERTIFIED, PRODUCTION-UNVERIFIED | current main includes prior source fixes + five merged Project 2424 packages; eight additional distinct packages have green exact heads | immutable public production revision + authenticated production journey | live SHA proof + disposable-account certification | P0 |
| Project 2424 First-100 | portfolio tree in `vertex-studyAI/vertexED.ai`; wider archive not exposed | ACTIVE / 13 VERIFIED IMPLEMENTATIONS | queue 100/100; 5 merged/tested; 8 additional distinct review-ready; strict certified count 0/100 | project-specific raw/external evidence, negative/ablation analysis, independent QA | promote strongest package through strict gate | P0 |
| Text-To-Video | `vertex-studyAI/Text-To-Video` | MERGED LOCAL RELIABILITY FIX | canonical PR #7 merged; exact head `4791f21a55217520955db603d917d8a5f2d7f06a` passed CI `31409630201`; stale/partial final-media boundary now fail-closed | hosted queue/storage/lifecycle remains intentionally out of scope | keep local artifact-integrity contract; expand hosted scope only with explicit product/deploy authorization | P1 |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / NEGATIVE-OR-INCONCLUSIVE, PROVENANCE DOCUMENTED | PR #53 merged evidence-backed `RESEARCH_STATUS.md`; PR #54 merged `RELEASE_PROVENANCE.md`; frozen ARC negative/inconclusive boundary and test-split stop rule preserved | confirmatory external benchmark if scientifically justified; owner license/citation choices for publication packaging | owner-approved license/citation metadata or a new predeclared confirmatory protocol—not test-split rescue | P0 research |
| FinanceMeta | not exposed | BLOCKED FOR DIRECT EXECUTION | no fresh target-repository mutation/runtime verification claimed | canonical repo/runtime access | connect source + production environment | P0/P1 |
| The Bu1LD | not exposed | BLOCKED FOR DIRECT EXECUTION | no fresh target-repository mutation/runtime verification claimed | canonical repo/runtime access | connect source + Supabase/edge environment | P0/P1 |
| Atlas | not exposed | BLOCKED FOR DIRECT EXECUTION | no fresh orchestration/runtime evidence | canonical repo/runtime access | inspect queue/workers/recovery/evidence collection | P1 |
| Percy | not exposed | BLOCKED / RECOVERABLE | no fresh SQLite or worker-liveness proof through current connector | local source/runtime access | verify SQLite compatibility/integrity + real worker liveness | P0 |

## Project 2424 — merged verified packages

| ID | Package | Evidence | Boundary |
|---|---|---|---|
| T2424-0034 | Quant ML Visualizer | PR #166 merged; CI `31409366246` success | descriptive quantitative tool/demo; no predictive-alpha claim |
| T2424-0036 | Rubik's A* Intelligence | PR #169 merged; CI `31409707818` success | bounded orientation-free 2×2 corner-permutation A*; not full cube solver |
| T2424-0038 | Obscured Records editorial triage | PR #178 merged; CI `31411209123` success | evidence-gated triage; not truth/legal verifier or autonomous publisher |
| T2424-1767 | Resource-Bounded MoE Operator | PR #162 merged; CI `31409012137` success | synthetic resource/error screen; no superiority claim |
| T2424-1863 | Resource-Bounded Local Operator | PR #177 merged | retained 20-seed result failed >75% gate at 67.777%; negative/inconclusive verdict preserved |

## Project 2424 — exact-head-green review-ready distinct packages

| ID | Package | PR | Boundary |
|---|---|---:|---|
| T2424-0024 | Trust Under Uncertainty | #172 | calibration/selective-risk evaluator; synthetic controls only |
| T2424-0026 | Counterfactual Defect Worlds | #174 | deterministic local-intervention simulator |
| T2424-0028 | Residual Event Tokenization | #163 | controlled residual-event codec mechanics |
| T2424-0029 | Representation Phase Transitions for PDEs | #176 | analytic heat-equation effective-rank experiment |
| T2424-0035 | Grokking Agent | #167 | synthetic delayed-generalization evaluator |
| T2424-0037 | Controlled NLP-to-CAD | #165 | narrow plate grammar to SVG/OpenSCAD; parser regression repaired |
| T2424-0053 | Scientific Motif Dictionary | #179 | deterministic normalized 1D motif indexing mechanics |
| T2424-0054 | Theory-Manifold Experiment Planner | #170 | transparent cost/value/uncertainty/diversity heuristic |

## Noncanonical follow-up

PR #160 is a separate exact-head-green T2424-0034 walk-forward/no-lookahead/transaction-cost implementation created before canonical #166 merged. It is not double-counted and should be reconciled into the canonical package rather than merged as a duplicate tree.

## Reconciled metrics

- Connected repositories inspected: **3**
- Project 2424 queue entries: **100**
- Distinct First-100 entries with substantive verified implementations: **13**
- Merged verified First-100 packages: **5**
- Exact-head-green review-ready distinct First-100 packages: **8**
- Strict First-100 certified complete: **0**
- Text-To-Video canonical stale/partial output fix: **merged via PR #7**
- LAM-JEPA current research-status/provenance surfaces: **merged via PRs #53/#54**
- Production deployments intentionally performed by the active follow-on lane: **0**

## Claim boundary

Green source CI is not immutable production proof. Controlled/synthetic experiments are not external scientific results. A merged Project 2424 package is not automatically `Certified complete`. LAM-JEPA's negative/inconclusive ARC result is not upgraded by documentation/provenance. No inaccessible repository is represented as freshly inspected or repaired.
