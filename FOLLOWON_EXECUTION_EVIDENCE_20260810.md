# FOLLOW-ON EXECUTION EVIDENCE — 2026-08-10

This ledger records the follow-on autonomous execution wave after the existing root `EXECUTION_EVIDENCE.md` checkpoint. It is additive: earlier merged recovery work remains evidenced by the prior ledger and git history.

## Evidence rules

- `CI_VERIFIED` requires GitHub Actions success on the exact recorded head.
- `REVIEW_READY` requires exact-head CI success before the draft gate is removed.
- An open PR is not represented as merged.
- No branch in this ledger is represented as production-deployed.
- Synthetic or controlled experiments are not represented as external scientific results.

## Repository scope

Current GitHub installation exposed three repositories:

1. `vertex-studyAI/vertexED.ai`
2. `vertex-studyAI/LAM-JEPA`
3. `vertex-studyAI/Text-To-Video`

Direct canonical repositories for Bu1LD, FinanceMeta, Atlas and Percy were not exposed by this installation, so no fresh direct-repository health claim is made for them.

---

## Text-To-Video — issue #6 artifact-integrity repair

**PR:** #8 `Make media outputs atomic after verification`  
**Head:** `54373226be9f578276fd3b7e8b1aae9f41f0a72c`  
**State:** CI_VERIFIED / REVIEW_READY  
**Production deploy:** not performed

Artifacts/behavior:

- `apps/worker/src/atomic-encoder.ts`
- `apps/worker/src/lib/atomic-encoder.test.ts`
- external render-job CLI updated to encode/verify a sibling attempt before final promotion
- smoke encoder CLI updated with the same contract
- `docs/atomic-media-output.md`

Exact runner evidence passed workspace typecheck/tests/web build, FFmpeg toolchain verification, real MP4 smoke encoding/verification, external validated render-job encoding and production dependency audit.

---

# Project 2424 follow-on package factory

The First-100 queue remains a work queue, not 100 completed projects. This wave converted eight low-dependency entries into substantive code/test/documentation packages. Every package below passed the repository's canonical exact-head CI before its PR was moved to review-ready.

| ID | Package | PR | Exact verified head | State | Controlled evidence boundary |
|---|---|---:|---|---|---|
| T2424-0024 | Trust Under Uncertainty | #172 | `a258ae35900e1b3f83c75604689603a80c43d45b` | CI_VERIFIED / REVIEW_READY | calibration/selective-risk evaluator on paired synthetic confidence controls |
| T2424-0026 | Counterfactual Defect Worlds | #174 | `93c857e8f5e5408f9b5cda6c0053fbb2b903c993` | CI_VERIFIED / REVIEW_READY | deterministic cellular-world intervention/locality mechanics |
| T2424-0028 | Residual Event Tokenization | #163 | `f35ac3a28063aee4f41fc5cc44e775655092f383` | CI_VERIFIED / REVIEW_READY | synthetic residual-event codec/reconstruction mechanics |
| T2424-0029 | Representation Phase Transitions for PDEs | #176 | `4c43ec9f88bda4f0857506730ab1083711f53dba` | CI_VERIFIED / REVIEW_READY | analytic heat-equation effective spectral-rank transitions |
| T2424-0034 | Quant ML Visualizer | #160 | `e0ff93c79cc26d25b8a823348939382d2a5d93e5` | CI_VERIFIED / REVIEW_READY | leakage-safe walk-forward software/demo baseline |
| T2424-0035 | Grokking Agent evaluator | #167 | `89e55c7e466f34e54bfc5c870a6ad056a5f034b1` | CI_VERIFIED / REVIEW_READY | delayed-vs-matched synthetic learning-curve classifier |
| T2424-0037 | Controlled NLP-to-CAD | #165 | `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` | CI_VERIFIED / REVIEW_READY | controlled plate grammar to parametric OpenSCAD/SVG |
| T2424-0054 | Theory-Manifold Experiment Planner | #170 | `2e2b602aa75768b4ba1983f30ec27ca36f7419b9` | CI_VERIFIED / REVIEW_READY | transparent cost/value/uncertainty/diversity planning heuristic |

## Failure → repair evidence

### NLP-to-CAD

The first canonical gate failed because the radius regex matched the final `r` inside `diameter`, so `diameter 8` was parsed as radius `8`. Token boundaries were repaired; the exact repaired head then passed build/test, local accessibility and production-browser certification.

### Trust Under Uncertainty

The first canonical gate correctly rejected a synthetic fixture whose five-bin ECE was not actually better than the overconfident control. The control data were repaired instead of weakening ECE or the assertion; the exact repaired head then passed the full CI gate.

### Text-To-Video

The source path could expose a stale/partial final MP4 after a failed current attempt. The repair encodes/verifies a sibling attempt and only promotes it atomically after verification; regression tests prove failed attempts preserve a previous verified final file.

## Follow-on metrics

- Connected repositories inspected: **3**
- Repositories modified: **2**
- New code/package PRs created: **9** — Text-To-Video #8 plus eight Project 2424 package PRs
- New Project 2424 substantive package PRs: **8**
- Project 2424 package PRs exact-head CI verified: **8 / 8**
- Project 2424 package PRs review-ready: **8 / 8**
- Project 2424 package PRs merged by this wave: **0 / 8**
- Strict First-100 certified-complete count: **0 / 100**
- Production deployments performed by this wave: **0**
- New regression test files across the code/package PRs: **9**
- New explicit regression test cases across those files: **42**
- Concrete defects/failing assumptions caught and repaired: **3**

The eight First-100 candidates are not promoted to strict certified completion merely because CI is green. Their project-specific external/raw-result/negative-analysis/independent-QA requirements still apply.

## Persistent P0 / access gates

1. VertexED production/runtime identity remains a separate release-certification gate. Source CI success is not production readiness.
2. Bu1LD, FinanceMeta, Atlas and Percy canonical repos/workspaces were not directly exposed by the current connector.
3. LAM-JEPA remains behind its existing negative/inconclusive ARC generalization gate; no unsupported positive result was created.
4. Review-ready Project 2424 packages remain open/unmerged to avoid using merges as an implicit external deployment mechanism without explicit authorization.
