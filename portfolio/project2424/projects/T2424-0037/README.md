# NLP-to-CAD

## NeuroCAD Alpha 0.1 — Language → Engineering Geometry

**Canonical Project 2424 identity:** `NLP-to-CAD`  
**Current product line:** `NeuroCAD Alpha 0.1`

NeuroCAD is an early engineering-software alpha that turns a **constrained** natural-language engineering description into an explicit parametric CAD representation, validates it before rendering, builds component/assembly structure, previews it interactively in the browser, supports bounded parameter edits, and exports formats it genuinely generates.

The flagship Alpha demo is a **conceptual axial jet-engine assembly**. It exists to demonstrate the CAD architecture visually. It is not a propulsion-performance, manufacturing, airworthiness, combustion, FEA or CFD system.

## Alpha pipeline

```text
SUPPORTED LANGUAGE
       ↓
BOUNDED INTENT
       ↓
CADDocument `neurocad-0.1`
       ↓
FAIL-CLOSED VALIDATION
       ↓
OBJECT + ASSEMBLY GRAPH
       ↓
PARAMETRIC GEOMETRY
       ├──→ INTERACTIVE 3D VIEW
       ├──→ CADSpec JSON
       └──→ OpenSCAD .scad
```

## What works in Alpha 0.1

- historical validated rectangular-plate workflow;
- versioned CAD document representation;
- primitive validation for plates, cylinders, tubes/rings/disks, frustums and stylized blade rings;
- parent/child assembly graph with reference/cycle checks;
- conceptual jet-engine generator with inlet, compressor, shaft, combustor envelope, turbine, casing and nozzle;
- 3–12 compressor stages and 1–4 turbine stages;
- casing visibility and exploded view;
- bounded jet-engine follow-up commands such as `Increase compressor stages to 8.`, `Use only one turbine stage.`, `Hide the casing.`, `Show exploded view.`, `Make it longer.`, `Make the shaft slightly thicker.`, and `Reset.`;
- flanged-tube assembly creation with explicit length, tube outer radius/diameter, wall thickness, flange outer radius/diameter and flange thickness;
- stateful flanged-tube parameter regeneration from follow-up language such as `Set tube length to 240 mm and wall thickness to 6 mm.` while preserving unspecified dimensions;
- deterministic rejection of invalid signed dimensions and conflicting radius/diameter descriptions;
- interactive Three.js viewport with orbit, zoom, pan, selection, fit/reset camera and hierarchy visibility controls;
- editable conceptual engine parameters in the browser parameter form;
- structured validation diagnostics;
- CADSpec JSON export;
- generated OpenSCAD export.

Not implemented: arbitrary CAD, STEP/B-rep, browser STL export, free-form sketching, general constraint solving, materials/tolerances, fillets/chamfers/threads, CFD/FEA, real propulsion calculations, or a general browser form editor for every primitive family.

## Run the demo

```bash
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Open `http://localhost:8000/web/`.

The 3D viewport uses a version-pinned Three.js module from jsDelivr. See [`QUICKSTART.md`](./QUICKSTART.md).

## Run focused Alpha QA

```bash
node --test \
  tests/nlpToCad.test.mjs \
  tests/neurocadAlpha.test.mjs \
  tests/neurocadIntentBoundary.test.mjs \
  tests/neurocadFlangedTubeEdit.test.mjs \
  tests/neurocadWeb.test.mjs
```

The implementation-session product record is in [`NEUROCAD_ALPHA_PRODUCT_VALIDATION_20260822.md`](./NEUROCAD_ALPHA_PRODUCT_VALIDATION_20260822.md). Product QA is deliberately separate from the frozen scientific benchmark family.

## Architecture

- [`src/core.mjs`](./src/core.mjs) — bounded rectangular-plate compiler and hardened plate renderer/export path.
- [`src/alpha.mjs`](./src/alpha.mjs) — public Alpha entrypoint.
- [`src/alpha/`](./src/alpha/) — document/schema validation, conceptual generators and exporters.
- [`web/`](./web/) — engineering workstation and interactive 3D visualization.
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — detailed separation and invariants.
- [`SAFETY_AND_SCOPE.md`](./SAFETY_AND_SCOPE.md) — claim and safety boundaries.
- [`DEMO.md`](./DEMO.md) — public demo flow, including the narrow editable flanged-tube path.

## Jet-engine concept scope

The default geometry uses only visual/conceptual parameters such as overall length/diameter, shaft diameter, stage counts, section proportions, casing visibility and exploded spacing. It deliberately does **not** calculate or recommend thrust, pressure ratio, RPM, temperature, fuel flow, efficiency, stress, fatigue life or real nozzle performance.

## Research record — preserved, including the falsifier

NeuroCAD began as a controlled rectangular-plate NLP→CAD research experiment.

### Frozen held-out template v1

Across 20 fixed held-out linguistic-template cases:

| System | Valid exact geometry | Invalid rejection | Overall success |
|---|---:|---:|---:|
| typed + validated compiler | **1.000** | **0.875** | **0.950** |
| original direct flat extraction | 1.000 | 0.000 | 0.600 |

The historical typed/validated compiler therefore recorded **19/20** overall success versus **12/20** for the original direct baseline. The adverse negative-width case `O018` was preserved rather than silently rewritten. The 12 valid held-out cases also produced non-empty STL outputs through OpenSCAD in the historical CI evidence family.

### Later component ablation — `VALIDATION_DOMINANT`

The later frozen matched-validation diagnostic reused the bounded cases and found:

| System | Overall success |
|---|---:|
| typed + validated | **1.00** |
| direct + matched validation | **1.00** |
| original direct without matched validation | 0.60 |

`original_gap = 0.40`, `remaining_gap = 0.00`, and `validation_recovery_fraction = 1.00`.

**Correct interpretation:** the diagnostic falsifies the claim that the measured gap itself demonstrates a typed-IR/parser causal advantage. On those reused cases, the measured advantage was **validation-dominant**. NeuroCAD therefore does not claim that typed IR was scientifically proven superior to direct CAD generation.

The engineering/product line continues independently, with explicit validation retained because it was the mechanism actually supported by the diagnostic.

Historical evidence remains in:

- [`OOD_PROTOCOL.md`](./OOD_PROTOCOL.md)
- [`benchmark/OOD_RESULTS.md`](./benchmark/OOD_RESULTS.md)
- [`NEUROCAD_COMPONENT_ABLATION_PROTOCOL_20260814.md`](./NEUROCAD_COMPONENT_ABLATION_PROTOCOL_20260814.md)
- [`NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md`](./NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md)

## Safety invariant

```text
UNTRUSTED INPUT
      ↓
INTERPRET / PARSE
      ↓
CAD SPEC
      ↓
VALIDATE
      ↓
ONLY THEN RENDER / EXPORT
```

Direct plate objects are strictly validated before SVG, OpenSCAD or summary generation. The Alpha document validator additionally enforces finite numbers, geometry ranges, primitive invariants, object/assembly complexity limits, resolved references and acyclic assembly relationships.

Raw prompt text is not executed with `eval`, `Function`, shell interpolation, or direct OpenSCAD source interpolation.

## Export truth

Browser Alpha exposes:

- `.json` — validated NeuroCAD CADSpec;
- `.scad` — generated OpenSCAD source.

A real local OpenSCAD run produced non-empty STL files for seven deterministic engine configurations during Alpha QA, but OpenSCAD also reported non-2-manifold warnings for the stylized multi-part assembly. STL is therefore **not** represented as manufacturing-valid and is not exposed as a browser Alpha button. STEP/B-rep is not implemented.

## Versioning

- historical research artifacts retain their existing identities;
- current product version: **NeuroCAD Alpha 0.1**;
- CAD document schema: **`neurocad-0.1`**.

See [`CHANGELOG.md`](./CHANGELOG.md).