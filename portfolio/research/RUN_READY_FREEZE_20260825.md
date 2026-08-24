# Research Run-Ready Freeze — 25 August 2026

**Purpose:** make every recoverable research line ready for a clean, evidence-producing run without spending protected scientific outcome budget or rewriting frozen results.

**Branch:** `research/run-ready-freeze-20260824`

## Non-negotiable truth boundary

This freeze inherits the canonical portfolio rules:

- negative, mixed, inconclusive and falsified results are preserved;
- no frozen result is rescued in place;
- `major_scientific_outcome_runs_authorized` remains `0` unless explicitly changed by the owner;
- IRIS seeds `1000–1029` remain forbidden;
- Darcy T2424-0050 remains `training_authorized=false` until every pre-outcome gate is closed;
- registry identity is not source, source is not execution, execution is not reproduction, and reproduction is not external validation;
- UNKNOWN stays UNKNOWN when canonical source/identity is not recovered.

The aim of this branch is therefore **PREPARE → VERIFY PRE-OUTCOME → FREEZE → HAND OFF**, not “make every hypothesis win.”

## Universal morning gate

A line may be labelled `RUN_READY` only if all applicable boxes below are backed by repository evidence.

- [ ] canonical identity and version resolved
- [ ] source tree or immutable source archive identified
- [ ] research question and hypothesis frozen
- [ ] explicit falsifier / failure criterion frozen
- [ ] benchmark/task definition frozen
- [ ] dataset identity, license/terms boundary and loader/download path recorded
- [ ] train/validation/test/OOD boundaries frozen before outcome access
- [ ] preprocessing deterministic and versioned
- [ ] main method implementation identified
- [ ] trivial/reference baseline identified
- [ ] strong contemporary or domain baseline identified where applicable
- [ ] compute-budget matching rule stated where comparisons need it
- [ ] primary experiment config frozen
- [ ] ablation/mechanism experiment config frozen where mechanism is claimed
- [ ] robustness/OOD/failure-region protocol frozen where relevant
- [ ] seed policy frozen; protected seeds inaccessible
- [ ] metrics and units predeclared
- [ ] statistical aggregation / uncertainty procedure predeclared
- [ ] output/result schema declared before final runs
- [ ] tables are generated from machine outputs, not hand-entered values
- [ ] figures are generated from machine outputs, not hand-entered values
- [ ] environment/dependency lock identified
- [ ] deterministic or bounded smoke path exists
- [ ] full run entry point can be handed to Percy/LabOS or a direct executor
- [ ] artifact directory records config, commit/source hash, dataset fingerprint and logs
- [ ] claim gate prevents CI/smoke/source presence from becoming a scientific-success claim
- [ ] historical negative/mixed evidence remains immutable

## Execution classes

| Class | Meaning | Allowed now |
|---|---|---|
| `FROZEN_RESULT` | Existing result is already negative/mixed/falsified and must not be retuned | reproduce/package/review only |
| `PREOUTCOME_BLOCKED` | Protocol/source exists but a pre-outcome gate is unresolved | source/data/config/baseline/environment closure only |
| `SOURCE_RECOVERY` | Canonical executable source or identity is missing | archive/hash/lineage recovery only |
| `PROTOCOL_FREEZE` | A successor study is scientifically allowed only as a fresh protocol | design + implement pre-outcome harness; no outcome run |
| `EXTERNAL_VALIDATION` | Internal package exists; next evidence must come from outside | release packet / reviewer instructions / reproducibility packaging |
| `RUN_READY` | All pre-outcome gates are closed and owner may authorize execution | no automatic outcome run while global authorization is 0 |

## Portfolio research-line freeze matrix

| Line | Current class | Morning target | Explicitly forbidden |
|---|---|---|---|
| LAM-JEPA | `EXTERNAL_VALIDATION` | verify release/reproduction commands, dataset/protocol provenance, paper artifact path and outside-review packet | no ARC locked-test rescue, no retune of negative result |
| IRIS v0.2 | `PREOUTCOME_BLOCKED` | close exact development-trajectory identity/equivalence provenance; hash every recovered input; generate execution manifest only after provenance closes | seeds 1000–1029, approximate trajectory regeneration, frontier outcome run |
| NeuroCAD typed-parser mechanism | `FROZEN_RESULT` | preserve `VALIDATION_DOMINANT`; prepare a *new* broader-benchmark successor skeleton separated from product reliability work | rewriting the falsified mechanism as positive |
| NeuroCAD product/reliability | pre-outcome engineering | parser/kernel/constraint/geometry/editability/manufacturability smoke and external-evaluator protocol | using product QA as proof of the falsified mechanism |
| NGMT v0.1 | `FROZEN_RESULT` | immutable negative package + fresh successor protocol namespace if continued | in-place v0.1 rescue |
| APEN | `PROTOCOL_FREEZE` | matched learned-memory + naturalistic-salience + failure-region control protocol | reusing mixed result as a new success claim |
| PEN | `SOURCE_RECOVERY` | recover exact source tree, hashes and original compact commands | inheriting APEN source/evidence |
| Eigen-JEPA | `FROZEN_RESULT` + successor `PROTOCOL_FREEZE` | preserve current mixed/negative evidence; specify multi-dataset hierarchy + stronger spectral/direct baselines in a new version | metric switching, in-place rescue |
| Eigen-Finance | `SOURCE_RECOVERY` | recover distinct source/contribution and separate it from adjacent Eigen/finance work | making a novelty claim before source identity closes |
| NPMS | `PROTOCOL_FREEZE` | natural/causal intervention protocol beyond invariant-parameter, state-space and spectral controls | natural/OOD outcome run before protocol authorization |
| JEPA × time-series | `PROTOCOL_FREEZE` | machine-readable cheap synthetic protocol with statistical/objective baselines, seed budget and falsifier | outcome run before freeze/authorization |
| Weather-JEPA | `SOURCE_RECOVERY` | recover canonical source; if recovered, wire deterministic weather loader + persistence/statistical baselines and temporal split manifest | calling a registered name an implemented model |
| Space-JEPA | `SOURCE_RECOVERY` | recover canonical source; if recovered, wire mission-data loader + persistence/ridge/reconstruction baselines and anomaly protocol | calling protocol ideas results |
| Audio-Light / Audio-JEPA incubation | `SOURCE_RECOVERY` | recover source or retain UNKNOWN; then define cheap representation benchmark only | manufacturing implementation status |
| Hercules | `SOURCE_RECOVERY` / archived compute | recover real implementation and freeze one matched-provider/task/tool-budget protocol | significant training before decisive protocol |
| Olympus family | `SOURCE_RECOVERY` / archived compute | separate implementations from names/specs for Olympus/Hermes/Prometheus/Perseus/Atlas/Kronos/Aion/Themis/Pantheon/Mnemosyne; freeze a matched-budget capability protocol | model/capability claims from names/specs |
| T2424-0050 Darcy v2 | `PREOUTCOME_BLOCKED` | close covariance/OOD-D interpretation, environment/hardware lock, B3 FNO, B4 DeepONet, split/budget hashes; keep training disabled | training, ID-test/OOD outcomes, auto-merge/deploy |
| T2424-1863 | `FROZEN_RESULT` | archive exact negative synthetic package; successor only under new real-PDE protocol | rescue/retune current result |

## Project 2424 repository-backed identity queue

The canonical `SOURCE_IDENTITY_MANIFEST.json` currently proves directory identity for the following 23 projects. Directory presence does not imply scientific completion.

| ID | Canonical repository name | Freeze objective |
|---|---|---|
| T2424-0016 | PST — Predictive Single-Cell Transition Score | source/data/benchmark/result provenance audit; prepare deterministic replay only |
| T2424-0019 | NPMS — Neural Predictive Memory Spectroscopy | successor protocol + controls only; preserve current non-unique result |
| T2424-0023 | Multilingual Epistemic Blind Spots Benchmark | real-model adapter, language/task manifest, strong baseline definitions, raw-output schema |
| T2424-0024 | Trust Under Uncertainty | recover exact current status; freeze calibration/abstention benchmark and reference baselines before runs |
| T2424-0025 | Non-Gaussian Memory Transformer | preserve precursor evidence; isolate any new learned causal-memory study under a new frozen protocol |
| T2424-0026 | Counterfactual Defect Worlds | recover executable path; freeze interventions, counterfactual ground truth and simple causal baselines |
| T2424-0027 | Sapir–Whorf Latent Tongue | recover current executable path; freeze multilingual/representation controls and falsifier |
| T2424-0028 | Residual Event Tokenization | recover method/claim boundary; freeze tokenization baselines and downstream utility tests |
| T2424-0029 | Representation Phase Transitions for PDEs | freeze PDE datasets/solver truth, representation diagnostics and alternative explanations |
| T2424-0030 | Adaptive Theory Geometry in World Models | freeze synthetic systems, geometry diagnostics, matched representation baselines and falsifier |
| T2424-0034 | Quant ML Visualizer | separate tooling utility from scientific claims; wire deterministic demo/validation paths |
| T2424-0035 | Grokking Agent | freeze task families, grokking criterion, compute-matched controls and seed policy |
| T2424-0036 | Rubik's A* Intelligence | freeze A*/IDA*/weighted-A*/learned-heuristic comparisons; optimality, expansions, time and memory metrics |
| T2424-0037 | NLP-to-CAD | structural CAD benchmark: parse, build, topology, geometry, constraints, editability, perturbation, manufacturability and semantics |
| T2424-0038 | Obscured Records Agent | freeze ground-truth retrieval/agent tasks, factuality and simple retrieval baselines |
| T2424-0040 | FinanceMeta Learning Graph | recover build/test state; freeze educational graph benchmark before scientific claims |
| T2424-0046 | Auto-Research Foundry | freeze one ground-truth research task and human/reference workflow baseline; audit provenance of generated artifacts |
| T2424-0049 | Multiphase Porous JEPA | freeze physical dataset/split, conservation/field metrics, operator baselines and material-regime OOD tests |
| T2424-0050 | Darcy Latent Operator | finish pre-outcome locks only; no learned outcome run |
| T2424-0053 | Scientific Motif Dictionary | freeze motif stability/repeatability and downstream predictive/interpretability utility tests |
| T2424-0054 | Theory-Manifold Experiment Planner | freeze synthetic worlds with known optimal/informative experiments; compare against random/greedy/active-learning controls |
| T2424-1767 | Resource-Bounded Mixture-of-Experts Operator for Scientific ML Benchmarking | freeze compute-quality Pareto protocol and matched dense/operator baselines |
| T2424-1768 | Self-Verifying Mixture-of-Experts Engine for Scientific ML Benchmarking | freeze verifier benefit/cost protocol, verifier-disabled ablation and matched compute budget |

## Standard result directory contract

Every new *authorized* run should write immutable machine outputs beneath a run-specific directory, for example:

```text
runs/<run_id>/
  manifest.json
  source.json
  environment.json
  dataset.json
  config.json
  seeds.json
  stdout.log
  stderr.log
  metrics.json
  raw_predictions.*
  tables/
  figures/
  checksums.sha256
```

At minimum `manifest.json` should record project ID/version, source commit or archive hash, protocol hash, dataset/split fingerprints, environment identity, hardware identity where relevant, seed policy, start/end time, executor, command, exit status and artifact hashes.

## Table/figure rule

No publication table or figure should contain a manually typed scientific result. Reporting code must consume `metrics.json` / raw machine outputs and emit the table/figure artifact. A table can exist before the run as a schema/template, but its result cells remain empty until populated by verified outputs.

## Claim gate

Before any result becomes paper prose, check:

1. did the exact frozen protocol produce it?
2. were protected test/OOD/seed boundaries respected?
3. is the comparison budget/fairness rule satisfied?
4. does raw output reproduce the aggregate?
5. does the figure/table regenerate from raw output?
6. is the effect larger than the predeclared practical/statistical threshold, if one exists?
7. is the result positive, null, mixed or negative under the *predeclared* decision rule?
8. does the claim say only what that evidence supports?

## Executor handoff

Preparation jobs may be routed through Percy/OpenCode/Python/Shell or direct Claude/Gemini/Codex as appropriate, but parallel writers must use isolated worktrees/branches. The executor must not silently change frozen hypotheses, metrics, protected seeds, test boundaries or result classifications.

## Morning handoff format

Each line should end the freeze with exactly:

- `CURRENT_TRUTH`
- `SOURCE_STATE`
- `DATA_STATE`
- `MODEL_STATE`
- `BASELINE_STATE`
- `PROTOCOL_STATE`
- `SMOKE_STATE`
- `RESULT_SCHEMA_STATE`
- `RUN_COMMAND`
- `BLOCKERS`
- `FORBIDDEN_ACTIONS`
- `NEXT_AUTHORIZED_ACTION`
- `FINAL_STATUS`: `RUN_READY / PREOUTCOME_BLOCKED / SOURCE_RECOVERY / FROZEN_RESULT / UNKNOWN`

The morning goal is **maximum defensible run-readiness**, not maximum claimed novelty.