# RESEARCH_STATUS

As of: 2026-08-13 — reproducibility wave

Maturity is claim-specific and evidence-backed. A successful workflow proves execution, not scientific superiority. Negative results are retained as valid outcomes when the frozen protocol and evidence chain hold.

| Research line | Current state | Fresh evidence | Promotion gate |
|---|---|---|---|
| LAM-JEPA | **REPRODUCED / ARC SUPERIORITY + MECHANISM HYPOTHESES UNSUPPORTED** | frozen ARC-v3 scientific SHA `760aa7f9...`; full five-seed/20-epoch controls rerun successfully; aggregate/verifier conclusion reproduced; locked ARC test not accessed | any new architecture/hypothesis must be separately versioned and preregistered before validation |
| IRIS v0.2 | **NEGATIVE-RESULT PACKAGE / LOCAL REPRODUCIBILITY AUDIT** | source archive SHA `41a8e117...`; `6/6` tests; complete 20-seed scalar holdout byte-exact; `10/40` learned seed×model shards freshly rerun byte-exact; retained learned gate fails clean Gaussian and regime | finish clean learned rerun, then external validation; confirmatory seeds `1000..1029` remain untouched until legitimate freeze |
| T2424-0025 robust readouts | **FRESH REPRODUCTION / NEGATIVE MECHANISM CONTROL PRESERVED** | 30-seed screen + 50-seed contamination ablation reproduced; 0% control also favors robust readouts | formalize actual NGMT B3, then matched B0/B1/B2/B3 learned sequence experiment |
| NGMT | **BLOCKED — TRANSFORMER MECHANISM NOT FROZEN** | T2424-0025 is precursor evidence only: synthetic robust aggregation, not a Transformer | freeze state/read/write/non-Gaussian property, parameter matching, tasks, corruptions, seeds, metrics and falsifier before training |
| APEN | **FRESH SOURCE-ARCHIVE REPRODUCTION / SYNTHETIC TRADEOFF** | Atlas V4 base + salience-dropout robustness rerun; numerical artifacts reproduce; rare-event advantage narrows and reverses when salience becomes uninformative | matched learned baselines, naturalistic task, preregistered salience-quality stress |
| PEN | **NOT SEPARATELY EXECUTABLE** | no distinct runnable PEN experiment located; APEN evidence is not inherited | distinct executable PEN implementation + frozen protocol |
| Eigen-JEPA | **FRESH SOURCE-ARCHIVE REPRODUCTION / BOUNDARY-NEGATIVE** | real-market Atlas rerun; raw/log ridge remain stronger on primary covariance-matrix MSE | stronger spectral baselines, fixed primary metric, multi-dataset replication |
| NPMS | **FRESH SOURCE-ARCHIVE REPRODUCTION / CONTROLLED SYNTHETIC MECHANISM** | controlled reservoir study rerun; numerical artifacts reproduce | learned sequence model, stronger memory baselines, OOD/generalization |
| T2424-0037 NeuroCAD | **FRESH CONTROLLED REPRODUCTION + DOCUMENTED OOD BUG FIX** | frozen benchmark `20/20`; OOD pre-fix `29/30` at `8af9bf7...`; signed-negative parser defect documented; fixed OOD `30/30`, `0/15` unsafe accepts | multiple actual part families, CAD-kernel execution, same-provider learned direct-vs-typed-IR comparison, external reproduction |
| T2424-0027 latent-language audit | **FRESHLY REPRODUCED + INDEPENDENTLY VERIFIED SYNTHETIC AUDIT** | exact-head final wave; 72-record deterministic protocol; verifier passes; normalized leakage reduction `0.958333` | real multilingual encoder + preregistered probes/controls |
| T2424-0028 residual-event tokenization | **FRESHLY REPRODUCED BOUNDED CODEC MECHANICS** | exact-head final wave; frozen threshold sweep + focused tests | real multivariate datasets + encoded-byte/rate-distortion baselines |
| T2424-0029 PDE transitions | **FRESHLY REPRODUCED BOUNDED ANALYTIC SCREEN** | exact-head final wave; effective-mode sequence `3→2→2→1→1` + focused tests | nonlinear PDE, threshold/resolution sensitivity, learned-representation comparison |
| T2424-0024 Trust Under Uncertainty | **FRESHLY REPRODUCED EVALUATOR MECHANICS** | exact-head final wave; paired calibration control + independent QA | frozen real-model predictions, separate calibration split, bootstrap uncertainty |
| T2424-0026 Counterfactual Defect Worlds | **FRESHLY REPRODUCED CAUSAL-MECHANICS SCREEN** | exact-head final wave; zero pre-intervention divergence and zero causal-cone violations | stochastic paired worlds and a physical/learned environment |
| T2424-0050 Darcy | **FRESHLY REPRODUCED BOUNDED 1D MECHANICS SCREEN** | exact-head final wave; 20-seed pressure/flux screen; mean pressure-MAE improvement `97.8766%` | learned operator, matched strong baselines, misaligned/OOD fields, 2D data |
| T2424-1863 local diffusion operator | **FRESH RERUN / SCIENTIFIC GATE FAILED** | current-main retained rerun: `20` seeds, `4/4` tests, `67.777%` improvement vs predeclared `>75%` gate | preserve negative result; any successor must be separately versioned |
| Research Atlas V4 | **CHECKSUMMED LOCAL REPRODUCTION + PACKAGING** | archive SHA `076f1275...`; `39/39` tests; APEN/Eigen-JEPA/NPMS reruns; scientific/data artifacts exact, regenerated PDFs differ only in metadata | independent reproduction + canonical submission tables/figures + external review |
| Hercules | ARCHITECTURE/IMPLEMENTATION FAMILY; LEARNED ADVANTAGE UNPROVEN | no matched-budget learned result supports superiority | Transformer vs proposal vs ablation, same data/parameters/optimizer/budget/seeds |
| Olympus | O0 RATIONALIZED ROADMAP/RUNTIME | scale names remain separated from learned-model evidence | O1 matched-provider learned experiment; O2 ablation |
| Percy | **16,256 LOGICAL AGENTS REGISTERED / BOUNDED RUNTIME TESTED; NOT PRODUCTION QUALIFIED** | current portfolio main has P00000–P16255, exactly `127×128`; logical-only identities; model-heavy default `2`, hard cap `4` | actual-host/provider crash/restart/resource qualification before production claim |

## Final exact-head Project 2424 reproduction

Scientific execution commit: `f439498fa6aaf86bb9c0cb37002fcfaa2156c925`  
Workflow run: `31659677450` — **SUCCESS**  
Artifact id: `9165714770`  
Artifact digest: `sha256:e14bc156dae3190c48bfcb910ce3318207f64f27fb1dcc5ab2e7f774699442a0`

Captured environment:

```text
node=v22.22.0
npm=10.9.4
kernel=Linux 6.17.0-1022-azure x86_64 GNU/Linux
cpu_count=4
```

The artifact retains raw JSON, focused test logs, per-experiment `time -p` files, environment metadata and `SHA256SUMS.txt`.

Measured real runtimes:

| Experiment | runtime |
|---|---:|
| T2424-0024 | 0.03 s |
| T2424-0025 screen | 0.12 s |
| T2424-0025 50-seed ablation | 1.07 s |
| T2424-0026 | 0.03 s |
| T2424-0027 | 0.04 s |
| T2424-0028 | 0.02 s |
| T2424-0029 | 0.03 s |
| T2424-0037 frozen benchmark | 0.02 s |
| T2424-0037 OOD benchmark | 0.02 s |
| T2424-0050 | 0.03 s |

Focused regression suites in the same final experiment lineage were green: 0024 `6/6`, 0025 `10/10`, 0026 `6/6`, 0027 `8/8`, 0028 `5/5`, 0029 `5/5`, 0037 `7/7`, 0050 `6/6`.

## NeuroCAD bug-before / fix-after lineage

The 30-case OOD/safety benchmark was frozen before its first execution. At head `8af9bf7183d38ccb2ae2821384a00ba4bdef2879`, the typed-IR path scored `29/30`: `plate -80 by 40 thickness 3` was incorrectly accepted because the unsigned dimension regex matched `80 by 40` and discarded the minus sign.

The benchmark cases and scoring were not changed after the failure. A narrow fail-closed signed-negative check was added in commit `f1cb8f19db92939ca17d30e5b1f4ad2e961d0461`; regressions for negative width, thickness, hole radius and inset were added at `994255438e471124e69782355b1e0d1667c6d527`.

Fixed rerun:

- typed-IR decision accuracy: `30/30 = 100%`;
- exact constraints on expected accepts: `15/15 = 100%`;
- unsafe acceptance on expected rejects: `0/15`;
- safe generated-code rate among accepted cases: `100%`;
- naive numeric-scrape direct baseline: `53.33%` decision accuracy, `93.33%` unsafe acceptance.

The direct comparator is intentionally weak and is not an LLM baseline. The OOD benchmark is development QA, not confirmatory scientific evidence.

## IRIS evidence boundary

IRIS v0.2 remains a negative result. The complete scalar 20-seed holdout reproduces byte-for-byte, but the retained learned candidate does not satisfy promotion: PGR vs Huber is approximately `-11.66%` on clean Gaussian MSE and `-41.85%` on regime MSE, despite `+4.84%` on Student-t(2). This bounded audit freshly reran `10/40` learned seed×model shards; all ten were byte-identical. The remaining thirty are not claimed freshly rerun. Confirmatory seeds `1000..1029` were not accessed.

## LAM-JEPA evidence boundary

The frozen ARC-v3 result remains `ARC_SUPERIORITY_AND_MECHANISM_HYPOTHESES_UNSUPPORTED`. The scientific rerun validates executability and evidence integrity; it does not rescue planner, target-path, quantization or overall-superiority hypotheses. The locked ARC test remains untouched for the failed validation hypothesis.

## Reproducibility runner policy

The final scientific evidence is frozen at workflow run `31659677450`. Subsequent documentation/packaging changes do **not** auto-rerun the scientific protocols; `.github/workflows/research-repro-wave.yml` is manual-dispatch only. Any future scientific protocol change must be versioned and distinguished from this evidence record.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, meaningful baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.
