# RESEARCH_STATUS

**As of:** 2026-08-22 14:25 IST  
**Rule:** preserve negative, mixed, falsified and inconclusive outcomes. Do not retune frozen tests, reuse prohibited seeds, cherry-pick, relabel failures, or promote pre-outcome scaffolds to results.

## Current truth

| Line | State | Verified evidence / next gate |
|---|---|---|
| LAM-JEPA ARC | **NEGATIVE_RESULT_COMPLETE / RELEASE-BLOCKED** | Frozen ARC result remains negative/inconclusive. Reproducibility and paper-provenance infrastructure are verified. Current `LAM-JEPA/main` release gate already marks final related-work integration PASS. Remaining gates are owner-controlled license/authorship/citation/tag decisions and genuinely independent external reproduction/review. No locked-test rescue run. |
| PHY-JEPA-v1 | **CONTINUE / PRE-OUTCOME** | Protocol predeclared 2026-08-21. Phase-0 deterministic damped-oscillator dataset/provenance sanity completed: 64 trajectories, train/validation/test = 44/9/11, generator/manifest hashes recorded. This is not a JEPA-vs-baseline result. Next authorized gate is a bounded single-system, one-seed phase-1 smoke run under the frozen protocol. |
| PO-OP-JEPA-v1 | **BLOCKED / PRE-OUTCOME** | Partial-observation operator-JEPA scaffold exists on LAM-JEPA PR #94. Dataset provenance for Burgers/Darcy and explicit mask-leakage checks must be frozen before any outcome run. |
| IRIS v0.2 | **NEGATIVE/INCONCLUSIVE — FROZEN** | Canonical development evidence failed the strong robust-baseline/persistent-shift development gate. Metric/source provenance was recovered. Seeds `1000–1029` remain prohibited. Do not rerun or reinterpret canonical trajectories. A successor requires a new versioned protocol and clean split from frozen v0.2. |
| NeuroCAD typed-parser mechanism | **FAILED — FROZEN** | Component ablation remains `VALIDATION_DOMINANT`; matched validation recovers the observed gap, falsifying the typed-parser causal interpretation on the bounded benchmark. Product-engineering Alpha is separate from this research claim. |
| NeuroCAD S3 successor | **BLOCKED / PRE-OUTCOME** | PR #430 freezes a 150-case broader successor protocol, baseline families, ablations, promotion/falsification thresholds and an execution-authorization hash gate. Current blocker: `DATASET_AND_MODEL_IDENTITY_BLOCKED`; no S3 evaluation is authorized until benchmark records/hashes and model/provider identities are frozen. |
| NGMT v0.1 | **NEGATIVE_RESULT_COMPLETE** | Frozen negative result. Any continuation must be v0.2+ with a fresh protocol; no in-place rescue. |
| Eigen-JEPA | **NEGATIVE/MIXED — FROZEN** | Classical baselines beat the primary claim; provenance discrepancy remains historically documented. No metric shopping or in-place rescue. |
| Eigen-Finance | **UNKNOWN / SEPARATE** | Must be independently verified; do not inherit Eigen-JEPA evidence or status by analogy. |
| NPMS | **NEGATIVE/INCONCLUSIVE — FROZEN** | Controlled replay remains parameter-confounded/non-unique with missing/spurious modes in the retained result. Any continuation requires a new natural/causal successor protocol. |
| APEN | **INCONCLUSIVE** | Controlled salience signal existed under aligned salience; shuffled/random controls erased the gain. Architecture-level claim remains unproven. Any stronger claim needs a fresh frozen protocol. |
| PEN | **BLOCKED / UNKNOWN IMPLEMENTATION** | No current authoritative implementation/result verified in this repository. Inspect actual source before any scientific claim. |
| Darcy T2424-0050 | **BLOCKED / NO TRAIN** | Pre-outcome only. `training_authorized=false`; do not auto-merge/deploy or run outcome training until frozen B3/B4 baselines, exact environment/hardware and covariance/OOD interpretation gates are closed. |
| External Darcy FNO audit | **INCONCLUSIVE** | Separate from Project 2424. Three-seed evidence is invalid for the intended sample-count claim because the 16×16 loader supplied 50 instead of 200 samples. Smallest clean rerun/control matrix remains open; do not merge this evidence into T2424-0050. |
| T2424-1863 | **FAILED — FROZEN** | Negative synthetic result; preserve as failure, no rescue. |
| Project 2424 overall | **CONTINUE / EVIDENCE-CLOSURE** | Registry historically contains 2,424 rows; strongest implemented/evidence packages should be closed before opening more. NeuroCAD T2424-0037 and other source-backed Wave-001 packages are real; many rows remain ideas/evidence-recovery rather than papers. |
| Weather-JEPA | **PRE-OUTCOME** | Scaffold/protocol exists with baselines, spatial/temporal splits, uncertainty reporting and stop rules intended frozen before outcome training. No positive result is verified. |
| Space-JEPA / satellite telemetry | **PRE-OUTCOME / EXTERNAL REVIEW ACTIVE** | Scoped as a falsifiable temporal-JEPA anomaly-detection pilot on ESA-ADB with matched forecasting/reconstruction baselines, leakage-resistant splits, frozen thresholding and kill criteria. Research foundation has external technical reviewers/commenters, but no verified implementation/held-out positive result yet. |
| Time-Series JEPA | **PRE-OUTCOME / PARTIAL** | Treat only as a successor family under explicit partial-observability hypotheses; no broad superiority claim authorized. |
| Hercules / Olympus | **ARCHIVED ACTIVE-COMPUTE** | No significant model-scale compute until a decisive matched protocol is frozen. |

## Portfolio execution order

1. Close LAM-JEPA release metadata + genuinely independent review without changing science.
2. Run only authorized bounded successor gates: PHY-JEPA phase-1; no broader JEPA training until smoke correctness is recorded.
3. Close IRIS/NGMT/Eigen-JEPA/NPMS negative-result packages rather than rescue them.
4. Resolve NeuroCAD S3 dataset/model identity before opening its confirmatory split.
5. Close Project 2424 evidence/provenance on strongest candidates before adding rows.
6. Keep Weather-JEPA and Space-JEPA pre-outcome until frozen baselines/splits/thresholds/reviewer gates are complete.

## Global stop rules

- No frozen negative/mixed/falsified result may be retuned in place.
- No prohibited seed reuse, including IRIS `1000–1029`.
- No test-label tuning, point adjustment, hand-picked windows, or post-hoc architecture shopping.
- `T2424-0050` remains `NO TRAIN` until explicit authorization gates close.
- Product/software improvements do not rewrite scientific mechanism verdicts.
- `Prepared`, `scaffolded`, `CI-green`, or `review requested` are not scientific outcomes.
