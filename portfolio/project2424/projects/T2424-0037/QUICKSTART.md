# NeuroCAD Alpha 0.1 — Quickstart

## Run the focused product tests

```bash
node --test portfolio/project2424/projects/T2424-0037/tests/alpha.test.mjs \
  portfolio/project2424/projects/T2424-0037/tests/intent.test.mjs
```

## Open the browser demo

Serve the repository root with any static HTTP server and open:

```text
/portfolio/project2424/projects/T2424-0037/web/alpha.html
```

The alpha is implemented with browser-native ES modules and has no runtime dependency on an external LLM provider.

## Hero demo

Use the default prompt:

> Generate a simplified axial jet-engine concept with an inlet, six compressor stages, a central shaft, combustor envelope, two turbine stages, outer casing and exhaust nozzle.

Then try bounded follow-ups such as:

- `Increase compressor stages to 8`
- `Hide the outer casing`
- `Show exploded view`
- `Make the engine longer`

## Export

The alpha currently exposes:

- NeuroCAD CADSpec JSON
- OpenSCAD source (`.scad`)

The historical rectangular-plate lineage separately retains real STL execution evidence. The new jet-engine alpha does not yet claim browser STL or STEP/B-rep export.

## Scope

This is conceptual/educational geometry. It does not provide propulsion-performance calculations, manufacturing validation, CFD/FEA, airworthiness, or certification.
