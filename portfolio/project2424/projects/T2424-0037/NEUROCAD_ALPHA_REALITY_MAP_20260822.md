# NeuroCAD Alpha — Execution Reality Map (2026-08-22)

## IMPLEMENTED BEFORE THIS ALPHA BRANCH
- Controlled rectangular-plate language parser.
- Typed/parametric plate representation.
- 1/2/4-hole layouts, geometry validation, OpenSCAD generation, SVG preview, geometry summary.
- Browser plate demo and regression suite.
- Frozen controlled benchmark and frozen held-out-template v1 evidence.
- Real OpenSCAD/STL execution evidence for the 12 valid held-out cases.
- Post-v1 negative-number fail-closed repair.

## FROZEN RESEARCH RESULT — DO NOT REWRITE
- Historical held-out v1: 19/20 overall for typed + validated versus 12/20 for original direct flat extraction; adverse case O018 preserved.
- Later frozen component ablation: direct extraction + matched validation = current typed + validated on the reused diagnostic (`VALIDATION_DOMINANT`).
- Product engineering may continue; the typed-IR causal-superiority claim is not supported by that diagnostic.

## IMPLEMENTED ON `feat/neurocad-alpha-jet-demo-20260822`
- Versioned `neurocad-0.1` CADDocument representation.
- Structured CAD diagnostics and fail-closed validation for bounded primitives.
- General assembly references and object transforms.
- Bounded conceptual jet-engine parameter model.
- Deterministic conceptual axial jet-engine assembly generator.
- Compressor/turbine stage generation, shaft, casing, combustor envelope, inlet, nozzle.
- Browser scene serialization and CADSpec JSON serialization.
- Constrained natural-language intent model for hero generation and contextual modifications.
- New alpha unit tests covering CAD validation, engine bounds, document regeneration, serialization, and intent parsing.
- New alpha browser launch surface with assembly tree, parameter controls, casing visibility, exploded offsets, orbit/zoom canvas preview, CADSpec inspection, and JSON export.

## PARTIALLY IMPLEMENTED / REQUIRES VERIFICATION
- Alpha browser viewer: implementation exists on branch; fresh browser smoke evidence is still required.
- New tests: authored on branch; fresh CI/local execution evidence is still required.
- Direct-spec hardening from PR #410: current branch has a new generalized validator but PR #410 remains a separate open draft and must be reconciled deliberately rather than silently treated as merged.
- 3D viewer is a bounded interactive browser canvas representation; it is not yet a WebGL/B-rep CAD kernel.

## NOT IMPLEMENTED
- STEP/B-rep export.
- Browser-side STL generation.
- CFD, FEA, combustion, thrust, efficiency, stress, fatigue, or airworthiness calculations.
- Arbitrary natural-language CAD generation.
- Manufacturing correctness/certification.
- Third-party replication of the new product alpha.
- Public production deployment of the new alpha branch.

## CURRENT PRODUCT CLAIM
NeuroCAD Alpha 0.1 converts a constrained set of engineering-language commands into validated parametric conceptual geometry and an explicit CAD document that can be inspected, modified, visualized, and exported as structured JSON. The historical rectangular-plate line additionally retains verified OpenSCAD/STL evidence.
