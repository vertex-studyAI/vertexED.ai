# T2424-0037 Status

**Project:** NeuroCAD / controlled NLP-to-CAD  
**Project 2424 ID:** T2424-0037  
**Track:** existing work → controlled experiment → engineering productization  
**State:** `TESTED_ENGINEERING_PIPELINE / RESEARCH_MECHANISM_FALSIFIED`  
**Claim level:** deterministic rectangular-plate compiler with controlled, held-out-template, executable-CAD, and component-ablation evidence

## Current truth

NeuroCAD has a working deterministic controlled-language → validated representation → OpenSCAD/SVG pipeline with retained tests and executable CAD evidence. It does **not** currently have a supported typed-IR/parser research-mechanism advantage on the reused 20-case diagnostic.

The latest frozen component ablation (`NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md`) is the decisive mechanism result:

| System | Valid exact geometry | Invalid rejection | Overall success |
|---|---:|---:|---:|
| typed + validated compiler (M2) | 1.00 | 1.00 | **1.00** |
| original direct flat extraction (B0) | 1.00 | 0.00 | **0.60** |
| direct extraction + matched fail-closed validation (B1) | 1.00 | 1.00 | **1.00** |

- `validation_recovery_fraction = 1.00`
- `remaining_gap = 0.00`
- frozen interpretation: **`VALIDATION_DOMINANT`**
- result workflow: `31777954088` — SUCCESS
- artifact: `9210587354`
- artifact SHA-256: `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`

This falsifies the claim that the performance gap on these reused diagnostic cases specifically demonstrates a typed-parser/IR causal advantage. The supported contribution is engineering reliability from explicit validation under the tested grammar.

## Historical evidence preserved

### Original controlled benchmark

- frozen deterministic 20-case benchmark: **20/20 passed**;
- syntax/source generation success: 1.0;
- geometry validity: 1.0;
- dimension accuracy: 1.0;
- constraint satisfaction: 1.0.

This remains a controlled in-grammar result, not an OOD or learned-model claim.

### Held-out linguistic-template v1

Protocol was frozen before execution in `OOD_PROTOCOL.md`; the implementation was not changed before seeing the result.

20 fixed cases: 12 valid targets, 8 invalid/fail-closed inputs.

| System | Valid exact | Invalid rejection | Overall |
|---|---:|---:|---:|
| then-frozen typed + validated compiler | **1.000** | **0.875** | **0.950** |
| original direct flat extraction | 1.000 | 0.000 | 0.600 |

- overall delta over direct baseline: **+0.350**;
- frozen gate: **PASS_HELD_OUT_TEMPLATE_GATE**;
- preserved historical failure: negative-width case `O018` was unexpectedly accepted;
- raw workflow `31659488587`, artifact `9165650301`, digest `sha256:753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`.

The later signed-negative safety repair is a separate engineering lineage and does not rewrite this 19/20 historical result.

### Executable CAD backend

The 12 valid held-out cases were independently passed through OpenSCAD 2021.01 in CI:

- generated STL: **12/12**;
- non-empty STL outputs: **12/12**;
- verdict: `PASS_OPENSCAD_EXECUTION`.

## Implemented

- [x] controlled plate-language parser
- [x] typed/parametric intermediate representation
- [x] 1/2/4-hole layouts
- [x] dimension and geometry validation
- [x] OpenSCAD generation and SVG preview generation
- [x] geometry summary metrics
- [x] browser demo
- [x] parser/geometry regression suite
- [x] controlled benchmark
- [x] held-out linguistic-template protocol/result
- [x] real OpenSCAD/STL execution gate
- [x] post-result signed-negative safety repair and regressions
- [x] frozen validation-confound component ablation
- [x] explicit failure/mechanism taxonomy

## Next productization work

The existing software line may continue without rescuing the failed research mechanism claim:

- [ ] richer CAD representation/editability and reopen validation;
- [ ] topology/constraint validation beyond successful STL rendering;
- [ ] explicit CLI/API packaging and stable input/output schema;
- [ ] deterministic artifact manifests and error codes for downstream tools;
- [ ] broader product QA on valid/invalid controlled-language cases;
- [ ] ownership/security boundaries if exposed through a hosted service.

## Next research gate

Do **not** tune parser/validator variants on the same 20 cases to recover the typed-IR story. Any further scientific run must be a separately frozen benchmark with broader part families/compositional prompts and a competent contemporary direct/program-generation baseline under matched backend, execution and semantic criteria.

## Not claimed

- arbitrary-language understanding;
- arbitrary CAD generation;
- OOD generalization to new geometry families;
- superiority to LLM/CAD-generation systems;
- manufacturing correctness;
- production deployment;
- a demonstrated typed-IR/parser scientific mechanism;
- research novelty;
- Certified Complete / Research Complete.
