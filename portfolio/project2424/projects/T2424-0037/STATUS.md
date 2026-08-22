# T2424-0037 NeuroCAD — Status

**Canonical research identity:** T2424-0037 `NLP-to-CAD`  
**Current product identity:** NeuroCAD Alpha 0.1  
**Research verdict:** historical controlled/held-out evidence retained; typed-parser causal mechanism **falsified by matched-validation diagnostic (`VALIDATION_DOMINANT`)**  
**Product state on this branch:** `DEMO_READY / PUBLIC_ALPHA_DEPLOYMENT_NOT_VERIFIED`

## Research state — immutable boundary

The research result family is not rewritten by Alpha product work.

- original controlled deterministic benchmark: 20/20 on its controlled set;
- frozen held-out v1: typed + validated 19/20 overall (`0.95`) vs original direct 12/20 (`0.60`), with O018 negative-width acceptance preserved;
- historical valid held-out OpenSCAD execution: 12/12 non-empty STL;
- later component diagnostic: typed + validated `1.00`, direct + matched validation `1.00`, original direct `0.60`;
- `validation_recovery_fraction = 1.00`;
- frozen interpretation: `VALIDATION_DOMINANT`;
- no typed-IR-specific superiority claim survives that diagnostic.

## Alpha product implementation

Implemented on the Alpha branch:

- [x] PR #410-equivalent strict direct plate-spec validation before SVG/OpenSCAD/summary rendering
- [x] versioned `neurocad-0.1` CAD document
- [x] bounded primitive registry/validation
- [x] generic assembly graph + transforms + visibility metadata
- [x] cyclic/missing assembly reference rejection
- [x] conceptual jet-engine generator
- [x] compressor/turbine stage parameter editing
- [x] casing visibility
- [x] exploded/assembled view state
- [x] stateful deterministic follow-up commands
- [x] flanged-tube preset
- [x] CADSpec JSON serialization
- [x] generated OpenSCAD document export
- [x] CAD-style browser workstation
- [x] Three.js interactive viewport implementation
- [x] assembly tree, component visibility and selection highlighting
- [x] parameter panel + structured diagnostics
- [x] browser JSON/SCAD export controls
- [x] explicit product/research/safety copy
- [x] Alpha docs/version/changelog/demo script
- [x] dedicated real-browser CI certification
- [x] deterministic 125-case product-QA matrix
- [x] dedicated J1–J7 real-OpenSCAD backend certification

## Verified for release certification

- [x] canonical repository CI succeeds after restoring the frozen `NLP-to-CAD` package identity rather than weakening its regression;
- [x] frozen NeuroCAD held-out benchmark workflow succeeds;
- [x] frozen component-ablation diagnostic succeeds;
- [x] deterministic product QA: **125/125 PASS**;
- [x] Chromium **140.0.7339.16** real-browser certification: **3/3 PASS**;
- [x] jet-engine generation, assembly tree, casing visibility, exploded mode, 6→9 compressor-stage edit, component selection, CADSpec JSON download, OpenSCAD download and reload are exercised in the actual browser;
- [x] orbit, zoom and pan are exercised against the live Three.js canvas;
- [x] invalid conceptual parameter edits fail closed and preserve the last valid CADSpec;
- [x] browser certificate captures no page exceptions/console errors in its tested flows;
- [x] J1–J7 execute through OpenSCAD **2021.01** in a fresh Ubuntu 24.04 runner and each produces a non-empty STL artifact;
- [x] the exact OpenSCAD release-certification run detected no topology warning for J1–J7.

An earlier local OpenSCAD implementation run did emit a possible non-2-manifold warning. That evidence remains preserved; absence of the warning in the later runner is **not** treated as proof of manifold/manufacturing validity.

See `NEUROCAD_ALPHA_PRODUCT_VALIDATION_20260822.md` for the detailed product-QA record.

## Release gates

| Gate | State | Evidence boundary |
|---|---|---|
| G0 Reality | GREEN | canonical repo/branch/PR verified |
| G1 Existing core | GREEN | legacy plate compiler + regressions pass |
| G2 Security | GREEN for Alpha rendering boundary | direct spec render/export paths validate first; static no-`eval`/`Function`/raw-HTML regressions pass |
| G3 CAD core | GREEN | versioned document + primitive validation exercised |
| G4 Assembly | GREEN | multi-component/nested assemblies + cycle/ref rejection exercised |
| G5 Jet engine | GREEN | deterministic conceptual engine + extrema exercised |
| G6 3D | GREEN | real Chromium/WebGL + orbit/zoom/pan certificate |
| G7 Editing | GREEN | browser parameter regeneration + fail-closed invalid edits |
| G8 Export | GREEN | real browser JSON + SCAD downloads; STL remains local/experimental |
| G9 QA | GREEN | canonical CI + 125-case product QA + focused workflows |
| G10 Product | GREEN for demo | complete flagship workstation flow exercised |
| G11 Claims | GREEN | research falsifier and product scope preserved |
| G12 Deployment | RED | no independently opened public NeuroCAD URL/revision yet |

## Current remaining release work

- [ ] deploy/serve an actual public NeuroCAD preview or route without destabilizing VertexED;
- [ ] identify the exact served NeuroCAD revision and rerun the flagship browser smoke against that URL;
- [ ] make the pinned Three.js runtime self-contained if offline/no-CDN operation is required for public Alpha;
- [ ] perform a deeper accessibility/security hardening pass before broad public exposure;
- [ ] repair/prove STL manifold topology only if STL is promoted to a supported user-facing export;
- [ ] obtain external validation if any future claim depends on it.

## Public claim boundary

Allowed Alpha framing:

> NeuroCAD turns constrained engineering descriptions into validated parametric geometry and lets users inspect, modify and export conceptual CAD assemblies.

Not claimed:

- arbitrary-language understanding;
- arbitrary CAD generation;
- production-ready mechanical engineering;
- manufacturing correctness;
- airworthiness/certification;
- propulsion-performance prediction;
- typed-IR scientific superiority;
- external validation;
- public deployment until a NeuroCAD URL and served revision are independently verified.
