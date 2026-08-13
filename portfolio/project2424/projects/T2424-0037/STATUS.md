# T2424-0037 Status

**Project:** NeuroCAD / controlled NLP-to-CAD  
**Project 2424 ID:** T2424-0037  
**Track:** existing work → controlled experiment  
**State:** `GREEN_CONTROLLED_BENCHMARK_AND_HELD_OUT_TEMPLATE_GATE / PR_REVIEW_PENDING`  
**Claim level:** deterministic rectangular-plate compiler with controlled and held-out-template evidence

## Claim-specific GREEN evidence

### Original controlled benchmark

- frozen deterministic 20-case benchmark: **20/20 passed**;
- syntax/source generation success: 1.0;
- geometry validity: 1.0;
- dimension accuracy: 1.0;
- constraint satisfaction: 1.0;
- fresh frozen rerun retained in the Project 2424 reproducibility artifact family.

This original result remains a controlled in-grammar benchmark, not an OOD or learned-model claim.

### Held-out linguistic-template v1

Protocol was frozen before execution in `OOD_PROTOCOL.md`. The existing parser implementation was not changed before seeing the result.

20 fixed cases: 12 valid targets, 8 invalid/fail-closed inputs.

| System | Valid exact | Invalid rejection | Overall |
|---|---:|---:|---:|
| typed + validated compiler | **1.000** | **0.875** | **0.950** |
| direct flat extraction | 1.000 | 0.000 | 0.600 |

- overall delta over direct baseline: **+0.350**;
- frozen gate: **PASS_HELD_OUT_TEMPLATE_GATE**;
- preserved failure: negative-width case `O018` is unexpectedly accepted and is not patched inside this result family.

Raw evidence:

- workflow run `31659488587`;
- artifact `9165650301`;
- digest `sha256:753a394de4bdced76fd6e1f21419d12cf13fc872691238655b04341193e6cd6d`.

### Executable CAD backend

The 12 valid held-out cases were independently passed through real OpenSCAD 2021.01 in CI:

- generated STL: **12/12**;
- non-empty STL outputs: **12/12**;
- verdict: `PASS_OPENSCAD_EXECUTION`.

This closes the earlier dependency-free evaluator's `backend_execution_success = null` gap for these frozen valid cases.

## Implemented

- [x] controlled plate-language parser
- [x] typed/parametric intermediate representation
- [x] 1/2/4-hole layouts
- [x] dimension and geometry validation
- [x] OpenSCAD generation and SVG preview generation
- [x] geometry summary metrics
- [x] browser demo
- [x] parser/geometry regression suite
- [x] frozen `CLAIM.md` and original `PROTOCOL.md`
- [x] original 20-case controlled benchmark
- [x] held-out-template protocol frozen before execution
- [x] executable direct extraction baseline
- [x] held-out-template raw result artifact
- [x] real OpenSCAD/STL execution gate
- [x] explicit failure taxonomy and preserved adverse case

## Still open

- [ ] merge/review the current evidence PR after exact-head checks;
- [ ] new part-family OOD rather than linguistic-template OOD;
- [ ] model-based direct-generation comparator if a suitable provider/model is introduced;
- [ ] richer CAD representation/editability/reopen validation;
- [ ] topology/constraint validation beyond successful STL rendering;
- [ ] external benchmark or independent third-party replication;
- [ ] research novelty audit and paper-level baseline set.

## Provenance

Legacy implementation head `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` passed canonical CI `31410049687`. The current Project 2424 frozen rerun retains successful controlled evidence for T2424-0037. The held-out-template result above is a separate v1 evidence family frozen and executed on 13 August 2026.

## Not claimed

- arbitrary-language understanding;
- arbitrary CAD generation;
- OOD generalization to new geometry families;
- superiority to LLM/CAD-generation systems;
- manufacturing correctness;
- production deployment;
- research novelty;
- Certified Complete / Research Complete.
