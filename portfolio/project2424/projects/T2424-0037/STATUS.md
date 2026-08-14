# T2424-0037 Status

**Project:** NeuroCAD / controlled NLP-to-CAD  
**Project 2424 ID:** T2424-0037  
**Track:** controlled compiler → mechanism falsification → product reliability / separately versioned learned-OOD gate  
**State:** `GREEN_PRODUCT_RELIABILITY / GREEN_VALIDATION_DOMINANT_MECHANISM_FALSIFIER / PAPER_NOT_READY`  
**Claim level:** bounded rectangular-plate compiler with executable CAD evidence; old typed-vs-direct gap no longer supports a typed/parser mechanism claim

## Claim-specific evidence

### Original controlled benchmark

- frozen deterministic 20-case benchmark: **20/20 passed**;
- syntax/source generation success: 1.0;
- geometry validity: 1.0;
- dimension accuracy: 1.0;
- constraint satisfaction: 1.0.

This remains controlled in-grammar software evidence, not an OOD or learned-model claim.

### Held-out linguistic-template v1 — historical frozen result

Protocol was frozen before execution in `OOD_PROTOCOL.md` and the v1 result remains immutable.

20 fixed cases: 12 valid targets, 8 invalid/fail-closed inputs.

| System | Valid exact | Invalid rejection | Overall |
|---|---:|---:|---:|
| typed + validated compiler | **1.000** | **0.875** | **0.950** |
| original direct flat extraction | 1.000 | 0.000 | 0.600 |

- overall delta over original direct baseline: **+0.350**;
- frozen v1 gate: **PASS_HELD_OUT_TEMPLATE_GATE**;
- preserved failure: negative-width case `O018` unexpectedly accepted in v1 and was not patched into that result family;
- workflow run `31659488587`;
- artifact `9165650301`;
- digest `sha256:753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`.

### Executable CAD backend

All 12 valid v1 held-out cases were executed through OpenSCAD 2021.01:

- generated STL: **12/12**;
- non-empty STL outputs: **12/12**;
- verdict: `PASS_OPENSCAD_EXECUTION`.

This supports bounded executable CAD generation for the tested plate family. It does not establish manufacturing correctness, arbitrary topology handling, or rich editability.

## New mechanism diagnostic — validation confound v2

A separate diagnostic was frozen **before first execution** in `NEUROCAD_COMPONENT_ABLATION_PROTOCOL_20260814.md` to ask whether the old typed-vs-direct gap was mostly caused by the validation layer rather than the typed/parser path.

It reused the old 20-case plate set only as a component diagnostic, not as unseen OOD data.

| System | Valid exact | Invalid rejection | Overall |
|---|---:|---:|---:|
| current typed + validated | **1.000** | **1.000** | **1.000** |
| original direct, unvalidated | 1.000 | 0.000 | 0.600 |
| direct + separately implemented matched validation | **1.000** | **1.000** | **1.000** |

Derived frozen diagnostics:

- `original_gap = 0.400`;
- `remaining_gap = 0.000`;
- `validation_recovery_fraction = 1.000`;
- interpretation: **`VALIDATION_DOMINANT`**.

Evidence:

- source SHA `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`;
- workflow run `31777954088` — SUCCESS;
- contract test `1/1` passed;
- artifact `9210587354`;
- artifact SHA-256 `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`;
- detailed result: `COMPONENT_ABLATION_RESULT_20260814.md`.

### Scientific consequence

The v1 `19/20` versus `12/20` gap **must not be used as evidence that the typed/parser/IR path itself caused the advantage**. Matched validation recovers the full gap on the reused plate benchmark. That mechanism interpretation is falsified for this diagnostic.

This does **not** falsify typed IR generally. It downgrades the current research story to product/reliability evidence until a stronger learned/new-family comparison survives.

## Current recommended state

### **B — PRODUCTIZE**

The typed/validated compiler remains useful bounded software with real backend execution and explicit fail-closed behavior.

### **C — CONTINUE EXPERIMENTATION only under a new frozen learned/OOD protocol**

A paper-scale mechanism claim requires:

- same exact provider/model across learned arms;
- direct executable-code generation;
- constrained direct generation;
- typed IR with and without semantic validation;
- retrieval/template control;
- genuinely new part families and compositional OOD;
- automatic geometry/topology semantics;
- coverage/false-rejection metrics;
- token/call/cost matching;
- repeated-sample/seed policy;
- predeclared falsifier and stop rule;
- independent prompt/evaluator review before outputs.

Until these are frozen, no learned run is authorized.

## Implemented

- [x] controlled plate-language parser
- [x] typed/parametric intermediate representation
- [x] dimension and geometry validation
- [x] OpenSCAD generation and SVG preview
- [x] controlled and held-out-template benchmark families
- [x] real OpenSCAD/STL execution gate
- [x] preserved v1 adverse case
- [x] frozen matched-validation component diagnostic
- [x] independent direct+validation implementation for confound attack
- [x] result artifact + contract test + environment provenance
- [x] mechanism claim downgraded after `VALIDATION_DOMINANT` result

## Still open

- [ ] same-provider learned direct/constrained/typed comparison;
- [ ] genuinely new part-family and compositional OOD manifest;
- [ ] richer CAD representation/editability/reopen validation;
- [ ] topology/constraint checks beyond successful STL rendering;
- [ ] external benchmark or independent third-party replication;
- [ ] paper-level prior-art/reviewer closure after the stronger baseline attack.

## Not claimed

- typed IR is superior because of the old v1 gap;
- arbitrary-language understanding;
- arbitrary CAD generation;
- OOD generalization to new geometry families;
- superiority to LLM/CAD-generation systems;
- manufacturing correctness;
- production deployment;
- research novelty;
- Certified Complete / Research Complete.
