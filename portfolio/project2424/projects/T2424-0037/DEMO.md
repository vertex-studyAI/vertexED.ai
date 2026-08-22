# NeuroCAD Alpha 0.1 — Demo Script

## Flagship flow

1. Open the NeuroCAD browser demo.
2. Click **JET ENGINE CONCEPT**.
3. Generate the default six-compressor / two-turbine conceptual assembly.
4. Confirm the status reports `READY`, component count, and validation `PASS`.
5. Drag the viewport to orbit and scroll to zoom.
6. Click components in the assembly tree to highlight them.
7. Turn **Outer casing** off to expose internal stages.
8. Enable **Exploded view** to separate major sections visually.
9. Change compressor stages from 6 to 9 and click **UPDATE MODEL**.
10. Inspect the regenerated assembly tree and CADSpec.
11. Export `neurocad-model.json` and `neurocad-model.scad`.

## Follow-up language examples

```text
Increase compressor stages to 9
Hide the outer casing
Show exploded view
Make it longer
Make the shaft thicker
Reset
```

## Grounding demo

Use the plate preset to demonstrate continuity with the historically tested bounded line:

```text
Create a plate 100 by 60 mm thickness 4 with 4 holes radius 4 inset 10
```

## Demo narration boundary

Recommended wording:

> NeuroCAD turns constrained engineering descriptions into explicit validated parametric geometry. This alpha shows both the historically grounded plate workflow and a new conceptual multi-part assembly layer. The jet-engine example is a visualization and CAD-composition demo, not a real propulsion design.

Do not say that the engine is manufacturable, airworthy, optimized, physically simulated, or certified.
