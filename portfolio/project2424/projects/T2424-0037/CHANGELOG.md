# NeuroCAD Changelog

## 0.1.0-alpha — 2026-08-22

Product-line alpha changes only; frozen scientific result files are unchanged.

- added strict direct-spec validation before plate rendering/summary/export;
- added versioned `neurocad-0.1` CAD documents;
- added validated parametric primitives: rectangular plate, cylinder, tube, disk, frustum, blade ring;
- added bounded assembly validation and reference checks;
- added conceptual turbojet assembly generator;
- added constrained creation and follow-up language commands;
- added interactive orbit/zoom browser wireframe, component highlighting, casing visibility, exploded view, and parameter regeneration;
- added CADSpec JSON and OpenSCAD source export;
- added Alpha product QA tests and claim-safe demo copy;
- documented the research/product boundary, including the retained `VALIDATION_DOMINANT` mechanism result.

### Explicit non-features

- no arbitrary NLP-to-CAD;
- no STEP/B-rep export;
- no in-browser STL execution;
- no CFD/FEA/thermal/combustion simulation;
- no propulsion-performance calculation;
- no manufacturing or certification claim.
