# NeuroCAD Alpha 0.1 — Quickstart

## Browser demo

From the repository root:

```bash
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Open `http://localhost:8000/web/`.

The browser demo has no model-provider requirement. It uses deterministic bounded language interpretation, validates a versioned CAD document, and renders an interactive 3D wireframe projection in the browser.

## Try the flagship concept demo

Use:

```text
Generate a simplified axial jet engine concept with 6 compressor stages and 2 turbine stages
```

Then try:

```text
Increase compressor stages to 9
Hide the outer casing
Show exploded view
Make it longer
```

The jet-engine model is conceptual / educational geometry only. It is not a propulsion, manufacturing, stress, thermal, combustion, performance, airworthiness, or certification model.

## Existing plate workflow

```text
Create a plate 100 by 60 mm thickness 4 with 4 holes radius 4 inset 10
```

## Tests

From the repository root:

```bash
npm test
```

Focused NeuroCAD alpha tests:

```bash
node --test tests/neurocadAlpha.test.mjs tests/nlpToCad.test.mjs
```

## Exports

The alpha browser demo exposes:

- NeuroCAD CADSpec JSON;
- OpenSCAD source (`.scad`).

STL generation remains an OpenSCAD-backed execution path and is not presented as in-browser STL export. STEP/B-rep export is not implemented.
