# NeuroCAD Alpha 0.1 — Language → Engineering Geometry

NeuroCAD is a bounded engineering-language → parametric-geometry system. The current product line combines the historically tested rectangular-plate compiler with a new versioned CAD document/assembly layer and a conceptual multi-part jet-engine showcase.

The public-alpha claim is deliberately narrower than general text-to-CAD:

> NeuroCAD turns constrained engineering descriptions into validated parametric geometry that can be inspected, edited within supported parameters, visualized, and exported as structured CAD artifacts.

## Alpha 0.1 demo

Run:

```bash
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Open `http://localhost:8000/web/`.

Flagship prompt:

```text
Generate a simplified axial jet engine concept with 6 compressor stages and 2 turbine stages
```

The browser workstation supports:

- deterministic bounded prompt interpretation;
- a versioned `neurocad-0.1` CAD document;
- validated multi-part assemblies;
- interactive 3D wireframe orbit/zoom;
- assembly-tree component selection;
- casing hide/show;
- exploded view;
- compressor/turbine stage, length, and diameter regeneration;
- follow-up commands such as `Increase compressor stages to 9`, `Hide the outer casing`, `Show exploded view`, and `Make it longer`;
- CADSpec JSON export;
- OpenSCAD source export.

The jet-engine model is a **conceptual / educational CAD assembly only**. It does not calculate or claim thrust, RPM, pressure ratio, fuel flow, temperatures, efficiency, stress, fatigue, materials, tolerances, manufacturing correctness, airworthiness, or certification.

## Alpha architecture

```text
bounded language command
        ↓
structured intent
        ↓
versioned CADDocument
        ↓
primitive + assembly validation
        ↓
procedural geometry
        ↓
interactive browser projection / OpenSCAD serialization
        ↓
CADSpec JSON / SCAD export
```

Supported Alpha structured primitives:

- `rectangular_plate`
- `cylinder`
- `tube`
- `disk`
- `frustum`
- `blade_ring`

The turbojet is one assembly built on this general layer; the CAD document itself is not engine-specific.

## Trust boundary

Untrusted input does not flow directly into executable CAD source.

- direct plate specs are strictly validated before SVG/OpenSCAD/summary rendering;
- geometry values must be finite bounded numbers;
- explicit `mm` units are required by structured plate specs;
- hole bounds and overlap are checked;
- object IDs are restricted to safe identifiers;
- object counts and scene transforms are bounded;
- primitive geometry is validated before export;
- duplicate IDs and dangling assembly references fail closed;
- no `eval`/`Function` execution path is used;
- prompt text is not interpolated into OpenSCAD source.

## Historical research record

NeuroCAD began as Project 2424 `T2424-0037`, a controlled rectangular-plate NLP→CAD experiment. The product line must remain separate from its frozen scientific history.

### Original controlled benchmark

The frozen deterministic 20-case controlled benchmark recorded **20/20 passed** on its bounded in-grammar cases.

### Held-out linguistic-template v1

The protocol was frozen before execution. Across 20 fixed cases (12 valid, 8 invalid/fail-closed):

| System | Valid exact geometry | Invalid rejection | Overall success |
|---|---:|---:|---:|
| typed + validated compiler | **1.000** | **0.875** | **0.950** |
| original direct flat extraction | 1.000 | 0.000 | 0.600 |

The retained adverse case `O018` (`plate -50 by 40 thickness 3`) remains part of frozen v1 and was not rewritten. The v1 artifact also retained **12/12 non-empty STL outputs** for valid cases through OpenSCAD 2021.01.

### Post-result engineering repair

The signed-negative parsing defect was fixed in a separate engineering lineage. Current code rejects signed-negative numeric literals. That repair does not change the historical v1 result.

### Component ablation / mechanism falsifier

A later protocol was frozen to test whether the measured gap came from the typed/parser path or from fail-closed validation. On the reused 20-case diagnostic:

| System | Overall success |
|---|---:|
| current typed + validated compiler | **1.00** |
| original direct extraction | 0.60 |
| direct extraction + matched validation | **1.00** |

The frozen interpretation is **`VALIDATION_DOMINANT`** (`validation_recovery_fraction = 1.00`). Therefore NeuroCAD does **not** claim that typed IR itself caused the observed advantage on that benchmark.

## Product QA

Run all repository tests:

```bash
npm test
```

Focused Alpha tests:

```bash
node --test tests/neurocadAlpha.test.mjs tests/nlpToCad.test.mjs
```

The new Alpha test suite covers direct-spec injection-shaped input rejection, primitive constraints, jet-engine stage/proportion bounds, min/max configurations, prompt/follow-up behavior, CADSpec serialization, SCAD output, duplicate IDs, dangling assemblies, and object-count abuse.

Frozen research workflows remain separate and must not be retuned to make Alpha look better.

## Exports

### Available in Alpha browser demo

- NeuroCAD CADSpec JSON;
- OpenSCAD source (`.scad`).

### Existing historical evidence

The bounded valid plate family has retained OpenSCAD → STL execution evidence.

### Not implemented / not claimed

- STEP/B-rep export or reopen/editability validation;
- in-browser STL generation;
- arbitrary free-form CAD;
- general model-provider NLP-to-CAD;
- CFD/FEA/thermal/combustion analysis;
- manufacturing or certification validation.

## Documentation

- [`QUICKSTART.md`](./QUICKSTART.md)
- [`ARCHITECTURE.md`](./ARCHITECTURE.md)
- [`DEMO.md`](./DEMO.md)
- [`SAFETY_AND_SCOPE.md`](./SAFETY_AND_SCOPE.md)
- [`CHANGELOG.md`](./CHANGELOG.md)
- [`NEUROCAD_ALPHA_PRODUCT_VALIDATION_20260822.md`](./NEUROCAD_ALPHA_PRODUCT_VALIDATION_20260822.md)
- [`OOD_PROTOCOL.md`](./OOD_PROTOCOL.md)
- [`NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md`](./NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md)

## Status boundary

Alpha engineering work may advance independently. Historical negative/mixed research results remain first-class evidence and must never be silently retuned, removed, or rewritten.
