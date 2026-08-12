# RESEARCH_STATUS

As of: 2026-08-12 — reproducibility wave

Maturity is claim-specific and evidence-backed.

| Research line | Current state | Evidence | Promotion gate |
|---|---|---|---|
| T2424-0037 NeuroCAD | TESTED + MERGED CONTROLLED BENCHMARK | CI #914 lineage; compiler/benchmark integrated | OOD prompts + same-provider direct-vs-IR learned comparison + external reproduction |
| T2424-0025 robust readouts | EXPERIMENTED + ANALYZED + MERGED + FRESH EXACT-SOURCE RERUN | 50-seed contamination sweep; negative 0% control preserved; 12 Aug exact-blob rerun retained in project RESULTS/REPRODUCE/raw metrics | robust Gaussian/reference controls + mechanism-specific ablations |
| T2424-0050 Darcy | BOUNDED EXPERIMENT + MERGED IDENTITY | synthetic pressure-MAE screen | actual learned operator, matched budget, held-out physical regimes |
| T2424-0029 PDE transitions | TESTED + MERGED BOUNDED ANALYTIC SCREEN | CI #830; 1D heat spectral-dimension fixture | nonlinear PDEs, learned representations, robustness/generalization |
| T2424-0028 residual-event tokenization | TESTED + MERGED + FRESH EXACT-SOURCE RERUN | fresh current-lineage CI #949; 12 Aug exact-blob threshold sweep retained | noisy/multivariate datasets + byte/rate-distortion baselines |
| T2424-0027 latent language audit | TESTED + MERGED | fresh CI #950; SHA-bound retained evidence and independent verifier | real multilingual encoder, preregistered concept/language probes and controls |
| T2424-0024 Trust Under Uncertainty | TESTED + MERGED | CI #827; paired calibration/ablation fixture | frozen real-model prediction set + calibration/selective-risk baselines |
| T2424-0026 Counterfactual Defect Worlds | TESTED + MERGED | CI #828; deterministic intervention/locality fixture | learned world model / richer environment baseline; causal/generalization tests |
| T2424-0040 FinanceMeta Learning Graph | TESTED + MERGED | CI #858; prerequisite-aware vs utility-only synthetic control | retrospective learner traces, curriculum validity, prospective causal evaluation |
| T2424-1768 self-verifying MoE | TESTED + MERGED SYNTHETIC CONTRACT PROTOTYPE + FRESH EXACT-SOURCE RERUN | CI #957; predeclared corrupt-expert control; 12 Aug exact-blob rerun retained | heterogeneous real tasks; verifier calibration; false accept/reject; cost/accuracy baseline |
| T2424-0035 Grokking Agent | TESTED + MERGED SYNTHETIC DETECTOR | CI #831; integrated concurrently | real training curves + matched no-grokking controls + sensitivity analysis |
| T2424-0054 Experiment Planner | TESTED + MERGED INTERNAL TOOL | CI #833; integrated concurrently | historical backtest vs random/greedy/simple priority rules; regret/throughput metrics |
| Research Atlas V4 | LOCAL REPRODUCIBILITY + PACKAGING / RETAINED SAME-DAY EVIDENCE | 39/39 tests, 18 experiment/manuscript reruns, validator, checksummed release evidence | independent reproduction + canonical tables/figures + submission/review |
| LAM-JEPA | ARC VALIDATION NEGATIVE/INCONCLUSIVE + REPOSITORY REPRODUCIBILITY AUDITED | matched-capacity five-seed evidence retained; current head CI/container/repro checks observed; dedicated RESULTS/REPRODUCE branch prepared | fresh external ARC rerun on data-capable compute without unlocking confirmatory test; preserve negative boundary |
| APEN | RETAINED SAME-DAY RERUN; MATCHED-LEARNED BASELINE OPEN | Atlas V4 base + robustness extension rerun; salience-failure boundary retained | expose canonical executable package; matched learned-memory baseline; frozen salience ablations |
| PEN | IDENTITY BLOCKED | no separately verified implementation/result in connected source | prove distinct hypothesis/source or consolidate into APEN |
| Eigen-JEPA | RETAINED SAME-DAY BOUNDARY/NEGATIVE RERUN | Atlas V4 rerun; superiority over strong raw/log ridge controls not established | expose canonical source; freeze split/task; strong controls + mechanism ablations |
| Hercules | ARCHITECTURE/IMPLEMENTATION FAMILY; LEARNED ADVANTAGE UNPROVEN | architecture ownership separated from Olympus names | same-budget Transformer vs proposal vs ablation |
| Olympus | O0 RATIONALIZED ROADMAP/RUNTIME | model-name/scale claims separated from actual learned evidence | O1 learned experiment; O2 ablation before scale promotion |
| Hermes / Prometheus / Perseus / Atlas / Kronos | CONCEPT/RUNTIME NAMES UNLESS SPECIFIC ARTIFACT PROVES MORE | no evidence in this ledger supports trained parameter-scale claims | implementation → training → evaluation → ablation → release, individually |
| Percy | TESTED INFRASTRUCTURE, NOT SCIENTIFIC RESULT | durable runtime + state doctor | real-host/provider qualification for production claim |

## Portfolio triage function

Advance candidates by:

`Research Value × Novelty × Feasibility × Evidence Potential ÷ Remaining Effort`

Prefer work that produces a falsifiable hypothesis, baseline, metric, retained raw result, figure/table and failure analysis. Attractive names without experimental leverage should remain unpromoted.

## Strongest next research experiments

1. **LAM-JEPA fresh reproduction gate** — run the pinned external ARC pipeline on network/data-capable compute, preserve the failed validation conclusion if reproduced, and do not access the locked confirmatory test to rescue it.
2. **T2424-0025 mechanism gate** — robust Gaussian/reference-memory controls to separate generic robust aggregation from any non-Gaussian-specific mechanism.
3. **APEN/PEN identity + baseline gate** — expose canonical executable source, decide whether PEN is distinct, and run matched learned-memory baselines with salience-failure controls.
4. **Eigen-JEPA boundary gate** — expose canonical source, freeze dataset/split and rerun raw/log ridge plus mechanism ablations before any stronger claim.
5. **NeuroCAD learned robustness gate** — frozen OOD language suite + same-provider direct output vs typed-IR pipeline with validity, editability, geometry and failure metrics.
6. **Darcy learned operator gate** — matched-budget FNO/DeepONet-or-equivalent baseline vs proposed learned operator on held-out regimes; preserve nonlearned screen only as provenance.
7. **Latent-language real-model gate** — freeze multilingual encoder(s), balanced concepts/languages, train-only nuisance-removal transform, held-out probes and global/random-projection controls.
8. **Self-verifying MoE gate** — multiple expert families, realistic contracts, corrupted/ambiguous cases, verifier false accept/reject tradeoff and unverified-mixture baseline.

## Reproducibility wave — fresh execution record

The 12 August wave added a canonical ledger at `portfolio/research/REPRODUCIBILITY_WAVE_20260812.md` and reproducibility artifacts for the experiments actually rerun in the current sandbox.

### Fresh exact-source reruns

- **T2424-0025:** source blobs matched the repository; 30-seed primary and 50-seed contamination ablation rerun under Node `v22.16.0`. The synthetic gate passes, but the clean 0% control also benefits strongly from robust readouts; retain the generic-robustness interpretation.
- **T2424-1768:** source blobs matched; deterministic contract-filtering fixture rerun. Corrupted verified MAE `0.0126660765` vs unverified `0.8025909493`, while clean outputs are unchanged. Claim remains synthetic contract mechanics only.
- **T2424-0028:** source blobs matched; deterministic threshold sweep rerun. Frozen primary threshold `0.5` uses 8/120 tokens (15× compression) with MAE `0.1728128635`. Claim remains synthetic compression/reconstruction only.

### Environment boundary

The current runtime has no outbound GitHub/dataset network. Full external-dataset jobs such as a fresh ARC download/retrain are therefore `ENVIRONMENT_BLOCKED`, not scientific failures. Connected GitHub evidence can still be audited and repository source can be hash-verified when reconstructed for self-contained experiments.

### 1,024-work-unit interpretation

The requested 1,024-agent wave is represented as 1,024 auditable research work units, not as a false claim that 1,024 simultaneous autonomous workers were launched. Work units must end in `REPRODUCED`, `NEGATIVE`, `INCONCLUSIVE`, `BUG_FIXED_RERUN`, `ENVIRONMENT_BLOCKED`, `IDENTITY_BLOCKED`, or `NOT_WORTH_ADVANCING`.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.