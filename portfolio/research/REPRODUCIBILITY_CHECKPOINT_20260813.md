# Research Reproducibility Checkpoint — 2026-08-13

## Scope and truth boundary

This checkpoint consolidates the current evidence state across LAM-JEPA, the strongest Project 2424 experiments, NGMT, APEN/PEN, Eigen-JEPA, and selected advanced Atlas experiments.

A passing rerun means the frozen execution/result was reproduced. It does **not** automatically imply a positive scientific result, novelty, external validity, publication readiness, or research completion. Synthetic and construction-aligned screens remain labeled as such. Negative and inconclusive outcomes are retained.

## Executive status

| Project | Reproducibility state | Scientific state | Promotion boundary |
|---|---|---|---|
| LAM-JEPA | independently audited retained ARC artifacts; audit PR #69 CI green | **NEGATIVE / INCONCLUSIVE** | no ARC superiority; planner/target mechanisms unsupported; locked test remains unused |
| T2424-0025 / NGMT precursor | frozen Actions reproduction + later frozen rerun retained | **CONTROLLED ROBUST-READOUT SCREEN** | not a Transformer; clean control prevents unique non-Gaussian attribution |
| T2424-0027 | deterministic rerun + independent verifier | **CONTROLLED SYNTHETIC** | no real multilingual/linguistic-relativity claim |
| T2424-0037 / NeuroCAD | frozen 20-case deterministic rerun | **CONTROLLED DETERMINISTIC** | no learned or general NLP-to-CAD claim |
| T2424-0050 / Darcy | 20-seed frozen rerun | **CONSTRUCTION-ALIGNED SCREEN** | not a learned neural operator; no 2D/3D/real porous-media claim |
| NGMT | precursor mechanisms reproducible | **BLOCKED ARCHITECTURE CLAIM** | canonical B0/B1/B2/B3 sequence-model mechanism not frozen |
| APEN | fresh Atlas rerun + salience robustness extension | **BOUNDED POSITIVE MECHANISM / TRADEOFF** | rare-event gain is salience-dependent; no overall-MSE/general sequence superiority |
| PEN | no independently executable implementation recovered | **BLOCKED_SOURCE** | do not inherit APEN evidence |
| Eigen-JEPA | fresh real-data rerun | **NEGATIVE / BOUNDARY** | beats persistence, not strongest raw/log ridge controls |
| NPMS | fresh controlled rerun | **CONTROLLED POSITIVE DIAGNOSTIC** | no general neural-memory interpretability/transfer claim |
| Atlas advanced set | all 18 base packages freshly rerun; 39/39 suite passed | mixed positive/tradeoff/negative | archival external-validation gates remain open |

## 1. LAM-JEPA

A separate independent audit branch in `vertex-studyAI/LAM-JEPA` re-downloaded the two retained frozen ARC-v3 full-controls artifacts and verified their recorded ZIP digests, manifests, raw aggregates, cross-attempt drift, and verifier decision.

Frozen scientific protocol:

- scientific revision: `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`;
- seeds: `[1,2,3,4,5]`;
- epochs: `20`;
- batch size: `32`;
- eligible train rows: `1117`;
- eligible validation rows: `295`;
- locked test evaluated: `false`.

Independent aggregate parsing:

- full LAM-JEPA accuracy: `0.2549152542 ± 0.0129968064`, `n=5`;
- `no_planner`: `0.2501694915 ± 0.0129968064`;
- `no_target`: `0.2616949153 ± 0.0203954020`;
- shuffled-label control: `0.2630508475 ± 0.0145011862`.

The retained verifier remains `PROTOCOL_V3_FULL_CONTROLS_VALIDATION_VERIFIED`, while `mechanism_claim_authorized=false` and `research_complete=false`. The independent audit is in draft PR #69 and its Research claim boundary, ARC Protocol V2 QA, and Reproducibility CI checks pass.

**Verdict:** reproducible negative/inconclusive scientific result. Do not spend the locked ARC test to rescue this line.

## 2. Project 2424 frozen reproduction

The latest retained Project 2424 frozen rerun is recorded in `portfolio/research/evidence/project2424-frozen-rerun-20260813.json` and was merged to `main` in PR #292.

Latest retained environment/result record:

- source head: `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`;
- Actions workflow run: `31618609967`;
- rerun job: `94295733785`;
- Ubuntu `24.04.4`, Node `v22.22.0`, npm `10.9.4`, 4 CPUs, CUDA unused;
- artifact id: `9162627168`;
- artifact digest: `sha256:d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`;
- focused tests: T2424-0025 `10/10`, T2424-0027 `8/8`, T2424-0037 `6/6`, T2424-0050 `6/6`;
- T2424-0027 independent verifier: `PASS`.

The retained scientific files match the earlier clean reproduction payloads; expected differences are timing/environment metadata rather than scientific results.

### T2424-0025 / NGMT precursor

Thirty-seed screen:

- heavy-tail mean-readout MAE: `0.3615267855`;
- weighted-median MAE: `0.0165609423`;
- relative improvement: `95.4192%`;
- clean mean MAE: `0.0243549670`;
- clean median MAE: `0.0125939627`;
- clean relative improvement: `48.2900%`.

The fixed 50-seed contamination sweep also reproduces median/trimmed/Huber controls. Because the zero-contamination control strongly favors the median as well, the safest conclusion is **generic robust aggregation in this synthetic construction**, not a unique non-Gaussian-memory or Transformer effect.

### T2424-0027

- raw concept accuracy: `1.0`;
- raw language accuracy: `1.0`;
- language-centered concept accuracy: `1.0`;
- language-centered language accuracy: `0.361111` vs chance `0.333333`;
- normalized language-leakage reduction: `0.958333`;
- verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`.

### T2424-0037 / NeuroCAD

Frozen 20-case benchmark: `20/20` pass with syntax/execution, geometry validity, dimension accuracy, and constraint satisfaction all `1.0`. This remains a deterministic compiler/IR benchmark rather than evidence of arbitrary natural-language CAD.

### T2424-0050 / Darcy

- 20 fixed seeds;
- baseline pressure MAE: `0.0658913916`;
- reduced-resistance pressure MAE: `0.0011366559`;
- mean relative improvement: `97.8766%`;
- mean flux relative error: `1.369e-16`;
- verdict: `PASS_BOUNDED_DARCY_LATENT_SCREEN`.

The harmonic block representation and generator are aligned by construction, so no neural-operator or real-PDE superiority claim follows.

## 3. Reproducibility bug lineage

A later Project 2424 verifier run failed because the verifier expected an obsolete ablation JSON schema after the scientific outputs had already been generated. The scientific outputs were preserved. Verifier-only commit `bd2a4d3d...` repaired the schema reader; the unchanged focused rerun then passed, followed by another clean successful run. This is recorded as a verifier defect, not silently rewritten scientific evidence.

## 4. NGMT

The reproducible T2424-0025 screen and a separate clean-room heavy-tail memory probe are useful precursor evidence, but **no canonical Non-Gaussian Memory Transformer has been frozen**. Before architecture-level promotion, freeze and run capacity/compute-matched:

- B0 no external memory;
- B1 standard learned memory;
- B2 Gaussian/reference probabilistic memory;
- B3 proposed non-Gaussian memory.

Use delayed/noisy recall, heavy-tail corruption, multimodal/regime-switch/non-stationary conditions, a clean Gaussian control, multi-seed uncertainty, mechanism ablations, and accepted/real sequence benchmarks. Until then the project remains blocked at architecture-level claim status.

## 5. APEN / PEN

Fresh APEN synthetic delayed-event result across 48 paired conditions:

- APEN rare-event MSE: `17.060349`;
- recent window: `18.967381`;
- exponential trace: `18.860263`;
- uniform memory: `18.714592`;
- oracle-delay reference: `16.687710`.

APEN minus recent rare-event MSE is `-1.907033`, 95% CI `[-2.216717,-1.599460]`; APEN minus exponential is `-1.799915`, 95% CI `[-2.090221,-1.516058]`, `n=48`.

However, APEN overall MSE (`2.210393`) is not superior to all controls. In the frozen salience-dropout stress test the rare-event advantage nearly disappears at 80% dropout and reverses at 100%. This condition is part of the result.

PEN is not counted separately because an independently executable PEN implementation was not recovered from the frozen package.

## 6. Eigen-JEPA

Real bundled Fama-French five-factor covariance forecasting, chronological held-out `n=111` blocks:

- raw ridge matrix MSE: `5.7734384e-09`;
- log ridge: `5.7896089e-09`;
- Eigen-JEPA: `5.8318226e-09`;
- Cholesky: `5.8762487e-09`;
- persistence: `7.7708315e-09`.

Eigen-JEPA improves over persistence but not the strongest raw/log ridge controls. Preserve this as negative/boundary evidence; do not metric-shop or relabel it as superiority.

## 7. Other advanced experiments

The fresh Atlas V4 execution reran all 18 base experiment packages, passed `39/39` tests, regenerated artifacts/manuscripts, and revalidated the release. Strong next candidates remain bounded by their current protocols.

Notable retained results include:

- NPMS: regime classification `0.928571`; within-coordinate spectrum similarity `0.995961` versus raw-parameter similarity `0.099271` in the controlled reservoir study;
- Memory Spectrum Transfer: spectrum delay-regime classification `0.875` versus parameter-summary `0.666667` across 24 trained small RNN/GRU models;
- Counterfactual Representation Surgery: OOD task accuracy `0.886481`, concept-probe accuracy `0.499259`, erasure `0.984296` in its controlled paired-subspace setup;
- Latent Law Compiler: test MSE `0.004185`, exact support `0.822222` versus MDL-all MSE `0.009571`, exact support `0.462222`, with metadata brittleness retained;
- Probabilistic Dimensional Compiler: test MSE `0.000469`, exact support `0.777778`, false-discovery rate `0.238889`; hard-metadata MSE `1.640980`.

## Highest-value next gates

1. LAM-JEPA: merge/review the independent evidence audit; preserve the failed ARC line and start a separately versioned hypothesis only if scientifically justified.
2. NGMT: freeze the actual learned B0/B1/B2/B3 sequence-model experiment before any Transformer claim.
3. APEN: move to a predeclared naturalistic delayed-event task with matched learned neural-memory baselines and unreliable-salience controls.
4. PEN: locate/implement an independently frozen executable mechanism or remain `BLOCKED_SOURCE`.
5. Eigen-JEPA: only continue under a new preregistered cross-dataset/mechanism-specific hypothesis; preserve the current losing ridge comparison.
6. NPMS/MST and the strongest Atlas families: add naturalistic/accepted datasets, closest serious baselines, matched compute/tuning, and independent clean-room replication.

## Canonical state rule

`REPRODUCED` means the specified frozen execution and evidence chain reproduced. It is deliberately distinct from `EXTERNALLY_VALIDATED`, `SUBMISSION_READY`, and `PUBLISHED`.
