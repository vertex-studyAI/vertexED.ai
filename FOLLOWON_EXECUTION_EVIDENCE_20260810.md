# FOLLOW-ON EXECUTION EVIDENCE — 2026-08-10

This ledger records the follow-on autonomous execution wave after the existing root `EXECUTION_EVIDENCE.md` checkpoint. It is intentionally additive: the earlier ledger remains the source for prior merged recovery work.

## Evidence rules

- A package is `CI_VERIFIED` only when GitHub Actions completed successfully on the exact recorded head.
- A package is `REVIEW_READY` only after that exact-head CI gate succeeded and the draft flag was removed.
- An open PR is not represented as merged.
- No branch in this ledger is represented as production-deployed.
- Synthetic or controlled experiments are labeled as such; they are not external scientific results.

## Repository scope

Current GitHub installation exposed three repositories:

1. `vertex-studyAI/vertexED.ai`
2. `vertex-studyAI/LAM-JEPA`
3. `vertex-studyAI/Text-To-Video`

Direct canonical repositories for Bu1LD, FinanceMeta, Atlas and Percy were not exposed by this installation, so no fresh direct-repo health claim is made for them.

---

## Text-To-Video — issue #6 artifact-integrity repair

**PR:** #8 `Make media outputs atomic after verification`  
**Head:** `54373226be9f578276fd3b7e8b1aae9f41f0a72c`  
**State:** REVIEW_READY  
**Production deploy:** not performed

### Files / behavior

- `apps/worker/src/atomic-encoder.ts`
- `apps/worker/src/lib/atomic-encoder.test.ts`
- updated external render-job CLI
- updated smoke encoder CLI
- `docs/atomic-media-output.md`

### Contract

A current render attempt is written to a unique sibling temporary path, verified using the existing media probe, then atomically renamed to the requested final path. Failed attempts are removed and a previously verified final file is preserved.

### Exact runner evidence

GitHub Actions on the exact PR head completed successfully, including:

- workspace typecheck/tests/web build;
- FFmpeg toolchain verification;
- real MP4 smoke encoding and verification;
- external validated render-job encoding;
- production dependency audit.

---

# Project 2424 follow-on package factory

The merged First-100 queue remains a queue, not 100 completed projects. This follow-on wave converted selected low-dependency entries into substantive package branches.

## T2424-0034 — Quant ML Visualizer

**PR:** #160  
**Head:** `e0ff93c79cc26d25b8a823348939382d2a5d93e5`  
**State:** CI_VERIFIED / REVIEW_READY

Artifacts:

- dependency-free walk-forward backtest core;
- expanding historical-only linear predictor;
- transaction-cost accounting;
- strategy/benchmark metrics;
- standalone browser visualizer;
- no-lookahead/future-mutation regression;
- README and STATUS boundary.

Claim boundary: software/demo baseline only; no alpha, investment or ML-superiority claim.

## T2424-0028 — Residual Event Tokenization

**PR:** #163  
**Head:** `f35ac3a28063aee4f41fc5cc44e775655092f383`  
**State:** CI_VERIFIED / REVIEW_READY

Artifacts:

- causal residual-event encoder;
- deterministic decoder;
- hold and linear predictors;
- threshold sweep / rate-error metrics;
- deterministic trend-with-defects experiment;
- reconstruction-bound regression suite;
- README and STATUS boundary.

Claim boundary: controlled synthetic codec mechanics; no SOTA compression claim.

## T2424-0037 — Controlled NLP-to-CAD

**PR:** #165  
**Head after repair:** `e06c91133dcc16f9e1846dde9b6908a0c64d16bc`  
**State:** CI_VERIFIED / REVIEW_READY

Artifacts:

- controlled plate/panel/bracket language parser;
- parametric intermediate geometry;
- 1/2/4-hole layouts;
- OpenSCAD source generation;
- SVG preview;
- browser demo;
- fail-closed safety envelope and tests.

Failure/repair evidence:

- first canonical release gate failed because the radius regex matched the final `r` inside `diameter`, reading `diameter 8` as radius `8`;
- parser token boundaries were repaired;
- exact repaired head then completed CI successfully.

Claim boundary: controlled part grammar; not arbitrary NLP-to-CAD or manufacturing validation.

## T2424-0035 — Grokking Agent evaluator

**PR:** #167  
**Head:** `89e55c7e466f34e54bfc5c870a6ad056a5f034b1`  
**State:** CI_VERIFIED / REVIEW_READY

Artifacts:

- learning-curve validation;
- causal smoothing;
- persistent memorization/generalization thresholds;
- delayed-generalization classifier;
- deterministic delayed positive control;
- matched non-grokking control;
- spike/persistence and future-data tests.

Claim boundary: evaluator mechanics on synthetic curves; no real-model grokking claim.

## T2424-0054 — Theory-Manifold Experiment Planner

**PR:** #170  
**Head:** `2e2b602aa75768b4ba1983f30ec27ca36f7419b9`  
**State:** CI_VERIFIED / REVIEW_READY

Artifacts:

- candidate/evidence schema;
- transparent value + uncertainty + novelty acquisition score;
- cost normalization;
- dependency blocking;
- hard time budget;
- repeated-family diversity penalty;
- evidence update and decision ledger;
- deterministic selection tests.

Claim boundary: transparent heuristic, not optimal Bayesian experimental design.

## T2424-0024 — Trust Under Uncertainty

**PR:** #172  
**Head after repair:** `a258ae35900e1b3f83c75604689603a80c43d45b`  
**State:** CI_VERIFIED / REVIEW_READY

Artifacts:

- Brier score;
- explicit calibration bins and ECE;
- risk-coverage curves;
- target-coverage selective risk;
- abstention reports;
- paired synthetic confidence controls;
- calibration regression suite.

Failure/repair evidence:

- first CI correctly rejected a synthetic fixture whose five-bin ECE was not actually better than the overconfident control;
- the control data were repaired instead of weakening the metric/test;
- exact repaired head then completed CI successfully.

Claim boundary: evaluator mechanics only; no real-model trustworthiness claim.

## T2424-0026 — Counterfactual Defect Worlds

**PR:** #174  
**Head:** `93c857e8f5e5408f9b5cda6c0053fbb2b903c993`  
**State:** CI_VERIFIED / REVIEW_READY

Artifacts:

- elementary cellular-automaton world kernel;
- paired baseline/counterfactual trajectories;
- localized flip/set intervention;
- Hamming and exact-index divergence;
- radius-one causal-cone verifier;
- deterministic Rule-110 experiment;
- locality/intervention regression suite.

Claim boundary: controlled causal-simulation mechanics; no physical or learned-world-model claim.

## T2424-0029 — Representation Phase Transitions for PDEs

**PR:** #176  
**Head:** `4c43ec9f88bda4f0857506730ab1083711f53dba`  
**State:** VERIFYING at ledger creation

Artifacts:

- analytic periodic 1D heat-equation solution;
- sine-mode projection;
- spectral energy and normalized entropy;
- 95%-energy effective mode count;
- diffusivity sweep;
- discrete representation-transition detector;
- analytic regression suite.

Canonical build-and-test had passed when this ledger was created; browser/accessibility tails were still running. Keep draft until the entire exact-head workflow completes successfully.

Claim boundary: operational effective-rank transition in a controlled PDE; not a universal physical or neural phase transition.

---

## Follow-on metrics at ledger creation

- Connected repositories inspected: **3**
- Repositories modified in follow-on work: **2**
- New follow-on PRs created: **9** total when including Text-To-Video #8 plus eight Project 2424 package PRs
- New Project 2424 substantive package PRs: **8**
- Project 2424 package PRs exact-head CI verified: **7**
- Project 2424 package PRs review-ready: **7**
- Project 2424 package PRs still verifying: **1**
- Package PRs merged by this follow-on wave: **0**
- Production deployments performed by this follow-on wave: **0**
- New regression test files added across follow-on package branches: **9** (one Text-To-Video + eight Project 2424)

## Persistent P0 / access gates

1. VertexED production/runtime identity remains a separate release-certification gate. Source CI success is not production readiness.
2. Bu1LD, FinanceMeta, Atlas and Percy canonical repos/workspaces were not directly exposed by the current connector.
3. LAM-JEPA remains behind its existing negative/inconclusive ARC generalization gate; no unsupported positive result was created.
4. Review-ready Project 2424 packages remain open/unmerged to avoid using repository merges as an implicit external deployment mechanism without explicit authorization.
