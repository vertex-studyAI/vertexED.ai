# Execution Evidence — 2026-08-10

Only achievements with directly observed repository/workflow evidence are recorded here.

## Asteroid Tracklet Baseline — frame/identity correctness repair

Project: Asteroid Tracklet Baseline  
Repository: `vertex-studyAI/vertexED.ai`  
PR branch: `agent/asteroid-tracklet-baseline-20260810`  
Commits:
- `41bcbb77a964622b759094642c5ca1da911dafbe`
- `aaab8d5a2ff1b02d0c489e5201f2f60803763ffa`

Files changed:
- `portfolio/new-projects/asteroid-tracklet-baseline/src/asteroid_tracklet/linker.py`
- `portfolio/new-projects/asteroid-tracklet-baseline/tests/test_linker.py`

Defect repaired:
- mixed frame numbers inside one caller-supplied frame group could silently drive prediction against the wrong timestamp;
- detection IDs were treated as globally unique strings, so IDs legitimately repeated in different frames could falsely conflict.

Verification added:
- reject mixed frame numbers inside one group;
- reject non-increasing frame-group timestamps;
- prove repeated IDs in different frames can still form two independent tracks;
- retain the existing clean-track, nonlinear-rejection and synthetic precision/recall falsifier tests.

Exact-head evidence:
- head: `aaab8d5a2ff1b02d0c489e5201f2f60803763ffa`
- workflow: canonical `CI`
- run: `31407928862` / #593
- result: `success`

Known limitation:
- synthetic benchmark only; no claim of asteroid discovery, orbit determination, novelty, or real-telescope usefulness.

## Project 2424 — First 100 execution queue verification

Project: Project 2424  
Repository/control branch: `vertex-studyAI/vertexED.ai` / `agent/project2424-first100-20260810`  
PR: #155  
Head: `7bb3e7f961677aba787dc611d574a96742a4f63e`

Artifacts inspected:
- `portfolio/project2424/FIRST_100_EXECUTION_WAVE.md`
- `portfolio/project2424/FIRST_100_QUEUE.ndjson`

Exact-head evidence:
- workflow: canonical `CI`
- run: `31405436666` / #589
- result: `success`

Verified interpretation:
- exactly 100 queue records are represented by the branch artifact;
- the branch explicitly distinguishes `EXECUTION_READY` contracts from completed/submission-ready research;
- the generic acceptance gate requires source identity, falsifiable claim, frozen protocol, runnable command, baseline, raw artifacts, ablation/negative analysis, go/no-go verdict and independent QA before paper-ready claims.

Known limitation:
- this is an execution queue, not evidence that 100 projects satisfy the completion definition. The canonical Project 2424 source repository is still external to this GitHub installation.

## Text-to-Video — atomic media-output repair verification

Project: VertexED Notes-to-Video V6  
Repository: `vertex-studyAI/Text-To-Video`  
Issue: #6  
PR: #7  
Head: `81125b70d9a82b7becf56ba8594dfeba73712a4c`

Concurrent implementation found rather than duplicated:
- encode/verify against same-filesystem staging media;
- promote verified media only after checks pass;
- clean current-attempt staging on failure;
- preserve prior final media when a new attempt fails;
- failure reports remain `mediaReady: false` without current-run media digest/URL;
- regressions cover failed-attempt preservation and explicit promotion.

Exact-head evidence:
- workflow: `CI`
- run: `31408198077` / #18
- result: `success`

Known limitation:
- this remains a local deterministic media pipeline. Production storage, hosting, narration and queue lifecycle are not implemented by this evidence.

## LAM-JEPA — repaired-v5 evidence-state reconciliation

Project: LAM-JEPA  
Repository: `vertex-studyAI/LAM-JEPA`

Relevant immutable history observed:
- `df249086e9171febaa77333a4c62888f35265c40` — guarded v5 quantizer repair;
- `168f6beb434610752da4cb2cb6161f15ee026663` — repaired-v5 validation protocol freeze;
- `18bd608a05bc308056e6279b347ff3ddb2b751be` — frozen repaired-v5 validation execution path;
- `05c039fcc02c09c0aa1c1487596dcdd741ee6d51` — verifier float32 tolerance repair.

Observed retained verdict from PR #52 history:
- `VALID_NEGATIVE_OR_INCONCLUSIVE_VALIDATION`;
- generalization gate false;
- quantization-benefit gate false;
- ARC confirmatory test absent.

Claim boundary:
- real research execution exists;
- the adverse/inconclusive result must be preserved;
- no superiority, confirmatory-test, external-generalization, or `RESEARCH_COMPLETE` claim follows.

## Portfolio execution status artifact

Repository: `vertex-studyAI/vertexED.ai`  
Branch: `agent/portfolio-execution-20260810`  
Commit: `cfc8e1f3a23c58d3980dec32ad24febf19d20f8c`

Artifact:
- `portfolio/execution/2026-08-10/MASTER_PORTFOLIO_STATUS.md`

Purpose:
- truth-scoped map of connected repositories;
- explicit `BLOCKED_EXTERNAL` classification for inaccessible targets;
- no production/deployment claims inferred from source CI.
