# T2424-0037 Status

**Project:** NLP-to-CAD  
**Project 2424 ID:** T2424-0037  
**Queue rank:** 30  
**Track:** C — Existing work → minimum experiment  
**State:** IMPLEMENTED_BENCHMARK / LOCAL_TESTED / CANONICAL_CI_PENDING  
**Claim level:** controlled-language CAD compiler + authored structured-IR comparison screen

## Implemented

- [x] controlled plate/panel/bracket/rectangle/block parser
- [x] parametric intermediate representation
- [x] rectangular width × height × thickness triads
- [x] numeric and word-form 1/2/4-hole layouts
- [x] dimension, geometry and safety validation
- [x] code-like prompt rejection before CAD generation
- [x] OpenSCAD generation and SVG preview generation
- [x] geometry summary metrics
- [x] browser demo
- [x] original parser/geometry regression suite
- [x] frozen 26-prompt benchmark
- [x] three deterministic architectural baselines: template-only, direct-regex emission, structured IR
- [x] benchmark evaluator with optional real OpenSCAD kernel compilation
- [x] benchmark regression suite
- [x] deterministic SCAD/SVG reference assets
- [x] `CLAIM.md`, expanded `PROTOCOL.md`, README and local-results record

## Local 12 August 2026 execution

Evidence class: `LOCAL_REPRODUCED_CONTROLLED_SCREEN`.

Focused local tests:

```text
node --test tests/nlpToCad.test.mjs tests/nlpToCadBenchmark.test.mjs
9 passed; 0 failed
```

Frozen benchmark v0.1:

- 26 prompts total;
- 14 expected-valid;
- 12 expected-rejection;
- structured IR decision accuracy: 100%;
- structured IR exact constraint adherence: 100%;
- structured IR unsafe acceptances: 0;
- direct-regex decision accuracy: 65.38%;
- direct-regex exact constraint adherence: 42.86%;
- direct-regex unsafe acceptances: 8.

OpenSCAD 2021.01 was available in the local execution environment and compiled 14/14 expected-valid structured-IR outputs to STL.

These are bounded local results on an authored benchmark. They are not an independent reproduction or a preregistered general NLP-to-CAD result.

## Canonical CI boundary

Legacy implementation head `e06c91133dcc16f9e1846dde9b6908a0c64d16bc` and the earlier canonical recovery head were exact-head green before the benchmark/evaluator changes. Those CI results **do not certify the current changed head**.

Fresh canonical GitHub Actions must pass on the current PR head before this state may return to repository-level `TESTED_DEMO` or any stronger label.

Repository integration can validate only the controlled compiler/demo mechanics. This package remains unmerged and is not nine-gate certified.

**DO NOT AUTO-MERGE OR DEPLOY. MANUAL REVIEW REQUIRED.**

## Not claimed

- arbitrary-language understanding
- arbitrary CAD generation
- CAD-kernel correctness beyond the frozen local compile check
- manufacturing correctness
- production deployment
- independent benchmark generalization
- research novelty
- research completion
- Certified complete

## Next gate

1. exact-head canonical CI on all current commits;
2. independently authored held-out prompt set;
3. stronger direct code-generation baseline;
4. at least one additional part family;
5. CAD-kernel-derived geometry-equivalence checks;
6. clean-environment reproduction with retained raw evaluator output.
