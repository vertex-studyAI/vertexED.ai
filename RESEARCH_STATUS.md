# RESEARCH_STATUS

As of: 2026-08-12 — reproducibility-wave refresh

Maturity is claim-specific and evidence-backed. A green execution gate is not automatically a positive scientific result.

| Research line | Current state | Evidence | Promotion gate |
|---|---|---|---|
| LAM-JEPA | EXECUTION REPRODUCIBLE / ARC SUPERIORITY UNSUPPORTED / MECHANISM INCONCLUSIVE-NEGATIVE | frozen 5-seed ARC validation: 0.254915 ± 0.012997 vs matched supervised 0.266441 ± 0.015460; paired delta -0.011525 ± 0.014099; fresh exact-head container rerun at `2f59b429` succeeded | new preregistered mechanism hypothesis or materially different task; do not use test data to rescue failed validation |
| T2424-0037 NeuroCAD | TESTED + MERGED CONTROLLED BENCHMARK | CI #914 lineage; compiler/benchmark integrated | OOD prompts + same-provider direct-vs-IR learned comparison + external reproduction |
| T2424-0025 robust readouts / NGMT precursor | FRESHLY REPRODUCED + ANALYZED / BOUNDED SYNTHETIC MECHANISM | reproducibility run `31616573215`; 30-seed reference + 50-seed contamination sweep; 10/10 focused tests; negative 0% control preserved | learned sequence task + Gaussian/reference controls + mechanism-specific ablations |
| NGMT full architecture | SPECIFICATION GATE / NO TRANSFORMER-LEVEL RESULT | T2424-0025 precursor reproduces robust aggregation but clean control also benefits; no frozen learned NGMT mechanism | freeze equations + B0/B1/B2/B3 baseline ladder + learned benchmark before execution |
| T2424-0050 Darcy | BOUNDED EXPERIMENT + MERGED IDENTITY | synthetic pressure-MAE screen | actual learned operator, matched budget, held-out physical regimes |
| T2424-0029 PDE transitions | TESTED + MERGED BOUNDED ANALYTIC SCREEN | CI #830; 1D heat spectral-dimension fixture | nonlinear PDEs, learned representations, robustness/generalization |
| T2424-0028 residual-event tokenization | TESTED + MERGED | fresh current-lineage CI #949 | noisy/multivariate datasets + byte/rate-distortion baselines |
| T2424-0027 latent language audit | FRESHLY REPRODUCED CONTROLLED SYNTHETIC DIAGNOSTIC | reproducibility run `31616573215`; exact metrics reproduced; independent verifier PASS; 8/8 focused tests | real multilingual encoder, preregistered concept/language probes and controls |
| T2424-0024 Trust Under Uncertainty | TESTED + MERGED | CI #827; paired calibration/ablation fixture | frozen real-model prediction set + calibration/selective-risk baselines |
| T2424-0026 Counterfactual Defect Worlds | TESTED + MERGED | CI #828; deterministic intervention/locality fixture | learned world model / richer environment baseline; causal/generalization tests |
| T2424-0040 FinanceMeta Learning Graph | TESTED + MERGED | CI #858; prerequisite-aware vs utility-only synthetic control | retrospective learner traces, curriculum validity, prospective causal evaluation |
| T2424-1768 self-verifying MoE | FRESHLY REPRODUCED SYNTHETIC CONTRACT MECHANICS | reproducibility run `31616573215`; corrupted MAE 0.012666 verified vs 0.802591 unverified; clean delta 0; 7/7 tests | heterogeneous real tasks; plausible in-bound failures; verifier calibration; robust aggregation/cost baselines |
| T2424-0035 Grokking Agent | FRESHLY REPRODUCED SYNTHETIC DETECTOR | reproducibility run `31616573215`; delayed fixture detected, matched synchronous control rejected; 5/5 tests | real training curves + matched no-grokking controls + sensitivity analysis |
| T2424-0054 Experiment Planner | TESTED + MERGED INTERNAL TOOL | CI #833; integrated concurrently | historical backtest vs random/greedy/simple priority rules; regret/throughput metrics |
| APEN / PEN | BLOCKED — CANONICAL SOURCE / IDENTITY UNAVAILABLE | connected portfolio names `P2424-0205` for APEN but no executable canonical repo recovered; PEN distinctness unverified | recover source/equations/data/baselines/ablation/raw results; consolidate PEN if not distinct |
| Eigen-JEPA | BLOCKED — SOURCE + MARKET-DATA CONTRACT UNAVAILABLE | no installed canonical Eigen-JEPA repository recovered; finance evaluation contract not frozen | recover source; freeze leakage-safe chronological walk-forward benchmark, costs, turnover, markets/regimes, baselines and ablations |
| Research Atlas V4 | LOCAL REPRODUCIBILITY + PACKAGING | 39/39 tests, 18 experiment/manuscript reruns, validator, checksummed release evidence | independent reproduction + canonical tables/figures + submission/review |
| Hercules | ARCHITECTURE/IMPLEMENTATION FAMILY; LEARNED ADVANTAGE UNPROVEN | architecture ownership separated from Olympus names | same-budget Transformer vs proposal vs ablation |
| Olympus | O0 RATIONALIZED ROADMAP/RUNTIME | model-name/scale claims separated from actual learned evidence | O1 learned experiment; O2 ablation before scale promotion |
| Hermes / Prometheus / Perseus / Atlas / Kronos | CONCEPT/RUNTIME NAMES UNLESS SPECIFIC ARTIFACT PROVES MORE | no evidence in this ledger supports trained parameter-scale claims | implementation → training → evaluation → ablation → release, individually |
| Percy | TESTED INFRASTRUCTURE, NOT SCIENTIFIC RESULT | durable runtime + state doctor | real-host/provider qualification for production claim |

## Reproducibility wave evidence

Frozen Project 2424 protocol base: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.

Fresh reproducibility workflow run `31616573215` completed successfully on Ubuntu 24.04.4 / Node v22.23.1 after an implementation-diff guard. It retained raw JSON, logs, environment metadata and SHA-256 checksums for T2424-0025, T2424-0027, T2424-1768 and T2424-0035. Artifact: `project2424-repro-wave-31616573215`; ZIP digest `sha256:79b64ebf31607d158e26ba8f74eb9970f9f22722bf7e8c2212dc4a2781860705`.

LAM-JEPA exact-head container rerun at commit `2f59b4297e5978d4ce769ebe95adb363e1e75d7a` also completed successfully. This establishes current build/import/CLI reproducibility but does not supersede or alter the negative/inconclusive frozen scientific result.

Per-project `RESULTS.md`, `REPRODUCE.md` and `metadata.json` records for this wave live under `portfolio/research/reproducibility-wave/`.

## Portfolio triage function

Advance candidates by:

`Research Value × Novelty × Feasibility × Evidence Potential ÷ Remaining Effort`

Prefer work that produces a falsifiable hypothesis, baseline, metric, retained raw result, figure/table and failure analysis. Attractive names without experimental leverage should remain unpromoted.

## Strongest next research experiments

1. **LAM-JEPA scientific rerun/reformulation gate** — only if a new hypothesis is frozen before evaluation; preserve the current ARC negative result and do not tune against confirmatory test data.
2. **T2424-0025 / NGMT mechanism gate** — learned sequence retrieval with B0 no-memory, B1 standard memory, B2 Gaussian/reference memory, frozen B3 proposal and mechanism ablations; multiple corruption families and robust uncertainty summaries.
3. **NeuroCAD learned robustness gate** — frozen OOD language suite + same-provider direct output vs typed-IR pipeline with validity, editability, geometry and failure metrics.
4. **Darcy learned operator gate** — matched-budget FNO/DeepONet-or-equivalent baseline vs proposed learned operator on held-out regimes; preserve nonlearned screen only as provenance.
5. **Latent-language real-model gate** — freeze multilingual encoder(s), balanced concepts/languages, train-only nuisance-removal transform, held-out probes and global/random-projection controls.
6. **Self-verifying MoE gate** — multiple expert families, realistic contracts, plausible in-bound failures, verifier false accept/reject tradeoff, robust aggregation baseline and cost/accuracy analysis.
7. **Eigen-JEPA recovery gate** — source recovery first, then leakage-safe chronological data contract before any backtest.
8. **APEN/PEN identity gate** — recover canonical implementation; prove distinct mechanisms or consolidate names before experimentation.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.