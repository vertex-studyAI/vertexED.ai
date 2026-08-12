# RESEARCH_STATUS

As of: 2026-08-12 — research reproducibility wave

Maturity is claim-specific and evidence-backed. A green CI lane is execution evidence, not scientific superiority.

| Research line | Current state | Evidence | Promotion gate |
|---|---|---|---|
| LAM-JEPA | **EXECUTION REPRODUCED / ARC SUPERIORITY + MECHANISM HYPOTHESES UNSUPPORTED** | current-head pipeline reproduction is green; frozen scientific ARC v3 full-controls SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb` rerun as attempt 2 in Actions run `31203337502`, SUCCESS | preserve locked ARC test; any new repair/hypothesis must be versioned and preregistered before validation |
| T2424-0025 robust readouts | **FRESH REPRODUCTION / ANALYZED / NEGATIVE MECHANISM CONTROL PRESERVED** | exact source from `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`; 30-seed screen + 50-seed contamination ablation reproduced; dedicated Actions run `31616762393` is green | freeze actual NGMT mechanism; add no-memory, standard-memory and capacity-matched Gaussian/reference-memory controls |
| NGMT | **BLOCKED — TRANSFORMER MECHANISM NOT FROZEN** | bounded T2424-0025 precursor reproduced, but it is synthetic aggregation rather than learned Transformer memory | define state/read/update/non-Gaussian property, matched baselines, sequence tasks, paired seeds and falsifier before training |
| APEN | **FRESH SOURCE-ARCHIVE REPRODUCTION / SYNTHETIC MECHANISM TRADEOFF** | checksummed Atlas V4 source; 48 paired base conditions + salience-dropout robustness rerun; numerical artifacts reproduced | matched learned baselines, naturalistic task, preregistered salience-quality stress test |
| PEN | **NOT SEPARATELY EXECUTABLE** | frozen Atlas V4 contains APEN; PEN appears as architecture-family provenance, not a distinct runnable experiment | produce a distinct executable PEN implementation + protocol before separate experimental status |
| Eigen-JEPA | **FRESH SOURCE-ARCHIVE REPRODUCTION / BOUNDARY-NEGATIVE COMPARISON** | Atlas V4 real-market rerun; raw/log ridge remain stronger on primary covariance-matrix MSE | stronger spectral baselines, preregistered target metric, multi-dataset replication |
| NPMS | **FRESH SOURCE-ARCHIVE REPRODUCTION / CONTROLLED SYNTHETIC MECHANISM** | Atlas V4 controlled reservoir experiment rerun; numerical artifacts reproduced | learned sequence model, stronger memory baselines, OOD/generalization study |
| T2424-0037 NeuroCAD | **FRESHLY REPRODUCED CONTROLLED BENCHMARK** | dedicated Actions run `31616762393`; frozen benchmark `20/20` + focused tests | OOD prompts + same-provider direct-vs-IR learned comparison + external reproduction |
| T2424-0050 Darcy | **FRESHLY REPRODUCED BOUNDED MECHANISM SCREEN** | dedicated Actions run `31616762393`; retained 20-seed synthetic pressure-MAE screen rerun | actual learned operator, matched budget, misaligned/OOD fields and held-out physical regimes |
| T2424-1863 local diffusion operator | **INDEPENDENTLY REPLAYED / NEGATIVE AGAINST PREDECLARED GATE** | merged frozen source `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`; Actions run `31411517815` attempt 3 reproduced 20-seed metrics and `4/4` tests | retain per-seed uncertainty; real PDE data; learned neural-operator baseline; rollout/compute comparison |
| T2424-0029 PDE transitions | TESTED + MERGED BOUNDED ANALYTIC SCREEN | CI #830; 1D heat spectral-dimension fixture | nonlinear PDEs, learned representations, robustness/generalization |
| T2424-0028 residual-event tokenization | TESTED + MERGED | fresh current-lineage CI #949 | noisy/multivariate datasets + byte/rate-distortion baselines |
| T2424-0027 latent language audit | **FRESHLY REPRODUCED + INDEPENDENTLY VERIFIED SYNTHETIC AUDIT** | dedicated Actions run `31616762393`; deterministic 72-record protocol + SHA-bound verifier | real multilingual encoder, preregistered concept/language probes and controls |
| T2424-0024 Trust Under Uncertainty | TESTED + MERGED | CI #827; paired calibration/ablation fixture | frozen real-model prediction set + calibration/selective-risk baselines |
| T2424-0026 Counterfactual Defect Worlds | TESTED + MERGED | CI #828; deterministic intervention/locality fixture | learned world model / richer environment baseline; causal/generalization tests |
| T2424-0040 FinanceMeta Learning Graph | TESTED + MERGED | CI #858; prerequisite-aware vs utility-only synthetic control | retrospective learner traces, curriculum validity, prospective causal evaluation |
| T2424-1768 self-verifying MoE | TESTED + MERGED SYNTHETIC CONTRACT PROTOTYPE | CI #957; predeclared corrupt-expert control | heterogeneous real tasks; verifier calibration; false accept/reject; cost/accuracy baseline |
| T2424-0035 Grokking Agent | TESTED + MERGED SYNTHETIC DETECTOR | CI #831; integrated concurrently | real training curves + matched no-grokking controls + sensitivity analysis |
| T2424-0054 Experiment Planner | TESTED + MERGED INTERNAL TOOL | CI #833; integrated concurrently | historical backtest vs random/greedy/simple priority rules; regret/throughput metrics |
| Research Atlas V4 | **FRESH CHECKSUMMED LOCAL REPRODUCTION + PACKAGING** | archive SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`; `39/39` tests; APEN/Eigen-JEPA/NPMS reruns; `61/65` selected artifacts byte-exact, four PDF timestamp-only differences | independent reproduction + canonical tables/figures + submission/review |
| Hercules | ARCHITECTURE/IMPLEMENTATION FAMILY; LEARNED ADVANTAGE UNPROVEN | architecture ownership separated from Olympus names | same-budget Transformer vs proposal vs ablation |
| Olympus | O0 RATIONALIZED ROADMAP/RUNTIME | model-name/scale claims separated from actual learned evidence | O1 learned experiment; O2 ablation before scale promotion |
| Hermes / Prometheus / Perseus / Atlas / Kronos | CONCEPT/RUNTIME NAMES UNLESS SPECIFIC ARTIFACT PROVES MORE | no evidence in this ledger supports trained parameter-scale claims | implementation → training → evaluation → ablation → release, individually |
| Percy | TESTED INFRASTRUCTURE, NOT SCIENTIFIC RESULT | durable runtime + state doctor | real-host/provider qualification for production claim |

## Reproducibility wave evidence

### LAM-JEPA

Two distinct execution checks are retained rather than conflated. A current-head pipeline reproduction verifies present repository executability. Separately, the frozen scientific ARC v3 full-controls job was rerun unchanged at SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb` as Actions run `31203337502`, attempt 2, and completed successfully.

The frozen five-seed scientific result remains:

- full model: `0.2549152542 ± 0.0129968064`, `n=5`;
- capacity-matched supervised baseline: `0.2664406780 ± 0.0154600058`, `n=5`;
- paired full minus matched: `-0.0115254237 ± 0.0140994131`, `n=5`;
- full minus `no_planner`: `+0.0047457627`, 95% bootstrap CI `[0.0, 0.0142372881]`;
- full minus `no_target`: `-0.0067796610`, 95% bootstrap CI `[-0.0135593220, 0.0]`.

No superiority, planner-benefit, target-benefit, or quantization-benefit claim is promoted. The locked ARC test remains untouched.

### T2424-0025 / NGMT precursor

The exact source experiment was executed both locally and in a dedicated frozen GitHub Actions workflow. The Actions run `31616762393` used runner commit `54baa1f21a3bc14adbf20eb604f356dfb926dac8`, completed successfully, and uploaded raw machine-readable evidence.

Fresh 30-seed screen:

- heavy-tail weighted-mean MAE `0.3615267855`;
- weighted-median MAE `0.0165609423`;
- relative improvement `95.4192%`;
- clean-control weighted-mean MAE `0.0243549670`;
- clean-control weighted-median MAE `0.0125939627`;
- clean-control improvement `48.2900%`.

At the fixed 18% Cauchy condition of the 50-seed ablation, mean ± sample SD MAE was:

- weighted mean `0.349439 ± 0.347203`;
- weighted median `0.017003 ± 0.004858`;
- 10% weighted trimmed mean `0.045506 ± 0.015713`;
- weighted Huber `0.030926 ± 0.006796`.

The 0% control also materially favors robust readouts. Current evidence therefore supports robust aggregation under this synthetic noisy-memory construction but does not isolate a uniquely non-Gaussian mechanism. It remains a precursor, not a Transformer result.

### T2424-0027, T2424-0037, T2424-0050

The same frozen Actions run reproduced:

- **T2424-0027:** raw concept accuracy `1.0`, raw language accuracy `1.0`, centered concept accuracy `1.0`, centered language accuracy `0.361111`, normalized excess language-leakage reduction `0.958333`; independent verifier `PASS`.
- **T2424-0037 NeuroCAD:** frozen controlled grammar benchmark `20/20`; syntax/execution success, geometry validity, dimension accuracy and constraint satisfaction all `1.0` on accepted cases.
- **T2424-0050 Darcy:** mean baseline pressure MAE `0.0658913916`, reduced-resistance MAE `0.0011366559`, relative improvement `97.8766%`, mean flux relative error `1.369e-16`, `n=20`.

These remain synthetic or controlled mechanism checks with their existing claim boundaries intact.

### T2424-1863 local diffusion operator

The merged bounded experiment was replayed unchanged on a fresh hosted runner as Actions run `31411517815`, attempt 3, job `94262839511` using source SHA `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`. Environment: Ubuntu `24.04.4` LTS, CPython `3.11.15`, pip `26.2.1`, pytest `9.1.1`, CPU. The focused suite passed `4/4`.

The 20-seed diffusion result reproduced exactly at the CLI-summary level: persistence RMSE `0.015610`, operator RMSE `0.005023`, learned coefficient `0.179689`, relative improvement `67.777%`. The zero-diffusion control remained `-0.029%` improvement. Because the frozen success criterion was `>75%`, the verdict remains `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`. No threshold was changed after observing the result.

The current benchmark reports aggregate 20-seed means without retaining standard deviation, variance or confidence intervals. This uncertainty-reporting gap is now explicit in `RESULTS.md`, `REPRODUCE.md`, and `experiment_metadata.json`; no significance claim is made.

### Atlas V4: APEN, Eigen-JEPA, NPMS

The frozen source package `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip` was materialized from the persistent project library and checksum-verified before execution. SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`.

Execution environment: Linux x86_64 CPU; Python `3.13.5`; NumPy `2.3.5`; pandas `2.2.3`; SciPy `1.17.0`; scikit-learn `1.8.0`; PyTorch `2.10.0+cpu`; Matplotlib `3.10.8`; pytest `9.0.2`. Full Atlas tests: `39/39` passed.

**APEN:** the 48 paired-condition base experiment reproduces its rare-event benefit, but not a clean overall-MSE dominance claim. The salience-dropout robustness extension also reproduces the mechanism failure: the APEN rare-event advantage narrows by 80% salience dropout and reverses at 100% dropout. This is retained as a limitation.

**PEN:** no distinct executable PEN experiment exists in the frozen package. APEN evidence is not duplicated under a separate PEN label.

**Eigen-JEPA:** the real-market rerun preserves the negative boundary. Primary covariance-matrix MSE is `5.8318226e-09` for Eigen-JEPA versus `5.7734384e-09` raw ridge and `5.7896089e-09` log ridge on `n=111` test blocks. Eigen-JEPA does not establish superiority.

**NPMS:** the controlled reservoir experiment reproduces regime-classification accuracy `0.928571` and the stored spectral statistics. External validity and learned-model evidence remain open.

Across the selected APEN/Eigen-JEPA/NPMS outputs, `61/65` artifacts reproduced byte-for-byte. The four differences were generated PDFs; the observed difference was Matplotlib `CreationDate` metadata. Numerical CSV/JSON/NPZ outputs and PNG figures were exact. This is presentation-artifact nondeterminism, not scientific-metric drift.

### Project 2424 current-head CI

At source SHA `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`, the canonical Project 2424 release gate was also rerun independently during this wave and completed successfully. This confirms current-lineage executability but is not substituted for the dedicated scientific reproduction outputs above.

## Reproducibility runner policy

After the first successful frozen Project 2424 reproduction, its workflow was changed to manual dispatch only. Documentation-only commits therefore cannot silently rerun the scientific protocols. Any future protocol change must be versioned and distinguished from the 12 August 2026 evidence record.

## Portfolio triage function

Advance candidates by:

`Research Value × Novelty × Feasibility × Evidence Potential ÷ Remaining Effort`

Prefer work that produces a falsifiable hypothesis, baseline, metric, retained raw result, figure/table and failure analysis. Attractive names without experimental leverage should remain unpromoted.

## Strongest next research experiments

1. **NGMT mechanism gate** — freeze the actual memory state/read/update rule, then compare no memory, standard memory, Gaussian/reference memory, proposed NGMT, and component ablations under matched compute on heavy-tailed/multimodal/regime-switching sequence tasks.
2. **Hercules/Olympus architecture gate** — identical dataset/tokenizer/parameter count/optimizer/training budget: Transformer vs proposed architecture vs ablation; measure validation loss, convergence, memory, throughput, downstream performance, instability and wall-clock cost.
3. **APEN external-validity gate** — matched learned baselines, naturalistic delayed-signal task, preregistered salience quality perturbations, paired seeds and calibration/rare-event metrics.
4. **Eigen-JEPA spectral gate** — stronger spectral/time-series controls, multiple market datasets, preregistered primary target and paired uncertainty analysis; treat current result as negative/boundary evidence.
5. **NeuroCAD learned robustness gate** — frozen OOD language suite + same-provider direct output vs typed-IR pipeline with validity, editability, geometry and failure metrics.
6. **Darcy learned operator gate** — matched-budget FNO/DeepONet-or-equivalent baseline vs proposed learned operator on held-out regimes; preserve nonlearned screen only as provenance.
7. **Latent-language real-model gate** — freeze multilingual encoder(s), balanced concepts/languages, train-only nuisance-removal transform, held-out probes and global/random-projection controls.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.
