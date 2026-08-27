# NeuroCAD — Current Verified State

**As of:** 2026-08-27

## Overall state

`DEMO_READY / PUBLIC_ALPHA_EXECUTABLE_HOST_BLOCKED / EXTERNAL_VALIDATION_PENDING / S3_PROTOCOL_FROZEN_IDENTITY_BLOCKED`

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
- 15 targeted external pilot invitations sent on 2026-08-23;
- deterministic `neurocad-public` artifact publication/provenance path exists;
- merged PR #520 established that jsDelivr is artifact transport only because served HTML is `text/plain`, and therefore cannot satisfy G12 browser certification;
- S3 successor protocol is present on `main` and remains frozen before confirmatory execution;
- S3 external-adapter registry is present on `main` with CADTestBench and MUSE selected as intended adapters, but neither is materialized and confirmatory execution remains unauthorized.

## Open / not verified

- an executable public NeuroCAD host serving the intended artifact at an accepted canonical route;
- passing production flagship smoke against that executable served artifact;
- any completed external engineering pilot;
- externally discovered defect -> fix -> external retest loop;
- product-market value, retention or willingness to pay;
- broader CAD interoperability beyond the documented Alpha export surface;
- strong positive typed-IR methods claim;
- materialized and content-hashed S3 external benchmark adapters;
- frozen provider/model identity and matched model-based baseline implementations for S3;
- `EXECUTION_AUTHORIZATION.json` satisfying the S3 preconditions;
- any new 150-case successor performance result.

## Release / research gates

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
| G12 Public deployment | RED | immutable artifact transport exists, but no accepted executable public host has passed the production browser smoke |
| G13 External pilot evidence | RED | no completed third-party pilot is retained |
| S3 Protocol | GREEN | successor protocol and falsifiers are frozen on `main` |
| S3 Adapter identity | YELLOW | CADTestBench + MUSE identities selected; materialization/hashes remain absent |
| S3 Execution authorization | RED | provider/model/baselines/data hashes are incomplete; confirmatory execution is forbidden |
| S3 Result | RED | no successor performance result exists |

## Current blockers

1. **G12 executable public host:** jsDelivr is valid immutable artifact transport but serves HTML as `text/plain`; it cannot satisfy the browser gate. An accepted executable host must serve the intended artifact and pass the unchanged flagship smoke.
2. **G13 external pilot:** invitations and pilot tooling exist, but no completed independent workflow is retained yet.
3. **S3 benchmark materialization:** selected external adapter identities exist, but exact immutable dataset revisions and content hashes are not frozen.
4. **S3 model/baseline identity:** matched provider/model/budget policy and B0-B3 implementations/configs are not fully frozen.
5. **S3 authorization:** do not run the confirmatory benchmark until the predeclared authorization artifact exists and hashes every required identity.

Do not turn any blocker green by weakening a test, changing a claim definition, counting outreach as validation, or running confirmatory research before the frozen authorization gate is satisfied.
