# RESEARCH_STATUS

As of: **2026-08-13 — independent reproducibility audit**

Maturity is claim-specific and evidence-backed. A green CI lane is execution evidence, not scientific superiority. Negative and inconclusive results remain first-class outcomes when the frozen protocol executed correctly.

Historical detail from the prior wave is retained in `portfolio/research/REPRODUCIBILITY_WAVE_20260812.md`. The independent 13-August Project 2424 audit is retained in `portfolio/research/reproducibility-wave-20260813/PROJECT2424_INDEPENDENT_AUDIT.md` and `project2424_independent_audit.json`.

| Research line | Current state | Strongest retained evidence | Promotion gate |
|---|---|---|---|
| LAM-JEPA | **FULL SCIENTIFIC RERUN REPRODUCED / ARC SUPERIORITY + MECHANISM HYPOTHESES UNSUPPORTED** | frozen ARC v3 scientific head `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`; Actions run `31203337502` attempts 2, 3 and 4; attempt-4 artifact `9163503934`, digest `sha256:14c315cd64b2b96d48af4b865bca700a101ea66842a78f35382a5f408805b10a`; independent raw recomputation reproduced seed aggregates exactly | keep locked ARC test closed; any new mechanism/hypothesis must be versioned and frozen before validation |
| T2424-0025 robust readouts | **REPRODUCED / CROSS-RERUN SCIENTIFIC JSON BYTE-IDENTICAL / NEGATIVE MECHANISM CONTROL PRESERVED** | frozen source `0d2a14e...`; verifier-fix run `31618609967` attempt 3, artifact `9162627168`, digest `sha256:d9d1816d...`; 30-seed screen + 50-seed ablation; attempts 2→3 retain identical scientific JSON | freeze actual NGMT architecture; add B0/B1/B2/B3 matched learned memory arms |
| NGMT | **BLOCKED — TRANSFORMER/LEARNED MEMORY MECHANISM NOT FROZEN** | T2424-0025 is an attention-addressed synthetic aggregation/readout screen; 0% contamination still strongly favors robust readout | define state/read/write/non-Gaussian property, matched dimensions/parameters, sequence tasks, paired seeds and falsifier before training |
| APEN | **FRESH PRIOR SOURCE-ARCHIVE REPRODUCTION / SYNTHETIC MECHANISM TRADEOFF** | Atlas V4 archive SHA-256 `076f12750d6a8e6c298c17815224a79463bcad149d6cf1283900d98c6e394a2c`; 48 paired conditions + salience-dropout stress; 39/39 Atlas tests | matched learned baselines, naturalistic task, preregistered salience-quality stress |
| PEN | **NOT SEPARATELY EXECUTABLE** | frozen Atlas V4 contains APEN; no distinct PEN executable experiment is retained | independent PEN implementation + frozen protocol before separate status |
| Eigen-JEPA | **FRESH PRIOR SOURCE-ARCHIVE REPRODUCTION / BOUNDARY-NEGATIVE** | real-market frozen rerun; matrix MSE `5.8318226e-09` vs raw ridge `5.7734384e-09` and log ridge `5.7896089e-09`, `n=111`; paired interval vs raw ridge crosses zero | stronger spectral/time-series baselines, preregistered primary metric, multi-dataset replication |
| NPMS | **FRESH PRIOR SOURCE-ARCHIVE REPRODUCTION / CONTROLLED SYNTHETIC MECHANISM** | Atlas V4 controlled reservoir rerun; regime classification accuracy `0.928571` | learned sequence model, stronger memory baselines, OOD/generalization |
| T2424-0027 latent language audit | **REPRODUCED + INDEPENDENTLY VERIFIED SYNTHETIC AUDIT** | 72-record deterministic protocol; centered language accuracy `0.361111`; leakage reduction `0.958333`; artifact result SHA `0eac35dd...` | real multilingual encoder, preregistered probes and controls |
| T2424-0028 residual-event tokenization | **REPRODUCED BOUNDED CODEC MECHANICS** | run `31656575356`, artifact `9164597422`, digest `sha256:252392c0...`; primary threshold 0.5 uses 8 events / 120 observations, 15× event-count compression, MAE `0.1728128635`; 5/5 tests | noisy/nonlinear/external signals, byte-level rate–distortion baseline, learned comparison |
| T2424-0029 PDE transitions | **REPRODUCED BOUNDED ANALYTIC SCREEN** | run `31653397825`, artifact `9163421118`, digest `sha256:5864fad9...`; exact effective-mode sequence `3→2→2→1→1`; 5/5 tests | nonlinear PDEs, grid/energy sensitivity, learned representation comparison |
| T2424-0037 NeuroCAD | **REPRODUCED CONTROLLED 20-CASE BENCHMARK** | audited artifact `9162627168`; 20/20; accepted 15/15; syntax/execution, geometry, dimension and constraint metrics all `1.0` | OOD/compositional suite + same-provider direct-vs-typed-IR learned comparison + retained raw outputs |
| T2424-0050 Darcy | **REPRODUCED BOUNDED SYNTHETIC/ANALYTIC SCREEN** | audited artifact `9162627168`; 20 seeds; baseline pressure MAE `0.0658913916 ± 0.0382656910`; latent `0.0011366559 ± 0.0002030801`; relative improvement `0.9787663202 ± 0.0086501063` | actual learned operator, matched budget, OOD/misaligned fields, held-out regimes |
| T2424-1863 local diffusion operator | **INDEPENDENTLY REPLAYED / NEGATIVE AGAINST PREDECLARED GATE** | source `7cee0bd4...`; reporting run `31649888889`; 20-seed relative improvement `0.6777662111 ± 0.0137478064`, below frozen >75% gate | real PDE data, learned operator baseline, rollout/compute comparison |
| T2424-0024 Trust Under Uncertainty | TESTED + MERGED | paired calibration/ablation fixture | frozen real-model prediction set + calibration/selective-risk baselines |
| T2424-0026 Counterfactual Defect Worlds | TESTED + MERGED | deterministic intervention/locality fixture | learned world model / richer environment baseline |
| T2424-0035 Grokking Agent | TESTED + MERGED SYNTHETIC DETECTOR | deterministic synthetic detector tests | real training curves + no-grokking controls + sensitivity |
| T2424-0040 FinanceMeta Learning Graph | TESTED + MERGED | prerequisite-aware vs utility-only synthetic control | retrospective traces + prospective causal evaluation |
| T2424-0054 Experiment Planner | TESTED + MERGED INTERNAL TOOL | internal planner tests | historical backtest vs random/greedy/simple rules |
| T2424-1768 self-verifying MoE | TESTED + MERGED SYNTHETIC CONTRACT PROTOTYPE | predeclared corrupt-expert control | heterogeneous real tasks, verifier calibration, cost/accuracy |
| Research Atlas V4 | **FRESH CHECKSUMMED PRIOR SOURCE-ARCHIVE REPRODUCTION + PACKAGING** | archive SHA `076f1275...`; 39/39 tests; all 18 base experiments rerun; 61/65 selected artifacts byte-exact, four PDF timestamp-only differences | independent clean-room reproduction + project-specific external gates |
| Hercules | ARCHITECTURE/IMPLEMENTATION FAMILY; LEARNED ADVANTAGE UNPROVEN | architecture ownership separated from giant-model naming | same-budget Transformer vs proposal vs ablation |
| Olympus | O0 RATIONALIZED ROADMAP/RUNTIME | scale/model-name claims separated from learned evidence | O1 learned experiment, O2 ablation before promotion |
| Hermes / Prometheus / Perseus / Atlas / Kronos | CONCEPT/RUNTIME NAMES UNLESS SPECIFIC ARTIFACT PROVES MORE | no retained evidence here proves the named training scales | implementation → training → evaluation → ablation → release individually |
| Percy | TESTED INFRASTRUCTURE, NOT SCIENTIFIC RESULT | 16,256 logical-agent scheduling namespace is separate from bounded physical concurrency | real-host/provider qualification for production claim |

## 13-August independent audit

### LAM-JEPA

The frozen ARC full-controls result has a retained **attempt 4** in run `31203337502`:

- job `94302727334`;
- artifact `9163503934`;
- digest `sha256:14c315cd64b2b96d48af4b865bca700a101ea66842a78f35382a5f408805b10a`;
- Ubuntu 24.04.4 LTS, Python 3.11.15, PyTorch 2.13.0+cpu, NumPy 2.4.6, CPU;
- five seeds `1..5`, 20 epochs, all 1,117 eligible train rows and 295 validation rows;
- locked test not evaluated;
- verifier verdict `PROTOCOL_V3_FULL_CONTROLS_VALIDATION_VERIFIED`;
- `mechanism_claim_authorized=false`, `research_complete=false`.

An independent parser recomputed all five-seed full / `no_planner` / `no_target` / shuffled-label accuracy means and sample SDs exactly from the raw artifact.

Attempt 3→4 has the same 10-file set: 8 files byte-identical, 36,468 numeric leaf differences, zero non-numeric differences, maximum per-example probability drift `0.0007445961`; every stored aggregate scientific summary and verifier decision is exactly equal. A historical PR merge checkout SHA was also audited and found to have zero changed files versus the scientific head.

LAM-JEPA therefore remains **negative/inconclusive, reproduced**. The capacity-matched supervised baseline remains stronger in mean validation accuracy; neither planner nor target-path criterion is promoted.

Canonical LAM-JEPA evidence is being reviewed in draft PR #72 in the LAM-JEPA repository.

### Project 2424 T2424-0025 / 0027 / 0037 / 0050

Retained run `31618609967`, attempt 3, artifact `9162627168`, digest `sha256:d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae` was downloaded and independently inspected.

A prior verifier failure is classified as infrastructure-only: the T2424-0025 `run.mjs` and `ablation.mjs` blobs are byte-identical between frozen experiment revision `0d2a14e...` and verifier-fix revision `bd2a4d3...`. The successful rerun is therefore not a scientific retune.

Attempts 2→3 retain the same 15-file set. Seven scientific/verifier files are byte-identical, including T2424-0025 screen/ablation/verifier JSON, T2424-0027 results/verifier, NeuroCAD benchmark JSON, and Darcy result JSON. Differences are timing, environment timestamps, and test-log duration metadata.

T2424-0025's 0% contamination control remains decisive against a unique NGMT interpretation: weighted median MAE `0.0125699 ± 0.0020831` versus weighted mean `0.0246469 ± 0.0023116`, `n=50`. NGMT remains blocked until B0/B1/B2/B3 are defined as an actual matched learned memory experiment.

### T2424-0028 / T2424-0029

The current retained artifacts were independently downloaded and inspected. Their raw hashes and focused-test hashes match the prior portfolio ledger. No claim is widened:

- 0028 is event-count compression/reconstruction mechanics, not byte-level codec superiority;
- 0029 is a controlled analytic effective-rank transition, not a universal neural/PDE phase transition.

### APEN / PEN / Eigen-JEPA / NPMS

The Atlas V4 release checksum and release manifest are independently visible in the connected Library, including `39/39` fresh tests and the source-release SHA. The actual Atlas source ZIP is not exposed as a directly materializable Library item in this execution context, so these projects are **not relabeled as independently rerun on 13 August**.

Retain the previous evidence classifications:

- APEN: synthetic rare-event mechanism/tradeoff; advantage degrades with salience quality and reverses at 100% dropout;
- PEN: no distinct executable experiment;
- Eigen-JEPA: boundary-negative against strongest raw/log ridge controls on primary matrix MSE;
- NPMS: controlled synthetic mechanism, external/learned validation open.

## Runner integrity note

Branch `repro-wave/project2424-20260813` hardens `.github/workflows/research-repro-wave-20260812.yml` with explicit `set -euo pipefail`, per-command wall-clock capture, and a SHA-256 manifest. It changes no scientific experiment source. No Actions run has attached to that branch commit as of this audit, so the hardening is classified **PREPARED / NOT YET EXECUTED** and is not counted as fresh scientific evidence.

## Strongest next research experiments

1. **NGMT mechanism gate** — freeze B0 no memory, B1 standard memory, B2 Gaussian/reference robust memory, B3 proposed non-Gaussian memory; match dimensions/parameters and run clean, heavy-tail and regime-shift sequence tasks with paired seeds.
2. **APEN external-validity gate** — matched learned baselines, a naturalistic delayed-signal task, preregistered salience corruption and rare-event/calibration metrics.
3. **Eigen-JEPA spectral gate** — stronger spectral/time-series controls, multiple market datasets and a preregistered primary target; current result stays negative/boundary.
4. **NeuroCAD learned robustness gate** — frozen OOD/compositional language suite and same-provider direct-output vs typed-IR comparison with raw outputs and unsafe/rejection cases.
5. **Darcy learned-operator gate** — matched-budget FNO/DeepONet-or-equivalent vs proposed learned operator on held-out physical regimes.
6. **NPMS learned-memory gate** — stronger memory baseline plus OOD/generalization evaluation.
7. **Hercules/Olympus architecture gate** — same data/tokenizer/parameter count/optimizer/training budget: Transformer vs proposal vs ablation.

## Paper-factory rule

A candidate becomes `PAPER_DRAFT` only when the central result has been measured and the manuscript has a precise research question, related-work positioning, reproducible method, baselines, metrics, experiments, limitations, figures/tables and reproduction instructions. Local manuscript generation alone does not advance scientific maturity.
