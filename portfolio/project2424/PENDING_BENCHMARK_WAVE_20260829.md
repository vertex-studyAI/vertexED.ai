# Project 2424 Pending Benchmark Wave — 2026-08-29

## Purpose

This ledger records what was actually executed in the 2026-08-29 pending benchmark wave and prevents a green CI run from being interpreted as scientific validation of all Project 2424 ideas.

Execution branch: `research/2424-pending-benchmark-wave-20260829`  
Execution commit: `9b1b333b567b66587e1a3778bacaf906869755a1`  
Draft PR: `#569`  
Research reproducibility run: `33256768781` — **SUCCESS**  
Canonical CI run: `33256778805` — **SUCCESS**  
Evidence artifact: `9716038865` (`research-repro-wave-20260813-current-main`)  
Artifact digest: `sha256:bebc6f818f904529099607b1f228228375bb455a478ba846ac163434c945cfa8`  
Environment: Ubuntu 24.04 hosted runner, x86_64, Node `v22.23.2`, npm `10.9.8`, 4 logical CPUs.

## Execution matrix

| ID | What actually ran | Evidence-backed status after this wave | Claim boundary / next gate |
| --- | --- | --- | --- |
| `T2424-0019` | Recovered NPMS evidence validator + recovered report hash | `EXACT_HEAD_RECOVERY_VALIDATED / SOURCE_MIGRATION_PENDING` | Not an original-source NPMS rerun. Recover original source/config/result/evidence/manuscript tree or close `SOURCE_BLOCKED`. |
| `T2424-0024` | Frozen synthetic evaluator-mechanics package + focused tests | `CONTROLLED_MECHANICS_REPRODUCED` | Synthetic mechanics only; no broader trust-under-uncertainty empirical claim. |
| `T2424-0025` | Frozen 30-seed heavy-tail screen + fixed 50-seed ablation + schema verifier + focused tests | `ROBUST_READOUT_REPRODUCED / MECHANISM_NON_UNIQUE` | Robust aggregation effect reproduced. Clean-control advantage prevents a uniquely non-Gaussian learned-memory interpretation. A learned NGMT successor requires a separately frozen B0/B1/B2/B3 study. |
| `T2424-0026` | Frozen counterfactual defect-world mechanics + focused test | `EXPECTED_FAILURE_MECHANICS_REPRODUCED` | Synthetic failure-mechanics package only. |
| `T2424-0027` | Frozen latent-language diagnostic + independent verifier + focused tests | `SYNTHETIC_LANGUAGE_LEAKAGE_MECHANICS_REPRODUCED` | Deterministic synthetic construction only. Real multilingual encoder extension must be separately preregistered. |
| `T2424-0028` | Frozen residual-event tokenization screen + focused tests | `EVENT_COMPRESSION_MECHANICS_REPRODUCED` | 1,200 ticks -> 80 events, 15x event-count compression on the frozen fixture. No real-system efficiency claim. |
| `T2424-0029` | Frozen PDE-transition representation screen + focused tests | `PDE_TRANSITION_METADATA_MECHANICS_REPRODUCED` | Representation/checksum mechanics only; no PDE model training or generalization claim. |
| `T2424-0035` | Frozen delayed-generalization detector + focused tests | `GROKKING_DETECTOR_MECHANICS_REPRODUCED` | Synthetic detector mechanics only. |
| `T2424-0037` | Frozen legacy 20-case NeuroCAD benchmark + focused tests | `LEGACY_BENCHMARK_REPRODUCED / VALIDATION_DOMINANT_CAUSAL_FALSIFICATION_PRESERVED` | Legacy 19/20 vs 12/20 result reproduced, but later matched-validation evidence still falsifies the typed-parser causal story. Held-out successor required. |
| `T2424-0040` | Frozen prerequisite-aware learning-graph mechanics + verifier + focused tests | `LEARNING_GRAPH_MECHANICS_REPRODUCED` | Deterministic/synthetic learning-graph mechanics only. |
| `T2424-0050` | Frozen deterministic Darcy screen + focused tests | `FROZEN_SYNTHETIC_SCREEN_REPRODUCED / HOLD_MIXED` | Parent remains HOLD/MIXED. No 2D successor training is authorized until the full preregistration/authorization manifest is frozen. |
| `T2424-0054` | Frozen theory-manifold planner mechanics + focused tests | `PLANNER_MECHANICS_REPRODUCED` | Deterministic planner smoke evidence only. |
| `T2424-1767` | Resource-bounded MoE deterministic smoke benchmark + canonical root tests + raw digest | `CI_VERIFIED_SOFTWARE_SMOKE / SCIENTIFIC_VALIDATION_PENDING` | Budget 4 is best on the frozen synthetic fixture; real Scientific-ML workloads, measured resource accounting and matched baselines remain required. |
| `T2424-1768` | Self-verifying MoE synthetic smoke benchmark + focused tests | `SELF_VERIFYING_MOE_SMOKE_REPRODUCED` | Synthetic smoke/mechanics only; no external performance or novelty claim. |

## Selected exact results

### T2424-0025 — robust readout

Frozen 30-seed screen:

- heavy-tail mean MAE: `0.3615267854795439`
- heavy-tail median MAE: `0.016560942283778028`
- heavy-tail reduction: `0.9541916505692136`
- clean mean MAE: `0.027944687357858787`
- clean median MAE: `0.014232760893362878`
- clean reduction: `0.4906745368944836`
- verdict: `PASS_HEAVY_TAIL_MEMORY_SCREEN`

The strong clean-control improvement is preserved as mechanism-negative evidence rather than hidden.

### T2424-0027 — latent-language diagnostic

- raw concept accuracy: `1.0`
- raw language accuracy: `1.0`
- centered concept accuracy: `1.0`
- centered language accuracy: `0.3611111111111111`
- normalized leakage reduction: `0.9583333333333334`
- verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`

### T2424-0028 — residual-event tokenization

- ticks: `1200`
- events: `80`
- event-count compression factor: `15`
- effective tick compression: `0.9333333333333333`
- average memory-value agreement: `1.0`
- reduced event fraction: `1.0`

### T2424-0037 — legacy NeuroCAD benchmark

- structured/exact success: `19/20` (`0.95`)
- direct success: `12/20` (`0.60`)
- valid STL among successful structured/exact outputs: `12/12`
- valid STL among successful direct outputs: `12/12`

This does not overturn the later `VALIDATION_DOMINANT` matched-validation diagnostic.

### T2424-0050 — frozen Darcy screen

- seeds: `20`
- baseline relative L2: `0.06589139158870963`
- proposed relative L2: `0.0011366558927507303`
- relative improvement: `0.978766366357442`
- full-factor gain vs ablation: `10.187550775309525`
- flux max absolute residual: `1.3688052427629493e-16`

This is a bounded deterministic synthetic screen and does not authorize successor training or establish neural-operator generalization.

### T2424-1767 — resource-bounded MoE smoke frontier

Raw result digest: `sha256:7628d160c05e529e84b58e885087947b2912f12e964b3da3dd0bba6d370a698e`

| Budget | MAE | Average cost |
| ---: | ---: | ---: |
| 1 | `0.6834355589976151` | `1.0` |
| 2 | `0.38543284160013064` | `1.6273291925465838` |
| 4 | `0.024811915852369105` | `3.372670807453416` |
| 7 | `0.03324567627497309` | `4.118012422360248` |
| full uniform | `0.8473486024991048` | `7.0` |

The frozen frontier is non-monotonic. Budget 4 is better than budget 7 on this synthetic task. Do not rewrite this as a generic compute-scaling claim.

## Explicit non-executions / blockers

These are not failures of the benchmark wave; they are deliberate integrity boundaries.

| ID / lineage | State | Reason |
| --- | --- | --- |
| `T2424-0016` PST | `SOURCE_BLOCKED` | Original MODEL-PST implementation/checkpoints/raw-evidence archive not recovered. |
| `T2424-0014` | `SOURCE_BLOCKED` | No current canonical source package was available on the execution head. |
| `T2424-0032` | `SOURCE_BLOCKED` | No current canonical source package was available on the execution head; stale historical metadata is insufficient to execute Eigen-JEPA. |
| `T2424-1769` | `SOURCE_BLOCKED` | No current canonical source package was available on the execution head. |
| `T2424-1863` | `FREEZE_NEGATIVE / NOT_RERUN` | Frozen negative result is preserved; no rescue-tuning or repeat-until-positive run was authorized. |
| `T2424-0050` 2D successor | `TRAINING_BLOCKED_AUTHORIZATION` | Parent frozen screen may reproduce, but successor outcome access/training requires a complete frozen protocol and explicit authorization. |
| unresolved First-100 registry/proposal rows | `BLOCKED` or existing queue disposition | Proposal/registry presence is not executable source and cannot inflate experiment-completion counts. |

## Integrity conclusion

This wave establishes exact-head reproducibility evidence for the source-backed packages listed above. It does **not** establish that all 2,424 Project 2424 proposals have implementations, runnable experiments, positive results, independent replication, novelty, publication readiness, or external validation.

Negative, mixed, falsified and blocked outcomes are valid closure states and must remain visible.
