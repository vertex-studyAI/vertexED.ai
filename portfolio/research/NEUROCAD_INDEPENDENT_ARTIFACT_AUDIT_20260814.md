# NEUROCAD INDEPENDENT ARTIFACT AUDIT — 2026-08-14

**Project:** T2424-0037 / NeuroCAD  
**Purpose:** independently recompute the frozen v1 held-out result from the retained GitHub Actions artifact without modifying the source experiment.  
**Artifact ID:** `9165650301`  
**Recorded / independently recomputed ZIP SHA-256:** `753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`  
**Artifact source SHA:** `e400df2837654c2d299d0822756e38f3e9580913`

## Environment recorded inside artifact

- Node `v22.23.1`
- npm `10.9.8`
- Linux Azure runner
- OpenSCAD `2021.01`

## Independent recomputation from `results.json`

The retained row records contain **20** frozen held-out cases: `12` valid and `8` invalid. Metrics were recomputed from row-level `success`, `accepted`, `exact_geometry`, and `kind` fields rather than trusting the stored summary.

| Metric | Typed / validated — recomputed | Stored | Direct flat extraction — recomputed | Stored |
|---|---:|---:|---:|---:|
| valid exact-geometry accuracy | `1.000` | `1.000` | `1.000` | `1.000` |
| invalid rejection accuracy | `0.875` | `0.875` | `0.000` | `0.000` |
| overall success | `0.950` | `0.950` | `0.600` | `0.600` |
| accepted invalid cases | `1` | `1` | `8` | `8` |
| valid failures | `0` | `0` | `0` | `0` |

Independent overall delta: `0.950 - 0.600 = 0.350`. Stored delta: `0.350`.

## Retained adverse result

The known v1 failure is present and preserved: case `O018` is invalid, expected `NON_POSITIVE_DIMENSION`, but the typed/validated system accepts it; `success=false`, observed `UNEXPECTED_ACCEPT`. It was not patched, removed, relabeled, or excluded from the frozen v1 result.

## Independent OpenSCAD check

The archive contains exactly `12` STL files for valid cases `O001`–`O012`.

- STL count: `12`;
- non-empty STL count: `12`;
- minimum STL size: `1,485` bytes;
- maximum STL size: `122,321` bytes.

`kernel-results.json` reports `PASS_OPENSCAD_EXECUTION`, OpenSCAD `2021.01`, total `12`, passed `12`, success rate `1.0`; filesystem evidence agrees.

## Retained test log

`tests.log` contains two Node subtests and reports **2 passed, 0 failed**.

## What this audit establishes

Supported:

- artifact bytes match the recorded digest;
- stored v1 summary matches independent row-level recomputation;
- `0.95` versus `0.60` and delta `0.35` are not summary arithmetic artifacts;
- O018 remains in raw output;
- all 12 archived valid-case STL files are non-empty;
- the bounded v1 artifact is internally self-consistent.

Not established:

- a fresh source-checkout execution;
- arbitrary text-to-CAD generalization;
- superiority over contemporary learned/program-generation baselines;
- manufacturing correctness, STEP/B-rep editability, or external replication.

## Fresh-checkout reproduction attempt

A clean `git clone` was attempted in the independent execution container, but that container could not resolve `github.com` via DNS and returned Git status `128` before checkout. Classification:

**`REPRODUCTION_BLOCKED_EXECUTION_ENV_DNS`**

This is not classified as a NeuroCAD test failure and is not scientific evidence for or against the method.

## Relationship to v2 falsification

This audit verifies the historical v1 bytes/metrics only. The separately frozen 2026-08-14 component ablation v2 supersedes the typed-parser causal interpretation on the reused diagnostic: direct extraction plus matched fail-closed validation reaches `1.00` and matches the current compiler, giving `VALIDATION_DOMINANT`. The v1 history remains immutable; the mechanism claim is narrowed by v2 rather than rewritten.

## Next gate

Do not tune parser/validator variants on the same 20 cases. Further research requires a genuinely new benchmark with broader part families/compositional prompts and a competent contemporary direct/program-generation baseline under matched backend/provider/budget and execution/semantic metrics.