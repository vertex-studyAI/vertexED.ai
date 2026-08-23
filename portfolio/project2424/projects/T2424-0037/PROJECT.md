# NeuroCAD — Project Definition

**Canonical research identity:** T2424-0037 `NLP-to-CAD`  
**Product identity:** NeuroCAD Alpha 0.1  
**Type:** research + technical product  
**Status:** ACTIVE

## Mission

ENGINE → TEST → BENCHMARK → DEMO → EXTERNAL VALIDATION → PAPER / PILOT

Build a scientifically defensible, demonstrable language-to-parametric-CAD system that turns bounded engineering intent into an explicit structured CAD document, validates it, generates editable parametric geometry, renders it, and exports a useful representation.

## Current supported product claim

> NeuroCAD turns constrained engineering descriptions into validated parametric geometry and lets users inspect, modify and export conceptual CAD assemblies.

## Current narrow proof path

1. constrained engineering text;
2. explicit `neurocad-0.1` CADDocument;
3. structured validation / fail-closed diagnostics;
4. bounded parametric geometry;
5. stateful edit and regeneration;
6. interactive browser inspection;
7. CADSpec JSON and OpenSCAD export.

The recommended engineering-object demo is the editable flanged-tube workflow. The conceptual jet-engine assembly is a visual interaction demo and not a propulsion/manufacturing model.

## Research-integrity boundary

Historical results are immutable evidence:

- controlled deterministic benchmark: 20/20 on its controlled set;
- frozen held-out v1: typed + validated 19/20 vs original direct 12/20;
- retained O018 signed-negative failure;
- post-result parser hardening is engineering work, not retroactive research correction;
- matched-validation diagnostic: typed + validated 1.00, direct + matched validation 1.00, original direct 0.60;
- frozen verdict: `VALIDATION_DOMINANT`;
- no typed-IR-specific superiority claim survives that diagnostic.

Any successor scientific claim must come from a new pre-frozen experiment, not reinterpretation of v1/v2.

## Explicit non-claims

NeuroCAD Alpha does not currently claim:

- arbitrary natural-language understanding;
- arbitrary CAD generation;
- manufacturing-ready geometry;
- STEP/B-rep support;
- GD&T automation;
- general sketch/constraint solving;
- CFD/FEA;
- propulsion performance;
- airworthiness/certification;
- external validation before completed pilots;
- public deployment before exact served-artifact verification.

## Green definitions

**RESEARCH COMPLETE:** every scientific claim matches reproducible evidence and falsified claims remain falsified.

**DEMO READY:** a deterministic end-to-end bounded workflow passes source, browser and backend certification.

**PUBLIC ALPHA READY:** a public NeuroCAD URL serves the intended immutable artifact and the production flagship smoke passes.

**PILOT READY:** a third party can use a documented build without developer hand-holding.

**EXTERNALLY VALIDATED:** independent engineering users have actually exercised the Alpha and reproducible outcomes are retained. Outreach alone does not count.
