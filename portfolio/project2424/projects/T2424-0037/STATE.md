# NeuroCAD — Current Verified State

**As of:** 2026-08-23

## Overall state

`DEMO_READY / PUBLIC_ALPHA_DEPLOYMENT_NOT_VERIFIED / EXTERNAL_VALIDATION_PENDING`

Historical research mechanism state: `VALIDATION_DOMINANT`; the old typed-IR-specific superiority claim is not supported by the matched-validation diagnostic.

## Verified

- versioned `neurocad-0.1` CAD document;
- bounded primitive and assembly validation;
- bounded multi-part conceptual assembly demo;
- flanged-tube creation from explicit dimensions;
- stateful flanged-tube edit/regeneration for length, tube radius/diameter, wall thickness, flange radius/diameter and flange thickness;
- engineering `OD` and `flange OD` shorthand;
- fail-closed invalid/conflicting dimension handling;
- interactive Three.js browser workstation;
- assembly tree, visibility and selection highlighting;
- CADSpec JSON export;
- OpenSCAD export;
- recorded 125-case deterministic product QA;
- browser/WebGL source certification;
- OpenSCAD backend certification;
- frozen historical held-out benchmark retained;
- frozen component-ablation diagnostic retained;
- external engineering pilot protocol and feedback template merged;
- 15 targeted external pilot invitations sent on 2026-08-23.

## Open / not verified

- exact current public NeuroCAD artifact served at `https://www.vertexed.app/neurocad/`;
- passing production flagship smoke against that served artifact;
- any completed external engineering pilot;
- externally discovered defect -> fix -> external retest loop;
- product-market value, retention or willingness to pay;
- broader CAD interoperability beyond the documented Alpha export surface;
- strong positive typed-IR methods claim;
- new 150-case successor research result.

## Release gates

| Gate | State | Current truth |
|---|---|---|
| G0 Reality | GREEN | canonical repo/project identity recovered |
| G1 Existing core | GREEN | bounded compiler/core regressions retained |
| G2 Validation boundary | GREEN | supported render/export paths validate before use |
| G3 CAD core | GREEN | versioned document + validation |
| G4 Assembly | GREEN | assembly graph + reference/cycle rejection |
| G5 Flagship visual demo | GREEN | bounded conceptual assembly exercised |
| G6 3D | GREEN | real-browser/WebGL source certification |
| G7 Editing | GREEN | stateful regeneration and fail-closed edits |
| G8 Export | GREEN within Alpha scope | JSON + OpenSCAD |
| G9 QA | GREEN | deterministic QA + workflow certifications |
| G10 Product demo | GREEN | end-to-end bounded workflow exists |
| G11 Claims/integrity | GREEN | negative evidence and falsifier preserved |
| G12 Public deployment | RED | production artifact identity/smoke not verified |
| G13 External pilot evidence | RED | no completed third-party pilot yet |

## Current blockers

1. **G12:** hosting/deployment has not produced a currently verified matching public artifact. The production-smoke job is intentionally strict and remains red until it does.
2. **G13:** pilot invitations exist, but no external engineer has completed a recorded workflow yet.
3. **Successor research:** the closed/unmerged successor protocol was `DATASET_AND_MODEL_IDENTITY_BLOCKED`; no successor result exists.

Do not turn any blocker green by weakening a test, changing a claim definition, or counting outreach as validation.
