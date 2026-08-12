# RESEARCH_STATUS

As of: 2026-08-12 20:40 IST

Maturity is claim-specific and evidence-backed.

| Research line | Current state | Evidence | Promotion gate |
|---|---|---|---|
| T2424-0037 NeuroCAD | TESTED + MERGED CONTROLLED BENCHMARK | CI #914 lineage; compiler/benchmark integrated | OOD prompts + same-provider direct-vs-IR learned comparison + external reproduction |
| T2424-0025 robust readouts | EXPERIMENTED + ANALYZED + MERGED | 50-seed contamination sweep; negative 0% control preserved | robust Gaussian/reference controls + mechanism-specific ablations |
| T2424-0050 Darcy | BOUNDED EXPERIMENT + MERGED IDENTITY | synthetic pressure-MAE screen | actual learned operator, matched budget, held-out physical regimes |
| T2424-0029 PDE transitions | TESTED + MERGED BOUNDED ANALYTIC SCREEN | CI #830; 1D heat spectral-dimension fixture | nonlinear PDEs, learned representations, robustness/generalization |
| T2424-0028 residual-event tokenization | TESTED + MERGED | fresh current-lineage CI #949 | noisy/multivariate datasets + byte/rate-distortion baselines |
| T2424-0027 latent language audit | TESTED + MERGED | fresh CI #950; SHA-bound retained evidence and independent verifier | real multilingual encoder, preregistered concept/language probes and controls |
| T2424-0024 Trust Under Uncertainty | TESTED + MERGED | CI #827; paired calibration/ablation fixture | frozen real-model prediction set + calibration/selective-risk baselines |
| T2424-0026 Counterfactual Defect Worlds | TESTED + MERGED | CI #828; deterministic intervention/locality fixture | learned world model / richer environment baseline; causal/generalization tests |
| T2424-0040 FinanceMeta Learning Graph | TESTED + MERGED | CI #858; prerequisite-aware vs utility-only synthetic control | retrospective learner traces, curriculum validity, prospective causal evaluation |
| T2424-1768 self-verifying MoE | TESTED + MERGED SYNTHETIC CONTRACT PROTOTYPE | CI #957; predeclared corrupt-expert control | heterogeneous real tasks; verifier calibration; false accept/reject; cost/accuracy baseline |
| T2424-0035 Grokking Agent | TESTED + MERGED SYNTHETIC DETECTOR | CI #831; integrated concurrently | real training curves + matched no-grokking controls + sensitivity analysis |
| T2424-0054 Experiment Planner | TESTED + MERGED INTERNAL TOOL | CI #833; integrated concurrently | historical backtest vs random/greedy/simple priority rules; regret/throughput metrics |
| Research Atlas V4 | LOCAL REPRODUCIBILITY + PACKAGING | 39/39 tests, 18 experiment/manuscript reruns, validator, checksummed release evidence | independent reproduction + canonical tables/figures + submission/review |
| Hercules | ARCHITECTURE/IMPLEMENTATION FAMILY; LEARNED ADVANTAGE UNPROVEN | architecture ownership separated from Olympus names | same-budget Transformer vs proposal vs ablation |
| Olympus | O0 RATIONALIZED ROADMAP/RUNTIME | model-name/scale claims separated from actual learned evidence | O1 learned experiment; O2 ablation before scale promotion |
| Hermes / Prometheus / Perseus / Atlas / Kronos | CONCEPT/RUNTIME NAMES UNLESS SPECIFIC ARTIFACT PROVES MORE | no evidence in this ledger supports trained parameter-scale claims | implementation → training → evaluation → ablation → release, individually |
| Percy | TESTED INFRASTRUCTURE, NOT SCIENTIFIC RESULT | durable runtime + state doctor | real-host/provider qualification for production claim |

## Portfolio triage function

Advance candidates by:

`Research Value × Novelty × Feasibility × Evidence Potential ÷ Remaining Effort`

Prefer work that produces a falsifiable hypothesis, baseline, metric, retained raw result, figure/table and failure analysis. Attractive names without experimental leverage should remain unpromoted.

## Strongest next research experiments

1. **Hercules/Olympus architecture gate** — identical dataset/tokenizer/parameter count/optimizer/training budget: Transformer vs proposed architecture vs ablation; measure validation loss, convergence, memory, throughput, downstream performance, instability and wall-clock cost.
2. **T2424-0025 mechanism gate** — robust Gaussian/reference-memory controls to separate generic robust aggregation from any non-Gaussian-specific mechanism.
3. **NeuroCAD learned robustness gate** — frozen OOD language suite + same-provider direct output vs typed-IR pipeline with validity, editability, geometry and failure metrics.
4. **Darcy learned operator gate** — matched-budget FNO/DeepONet-or-equivalent baseline vs proposed learned operator on held-out regimes; preserve nonlearned screen only as provenance.
5. **Latent-language real-model gate** — freeze multilingual encoder(s), balanced concepts/languages, train-only nuisance-removal transform, held-out probes and global/random-projection controls.
6. **Self-verifying MoE gate** — multiple expert families, realistic contracts, corrupted/ambiguous cases, verifier ROC-like false accept/reject tradeoff and unverified-mixture baseline.
7. **Learning Graph learner gate** — backtest sequencing on historical mastery traces before any prospective learner experiment.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.