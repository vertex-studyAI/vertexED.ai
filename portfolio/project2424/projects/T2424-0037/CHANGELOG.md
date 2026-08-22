# NeuroCAD Changelog

## Alpha 0.1 — 2026-08-22

Product-engineering release candidate built separately from the frozen NeuroCAD research result family.

### Added

- versioned `neurocad-0.1` CAD document schema;
- validated primitives for plates, cylinders, tubes/rings/disks, frustums and stylized blade rings;
- generic assembly graph with object/assembly references and cycle checks;
- deterministic conceptual axial jet-engine generator with 3–12 compressor stages and 1–4 turbine stages;
- stateful bounded commands for stage edits, length, shaft thickness, casing visibility, exploded/assembled view and reset;
- flanged-tube assembly preset;
- validated CADSpec JSON and generated OpenSCAD export;
- interactive browser 3D viewport with orbit/zoom/pan, component selection, visibility controls, fit/reset camera, casing and exploded controls;
- parameter editor and structured validation diagnostics;
- product QA and browser-security regression tests.

### Hardened

- direct plate CAD objects are now strictly validated before OpenSCAD, SVG or summary rendering, porting the useful engineering changes from PR #410 onto the current-main product branch;
- numeric geometry must be finite and bounded;
- plate holes must fit fully inside the body and must not overlap;
- assembly references and cycles fail closed;
- browser rendering does not use `eval`, `Function`, raw prompt-to-source execution, or raw user HTML insertion.

### Explicitly not added

- thrust, RPM, pressure ratio, temperatures, fuel flow, efficiency or other propulsion-performance calculation;
- combustion hardware design;
- FEA/CFD;
- manufacturing certification;
- STEP/B-rep export;
- browser STL export;
- arbitrary natural-language or arbitrary-CAD generation.

### Research integrity

The frozen held-out v1 result, O018 negative-width failure, post-result repair lineage and 2026-08-14 `VALIDATION_DOMINANT` component ablation are unchanged.
