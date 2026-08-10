# Master Portfolio Status

**Updated:** 10 August 2026 — follow-on execution refresh  
**Evidence rule:** only connector-visible repository state, exact-head CI, and versioned evidence artifacts count as current verification.

| Project | Connector-visible source | State | Current evidence | Main blocker | Best next artifact | Priority |
|---|---|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / SOURCE-CERTIFIED, PRODUCTION-UNVERIFIED | Earlier source fixes preserved in `EXECUTION_EVIDENCE.md`; eight follow-on Project 2424 candidate PRs each passed canonical exact-head CI | Immutable public production revision + authenticated production journey not proven | Live SHA proof + disposable-account certification | P0 |
| Project 2424 First-100 | portfolio tree in `vertex-studyAI/vertexED.ai`; wider canonical archive not exposed | ACTIVE / RECOVERABLE | Queue 100/100; eight substantive packages implemented, CI-verified and review-ready; strict certified count 0/100 | Packages are unmerged and still need project-specific raw/external result + negative/ablation + independent QA evidence | Promote strongest candidate through strict evidence gate | P0 |
| Text-To-Video | `vertex-studyAI/Text-To-Video` | ACTIVE / REVIEW-READY LOCAL PROTOTYPE | PR #8 exact-head CI passed build/tests, FFmpeg smoke, external render-job encoding and dependency audit | Review/merge; hosted rendering/durable lifecycle remains intentionally out of scope | Merge atomic-output repair after review or keep local-only | P1 |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / NEGATIVE-OR-INCONCLUSIVE GATE | Existing repaired ARC evidence remains negative/inconclusive; no positive claim created in this wave | Externally grounded frozen confirmatory benchmark | Predeclared multi-seed confirmatory protocol | P0 research |
| FinanceMeta | not exposed by current GitHub installation | BLOCKED FOR DIRECT EXECUTION | No fresh target-repository mutation or runtime verification claimed | Canonical repository/runtime access | Connect source + production environment, then execute release gate | P0/P1 |
| The Bu1LD | not exposed by current GitHub installation | BLOCKED FOR DIRECT EXECUTION | No fresh target-repository mutation or runtime verification claimed | Canonical repository/runtime access | Connect source + Supabase/edge environment, then execute role journeys | P0/P1 |
| Atlas | not exposed by current GitHub installation | BLOCKED FOR DIRECT EXECUTION | No fresh orchestration/runtime evidence in follow-on wave | Canonical repository/runtime access | Inspect queue, workers, recovery and evidence collection | P1 |
| Percy | not exposed by current GitHub installation | BLOCKED / RECOVERABLE | Existing control evidence forbids declaring runtime healthy without fresh SQLite/worker proof | Local source/runtime inaccessible to this connector | Repair/verify SQLite compatibility + real worker liveness | P0 |

## Follow-on Project 2424 implementation candidates

| ID | Package | PR | Exact-head CI | Review state | Strict First-100 certification |
|---|---|---:|---|---|---|
| T2424-0024 | Trust Under Uncertainty | #172 | PASS | READY | NOT YET |
| T2424-0026 | Counterfactual Defect Worlds | #174 | PASS | READY | NOT YET |
| T2424-0028 | Residual Event Tokenization | #163 | PASS | READY | NOT YET |
| T2424-0029 | Representation Phase Transitions for PDEs | #176 | PASS | READY | NOT YET |
| T2424-0034 | Quant ML Visualizer | #160 | PASS | READY | NOT YET |
| T2424-0035 | Grokking Agent evaluator | #167 | PASS | READY | NOT YET |
| T2424-0037 | Controlled NLP-to-CAD | #165 | PASS | READY | NOT YET |
| T2424-0054 | Theory-Manifold Experiment Planner | #170 | PASS | READY | NOT YET |

## Concrete follow-on repairs

1. **Text-To-Video stale/partial output boundary** — introduced verified sibling-attempt encoding and atomic final promotion, with failure-preservation regression tests.
2. **NLP-to-CAD diameter/radius parser collision** — canonical CI caught `diameter` matching the single-letter radius token; word boundaries repaired and the exact head re-certified.
3. **Trust Under Uncertainty invalid calibration fixture** — canonical CI showed the supposed moderate control was not actually better under five-bin ECE; fixture repaired without weakening the metric/test and exact head re-certified.

## Follow-on metrics

- Connected repositories inspected: **3**
- Repositories modified: **2**
- New code/package PRs: **9**
- New Project 2424 substantive packages: **8**
- Project 2424 candidate PRs exact-head CI verified: **8 / 8**
- Project 2424 candidate PRs review-ready: **8 / 8**
- Project 2424 candidate PRs merged by this follow-on wave: **0 / 8**
- Strict Project 2424 First-100 completed: **0 / 100**
- New regression test files: **9**
- New explicit regression test cases: **42**
- Production deployments performed: **0**

## Claim boundary

- Green source CI is not production deployment proof.
- Controlled/synthetic experiments are not external scientific results.
- Open review-ready PRs are not merged artifacts.
- First-100 queue membership or CI success alone does not satisfy the strict completion gate.
- No inaccessible repository is represented as freshly inspected or repaired.
- No unsupported LAM-JEPA/Hercules/AGI claim was created.
