# T2424-0037 NeuroCAD — Status

**Research identity:** T2424-0037 controlled NLP-to-CAD  
**Product identity:** NeuroCAD Alpha 0.1  
**Research verdict:** historical controlled/held-out evidence retained; typed-parser causal mechanism **falsified by matched-validation diagnostic (`VALIDATION_DOMINANT`)**  
**Product state on this branch:** `ALPHA_IMPLEMENTED / FOCUSED_QA_PASS / BROWSER_INTERACTIVE_SMOKE_PENDING / PUBLIC_DEPLOYMENT_PENDING`

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
- [x] polished browser workstation source
- [x] Three.js interactive viewport implementation
- [x] assembly tree, component visibility and selection highlighting
- [x] parameter panel + structured diagnostics
- [x] browser JSON/SCAD export controls
- [x] explicit product/research/safety copy
- [x] Alpha docs/version/changelog/demo script

## Verified during implementation

- focused Node tests: **21/21 PASS**;
- `src/core.mjs`, Alpha modules and `web/app.mjs`: Node syntax checks pass locally;
- seven deterministic jet configurations: CAD document validation PASS;
- J1–J7 generated OpenSCAD source executed through the available local OpenSCAD binary and each produced a non-empty STL;
- OpenSCAD emitted non-2-manifold warnings for the stylized multi-part assembly, so manufacturing-valid STL is **not** claimed.

See `NEUROCAD_ALPHA_PRODUCT_VALIDATION_20260822.md` for exact product-QA evidence.

## Gates not yet green

- [ ] full repository CI on the exact Alpha branch head;
- [ ] actual interactive browser/WebGL smoke of orbit/selection/edit/regeneration/export;
- [ ] fresh-clone install/run smoke on the final exact branch head;
- [ ] public deployment and independently opened clean URL;
- [ ] topology/manifold repair if STL is promoted to a supported user-facing export;
- [ ] external validation.

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
- public deployment until a URL and served revision are verified.
