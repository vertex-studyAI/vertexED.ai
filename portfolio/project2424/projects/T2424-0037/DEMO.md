# NeuroCAD Alpha 0.1 — Demo Script

1. Open the browser demo.
2. Choose **Jet Engine Concept**.
3. Generate the default conceptual engine.
4. Confirm **VALIDATION PASS** and inspect the component/assembly counts.
5. Orbit, zoom and pan in the 3D viewport.
6. Click **Hide casing** to expose the internal stages.
7. Click **Exploded** to separate major sections.
8. Open **Parameters**, change compressor stages from 6 to 9, and update the model.
9. Select a compressor rotor in the assembly tree and confirm it highlights in the viewport.
10. Inspect the validated CADSpec.
11. Export **CADSpec JSON** and **OpenSCAD .scad**.
12. Try a follow-up command such as `Use only one turbine stage.` or `Make the shaft slightly thicker.`
13. Try an unsupported request and confirm NeuroCAD fails closed rather than inventing geometry.

## Launch-video claim boundary

Suggested narration:

> NeuroCAD Alpha turns a constrained engineering description into an explicit, validated parametric CAD document. This demo uses a conceptual jet-engine assembly to show hierarchy, regeneration and export; it is not a propulsion-performance or manufacturing design system.
