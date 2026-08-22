# NeuroCAD Alpha 0.1 — Demo Script

## Engineering-object path — recommended public-alpha proof

1. Open the browser demo.
2. Enter: `Create a flanged tube 200 mm long with outer diameter 100 mm, 5 mm wall thickness, flange diameter 130 mm, and 12 mm flange thickness.`
3. Generate it and confirm **VALIDATION PASS**.
4. Inspect the three-component assembly and the validated CADSpec.
5. Enter the stateful edit: `Set tube length to 240 mm and wall thickness to 6 mm.`
6. Confirm the same flanged-tube assembly regenerates with the new length and wall while retaining the unspecified outer/flange dimensions.
7. Enter: `Set flange outer diameter to 150 mm and flange thickness to 14 mm.`
8. Confirm **VALIDATION PASS** again and inspect the regenerated geometry.
9. Export **CADSpec JSON** and **OpenSCAD .scad**.
10. Try `Set tube length to -20 mm.` and confirm NeuroCAD fails closed rather than retaining stale or invalid geometry.

This is the smallest current demo that shows constrained language → structured representation → validated parametric geometry → parameter edit/regeneration → render/export without relying on the conceptual jet-engine example.

## Flagship visual path — conceptual jet engine

1. Choose **Jet Engine Concept**.
2. Generate the default conceptual engine.
3. Confirm **VALIDATION PASS** and inspect the component/assembly counts.
4. Orbit, zoom and pan in the 3D viewport.
5. Click **Hide casing** to expose the internal stages.
6. Click **Exploded** to separate major sections.
7. Open **Parameters**, change compressor stages from 6 to 9, and update the model.
8. Select a compressor rotor in the assembly tree and confirm it highlights in the viewport.
9. Inspect the validated CADSpec.
10. Export **CADSpec JSON** and **OpenSCAD .scad**.
11. Try a follow-up command such as `Use only one turbine stage.` or `Make the shaft slightly thicker.`
12. Try an unsupported request and confirm NeuroCAD fails closed rather than inventing geometry.

## Launch-video claim boundary

Suggested narration:

> NeuroCAD Alpha turns a constrained engineering description into an explicit, validated parametric CAD document. The flanged-tube path demonstrates bounded parameter regeneration and export; the jet-engine path is a conceptual visualization. NeuroCAD Alpha is not a manufacturing, structural-analysis, or propulsion-performance system.
