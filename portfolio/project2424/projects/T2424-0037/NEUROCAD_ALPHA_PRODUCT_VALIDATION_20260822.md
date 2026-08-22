# NeuroCAD Alpha Product Validation — 2026-08-22

**Scope:** engineering/product QA only. This file does not alter the frozen NeuroCAD scientific benchmark or component-ablation result.

## Implemented alpha slice

- strict direct plate-spec validation before SVG/OpenSCAD/summary output;
- versioned CADDocument and bounded primitive registry;
- assembly reference and duplicate-ID checks;
- deterministic conceptual turbojet generator;
- constrained create/follow-up language commands;
- CADSpec JSON and OpenSCAD serialization;
- browser wireframe workstation with orbit/zoom, component selection, casing visibility, exploded view, and parameter editing.

## Isolated execution evidence before upload

The repository could not be cloned in the execution sandbox because `github.com` DNS resolution failed. Repository reads/writes therefore used the connected GitHub surface. The new NeuroCAD core modules and new alpha test file were mirrored into an isolated local fixture and executed with Node `v22.16.0`.

Command equivalent:

```bash
node --test tests/neurocadAlpha.test.mjs
```

Result:

```text
10 tests
10 passed
0 failed
```

Covered checks include:

- source-injection-shaped direct CAD input rejection;
- impossible tube rejection;
- unsafe identifier rejection;
- default multi-part turbojet validation;
- compressor/turbine stage bounds;
- shaft/casing proportion rejection;
- min/max stage configurations;
- prompt stage-count parsing;
- follow-up regeneration;
- casing visibility state;
- exploded-view state;
- legacy plate wrapping;
- numeric-only SCAD output checks;
- duplicate object rejection;
- dangling assembly-reference rejection;
- object-count abuse rejection.

## GitHub exact-head gate

The pull request must remain draft until current-head repository CI, the frozen NeuroCAD held-out-template workflow, and the NeuroCAD component-ablation diagnostic all complete successfully. CI success does not promote any scientific claim; it only verifies code/evidence compatibility.

## Public claim boundary

Supported product wording:

> NeuroCAD Alpha turns constrained engineering descriptions into validated parametric geometry and supports inspection, bounded editing, interactive visualization, and structured CAD export.

The conceptual jet-engine demo is not manufacturable, airworthy, propulsion-qualified, structurally/thermally validated, performance-optimized, or certified.
