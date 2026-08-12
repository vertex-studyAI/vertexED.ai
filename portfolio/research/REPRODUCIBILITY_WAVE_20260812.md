# Research Reproducibility Wave — 12 August 2026

**Portfolio source head:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**LAM-JEPA source head:** `2f59b4297e5978d4ce769ebe95adb363e1e75d7a`  
**Objective:** reproducibility, falsification and provenance; not positive-result maximization.

## Evidence classes

- **FRESH_EXACT_SOURCE:** source bytes were reconstructed from the connected repository, verified against Git blob hashes, and executed in the current sandbox.
- **RETAINED_SAME_DAY:** evidence was already retained in the repository from a documented 12 August rerun, but was not independently rerun in this sandbox.
- **REPOSITORY_CI:** exact-head repository checks/workflows observed; this is execution/package evidence, not a new scientific metric.
- **BLOCKED_ENVIRONMENT:** command/source is known but current sandbox cannot execute without missing network/data/dependencies.
- **IDENTITY_BLOCKED:** no distinct verified implementation exists for the named research line.

## Priority ledger

| Priority | Research line | Current wave status | Scientific result / boundary | Next reproducibility gate |
|---:|---|---|---|---|
| 1 | LAM-JEPA | REPOSITORY_CI + BLOCKED_ENVIRONMENT | Frozen ARC validation remains negative/inconclusive; matched-supervised advantage and planner/target mechanism claims unsupported | fresh ARC rerun on network/data-capable compute without unlocking test; retain exact raw artifacts |
| 2 | T2424-1768 Self-Verifying MoE | FRESH_EXACT_SOURCE | contract filtering passes frozen synthetic injected-violation screen; no general MoE claim | heterogeneous real tasks, verifier calibration, false accept/reject, cost baseline |
| 2 | T2424-0028 Residual Event Tokenization | FRESH_EXACT_SOURCE | deterministic compression/error frontier reproduced; no external-data/model claim | noisy/multivariate/natural data + byte/rate-distortion baselines |
| 2 | Research Atlas V4 strongest ML families | RETAINED_SAME_DAY | 18 packages rerun, 39/39 tests, manuscripts rebuilt; several strong bounded results retained | independent clean-room rerun + official/matched baselines + naturalistic datasets |
| 3 | T2424-0025 / NGMT surrogate | FRESH_EXACT_SOURCE | robust readouts resist Cauchy contamination, but clean 0% control also benefits; unique NGMT mechanism not isolated | freeze B3 equations; Gaussian/reference memory; matched Transformer benchmark |
| 4 | APEN | RETAINED_SAME_DAY | base and robustness extension rerun; rare-event gains depend on informative salience; matched learned baselines still missing | expose canonical executable package; matched learned-memory baseline; salience-failure ablations |
| 4 | PEN | IDENTITY_BLOCKED | no separate verified implementation/result established in connected source | prove distinct hypothesis/source or consolidate into APEN without duplicate claims |
| 5 | Eigen-JEPA | RETAINED_SAME_DAY | fresh Atlas rerun preserves boundary/negative result; superiority over strong raw/log ridge controls not established | expose canonical source; freeze task/split; rerun strong controls and mechanism ablations |
| 6 | LLC + PDC | RETAINED_SAME_DAY | strong controlled symbolic-law/dimensional results; external/naturalistic gates remain | canonical independent rerun + broader data-generating regimes |
| 6 | NPMS + Memory Spectrum Transfer | RETAINED_SAME_DAY | controlled reservoir/memory-spectrum results retained | stronger learned-memory baselines + multiple task families |
| 6 | Counterfactual Representation Surgery | RETAINED_SAME_DAY | controlled OOD/erasure result retained | external encoders/datasets + intervention baselines |
| 6 | Assumption-Conditioned Prediction + ACR | RETAINED_SAME_DAY | controlled regime-aware result retained | natural regime data + matched mixture/robust baselines |
| 6 | Unknown-Type Decomposition + Mixed Shift Factorizer | RETAINED_SAME_DAY | controlled classification/shift results retained | external datasets + generated-shift audit + calibration |

## Fresh exact-source executions in this wave

### T2424-0025 — robust-readout / NGMT surrogate

- Node.js `v22.16.0`, Linux x86_64 kernel `6.18.35`.
- Primary runtime: `0.13 s`; 30 seeds.
- Heavy-tail mean MAE `0.3615267855`; median MAE `0.0165609423`.
- Clean mean MAE `0.0243549670`; median MAE `0.0125939627`.
- 50-seed contamination sweep runtime: `0.94 s`.
- Claim boundary: generic robust-readout behavior only.
- Artifacts: project `RESULTS.md`, `REPRODUCE.md`, `results/repro-20260812-metrics.json`.

### T2424-1768 — self-verifying MoE

- Runtime `0.02 s`; deterministic 81-sample fixture.
- Corrupted verified MAE `0.0126660765` vs unverified `0.8025909493`.
- Clean verified and unverified MAE both `0.0125787338`; clean delta `0`.
- Claim boundary: caller-supplied contract filtering on a synthetic scalar mixture.
- Artifacts: project `RESULTS.md`, `REPRODUCE.md`, `experiment/repro-20260812-result.json`.

### T2424-0028 — residual event tokenization

- Runtime `0.03 s`; deterministic 120-observation fixture.
- Frozen primary threshold `0.5`, linear predictor: 8 tokens, 15× compression, MAE `0.1728128635`, RMSE `0.2232590424`.
- Claim boundary: synthetic compression/reconstruction behavior only.
- Artifacts: project `RESULTS.md`, `REPRODUCE.md`, `results/repro-20260812-result.json`.

## LAM-JEPA audit

The LAM-JEPA repository now has a reproducibility-wave branch containing root `RESULTS.md`, root `REPRODUCE.md`, and machine-readable audit metadata. The current head has successful push workflows for the research-claim boundary, ARC protocol QA, reproducibility CI and container smoke packaging. The scientific conclusion remains unchanged: the frozen ARC validation evidence is negative/inconclusive and the locked confirmatory test must not be used to rescue it.

The current execution sandbox has no outbound GitHub/dataset network from its runtime, so a full fresh ARC download/retrain was not performed. That is recorded as `BLOCKED_ENVIRONMENT`, not as a model failure.

## Same-day retained Atlas evidence

The existing fresh Atlas record states that 39/39 tests passed, all 18 base experiment packages were rerun, APEN/CRS/LLC robustness extensions were rerun, all 18 manuscripts were recompiled, release validation covered 769 files, and a clean re-extraction again passed 39/39 tests. This is valuable retained reproducibility evidence but is not relabeled as an independent rerun in this wave.

Important preserved boundaries include:

- APEN rare-event gains depend on informative salience and degrade as salience fails;
- Eigen-JEPA does not establish superiority over strong raw/log ridge controls;
- Falsification World Models does not dominate disagreement acquisition;
- Progressive Possibility Collapse is competitive with Bayesian thresholding rather than a clean dominance result.

## 1,024-work-unit queue

The request for “1,024 agents” is represented as **1,024 auditable work units**, not a claim that 1,024 simultaneous autonomous processes were launched.

- `RRW-0001..0064`: LAM-JEPA provenance, artifact inventory, rerun environments, baseline verification, seed/statistics audit.
- `RRW-0065..0256`: strongest Project 2424 ML experiments: source pinning, exact reruns, controls, raw metrics, failure audits.
- `RRW-0257..0384`: NGMT mechanism-definition and B0/B1/B2/B3 benchmark gate.
- `RRW-0385..0512`: APEN/PEN identity, matched learned baselines, salience controls, consolidation decision.
- `RRW-0513..0640`: Eigen-JEPA source recovery, strong raw/log/spectral baselines, ablations and split audit.
- `RRW-0641..1024`: LLC/PDC, NPMS/MST, CRS, ACP/ACR, UTD/MSF, MCF/PCF, ATG, ESNF, theory-conditioned memory and other advanced experimental candidates.

Every unit must terminate in one of: `REPRODUCED`, `NEGATIVE`, `INCONCLUSIVE`, `BUG_FIXED_RERUN`, `ENVIRONMENT_BLOCKED`, `IDENTITY_BLOCKED`, or `NOT_WORTH_ADVANCING`. “Green” is not an allowed substitute for a scientific verdict.

## Bug and post-hoc policy

- Preserve the pre-fix command, log and result.
- Fix the smallest identified implementation bug.
- State whether the fix changes execution plumbing or the scientific protocol.
- Rerun and retain both old and new lineage.
- Any changed data split, seed set, metric, gate, architecture or threshold becomes a new experiment version.

## Promotion rule

No project advances because it has a polished manuscript, a passing CI job or a positive single run. Promotion requires a frozen hypothesis, meaningful baseline, retained raw result, uncertainty appropriate to the design, failure analysis and a reproduction command that another operator can execute.
