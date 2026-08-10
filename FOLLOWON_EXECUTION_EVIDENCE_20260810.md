# FOLLOW-ON EXECUTION EVIDENCE — 2026-08-10

This ledger extends `EXECUTION_EVIDENCE.md` and reconciles concurrent execution against current repository truth.

## Evidence rules

- Merged, review-ready, tested, deployed, and research-validated are different states.
- Controlled/synthetic experiments are not external scientific validation.
- Strict Project 2424 completion remains governed by the nine-part gate in `portfolio/project2424/PROJECT_2424_FIRST_100.md`.
- No inaccessible repository is represented as freshly inspected or repaired.

## Connector scope

Visible repositories: `vertex-studyAI/vertexED.ai`, `vertex-studyAI/LAM-JEPA`, and `vertex-studyAI/Text-To-Video`. Canonical Bu1LD, FinanceMeta, Atlas, Percy, and wider local Project 2424 runtime/source were not exposed.

# Text-To-Video — canonical repair merged

PR #7, **Fail closed on stale or partial render outputs**, is merged as `1d1ad2d027ca38e6fb0581ccf280333da454b672`. Exact implementation head `4791f21a55217520955db603d917d8a5f2d7f06a` passed CI run `31409630201`.

The merged contract stages each current attempt away from the final MP4, runs FFmpeg/ffprobe verification and provenance hashing on staging, promotes verified media only as the final media-state transition, cleans staging on failure, preserves a previous verified final artifact, and exposes no current-attempt digest/URL on failure. The acceptance gate covered workspace install/release checks, FFmpeg toolchain verification, real MP4 smoke encoding, external render-job encoding, dependency audit, and evidence uploads.

Parallel PR #8 is closed unmerged and is not canonical evidence. No hosted rendering, queue, storage service, narration provider, deployment, secret, or external API behavior was added.

# LAM-JEPA — research truth and provenance merged

PR #53 merged `RESEARCH_STATUS.md` as `33e8e7347856da0c128ead38717bbc9fa98aa919`. It records the external ARC eligibility boundary, frozen controls, capacity-matched comparison, ARC-v5 repair/validation outcome, supported versus unsupported claims, and the stop rule forbidding locked ARC test use to rescue the failed superiority/mechanism hypothesis. It does **not** claim `RESEARCH_COMPLETE`.

PR #54 merged `RELEASE_PROVENANCE.md` as `6f7fbe8914dc02760a7bd17c7ada4a5104e8b065`. It records implementation surface, validation dataset identity/hashes/counts, test-split prohibition, comparison conditions, dependency surface, reproduction entry points, and scientific claim boundaries.

The remaining publication blockers are owner decisions, not engineering guesses: no root `LICENSE` was invented, and no final `CITATION.cff` was fabricated because license compatibility, public author list/order, release title/version, and identifiers require explicit approval. The scientific conclusion remains negative/inconclusive; no model retraining, result reinterpretation, test-split access, or external release was performed by these provenance changes.

# Project 2424 — merged verified packages

| ID | Package | Evidence | Boundary |
|---|---|---|---|
| T2424-0034 | Quant ML Visualizer | PR #166 merged; exact head `b62475cec9d867209ce64ee58bb6a22f25633439`; CI `31409366246` success | descriptive quantitative tool/demo; no predictive-alpha claim |
| T2424-0036 | Rubik's A* Intelligence | PR #169 merged; exact head `422807799833247d6ea7ab095b557d26d41e2b57`; CI `31409707818` success | bounded orientation-free 2×2 corner-permutation A*; not full cube solver |
| T2424-0038 | Obscured Records editorial triage | PR #178 merged; exact head `abf8c998bab4bc0adedfb3d1d1a19432603c355f`; CI `31411209123` success | deterministic evidence-gated triage; not truth/legal verifier or autonomous publisher |
| T2424-1767 | Resource-Bounded MoE Operator | PR #162 merged; exact head `1496c991a3b00473700b2f4c3d173d428f793e9b`; CI `31409012137` success | synthetic resource/error screen; no superiority claim |
| T2424-1863 | Resource-Bounded Local Operator | PR #177 merged | 20-seed screen failed predeclared >75% gate at 67.777%; negative/inconclusive verdict preserved |

T2424-1863 retained: learned coefficient `0.179689` versus planted `0.18`, persistence RMSE `0.015610`, local-operator RMSE `0.005023`, 67.777% improvement, and zero-diffusion control improvement `-0.029%`. The gate was not relaxed.

# Project 2424 — exact-head-green review-ready packages

| ID | PR | Verified head | Boundary |
|---|---:|---|---|
| T2424-0024 | #172 | `a258ae35900e1b3f83c75604689603a80c43d45b` | calibration/selective-risk evaluator on paired synthetic controls |
| T2424-0026 | #174 | `93c857e8f5e5408f9b5cda6c0053fbb2b903c993` | deterministic counterfactual cellular-world intervention/locality simulator |
| T2424-0028 | #163 | `f35ac3a28063aee4f41fc5cc44e775655092f383` | residual-event codec/reconstruction mechanics on controlled series |
| T2424-0029 | #176 | `4c43ec9f88bda4f0857506730ab1083711f53dba` | analytic heat-equation spectral effective-rank experiment |
| T2424-0035 | #167 | `89e55c7e466f34e54bfc5c870a6ad056a5f034b1` | delayed-vs-matched synthetic learning-curve evaluator |
| T2424-0037 | #165 | `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` | controlled plate language to validated SVG/OpenSCAD |
| T2424-0053 | #179 | `298b739675850d4980a1397cd3bf5fefd699e5dc` | z-normalized 1D scientific motif indexing mechanics |
| T2424-0054 | #170 | `2e2b602aa75768b4ba1983f30ec27ca36f7419b9` | transparent cost/value/uncertainty/diversity heuristic |

Two failures were caught rather than hidden: NLP-to-CAD initially misread `diameter` through a radius-token regex collision, and Trust Under Uncertainty initially used a synthetic control that was not actually better under five-bin ECE. Both were repaired without weakening their tests and exact repaired heads passed CI.

PR #160 is a noncanonical T2424-0034 walk-forward/no-lookahead/transaction-cost follow-up created before canonical #166 landed. It is not counted as another project and should be reconciled into the canonical tree rather than merged as a duplicate.

# Reconciled Project 2424 counts

- Queue entries: **100 / 100**
- Distinct entries with substantive verified implementation packages: **13 / 100**
- Merged verified packages on `main`: **5 / 100**
- Exact-head-green review-ready distinct packages: **8 / 100**
- Strict certified complete: **0 / 100**
- Merged synthetic research screens with retained result/verdict evidence: **2**
- Preserved negative/inconclusive merged screen: **1**

Strict certification stays 0 because project-specific real/external data, stronger baselines, raw artifacts, negative/ablation analysis, explicit verdicts, and independent scientific QA remain required.

# Persistent gates

1. VertexED immutable production revision and authenticated disposable-account certification remain unresolved.
2. Bu1LD, FinanceMeta, Atlas, Percy, and wider Project 2424 sources/runtimes are not exposed by the current connector.
3. LAM-JEPA remains negative/inconclusive on frozen ARC validation; locked ARC test access is not authorized to rescue the hypothesis.
4. LAM-JEPA publication packaging still requires owner approval for root licensing and final citation/author metadata.
5. Review-ready Project 2424 packages should not be auto-merged through a path that may trigger external deployment without explicit authorization.
