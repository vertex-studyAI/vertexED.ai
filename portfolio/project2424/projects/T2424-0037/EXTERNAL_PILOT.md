# NeuroCAD Alpha 0.1 — External Engineering Pilot

This pilot is for mechanical/CAD engineers evaluating the current bounded Alpha. The goal is to find reproducible failures and workflow gaps, not to collect testimonials.

## Scope

NeuroCAD Alpha currently demonstrates:

- constrained engineering language → explicit CAD document
- bounded parametric geometry generation
- document validation and fail-closed behavior
- stateful parameter edits and regeneration
- assembly inspection in the browser
- CADSpec JSON export
- OpenSCAD `.scad` export

It does **not** claim arbitrary language-to-CAD, manufacturing-ready geometry, STEP/B-rep, GD&T automation, CFD/FEA, propulsion performance, airworthiness, or certification.

## 10-minute engineering-object test

1. Open the NeuroCAD browser demo.
2. Enter:

   `Create a flanged tube 200 mm long with outer diameter 100 mm, 5 mm wall thickness, flange diameter 130 mm, and 12 mm flange thickness.`

3. Confirm `VALIDATION PASS`.
4. Inspect the three-component assembly and CADSpec.
5. Enter:

   `Set tube length to 240 mm and wall thickness to 6 mm.`

6. Verify that the model regenerates while unspecified dimensions remain unchanged.
7. Enter:

   `Set flange outer diameter to 150 mm and flange thickness to 14 mm.`

8. Confirm validation still passes.
9. Export CADSpec JSON and OpenSCAD.
10. Enter:

   `Set tube length to -20 mm.`

11. Confirm the request fails closed rather than silently producing or retaining invalid geometry.

## 10-minute conceptual assembly test

The jet-engine workflow is an interaction/assembly demonstration only. It is not a propulsion or manufacturing model.

1. Choose `Jet Engine Concept`.
2. Generate the default model and confirm `VALIDATION PASS`.
3. Orbit, zoom and pan.
4. Hide the casing.
5. Switch to exploded view.
6. Change compressor stages from 6 to 9.
7. Select a compressor rotor in the assembly tree and confirm viewport highlighting.
8. Try: `Use only one turbine stage.`
9. Try: `Make the shaft slightly thicker.`
10. Export CADSpec JSON and OpenSCAD.
11. Enter an unsupported engineering request and confirm NeuroCAD fails closed rather than inventing geometry.

## Engineer's own test

After the scripted path, try **one simple part or assembly from your real work** that seems reasonably close to the current scope.

Please do not simplify the wording to help NeuroCAD. Use the terminology you would naturally use with another engineer.

For each attempt, capture:

- exact input
- what you expected
- what NeuroCAD produced
- pass / fail / ambiguous
- whether the error was understandable
- whether the resulting parameters and geometry were inspectable
- whether you could make the next edit you wanted
- whether the export was useful

## Failure categories

Use one or more:

- `INTENT_MISREAD`
- `DIMENSION_LOSS`
- `CONSTRAINT_FAILURE`
- `INVALID_GEOMETRY`
- `STALE_GEOMETRY`
- `EDIT_FAILURE`
- `ASSEMBLY_UI`
- `EXPORT_FAILURE`
- `UNSUPPORTED_BUT_ACCEPTED`
- `UNSUPPORTED_AND_CORRECTLY_REJECTED`
- `OTHER`

## What counts as a successful pilot

A pilot is complete when an external engineer runs at least one bounded workflow and returns an observable result: a confirmed working flow, a failing input, a screenshot/artifact, or a reproducible usability issue.

Outreach or a positive comment by itself does not count as validation.
