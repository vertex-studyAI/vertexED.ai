# NEUROCAD INDEPENDENT ARTIFACT AUDIT — 2026-08-14

**Project:** T2424-0037 / NeuroCAD  
**Purpose:** independently recompute the strongest frozen v1 held-out result from the retained GitHub Actions artifact without modifying the source experiment.  
**Artifact ID:** `9165650301`  
**Recorded / independently recomputed ZIP SHA-256:** `753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`  
**Artifact source SHA:** `e400df2837654c2d299d0822756e38f3e9580913`

## Environment recorded inside artifact

- Node `v22.23.1`
- npm `10.9.8`
- Linux Azure runner
- OpenSCAD `2021.01`

## Independent recomputation from `results.json`

The retained raw row records contain **20** frozen held-out cases:

- `12` valid cases;
- `8` invalid cases.

Metrics were recomputed directly from row-level `success`, `accepted`, `exact_geometry`, and `kind` fields rather than trusting the stored summary.

| Metric | Typed / validated compiler — recomputed | Stored | Direct flat extraction — recomputed | Stored |
|---|---:|---:|---:|---:|
| valid cases | 12 | — | 12 | — |
| invalid cases | 8 | — | 8 | — |
| valid exact-geometry accuracy | `1.000` | `1.000` | `1.000` | `1.000` |
| invalid rejection accuracy | `0.875` | `0.875` | `0.000` | `0.000` |
| overall success | `0.950` | `0.950` | `0.600` | `0.600` |
| accepted invalid cases | `1` | `1` | `8` | `8` |
| valid failures | `0` | `0` | `0` | `0` |

Independent overall delta:

`0.950 - 0.600 = 0.350`

Stored delta: `0.350`.

The frozen development threshold is `>= 0.150`; the stored evaluator verdict is `PASS_HELD_OUT_TEMPLATE_GATE`.

## Retained adverse result

The audit confirms the known v1 failure was preserved:

- case `O018` is invalid;
- expected failure class: `NON_POSITIVE_DIMENSION`;
- typed/validated system unexpectedly accepts it;
- row-level `success = false`;
- observed class: `UNEXPECTED_ACCEPT`.

No attempt was made to patch, remove, relabel, or exclude O018 from the frozen v1 result.

## Independent OpenSCAD artifact check

The archive contains exactly `12` `.stl` files for the valid cases `O001`–`O012`.

Independent filesystem check:

- STL count: `12`;
- non-empty STL count: `12`;
- minimum STL size: `1,485` bytes;
- maximum STL size: `122,321` bytes.

The retained `kernel-results.json` reports:

- verdict `PASS_OPENSCAD_EXECUTION`;
- OpenSCAD `2021.01`;
- total `12`;
- passed `12`;
- success rate `1.0`.

The filesystem evidence agrees with the retained kernel summary.

## Retained test log

`tests.log` contains two Node subtests:

1. frozen held-out benchmark remains at 20 cases;
2. OOD evaluator reports both frozen systems without treating a negative scientific gate as a CI failure.

Result: **2 passed, 0 failed**.

## What this audit establishes

**Supported:**

- the downloaded artifact bytes match the recorded digest;
- the stored held-out summary matches an independent recomputation from row-level artifact data;
- the `0.95` versus `0.60` overall success and `0.35` delta are not a summary-file arithmetic artifact;
- the retained O018 negative case is present in raw output;
- all 12 archived valid-case STL files are non-empty and agree with the kernel summary;
- the bounded artifact is internally self-consistent.

**Not established:**

- a new execution from a fresh source checkout;
- arbitrary text-to-CAD generalization;
- superiority over contemporary learned/program-generation baselines;
- manufacturing correctness, STEP/B-rep editability, or external replication.

## Fresh-checkout reproduction attempt

A clean `git clone` was attempted in the independent execution container, but the container could not resolve `github.com` via DNS and returned Git status `128` before source checkout. This is classified as:

**`REPRODUCTION_BLOCKED_EXECUTION_ENV_DNS`**

It is **not** classified as a NeuroCAD test failure and is not scientific evidence for or against the method.

## Next gate

Do **not** rerun the same frozen benchmark merely to create activity. The next scientific information gain is a separately frozen dangerous-baseline/OOD experiment comparing the typed/validated route against competent same-provider learned/direct/constrained generation under matched prompts, information, backend, retry/token budget, and execution/semantic metrics.