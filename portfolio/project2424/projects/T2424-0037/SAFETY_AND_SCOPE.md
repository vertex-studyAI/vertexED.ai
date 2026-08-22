# NeuroCAD Alpha 0.1 — Safety and Scope

## Supported claim

NeuroCAD Alpha converts a constrained set of engineering descriptions and follow-up commands into validated parametric geometry, displays the structured component hierarchy, supports bounded parameter edits, renders an interactive browser preview and exports validated CADSpec JSON / generated OpenSCAD source.

## Jet-engine demo boundary

The engine is a conceptual/educational CAD assembly used to demonstrate software architecture and parametric regeneration. NeuroCAD Alpha does **not** provide or claim airworthiness, manufacturability, combustion qualification, structural validation, thermodynamic optimization, certification, thrust/pressure-ratio prediction, rotational-speed recommendations, temperature/fuel-flow calculation, stress/fatigue analysis, or real nozzle performance.

## Input boundary

All prompts and CAD objects are untrusted. The product line therefore validates data before render/export, requires finite numeric geometry, bounds dimensions/stage counts/object counts/assembly sizes, rejects malformed references and assembly cycles, never uses `eval()` or `Function()`, never interpolates raw prompt text into shell commands, and never copies raw prompt text into generated OpenSCAD geometry.

## Export boundary

Browser Alpha exposes only formats it actually produces directly: CADSpec JSON and OpenSCAD source. STL generation remains a local/backend OpenSCAD conversion path where the executable is installed. STEP/B-rep is not implemented.
