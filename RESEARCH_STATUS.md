# RESEARCH_STATUS

As of: 2026-08-12 reproducibility wave

Maturity is claim-specific and evidence-backed.

## Reproducibility wave update

Canonical wave evidence is recorded in `portfolio/research/REPRODUCIBILITY_WAVE_20260812.md` and `portfolio/research/REPRODUCIBILITY_WAVE_20260812.json`.

- Research Atlas source archive SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c` was re-executed in a CPU environment; full source regression passed 39/39 tests and the selected post-rerun suite passed 13/13 tests.
- APEN, Eigen-JEPA, NPMS, Mixed Shift Factorizer, Probabilistic Dimensional Compiler and Memory Spectrum Transfer received fresh unchanged reruns; APEN also received the retained salience-dropout robustness extension.
- Eigen-JEPA remains negative/boundary evidence versus strong raw/log ridge controls. APEN retains the salience-failure boundary. No result was promoted merely because a run completed.
- Memory Spectrum Transfer has a documentation-only correction: stale README prose `95.8% vs 75.0%` is superseded by the retained and freshly reproduced values `87.5% vs 66.7%`; no code, split, seed policy, metric or machine-readable result changed.
- LAM-JEPA remains negative/inconclusive on the frozen ARC line; the confirmatory test remains locked for that failed hypothesis.
- T2424-0025 remains a bounded robust-readout result, not a demonstrated Non-Gaussian Memory Transformer.
- PEN receives no experimental promotion because no separate executable PEN package was found in the mounted Atlas source used by this wave.

| Research line | Current state | Evidence | Promotion gate |
|---|---|---|---|
| LAM-JEPA | ANALYZED / NEGATIVE_OR_INCONCLUSIVE | frozen five-seed ARC validation; exact-head execution artifact verified; no superiority/mechanism gate met | new preregistered hypothesis or benchmark; do not use locked confirmatory test to rescue current line |
| APEN | LOCAL_REPRODUCIBLE_CONTROLLED | fresh rerun + salience-dropout robustness extension; paired seed-level uncertainty retained | matched learned baselines + naturalistic sequence task + salience-estimation robustness |
| Eigen-JEPA | LOCAL_REPRODUCIBLE_NEGATIVE_BOUNDARY | fresh rerun; raw/log ridge remain stronger or statistically indistinguishable controls | new preregistered mechanism hypothesis or stronger task; no superiority wording |
| NPMS | LOCAL_REPRODUCIBLE_CONTROLLED | fresh rerun; regime accuracy 0.928571 in controlled reservoir study | larger learned models + natural sequence tasks + independent reproduction |
| Mixed Shift Factorizer | LOCAL_REPRODUCIBLE_CONTROLLED | fresh rerun; macro-F1 0.833546, hamming 0.833854 | natural deployment shifts + external datasets + independent reproduction |
| Probabilistic Dimensional Compiler | LOCAL_REPRODUCIBLE_CONTROLLED | fresh rerun; test MSE 0.000469, exact support 0.777778 | real scientific-law corpora + stronger external baselines |
| Memory Spectrum Transfer | LOCAL_REPRODUCIBLE_CONTROLLED | fresh rerun; spectrum 0.875 vs parameter-summary 0.666667 across 24 trained models | larger models/tasks + uncertainty expansion + independent reproduction |
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
| Research Atlas V4 | LOCAL REPRODUCIBILITY + PACKAGING | original 39/39 package verification plus current-wave selected fresh reruns and checksummed evidence | independent reproduction + canonical tables/figures + submission/review |
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
