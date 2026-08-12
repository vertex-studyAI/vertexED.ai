# RESEARCH_STATUS

As of: 2026-08-12 — research reproducibility wave

Maturity is claim-specific and evidence-backed. A green CI lane is execution evidence, not scientific superiority.

| Research line | Current state | Evidence | Promotion gate |
|---|---|---|---|
| LAM-JEPA | **EXECUTION REPRODUCED / ARC SUPERIORITY + MECHANISM HYPOTHESES UNSUPPORTED** | exact-head `2f59b4297e5978d4ce769ebe95adb363e1e75d7a` Reproducibility CI rerun attempt 2, job `94178401933`, SUCCESS; retained frozen five-seed ARC validation remains negative/inconclusive | preserve locked ARC test; any new repair/hypothesis must be versioned and preregistered before validation |
| T2424-0025 robust readouts | **FRESH LOCAL REPRODUCTION / ANALYZED / NEGATIVE MECHANISM CONTROL PRESERVED** | exact source from `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`; 30-seed screen and 50-seed contamination ablation reproduced to machine precision; 0% Cauchy control still favors robust readouts | freeze actual NGMT mechanism; add no-memory, standard-memory and capacity-matched Gaussian/reference-memory controls |
| NGMT | **BLOCKED — TRANSFORMER MECHANISM NOT FROZEN** | bounded T2424-0025 precursor reproduced, but it is synthetic aggregation rather than learned Transformer memory | define state/read/update/non-Gaussian property, matched baselines, sequence tasks, paired seeds and falsifier before training |
| APEN / PEN | **NOT YET REPRODUCIBLE** | portfolio references exist, but this wave located no standalone canonical runnable APEN/PEN implementation with frozen experiment metadata in the connected source | identify canonical source; freeze hypothesis, task, baseline, metric, seed list and run command before any result claim |
| Eigen-JEPA | **NOT YET REPRODUCIBLE** | portfolio references exist, but no standalone Eigen-JEPA repository/runnable frozen experiment was located in the connected GitHub installation | identify canonical implementation and protocol; do not report experimental results until source and evidence are addressable |
| T2424-0037 NeuroCAD | TESTED + MERGED CONTROLLED BENCHMARK | deterministic controlled-language compiler protocol; fresh exact-head Project 2424 release gate rerun attempt 3 is green; no learned general-NLP claim | OOD prompts + same-provider direct-vs-IR learned comparison + external reproduction |
| T2424-0050 Darcy | BOUNDED EXPERIMENT + MERGED IDENTITY | retained 20-seed synthetic pressure-MAE screen; harmonic-block result is construction-aligned and nonlearned; fresh exact-head Project 2424 release gate rerun attempt 3 is green | actual learned operator, matched budget, misaligned/OOD fields and held-out physical regimes |
| T2424-0029 PDE transitions | TESTED + MERGED BOUNDED ANALYTIC SCREEN | CI #830; 1D heat spectral-dimension fixture | nonlinear PDEs, learned representations, robustness/generalization |
| T2424-0028 residual-event tokenization | TESTED + MERGED | fresh current-lineage CI #949 | noisy/multivariate datasets + byte/rate-distortion baselines |
| T2424-0027 latent language audit | TESTED + MERGED SYNTHETIC AUDIT | frozen deterministic 72-record mechanism protocol; fresh CI #950; SHA-bound retained evidence | real multilingual encoder, preregistered concept/language probes and controls |
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

## Reproducibility wave evidence

### LAM-JEPA

Fresh exact-head workflow reproduction was triggered without modifying the experiment after seeing prior results. The rerun used source SHA `2f59b4297e5978d4ce769ebe95adb363e1e75d7a`, GitHub Actions run `31610608912`, attempt 2, job `94178401933`, and completed successfully on a CPU-only Ubuntu/Python 3.11 environment. This rerun verifies the executable evidence pipeline; it is **not** a new five-seed 20-epoch scientific sample.

Canonical frozen validation remains:

- LAM-JEPA: `0.2549152542 ± 0.0129968064`, `n=5`;
- capacity-matched supervised: `0.2664406780 ± 0.0154600058`, `n=5`;
- paired LAM minus matched: `-0.0115254237 ± 0.0140994131`, `n=5`;
- full minus `no_planner`: `+0.0047457627`, 95% bootstrap CI `[0.0, 0.0142372881]`;
- full minus `no_target`: `-0.0067796610`, 95% bootstrap CI `[-0.0135593220, 0.0]`.

No superiority, planner-benefit, target-benefit, or quantization-benefit claim is promoted.

### T2424-0025 / NGMT precursor

The exact source experiment was freshly executed locally using Node.js `v22.16.0` on Linux x86_64. The 30-seed screen completed in about `0.15 s`; the 50-seed ablation completed in about `0.91 s`; outputs matched the retained reference to machine precision.

The main scientific boundary is negative/inconclusive for a specific non-Gaussian-memory mechanism: at `0%` Cauchy contamination, weighted median MAE remains materially lower than weighted mean MAE, so the current task does not isolate a uniquely non-Gaussian benefit.

### Project 2424 current-head CI

At source SHA `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`, GitHub Actions run `31611954223` was rerun during this wave. Attempt 3, build-and-test job `94183150508`, completed successfully from `2026-08-12T16:23:03Z` to `2026-08-12T16:23:57Z` and ran the canonical release gate. This is a fresh exact-head execution check for the current Project 2424 source line.

The production-deployment smoke belongs to a separate product/deployment lane and is not treated as scientific evidence for or against these source experiments.

## Portfolio triage function

Advance candidates by:

`Research Value × Novelty × Feasibility × Evidence Potential ÷ Remaining Effort`

Prefer work that produces a falsifiable hypothesis, baseline, metric, retained raw result, figure/table and failure analysis. Attractive names without experimental leverage should remain unpromoted.

## Strongest next research experiments

1. **NGMT mechanism gate** — freeze the actual memory state/read/update rule, then compare no memory, standard memory, Gaussian/reference memory, proposed NGMT, and component ablations under matched compute on heavy-tailed/multimodal/regime-switching sequence tasks.
2. **Hercules/Olympus architecture gate** — identical dataset/tokenizer/parameter count/optimizer/training budget: Transformer vs proposed architecture vs ablation; measure validation loss, convergence, memory, throughput, downstream performance, instability and wall-clock cost.
3. **NeuroCAD learned robustness gate** — frozen OOD language suite + same-provider direct output vs typed-IR pipeline with validity, editability, geometry and failure metrics.
4. **Darcy learned operator gate** — matched-budget FNO/DeepONet-or-equivalent baseline vs proposed learned operator on held-out regimes; preserve nonlearned screen only as provenance.
5. **Latent-language real-model gate** — freeze multilingual encoder(s), balanced concepts/languages, train-only nuisance-removal transform, held-out probes and global/random-projection controls.
6. **Self-verifying MoE gate** — multiple expert families, realistic contracts, corrupted/ambiguous cases, verifier false accept/reject tradeoff and unverified-mixture baseline.
7. **APEN/PEN and Eigen-JEPA source gate** — locate the canonical runnable implementation before spending compute; a named concept without addressable code cannot enter the reproducibility queue.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.
