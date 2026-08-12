# RESEARCH_STATUS

As of: 2026-08-13 — research reproducibility wave

Maturity is claim-specific and evidence-backed. A green CI lane is execution evidence, not scientific superiority.

| Research line | Current state | Evidence | Promotion gate |
|---|---|---|---|
| LAM-JEPA | **FULL SCIENTIFIC RERUN REPRODUCED / ARC SUPERIORITY + MECHANISM HYPOTHESES UNSUPPORTED** | frozen ARC v3 full-controls SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb` now has successful attempts 2 and 3 in Actions run `31203337502`; exact aggregate conclusions and verifier outputs reproduced | preserve locked ARC test; any new repair/hypothesis must be versioned and preregistered before validation |
| T2424-0025 robust readouts | **FRESH REPRODUCTION / ANALYZED / NEGATIVE MECHANISM CONTROL PRESERVED** | exact source from `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`; 30-seed screen + 50-seed contamination ablation reproduced; dedicated Actions run `31616762393` is green | freeze actual NGMT mechanism; add no-memory, standard-memory and capacity-matched Gaussian/reference-memory controls |
| NGMT | **BLOCKED — TRANSFORMER MECHANISM NOT FROZEN** | bounded T2424-0025 precursor reproduced, but it is synthetic aggregation rather than learned Transformer memory | define state/read/update/non-Gaussian property, matched baselines, sequence tasks, paired seeds and falsifier before training |
| APEN | **FRESH SOURCE-ARCHIVE REPRODUCTION / SYNTHETIC MECHANISM TRADEOFF** | checksummed Atlas V4 source; 48 paired base conditions + salience-dropout robustness rerun; numerical artifacts reproduced | matched learned baselines, naturalistic task, preregistered salience-quality stress test |
| PEN | **NOT SEPARATELY EXECUTABLE** | frozen Atlas V4 contains APEN; PEN appears as architecture-family provenance, not a distinct runnable experiment | produce a distinct executable PEN implementation + protocol before separate experimental status |
| Eigen-JEPA | **FRESH SOURCE-ARCHIVE REPRODUCTION / BOUNDARY-NEGATIVE COMPARISON** | Atlas V4 real-market rerun; raw/log ridge remain stronger on primary covariance-matrix MSE | stronger spectral baselines, preregistered target metric, multi-dataset replication |
| NPMS | **FRESH SOURCE-ARCHIVE REPRODUCTION / CONTROLLED SYNTHETIC MECHANISM** | Atlas V4 controlled reservoir experiment rerun; numerical artifacts reproduced | learned sequence model, stronger memory baselines, OOD/generalization study |
| T2424-0037 NeuroCAD | **FRESHLY REPRODUCED CONTROLLED BENCHMARK** | dedicated Actions run `31616762393`; frozen benchmark `20/20` + focused tests | OOD prompts + same-provider direct-vs-IR learned comparison + external reproduction |
| T2424-0050 Darcy | **FRESHLY REPRODUCED BOUNDED MECHANISM SCREEN** | dedicated Actions run `31616762393`; retained 20-seed synthetic pressure-MAE screen rerun | actual learned operator, matched budget, misaligned/OOD fields and held-out physical regimes |
| T2424-1863 local diffusion operator | **INDEPENDENTLY REPLAYED / UNCERTAINTY RETAINED / NEGATIVE AGAINST PREDECLARED GATE** | frozen source `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`; reporting workflow run `31649888889` retained raw 20-seed metrics, sample SDs, negative-gate assertion, and artifact `9162158000` | real PDE data; learned neural-operator baseline; rollout/compute comparison |
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

The frozen ARC v3 full-controls job was rerun unchanged at scientific SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb` in Actions run `31203337502`.

Successful attempt 2:

- job `94178988063`;
- artifact `9149336081`;
- digest `sha256:c45710b5dae6a767ccb6bab7f6e3d8e9578752d8cf9b79fd82a65ae824dded1b`.

Successful attempt 3:

- job `94291056903`;
- artifact `9162165932`;
- digest `sha256:caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`.

Both attempts used seeds `1..5`, 20 epochs, batch size 32, learning rate `0.0003`, model steps 1, all `1117` eligible train rows and all `295` eligible validation rows. The locked test was not downloaded or evaluated.

The full-controls aggregates reproduced exactly between attempts 2 and 3:

- full model: `0.2549152493 ± 0.0129968006`, `n=5`;
- `no_planner`: `0.2501694888 ± 0.0129968006`, `n=5`;
- `no_target`: `0.2616949081 ± 0.0203953938`, `n=5`;
- shuffled-label control: `0.2630508393 ± 0.0145011803`, `n=5`, pass under frozen `0.35` ceiling;
- full minus `no_planner`: `+0.0047457606`, bootstrap 95% CI `[0.0, 0.0142372817]`;
- full minus `no_target`: `-0.0067796588`, bootstrap 95% CI `[-0.0135593176, 0.0]`.

The separately retained capacity-matched supervised baseline remains stronger in mean accuracy (`0.2664406780 ± 0.0154600058` versus LAM-JEPA `0.2549152542 ± 0.0129968064`). No superiority, planner-benefit, target-benefit, or quantization-benefit claim is promoted.

Artifact comparison found 10 files per attempt, with 8 byte-identical. The raw result JSON and normalized-input copy differ in low-order per-example floating-point probabilities: 35,526 numeric leaves differed, no non-numeric leaves differed, and the maximum observed numeric drift was about `5.9186e-4`. Full/no-planner/no-target aggregate summaries, all paired effects, the negative-control summary, strict verifier report and verifier verdict were exactly equal.

A stale `protocol.claim_boundary` string in the frozen raw output says the invocation is “not the final five-seed/20-epoch protocol.” This is a non-invalidating reporting-metadata defect: executable arguments and the independent verifier confirm that the full five-seed/20-epoch protocol executed. The frozen artifact is preserved unchanged.

The separate seed-order software defect and repair remain distinct from these scientific reruns. Machine-readable LAM-JEPA metadata records six independently verified deterministic replay attempts after the narrow seed-order repair. That repair does not change the negative ARC conclusion.

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

The original independent hosted replay remains Actions run `31411517815`, attempt 3, source SHA `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`, with `4/4` focused tests passing.

A reporting-only evidence-retention upgrade was then executed in Actions run `31649888889` at commit `dd942c18ebc8a528a0a8709f73191a6e73c0145e`. It reran the unchanged frozen 20-seed benchmark, retained the existing `--json` per-seed records, derived sample standard deviations, reasserted the negative >75% gate, and uploaded artifact `9162158000` with digest `sha256:b1c97233c2d5c4127fe4259f5035e8cfa19fa9c3a939d9a0969bbbd8dbf07213`.

Retained 20-seed statistics:

- diffusion persistence RMSE: `0.0156104849 ± 0.0005888038`;
- diffusion operator RMSE: `0.0050231824 ± 0.0000875845`;
- learned coefficient: `0.1796885855 ± 0.0013561664`;
- relative improvement: `0.6777662111 ± 0.0137478064`;
- relative-improvement range: `0.6543635307` to `0.7058142471`;
- zero-diffusion relative improvement: `-0.0002886259 ± 0.0007887086`.

The frozen success criterion remains mean improvement `>75%`, so the verdict remains `NEGATIVE_OR_INCONCLUSIVE_AGAINST_PREDECLARED_GATE`. The evidence upgrade changed reporting/retention only; no scientific code, seeds, data generation, metric, or threshold changed.

### Atlas V4: APEN, Eigen-JEPA, NPMS

The frozen source package `BU1LD_Research_Atlas_Flagships_v4_FRESH_2026-08-12.zip` was checksum-verified before execution. SHA-256: `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`.

Execution environment: Linux x86_64 CPU; Python `3.13.5`; NumPy `2.3.5`; pandas `2.2.3`; SciPy `1.17.0`; scikit-learn `1.8.0`; PyTorch `2.10.0+cpu`; Matplotlib `3.10.8`; pytest `9.0.2`. Full Atlas tests: `39/39` passed.

**APEN:** the 48 paired-condition base experiment reproduces its rare-event benefit, but not a clean overall-MSE dominance claim. The salience-dropout robustness extension reproduces the mechanism failure: the APEN rare-event advantage narrows by 80% salience dropout and reverses at 100% dropout. This remains a limitation rather than a result to hide.

**PEN:** no distinct executable PEN experiment exists in the frozen package. APEN evidence is not duplicated under a separate PEN label.

**Eigen-JEPA:** the real-market rerun preserves the negative boundary. Primary covariance-matrix MSE is `5.8318226e-09` for Eigen-JEPA versus `5.7734384e-09` raw ridge and `5.7896089e-09` log ridge on `n=111` test blocks. The paired Eigen-minus-raw interval crosses zero; Eigen-JEPA does not establish superiority.

**NPMS:** the controlled reservoir experiment reproduces regime-classification accuracy `0.928571` and stored spectral statistics. External validity and learned-model evidence remain open.

Across selected APEN/Eigen-JEPA/NPMS outputs, `61/65` artifacts reproduced byte-for-byte. The four differences were generated PDFs and were attributable to Matplotlib creation-time metadata; numerical CSV/JSON/NPZ outputs and PNG figures were exact.

## Reproducibility runner policy

Scientific workflows should retain raw machine-readable metrics, exact commands, source revisions, environments, seeds and verifier outputs. Reporting-only improvements may add artifact retention or descriptive statistics, but they must not silently alter the frozen scientific protocol or threshold.

## Portfolio triage function

Advance candidates by:

`Research Value × Novelty × Feasibility × Evidence Potential ÷ Remaining Effort`

Prefer work that produces a falsifiable hypothesis, baseline, metric, retained raw result, uncertainty, figure/table and failure analysis. Attractive names without experimental leverage remain unpromoted.

## Strongest next research experiments

1. **NGMT mechanism gate** — freeze the actual memory state/read/update rule, then compare no memory, standard memory, Gaussian/reference memory, proposed NGMT, and component ablations under matched compute on heavy-tailed/multimodal/regime-switching sequence tasks.
2. **APEN external-validity gate** — matched learned baselines, naturalistic delayed-signal task, preregistered salience-quality perturbations, paired seeds and calibration/rare-event metrics.
3. **Eigen-JEPA spectral gate** — stronger spectral/time-series controls, multiple market datasets, preregistered primary target and paired uncertainty analysis; treat current result as negative/boundary evidence.
4. **NeuroCAD learned robustness gate** — frozen OOD language suite + same-provider direct output vs typed-IR pipeline with validity, editability, geometry and failure metrics.
5. **Darcy learned operator gate** — matched-budget FNO/DeepONet-or-equivalent baseline vs proposed learned operator on held-out regimes; preserve nonlearned screen only as provenance.
6. **Hercules/Olympus architecture gate** — identical dataset/tokenizer/parameter count/optimizer/training budget: Transformer vs proposal vs ablation; measure validation loss, convergence, memory, throughput, downstream performance, instability and wall-clock cost.
7. **Latent-language real-model gate** — freeze multilingual encoder(s), balanced concepts/languages, train-only nuisance-removal transform, held-out probes and global/random-projection controls.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.
