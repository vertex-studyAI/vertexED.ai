# FOLLOW-ON EXECUTION EVIDENCE — 2026-08-10

This ledger extends the earlier root `EXECUTION_EVIDENCE.md` without rewriting its historical evidence. It reconciles the follow-on execution wave against current `main` after concurrent Project 2424 lanes advanced the repository.

## Evidence rules

- `MERGED_VERIFIED` requires a merged PR whose recorded exact head passed the relevant GitHub Actions gate.
- `REVIEW_READY` requires exact-head CI success but does not imply merge or production deployment.
- Controlled/synthetic experiments are not external scientific validation.
- Strict Project 2424 completion remains governed by the nine-part certification gate in `portfolio/project2424/PROJECT_2424_FIRST_100.md`.
- No inaccessible repository is represented as freshly inspected or repaired.

## Connector scope

The current GitHub installation exposed exactly three repositories:

1. `vertex-studyAI/vertexED.ai`
2. `vertex-studyAI/LAM-JEPA`
3. `vertex-studyAI/Text-To-Video`

Canonical Bu1LD, FinanceMeta, Atlas, Percy and wider local Project 2424 runtime/source were not exposed through this installation.

---

# 1. Text-To-Video repair

## PR #8 — atomic media publication boundary

**Head:** `54373226be9f578276fd3b7e8b1aae9f41f0a72c`  
**State:** REVIEW_READY / UNMERGED  
**Deployment:** none

Implemented:

- unique sibling attempt output;
- existing encoder + ffprobe verification on the attempt artifact;
- same-filesystem atomic rename only after verification;
- failed-attempt cleanup;
- preservation of an older verified final file;
- explicit current-attempt promotion/failure report fields;
- regression tests with fake FFmpeg/ffprobe executables;
- documented artifact-integrity contract.

Exact-head GitHub Actions passed workspace typecheck/tests/web build, FFmpeg toolchain verification, real MP4 smoke encoding/verification, external validated render-job encoding and production dependency audit.

---

# 2. Project 2424 — verified packages merged on current main

## T2424-0034 — Quant ML Visualizer

**PR:** #166  
**Merged as:** `868fa55153c8b1058f2ad9fbe3b0d397f347fe99`  
**Exact tested head:** `b62475cec9d867209ce64ee58bb6a22f25633439`  
**CI:** `31409366246` success  
**State:** MERGED_VERIFIED / TESTED_TOOL

Current main package is a descriptive quantitative analytics/reporting tool with deterministic demo input. No market download, predictive-alpha or ML-superiority claim is attached.

## T2424-0036 — Rubik's A* Intelligence

**PR:** #169  
**Merged as:** `1b143eb8904e5568f9ed8db537951a701e22f88f`  
**Exact tested head:** `422807799833247d6ea7ab095b557d26d41e2b57`  
**CI:** `31409707818` success  
**State:** MERGED_VERIFIED / TESTED_TOOL

Bounded orientation-free 2×2 corner-permutation search prototype with U/R/F moves, admissible lower bound, binary-heap A*, node/depth budgets and six fixed returned-path checks. It is not a full Rubik's Cube solver or intelligence claim.

## T2424-0038 — Obscured Records editorial triage

**PR:** #178  
**Merged as:** `fb0c3a78cad2b27bd894c1e59cfbb05606be46a7`  
**Exact tested head:** `abf8c998bab4bc0adedfb3d1d1a19432603c355f`  
**CI:** `31411209123` success  
**State:** MERGED_VERIFIED / TESTED_TOOL

Structured story/source validation, publisher/source-type diversity, primary-source coverage, transparent scoring, high-risk corroboration blockers and deterministic decision ledger. It does not fetch or verify truth, assess legal safety, autonomously publish or replace editorial judgment.

A redundant recovery PR #181 was closed after verification showed #178 had already merged successfully.

## T2424-1767 — Resource-Bounded MoE Operator

**PR:** #162  
**Merged as:** `8c4bb2b31140f8e580135a5595f2731b0068d146`  
**Exact tested head:** `1496c991a3b00473700b2f4c3d173d428f793e9b`  
**CI:** `31409012137` success  
**State:** MERGED_VERIFIED / TESTED_TOOL / SYNTHETIC_SCREEN

Resource-budgeted MoE routing with deterministic synthetic benchmark and explicit no-superiority boundary.

## T2424-1863 — Resource-Bounded Local Operator

**PR:** #177  
**Merged as:** `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`  
**Exact package head:** `8368b2daa9e7720cd972accee6e8d363f67c3a59`  
**State:** MERGED_VERIFIED / EXECUTED_NEGATIVE_SCREEN

Predeclared claim required **>75%** mean held-out one-step RMSE improvement over persistence while recovering the planted diffusion coefficient near `0.18`.

Retained 20-seed result:

- learned coefficient: `0.179689`;
- persistence RMSE: `0.015610`;
- local-operator RMSE: `0.005023`;
- improvement: **67.777%** — below the predeclared gate;
- zero-diffusion negative-control improvement: **-0.029%**;
- verdict: `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`.

The threshold was not relaxed after observing the failure.

---

# 3. Project 2424 — exact-head-green review-ready packages not merged

These are eight **distinct** First-100 entries. Each has substantive implementation, regression tests, README/STATUS claim boundaries and successful canonical exact-head CI.

| ID | PR | Verified head | Package boundary |
|---|---:|---|---|
| T2424-0024 | #172 | `a258ae35900e1b3f83c75604689603a80c43d45b` | calibration/selective-risk evaluator on paired synthetic controls |
| T2424-0026 | #174 | `93c857e8f5e5408f9b5cda6c0053fbb2b903c993` | deterministic counterfactual cellular-world intervention/locality simulator |
| T2424-0028 | #163 | `f35ac3a28063aee4f41fc5cc44e775655092f383` | residual-event codec/reconstruction mechanics on controlled series |
| T2424-0029 | #176 | `4c43ec9f88bda4f0857506730ab1083711f53dba` | analytic heat-equation spectral effective-rank experiment |
| T2424-0035 | #167 | `89e55c7e466f34e54bfc5c870a6ad056a5f034b1` | delayed-vs-matched synthetic learning-curve evaluator |
| T2424-0037 | #165 | `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` | controlled plate language to validated SVG/OpenSCAD |
| T2424-0053 | #179 | `298b739675850d4980a1397cd3bf5fefd699e5dc` | z-normalized 1D scientific motif indexing mechanics |
| T2424-0054 | #170 | `2e2b602aa75768b4ba1983f30ec27ca36f7419b9` | transparent cost/value/uncertainty/diversity planning heuristic |

## Failures caught and repaired during this candidate wave

### T2424-0037 NLP-to-CAD

Initial canonical CI failed because the single-letter radius token matched the final `r` inside `diameter`, causing `diameter 8` to be read as radius `8`. Word boundaries were repaired and the exact repaired head then passed canonical build/test, local accessibility and production-browser jobs.

### T2424-0024 Trust Under Uncertainty

Initial canonical CI correctly showed the synthetic “moderate” confidence fixture was not actually better than the overconfident fixture under five-bin ECE. The control data were repaired rather than weakening ECE or the assertion; exact-head CI then passed.

---

# 4. Noncanonical duplicate/follow-up branch

PR #160 is an exact-head-green T2424-0034 walk-forward quant/ML follow-up produced before the canonical T2424-0034 package landed through #166. It adds historical-only fitting, transaction costs and no-lookahead tests, but is **not counted as a second First-100 project**. Its useful changes should be reconciled into the canonical T2424-0034 package rather than merged as a duplicate tree.

---

# 5. Reconciled Project 2424 counts

- Queue entries: **100 / 100**
- Distinct entries with substantive verified implementation packages: **13 / 100**
- Merged verified packages on `main`: **5 / 100**
- Exact-head-green review-ready distinct packages not merged: **8 / 100**
- Strict certified complete: **0 / 100**
- Merged synthetic research screens with retained verdict/result evidence: **2** (T2424-1767, T2424-1863)
- Preserved negative/inconclusive merged screen: **1** (T2424-1863)

Strict certification remains 0 because real/external data, stronger baselines, raw artifacts, ablations/negative analysis and independent scientific QA remain project-specific gates.

---

# 6. Follow-on execution metrics

- Connected repositories inspected: **3**
- Repositories modified by the active follow-on lane: **2**
- New active-lane code/package PRs created: **9** — Text-To-Video #8 plus eight Project 2424 package PRs (#160, #163, #165, #167, #170, #172, #174, #176)
- Additional concurrent Project 2424 implementation evidence reconciled: **5 merged packages + T2424-0053 review-ready**
- New active-lane regression test files: **9**
- New active-lane explicit regression test cases: **42**
- Concrete active-lane defects/failing assumptions caught and repaired: **3**
- Production deployments intentionally performed by this lane: **0**

---

# 7. Persistent gates

1. VertexED immutable production revision and authenticated disposable-account production certification remain unresolved.
2. Bu1LD, FinanceMeta, Atlas and Percy canonical repos/runtimes are not exposed by the current GitHub installation.
3. Wider Project 2424 local/archive source beyond the evidence restored into VertexED remains an access/recovery gate.
4. LAM-JEPA remains behind its negative/inconclusive ARC generalization gate; no unsupported positive result was created.
5. Review-ready candidate packages should not be auto-merged through a path that may trigger external deployment without explicit authorization.
