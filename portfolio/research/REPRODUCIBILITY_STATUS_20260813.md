# Research Reproducibility Wave — Canonical Live Status — 13 August 2026

**Control-repository base:** `1a6e270a8d58e36447bee818740201a9c5e6072c`  
**Status semantics:** claim-specific; `REPRODUCED` is not `EXTERNALLY VALIDATED`, and CI success is not scientific superiority.  
**Negative results:** eligible for GREEN when the frozen experiment executed correctly and the adverse result is retained.

This file is the current research-wave status layer. Older root/portfolio status ledgers remain historical evidence and may lag these closure actions.

## Executive matrix

| Priority | Project / line | Current evidence state | Scientific outcome | Next gate |
|---:|---|---|---|---|
| P0 | LAM-JEPA | **FULL SCIENTIFIC RESULT REPRODUCED** in dedicated repo | ARC superiority, planner, target and repaired-quantization claims unsupported | new hypothesis only under separately frozen protocol; locked ARC test stays untouched |
| P0 | Project 2424 priority runner | **12 PRIORITY PATHS EXACT-HEAD EXECUTED; FAIL-CLOSED RUNNER** | mixed bounded/negative evidence by project | external/learned baselines per project; do not promote synthetic mechanics |
| P0 | T2424-0025 / NGMT precursor | **REPRODUCED + NEGATIVE MECHANISM CONTROL** | robust readouts help, including at zero Cauchy contamination; unique non-Gaussian mechanism not isolated | freeze real B0/B1/B2/B3 Transformer mechanism before training |
| P0 | NeuroCAD / T2424-0037 | **ORIGINAL + HELD-OUT + CAD-BACKEND REPRODUCED; POST-RESULT BUG FIX VERIFIED** | frozen OOD v1 passed 19/20 with one retained negative-width failure; unchanged benchmark passes 20/20 after narrow fix; OpenSCAD 12/12 | genuinely new geometry families; stronger direct/model baseline; richer CAD validity |
| P0 | IRIS v0.2 | **REPRODUCED MIXED/NEGATIVE + STRONGER DEVELOPMENT BASELINES REPRODUCED** | scalar heavy-tail effect localizes; universal shift and learned transfer fail; PABIM not promoted | common learned robust/change-aware harness, external temporal data, frozen successor, untouched confirmatory block |
| P1 | NGMT | **BLOCKED — MECHANISM NOT FROZEN** | no Transformer-level result | formal state/read/write/non-Gaussian equations and matched budgets |
| P1 | APEN | **REPRODUCED SYNTHETIC CONTROLLED MIXED** | rare-event benefit with informative salience; advantage collapses/reverses under heavy salience dropout | learned/naturalistic baseline and preregistered salience-quality stress |
| P1 | PEN | **INDEPENDENT EVIDENCE PACKAGE FOUND; FRESH SOURCE-TREE RERUN BLOCKED** | retained PEN slightly beats no-memory but loses random-write and attention-only controls | recover executable MODEL-PEN source tree and rerun independently; do not inherit APEN evidence |
| P1 | Eigen-JEPA | **REPRODUCED REAL-DATA MIXED/NEGATIVE** | no superiority over strong direct covariance forecasting; persistence strongest on reported subspace metric | reconcile distinct lineages; freeze primary metric; multi-dataset replication |
| P1 | NPMS | **REPRODUCED CONTROLLED DIAGNOSTIC + TRAINED RNN/GRU COMPANION** | spectra are coordinate-stable and more delay-regime-informative than coarse parameter summaries in controlled models | larger/nonlinear architectures, natural tasks, causal intervention selectivity |
| P1 | T2424-0050 Darcy | **REPRODUCED BOUNDED DETERMINISTIC SCREEN** | construction-aligned reduced resistance works on controlled 1D fields | learned operator, misaligned/OOD fields, multidimensional physical data |
| P1 | T2424-1863 | **REPRODUCED NEGATIVE AGAINST PREDECLARED GATE** | observed mean improvement `67.777%`, below required `>75%` | retain negative; real PDE / learned-operator comparison before any promotion |
| infra | Percy logical swarm | **16,256 LOGICAL IDENTITIES MERGED + TESTED** | scheduling namespace only; not 16,256 physical workers | real-host SQLite/lease/heartbeat/provider/RAM qualification remains external to this session |

## LAM-JEPA — dedicated repository closure

Dedicated repository `vertex-studyAI/LAM-JEPA` now contains the final evidence audit and conservative manuscript-ready Results text.

Frozen full scientific source:

`760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`

Independent full-controls reruns, Actions run `31203337502`:

- attempt 2 artifact `9149336081`, digest `sha256:c45710b5dae6a767ccb6bab7f6e3d8e9578752d8cf9b79fd82a65ae824dded1b`;
- attempt 3 artifact `9162165932`, digest `sha256:caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`.

Frozen five-seed ARC results:

- full LAM-JEPA `0.2549152493 ± 0.0129968006`;
- `no_planner` `0.2501694888 ± 0.0129968006`;
- `no_target` `0.2616949081 ± 0.0203953938`;
- shuffled-label control `0.2630508393 ± 0.0145011803`;
- full − no-planner `+0.0047457606`, bootstrap 95% CI `[0, 0.0142372817]`;
- full − no-target `-0.0067796588`, bootstrap 95% CI `[-0.0135593176, 0]`.

Separately retained capacity-matched supervised result:

- LAM-JEPA `0.2549152542 ± 0.0129968064`;
- matched supervised `0.2664406780 ± 0.0154600058`;
- paired LAM − matched `-0.0115254237 ± 0.0140994131`.

The locked ARC test remains unused for the failed hypothesis line. A real seed-order software reproducibility defect was preserved, narrowly repaired, and replayed without changing the scientific verdict.

## Project 2424 — current fail-closed reproduction runner

The expanded workflow covers 12 priority mechanics packages and now uses explicit Bash/pipefail so a failed producer cannot be masked by `tee`.

Exact-head hardening execution:

- workflow run `31660595576`;
- head `faad54b05de4dbfd7f9f6720342b22e50a283ef3`;
- conclusion `success`;
- artifact `9166031673`;
- digest `sha256:e142f0f03b206891fc2266e7762c3c04f3a1a4163302e6a2aa6254c9516e03ad`.

Covered paths:

`T2424-0024`, `0025`, `0026`, `0027`, `0028`, `0029`, `0035`, `0037`, `0040`, `0050`, `0054`, `1768`.

T2424-1863 is separately retained as a negative/inconclusive result against its predeclared `>75%` improvement criterion; observed 20-seed mean improvement is `67.777%`.

### T2424-0025

The 30-seed screen and 50-seed contamination sweep reproduce. The decisive mechanism boundary remains the zero-contamination control: weighted median MAE is about `0.01257` versus arithmetic mean `0.02465` even without Cauchy contamination. This is a robust-readout precursor, **not NGMT**.

### NeuroCAD bug-before / fix-after

Frozen held-out-template v1 was committed before execution and remains unchanged:

- 20 cases: 12 valid, 8 invalid;
- typed compiler v1: 12/12 exact valid, 7/8 invalid rejection, 19/20 overall;
- direct flat baseline: 12/12 exact valid, 0/8 invalid rejection, 12/20 overall;
- retained failure: `plate -50 by 40 thickness 3` accepted because the regex could skip the sign;
- OpenSCAD backend: 12/12 valid cases produced non-empty STL.

Original v1 artifact: `9165650301`, digest `sha256:753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`.

Post-result repair changed only signed-negative-literal rejection plus four regression tests. The same frozen benchmark, thresholds and direct baseline were not edited.

Post-fix exact-head run `31660543924`, head `d4ce113096d188ca5cd4d4f272c8955df2f1365c`:

- typed compiler: 12/12 exact valid, 8/8 invalid rejection, 20/20 overall;
- direct baseline remains 12/20;
- OpenSCAD: 12/12;
- artifact `9166026030`;
- digest `sha256:cdf31db334246baad2c4fe15a1ea3faae4156ebce12ffedf238ff046a5c7bb4b`.

The v1 failure remains historical scientific evidence; the 20/20 result is clearly post-fix engineering/reproduction evidence.

## IRIS v0.2

Latest clean recovered package:

- archive `IRIS_v0.2_research_package(1).zip`;
- SHA-256 `5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`;
- package checksums passed;
- 4/4 tests passed;
- scalar and learned raw/summary/paired CSVs regenerated byte-identically in one clean attempt;
- figures/tables regenerated hash-identically;
- only runtime-bearing manifests changed.

Scientific result:

- scalar Student-t(2) HTAM vs Huber-4 improvement `+30.27%`, bootstrap 95% CI `[28.71%, 31.80%]`, `n=20`;
- Student-t(3) `+19.33%`, CI `[17.66%, 21.00%]`;
- abrupt regime `-7.27%`, CI `[-9.18%, -5.24%]` — universal shift claim fails;
- learned PABIM improves HTAM regime failure but remains about `25.1%` worse than Huber-4 on clean MSE and `43.0%` worse on regime MSE.

Stronger development-baseline addendum:

- archive SHA-256 `7653c87d5effb08da9068630259802d77b34b930083dd160ccea4ce23311175b`;
- internal checksums pass;
- confirmed-change Huber improves abrupt-regime MSE about `7.77%` and recovery `23.1 → 17.1` steps, but worsens Student-t(2) MSE about `5.32%`;
- robust CUSUM recovers regime changes faster (`23.1 → 13.8` steps) but false-opens heavily under isolated corruption (`0.4072–0.4559` in key stress conditions).

No successor confirmatory block was accessed. IRIS remains a rigorous mixed/negative research package, not a proven positive architecture.

## APEN / PEN / Eigen-JEPA / NPMS

Recovered Atlas V4 archive SHA-256:

`500e4c6b3e6f1be16ef78c9b55e62f647efefd92e8a27eeadef1190a50352b48`

A pre-existing package-integrity defect was preserved: 761 listed hashes pass, eight fail (seven regenerated PDFs plus one Memory Spectrum Transfer README). Scientific APEN/Eigen/NPMS CSV/JSON/NPZ artifacts are not in the failed set.

### APEN

Fresh rerun: 7 focused APEN/Eigen/NPMS tests pass collectively. APEN shows a bounded rare-event benefit but not overall-MSE dominance. Salience dropout falsifier shows the benefit collapses near 80% dropout and reverses at 100%.

### PEN

A distinct MODEL-PEN evidence package exists. Retained means across compact seeds 17/23/29:

- PEN predictive MSE `0.2382847617`;
- no memory `0.2414076626`;
- random write `0.2373956343`;
- attention only `0.2357257257`.

The retained result does not support learned-salience superiority. A complete executable source tree has not yet been recovered into the current runtime, so this is **not** relabeled as a fresh reproduction.

### Eigen-JEPA

Official Fama-French real-data covariance line freshly reruns. Eigen-JEPA improves matrix-MSE point estimate relative to persistence but does not establish superiority over raw/log ridge; log-ridge is better on log distance and persistence is best on the reported subspace-distance metric. Do not metric-shop.

### NPMS + Memory Spectrum Transfer

Controlled NPMS reservoir diagnostic reproduces. The trained companion adds 24 RNN/GRU models (delays 3/8/15 × four seeds):

- orthogonal-rotation spectrum similarity `1.0`;
- delay-regime classification from functional spectra `0.875`;
- classification from coarse parameter summaries `0.666667`.

This strengthens a controlled diagnostic claim, not a universal memory-mechanism claim.

## Percy logical execution model

The repository now contains the exact logical scheduling namespace:

- `P00000–P16255` = 16,256 logical identities;
- `S000–S126` = 127 squads;
- 128 logical agents per squad;
- exhaustive mapping/cardinality tests merged.

This does **not** mean 16,256 processes, model sessions or API calls. Real-host Percy SQLite integrity, leases, heartbeat state, provider health, RAM/swap/thermals and mounted-disk state remain unavailable to this GitHub/Library execution session and must not be marked green without host evidence.

## Claims that remain blocked

- LAM-JEPA superiority or validated planner/target/quantization benefit;
- Transformer-level NGMT;
- fresh executable PEN reproduction;
- arbitrary/general NeuroCAD or new part-family OOD;
- IRIS positive architecture or external validation;
- Eigen-JEPA general superiority;
- NPMS causal-use/general transfer;
- learned Darcy/neural-operator claims;
- giant-model Hercules/Olympus claims without matched-budget learned experiments;
- any `PUBLISHED`, `EXTERNALLY VALIDATED`, `PRODUCTION VERIFIED`, or `RESEARCH_COMPLETE` label not backed by the corresponding retained evidence.
