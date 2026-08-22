# NeuroCAD Alpha 0.1 — Product Validation — 2026-08-22

This file records **product QA and release certification**, not a new scientific/OOD benchmark. It does not alter the frozen NeuroCAD v1 result or the 2026-08-14 component-ablation verdict.

## Canonical repository gate

The Alpha branch is required to pass the repository's canonical `npm run ci` chain rather than a NeuroCAD-only shortcut. That gate includes lint/typecheck, Vercel-function validation, production dependency audit, the root Node regression suite, evaluation tests and the CI build.

During release certification, the canonical CI workflow completed successfully on the Alpha branch after the frozen Project 2424 identity regression was repaired by restoring `NLP-to-CAD` as the canonical README H1 while retaining NeuroCAD Alpha 0.1 as the product subtitle.

The identity regression itself was **not** weakened or removed.

## Focused JavaScript QA

```bash
node --test \
  tests/nlpToCad.test.mjs \
  tests/neurocadAlpha.test.mjs \
  tests/neurocadWeb.test.mjs
```

Implementation-session focused result: **21/21 PASS**.

Coverage includes historical plate behavior, PR #410-equivalent direct-spec hardening, source-injection-shaped geometry rejection, hole bounds/overlap/unit/count checks, conceptual engine stage extrema, shaft/casing and ratio constraints, non-finite rejection, stateful follow-ups, finite SCAD/JSON generation, flanged-tube and legacy-plate adaptation, cyclic-assembly diagnostics, unsupported-prompt fail-closed behavior, and browser no-`eval`/`Function`/raw-HTML regressions.

## Deterministic 125-case product-QA matrix

`tests/neurocadProductQa.test.mjs` is part of the root test surface and generates machine-readable evidence under `artifacts/neurocad-alpha/` in the focused CI workflow.

The matrix contains exactly:

- 25 plate cases;
- 20 tube/cylinder cases;
- 20 flange/component cases;
- 20 nested/general assembly cases;
- 20 conceptual jet-engine configurations;
- 20 malformed/adversarial cases.

Total: **125/125 product-QA cases PASS** in the release-certification workflow.

Valid cases require schema validation, JSON serialization, finite/non-empty OpenSCAD generation and no `NaN`/`Infinity` output. Adversarial cases pass only when the system rejects them or returns structured fail-closed diagnostics.

This is **product QA**, not a scientific OOD benchmark and not evidence of manufacturing or propulsion validity.

## Real Chromium browser certification

A dedicated GitHub Actions workflow performs a fresh checkout and dependency install, installs Chromium, launches the standalone NeuroCAD HTTP demo, and executes the actual workstation with Playwright.

Release-certification environment: Chromium **140.0.7339.16**.

Browser result: **3/3 PASS**.

The real browser flow verifies:

1. the conceptual jet engine renders with a live WebGL canvas and validation PASS;
2. the assembly tree is populated;
3. casing visibility can be toggled;
4. exploded mode can be enabled;
5. compressor stages can be edited from 6 to 9 and the CADSpec regenerates;
6. a component can be selected from the hierarchy;
7. CADSpec contains no `NaN`/`Infinity`;
8. CADSpec JSON downloads as `neurocad-model.json`;
9. generated OpenSCAD downloads as `neurocad-model.scad`;
10. reload returns to a valid generated model;
11. orbit, zoom and pan visibly change the rendered viewport without scrolling the page;
12. invalid conceptual parameters fail closed, surface an error and preserve the last valid CAD document;
13. no captured page exceptions or console errors occur in the certified flow.

The workflow stores screenshots for home/default generation, jet generation, casing hidden, exploded mode, nine compressor stages and CADSpec inspection.

## Deterministic jet-engine configurations

All seven configurations pass `validateCADDocument()` before export.

| Case | Configuration | Validation | Objects | Assemblies |
|---|---|---:|---:|---:|
| J1 | 5 compressor / 1 turbine | PASS | 18 | 12 |
| J2 | 8 compressor / 2 turbine | PASS | 25 | 16 |
| J3 | 3 compressor / 3 turbine | PASS | 16 | 12 |
| J4 | max stages: 12 compressor / 4 turbine | PASS | 35 | 22 |
| J5 | minimum supported dimensions + 3/1 stages | PASS | 14 | 10 |
| J6 | casing hidden | PASS | 21 | 14 |
| J7 | exploded spacing 90 mm | PASS | 21 | 14 |

## Exact-head OpenSCAD backend certification

A dedicated GitHub Actions workflow installs the real OpenSCAD binary in a fresh Ubuntu runner and runs all J1–J7 through the CAD backend.

Environment:

```text
Ubuntu 24.04.4 LTS
Node v22.23.2
npm 10.9.8
OpenSCAD version 2021.01
```

Result: **7/7 PASS**, each with CAD validation PASS, generated finite `.scad`, OpenSCAD exit code 0 and a non-empty STL artifact.

| Case | STL bytes | OpenSCAD result | Warning detected by exact-head workflow |
|---|---:|---:|---:|
| J1 | 1,475,103 | PASS | NO |
| J2 | 2,219,911 | PASS | NO |
| J3 | 1,275,151 | PASS | NO |
| J4 | 3,313,910 | PASS | NO |
| J5 | 1,046,192 | PASS | NO |
| J6 | 1,626,316 | PASS | NO |
| J7 | 1,775,296 | PASS | NO |

### STL/manifold truth boundary

An earlier local implementation run emitted OpenSCAD warnings that the stylized multi-part assembly might not be a valid 2-manifold. The current Ubuntu/OpenSCAD release-certification run did **not** emit the warning for J1–J7.

The later absence of a warning does **not** prove manifold or manufacturing validity, so the earlier warning is preserved rather than erased. Browser Alpha intentionally exposes CADSpec JSON and `.scad`; STL remains local/experimental and STEP/B-rep is not implemented.

## Dependency note

The standalone 3D workstation currently uses version-pinned Three.js `0.179.1` modules from jsDelivr. The real browser certification proves that this pinned runtime path works in the CI browser environment, but a repository-local/self-contained Three.js bundle remains a hardening opportunity before treating offline/no-CDN operation as a release property.

## Research boundary

Still preserved and unchanged:

- frozen held-out v1: typed + validated `0.95` overall vs original direct `0.60`, including preserved O018 negative-width failure;
- later component diagnostic: typed + validated `1.00`, direct + matched validation `1.00`, original direct `0.60`;
- `validation_recovery_fraction = 1.00`;
- frozen interpretation: `VALIDATION_DOMINANT`.

The Alpha engineering line does not claim typed-IR scientific superiority.

## Release interpretation

The tested local/CI artifact now meets the project's **DEMO READY** definition: generation, interactive 3D, hierarchy inspection, casing/exploded controls, structural parameter editing, validation and honest JSON/SCAD export are all exercised in a real browser without hidden manual intervention.

It is **not PUBLIC ALPHA READY** until an actual public NeuroCAD URL is deployed, its served revision is identified and the same browser flow is independently opened against that deployment.
