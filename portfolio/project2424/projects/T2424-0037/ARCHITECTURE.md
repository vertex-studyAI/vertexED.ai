# NeuroCAD Alpha 0.1 — Architecture

```text
supported natural-language command
        ↓
intent interpreter
        ↓
versioned CADDocument (`neurocad-0.1`)
        ↓
fail-closed schema + geometry + assembly validation
        ↓
validated CAD document
        ├──→ Three.js browser renderer
        ├──→ CADSpec JSON serializer
        └──→ generated OpenSCAD exporter
```

## Separation of concerns

`src/core.mjs` remains the bounded rectangular-plate research/product lineage. It owns the controlled plate parser, plate validation, SVG preview, OpenSCAD and plate summary.

`src/alpha.mjs` is the public Alpha entrypoint. `src/alpha/schema.mjs` owns versioned document/schema validation, `src/alpha/engine.mjs` owns conceptual generators and bounded command interpretation, and `src/alpha/export.mjs` owns document-level serialization/export.

`web/app.mjs` is visualization/UI only. It cannot turn raw prompt text into executable JavaScript or shell commands. It receives a validated document, creates Three.js geometry, and uses DOM text APIs for model data.

## CAD document

A document contains:

- `version: "neurocad-0.1"`;
- `units: "mm"`;
- a bounded object list;
- optional bounded assemblies;
- transforms (`position`, `rotation`, `scale`);
- visibility/material-role metadata;
- product metadata such as generator kind and conceptual parameters.

Supported Alpha primitive types are `rectangular_plate`, `cylinder`, `tube`, `ring`, `disk`, `frustum`, and `blade_ring`.

## Validation invariants

Before document rendering/export:

- all geometry values are numbers and finite;
- dimensions are positive and bounded;
- document units are explicit millimetres;
- inner radii are smaller than outer radii;
- blade hub radius is smaller than tip radius;
- engine stage counts and conceptual section ratios are bounded;
- object/assembly identifiers are unique;
- references resolve;
- assembly self-reference and cycles are rejected;
- object and assembly complexity limits are enforced.

## Jet-engine concept

The engine is an assembly demonstration made from safe visual geometry: inlet/casing tubes, repeated stylized compressor rotor/stator blade rings, a central shaft, an annular combustor envelope, turbine blade rings and an exhaust frustum. Parameters exist only to produce geometry. No operating or manufacturing performance is calculated.
