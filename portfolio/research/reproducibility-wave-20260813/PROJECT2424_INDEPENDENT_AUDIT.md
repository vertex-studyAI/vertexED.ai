# Project 2424 Independent Reproducibility Audit — 13 August 2026

## Scope

This audit independently inspects retained evidence from Project 2424 Actions run `31618609967`, run attempt `3`, without changing any scientific experiment source, seed set, contamination grid, metric, threshold, benchmark fixture, or claim boundary.

Retained attempt-3 evidence:

- runner/source head: `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`
- artifact: `9162627168`
- artifact digest: `sha256:d9d1816d3cf8eb317f435b180c0ec6137fa64cbfde6b99e7f8b5f2d5f1a0bbae`
- Node: `v22.22.0`
- npm: `10.9.4`
- Linux: `6.17.0-1022-azure`, x86_64
- visible CPUs: `4`
- artifact execution window: `2026-08-12T23:31:46Z` → `2026-08-12T23:31:48Z`

The artifact contains 15 retained files covering T2424-0025, T2424-0027, T2424-0037, T2424-0050, tests/verifiers, timings, and environment capture.

## Verifier-bug lineage

A prior run, `31617979117`, failed after the scientific T2424-0025 commands had emitted results because a post-run verifier expected an obsolete ablation schema (`a.seeds` / `a.summary`) instead of the canonical `a.sweep.seeds` / `a.sweep.rows` shape.

The verifier-only repair was committed as `bd2a4d3d939b8ce06908d7842ca9e075e0ae2fa7`. The scientific entry points remained byte-identical to the frozen experiment revision `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`:

- `T2424-0025/experiment/run.mjs`: blob SHA `e5987fb6021fa0ed550166c8c45c8f4acce6fc1e`
- `T2424-0025/experiment/ablation.mjs`: blob SHA `ed0e5b600425f67ae3e60e9809d8b9c8378bcaae`

Thus the failed run remains preserved as an infrastructure-verifier incident; the successful rerun is not a post-hoc scientific retune.

## T2424-0025 — robust-readout / NGMT precursor

### Frozen question

Does a robust weighted readout reduce synthetic attention-style aggregation MAE under heavy-tailed contamination, and is any advantage specific enough to support a non-Gaussian-memory interpretation?

### Methods

- baseline: weighted arithmetic mean
- proposed bounded readout: weighted median
- robust references: 10% weighted trimmed mean and weighted Huber location
- negative control: 0% Cauchy contamination
- metric: MAE, lower is better
- bounded screen: 30 deterministic seeds
- ablation: 50 deterministic seeds at contamination `0, .05, .10, .18, .25, .35`

### Reproduced 30-seed screen

| Condition | Mean readout MAE | Median readout MAE | Relative improvement |
|---|---:|---:|---:|
| Heavy-tail | 0.3615267855 | 0.0165609423 | 95.42% |
| Clean Gaussian control | 0.0243549670 | 0.0125939627 | 48.29% |

The bounded repository gate passes. This is **not** evidence for a Transformer-level NGMT mechanism.

### Reproduced 50-seed ablation

| Cauchy contamination | Mean MAE ± sample SD | Median MAE ± sample SD | Median relative reduction |
|---:|---:|---:|---:|
| 0.00 | 0.0246469 ± 0.0023116 | 0.0125699 ± 0.0020831 | 49.00% |
| 0.05 | 0.1450123 ± 0.1996837 | 0.0133367 ± 0.0021542 | 90.80% |
| 0.10 | 0.3211625 ± 0.5111811 | 0.0141783 ± 0.0029325 | 95.58% |
| 0.18 | 0.3494393 ± 0.3472034 | 0.0170025 ± 0.0048577 | 95.13% |
| 0.25 | 0.4567522 ± 0.4225194 | 0.0223649 ± 0.0064166 | 95.10% |
| 0.35 | 0.8655903 ± 1.4660585 | 0.0286803 ± 0.0109628 | 96.69% |

The 0% contamination control is the key scientific limiter: robust median readout is already substantially better without Cauchy contamination. Therefore the current evidence supports a **generic robust-readout effect in a synthetic aggregation task**, not a uniquely non-Gaussian-memory mechanism.

Measured attempt-3 wall time:

- 30-seed screen: `0.12 s`
- 50-seed ablation: `1.08 s`

## T2424-0027 — latent-language diagnostic

The deterministic 72-record synthetic protocol reproduced with:

- 4 concepts
- 3 languages
- raw concept accuracy: `1.0`
- raw language accuracy: `1.0`
- centered concept accuracy: `1.0`
- centered language accuracy: `0.361111...`
- chance level: `0.333333...`
- leakage-reduction fraction: `0.958333...`

The retained independent verifier passes. This supports the controlled synthetic language-leakage diagnostic only; it does not establish a real multilingual representation result.

## T2424-0037 — NeuroCAD controlled benchmark

The frozen deterministic 20-case benchmark reproduced:

- total: `20`
- passed: `20`
- benchmark success: `1.0`
- expected accepted: `15`; accepted: `15`
- syntax validity: `1.0`
- execution validity: `1.0`
- geometric validity: `1.0`
- dimension/constraint adherence: `1.0`
- complexity buckets: `7/7`, `10/10`, `3/3`
- focused tests: pass

This is strong controlled execution evidence, but it does **not** justify an arbitrary-natural-language-CAD claim. The promotion gate remains OOD/compositional prompts plus a meaningful same-provider direct-vs-typed-IR baseline and retained raw provider outputs.

## T2424-0050 — Darcy bounded mechanism screen

Across 20 retained seeds, independently recomputed from the raw result records:

- baseline pressure MAE: `0.0658913916 ± 0.0382656910`
- latent pressure MAE: `0.0011366559 ± 0.0002030801`
- relative pressure-MAE improvement: `0.9787663202 ± 0.0086501063`
- mean flux relative error: approximately `1.37e-16`
- maximum latent pressure MAE: `0.0014613492`

The uniform-field control remains effectively exact. This is a bounded synthetic/analytic operator screen, not evidence for a trained neural operator or broad physical generalization.

## Cross-rerun identity: attempt 2 → attempt 3

Artifacts `9162075012` and `9162627168` have the same 15-file set.

Seven scientific/verifier files are byte-identical across the two retained attempts:

- `T2424-0025-ablation.json`
- `T2424-0025-screen.json`
- `T2424-0025-verification.json`
- `T2424-0027-results.json`
- `T2424-0027-verify.log`
- `T2424-0037-benchmark.json`
- `T2424-0050-darcy.json`

The differing files are environment timestamps, timing files, and test logs whose runtime-duration metadata changes between runners. No retained scientific JSON result changed.

## Attempt-3 retained file hashes

| File | SHA-256 |
|---|---|
| `T2424-0025-ablation.json` | `f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e` |
| `T2424-0025-screen.json` | `7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1` |
| `T2424-0025-verification.json` | `ba0e73902ef8cd2dabc66995bffbd20476afad7aa23f8302ce4be7e68f736188` |
| `T2424-0027-results.json` | `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605` |
| `T2424-0027-verify.log` | `1a354c5ef26de30bc99a8b5ace22087e125b865db7326abe48e3bef6cbe7f6c3` |
| `T2424-0037-benchmark.json` | `e3e15d79631d1fccd02bc2711f71e98acc1f7f686e390cd65d82fcb054e5c601` |
| `T2424-0050-darcy.json` | `67ad7bd98000c58533753b2dd8e70ddebce411780e66f11284c9cfb59206e586` |

All 15 attempt-3 file hashes are retained in the machine-readable companion audit.

## Current scientific disposition

- **T2424-0025:** REPRODUCED bounded positive robust-readout result, but **NGMT mechanism not established**.
- **NGMT:** BLOCKED pending an actual frozen learned memory architecture with no-memory / standard-memory / Gaussian-reference / proposed non-Gaussian arms.
- **T2424-0027:** REPRODUCED + independently verified synthetic diagnostic.
- **T2424-0037 NeuroCAD:** REPRODUCED controlled 20-case benchmark; external/OOD learned comparison still open.
- **T2424-0050 Darcy:** REPRODUCED bounded synthetic mechanism screen; learned-operator generalization still open.
- **T2424-0028 / T2424-0029:** present in the current runner but not contained in the audited attempt-3 artifact; do not claim a fresh 13-August rerun until a new Actions artifact exists.

## Runner hardening prepared on isolated branch

Branch `repro-wave/project2424-20260813` changes only `.github/workflows/research-repro-wave-20260812.yml` to enable fail-closed `pipefail`, capture wall-clock timing, and emit a SHA-256 manifest. Scientific experiment source is not modified. A fresh-run claim requires an actual completed Actions run; branch creation alone is not evidence.
