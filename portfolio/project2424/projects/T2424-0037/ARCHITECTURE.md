# NeuroCAD Alpha 0.1 — Architecture

## Product pipeline

```text
bounded language command
        ↓
intent interpretation
        ↓
versioned CADDocument (`neurocad-0.1`)
        ↓
primitive + assembly validation
        ↓
interactive browser projection / OpenSCAD serialization
        ↓
CADSpec JSON or SCAD export
```

## Trust boundary

Untrusted prompt text is never copied into executable CAD source. The deterministic language layer produces numeric structured data. Every caller-constructed plate spec is revalidated before SVG, summary, or OpenSCAD output. Alpha CAD objects use safe identifiers, finite numeric dimensions, explicit millimetre units, bounded object counts, bounded transforms, primitive-specific geometry checks, duplicate-ID rejection, and assembly reference validation.

## Primitive registry

Alpha 0.1 supports these structured object types:

- `rectangular_plate`
- `cylinder`
- `tube`
- `disk`
- `frustum`
- `blade_ring`

This is deliberately not arbitrary free-form CAD.

## Assembly model

A `CADDocument` contains validated objects and optional assemblies. Assemblies reference object IDs and fail closed on dangling references. The jet-engine concept is one client of this generic layer; the document model itself is not engine-specific.

## Jet-engine concept generator

The generator builds a stylized axial assembly from bounded visual parameters:

- inlet frustum;
- central shaft;
- repeated compressor rotor/stator blade rings;
- combustor envelope;
- repeated turbine blade rings;
- outer casing;
- exhaust nozzle.

Stage counts and dimensions are bounded for predictable geometry and browser performance. The generator does not compute thrust, pressure ratio, RPM, temperatures, fuel flow, structural loads, fatigue, materials, tolerances, or certification quantities.

## Browser viewer

The alpha browser surface uses a dependency-free interactive 3D wireframe projection. It projects primitive geometry from 3D coordinates to a 2D canvas with orbit, zoom, depth ordering, group-aware exploded offsets, component highlighting, and casing visibility controls. It is a product visualization layer, not a CAD kernel.

## Scientific separation

Historical NeuroCAD research artifacts are immutable. The frozen v1 benchmark and later `VALIDATION_DOMINANT` ablation remain separate from the Alpha product line. Product engineering improvements must not be used to rewrite old experiment outcomes or claim typed-IR causal superiority.
