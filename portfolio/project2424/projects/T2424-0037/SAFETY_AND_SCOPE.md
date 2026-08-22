# NeuroCAD Alpha 0.1 — Safety and Scope

## Supported product claim

NeuroCAD Alpha converts a constrained set of engineering-language commands into validated parametric geometry, exposes the resulting structure for inspection/editing, and exports supported structured CAD artifacts.

## Jet-engine demo scope

The flagship turbojet is a **conceptual / educational CAD assembly**. It exists to exercise parametric composition, repeated component generation, assembly inspection, visibility controls, parameter regeneration, and export.

It is not represented as:

- airworthy;
- manufacturable;
- structurally validated;
- thermally validated;
- combustion-qualified;
- performance-optimized;
- certified;
- suitable for physical propulsion use.

The alpha does not calculate thrust, RPM, pressure ratio, temperatures, fuel flow, efficiency, stress, fatigue life, materials, tolerances, or safety margins.

## Input safety

- prompt text is interpreted into bounded structured intent;
- no `eval`/`Function` execution is used;
- user text is not interpolated into OpenSCAD source;
- numeric geometry is finite and bounded;
- IDs are restricted to safe identifier characters;
- direct caller-supplied plate specs are validated before rendering;
- object count and scene extents are bounded;
- unsupported or inconsistent geometry fails closed.

## Research integrity

The frozen NeuroCAD v1 result, retained O018 failure, post-result repair, and later component ablation remain separate evidence families. The later diagnostic concluded `VALIDATION_DOMINANT`: matched validation recovered the observed gap on the reused 20-case diagnostic. Alpha engineering work must not be presented as evidence that typed IR caused the historical benchmark advantage.

## Export boundary

CADSpec JSON and OpenSCAD source are product outputs. OpenSCAD/STL execution evidence exists for the historical bounded plate family. Alpha jet-engine SCAD generation is an engineering artifact; it is not manufacturing certification or STEP/B-rep editability evidence.
