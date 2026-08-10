# Execution Queue

**Updated:** 10 August 2026 — follow-on package wave  
State vocabulary: `TODO`, `RUNNING`, `BLOCKED`, `FAILED`, `VERIFYING`, `DONE`.

## P0 — VertexED release truth

### VX-PROD
Project: VertexED  
Priority: P0 release  
Expected artifact: exact live immutable revision proof + authenticated production certification  
Dependencies: canonical production configuration and disposable production identities  
Assigned worker: release lane / owner access boundary  
State: BLOCKED  
Evidence: source CI is green on current candidate branches, but source status is not immutable live-revision proof. No production deployment was authorized in the follow-on wave.

## P0 — Project 2424 First-100

### P2424-FIRST100-QUEUE
Project: Project 2424  
Priority: P0  
Expected artifact: 100-entry evidence-first execution queue  
Dependencies: none  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: `FIRST_100_QUEUE.ndjson`, `FIRST_100_EXECUTION_WAVE.md`, strict dashboard and queue tests exist. Queue membership is not completion.

### P2424-WAVE-A
Project: Project 2424  
Priority: P0/P1  
Expected artifact: first substantive implementation wave from First-100  
Dependencies: self-contained low-dependency candidates  
Assigned worker: research/software factory  
State: DONE  
Evidence: eight package PRs created, exact-head CI verified and moved to review-ready: #160, #163, #165, #167, #170, #172, #174, #176. Strict completed count remains 0/100 pending the full promotion gate.

### P2424-0024-EVIDENCE
Project: Trust Under Uncertainty  
Priority: P1 research credibility  
Expected artifact: held-out real-model prediction benchmark with bootstrap uncertainty, subgroup slices and separately fit calibration baseline  
Dependencies: retained labeled predictions / frozen split  
Assigned worker: uncertainty research lane + independent QA  
State: TODO  
Evidence: PR #172 supplies tested evaluator mechanics and paired synthetic controls; external trustworthiness is not yet established.

### P2424-0026-EVIDENCE
Project: Counterfactual Defect Worlds  
Priority: P1  
Expected artifact: stochastic paired-world benchmark or small physical/learned simulator with identical randomness between baseline/counterfactual runs  
Dependencies: selected simulator/environment  
Assigned worker: simulation lane + independent QA  
State: TODO  
Evidence: PR #174 supplies tested cellular-world intervention/locality mechanics.

### P2424-0028-EVIDENCE
Project: Residual Event Tokenization  
Priority: P1  
Expected artifact: external rate-distortion benchmark with encoded-byte accounting and downsampling/change-point baselines  
Dependencies: selected real datasets  
Assigned worker: compression/research lane  
State: TODO  
Evidence: PR #163 supplies tested residual-event codec and reconstruction bounds on controlled data.

### P2424-0029-EVIDENCE
Project: Representation Phase Transitions for PDEs  
Priority: P1 research  
Expected artifact: frozen numerical nonlinear-PDE benchmark comparing Fourier and learned latent dimensions at matched reconstruction error  
Dependencies: selected PDE solver/data  
Assigned worker: scientific-ML lane + independent QA  
State: TODO  
Evidence: PR #176 supplies exact-head CI-verified analytic heat-equation spectral experiment.

### P2424-0034-EVIDENCE
Project: Quant ML Visualizer  
Priority: P1  
Expected artifact: chronological real-data benchmark with fixed train/validation/test periods, trivial/momentum/mean-reversion baselines and preserved negative results  
Dependencies: legally usable historical price dataset  
Assigned worker: quant research lane + independent QA  
State: TODO  
Evidence: PR #160 supplies tested no-lookahead walk-forward software/demo mechanics.

### P2424-0035-EVIDENCE
Project: Grokking Agent  
Priority: P1 research  
Expected artifact: frozen detector applied to retained real-model training curves plus threshold-sensitivity and matched controls  
Dependencies: real retained training logs  
Assigned worker: learning-dynamics lane  
State: TODO  
Evidence: PR #167 supplies tested delayed-vs-matched synthetic detector mechanics.

### P2424-0037-EVIDENCE
Project: Controlled NLP-to-CAD  
Priority: P1 demo/research  
Expected artifact: multi-part exact-geometry benchmark validated through a real CAD kernel  
Dependencies: CAD kernel/tooling and frozen prompt/target set  
Assigned worker: CAD lane + independent QA  
State: TODO  
Evidence: PR #165 supplies tested controlled plate grammar; first CI found and repaired a diameter/radius parser bug.

### P2424-0054-INTEGRATE
Project: Theory-Manifold Experiment Planner  
Priority: P1 research operations  
Expected artifact: planner driven by recorded First-100 score provenance and realized cost/value outcomes  
Dependencies: completed experiment outcomes  
Assigned worker: research-ops lane  
State: TODO  
Evidence: PR #170 supplies tested cost/value/uncertainty/diversity heuristic mechanics.

### P2424-RESTORE
Project: Project 2424 wider archive/source  
Priority: P0  
Expected artifact: verified canonical source with preserved dirty overlay and rerun baseline  
Dependencies: local/cloud archive access outside current connector scope  
Assigned worker: local Atlas/Percy environment  
State: BLOCKED  
Evidence: wider canonical source is not exposed by the current GitHub installation.

## P1 — Text-To-Video

### VIDEO-ATOMIC
Project: Text-To-Video  
Priority: P1 reliability  
Expected artifact: fail-closed current-attempt media publication boundary  
Dependencies: none  
Assigned worker: connected GitHub execution  
State: DONE  
Evidence: PR #8 exact-head CI passed real FFmpeg smoke, external render-job encoding, workspace build/tests and dependency audit. Review-ready; unmerged.

### VIDEO-HOSTED
Project: Text-To-Video  
Priority: P1/P2 product  
Expected artifact: hosted queue/storage lifecycle only if the product is intentionally moving beyond local-demo scope  
Dependencies: product decision + production infrastructure authorization  
Assigned worker: product/platform lane  
State: BLOCKED  
Evidence: local media integrity is now stronger; hosted deployment remains outside the authorized scope.

## P0/P1 — Inaccessible portfolio targets

### FM-TARGET
Project: FinanceMeta  
Priority: P0/P1  
Expected artifact: target authorization/release evidence  
Dependencies: canonical repo + production runtime access  
Assigned worker: access-boundary  
State: BLOCKED  
Evidence: target repository/runtime is not exposed by the current installation.

### BUILD-TARGET
Project: The Bu1LD  
Priority: P0/P1  
Expected artifact: immutable target source + role-journey certification  
Dependencies: canonical repo + Supabase/edge runtime access  
Assigned worker: access-boundary  
State: BLOCKED  
Evidence: target repository/runtime is not exposed by the current installation.

### PERCY-RUNTIME
Project: Percy  
Priority: P0  
Expected artifact: SQLite compatibility/integrity + real worker-liveness proof  
Dependencies: local source/database/runtime  
Assigned worker: local execution environment  
State: BLOCKED  
Evidence: no fresh runtime evidence can be generated through this GitHub-only connector.

### ATLAS-RUNTIME
Project: Atlas  
Priority: P1  
Expected artifact: current queue/worker/recovery/evidence-collection audit and repairs  
Dependencies: canonical source/runtime access  
Assigned worker: orchestration lane  
State: BLOCKED  
Evidence: canonical Atlas repository is not exposed by the current installation.

## P0 research — LAM-JEPA

### LAM-CONFIRM
Project: LAM-JEPA  
Priority: P0 research credibility  
Expected artifact: externally grounded, frozen multi-seed confirmatory benchmark with strong baselines, ablations and independent verification  
Dependencies: benchmark protocol/data + compute  
Assigned worker: research lane + independent QA  
State: TODO  
Evidence: retained ARC validation remains negative/inconclusive. Do not weaken the gate or claim superiority.
