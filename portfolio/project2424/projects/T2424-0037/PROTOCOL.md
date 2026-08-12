# Protocol — T2424-0037 NLP-to-CAD

## Minimum compiler protocol

**PROJECT:** T2424-0037 — NLP-to-CAD  
**CLAIM:** Controlled rectangular-plate/block prompts compile deterministically to intended bounded parametric geometry and unsupported/unsafe prompts fail closed.  
**PRIMARY METRIC:** exact parsed geometry / expected rejection across frozen regression fixtures.  
**SEEDS:** none; deterministic parser/compiler.  
**EXPECTED COST:** seconds on Node.js; no external service or paid API.

## Follow-up IR experiment

**Status:** frozen after an initial local result was already observed on 12 August 2026; this is **not a preregistration**.

**QUESTION:** Within the controlled-language benchmark, does an explicit validated intermediate representation improve constraint adherence and fail-closed behavior relative to direct text-to-CAD emission?

**BENCHMARK:** `benchmark/cases.mjs`, version `v0.1-26-prompts`.

**BASELINES:**

1. `template_only` — exact-template direct emission;
2. `direct_regex` — dimension extraction followed by direct OpenSCAD emission without structured hole/constraint validation;
3. `structured_ir` — controlled parser → normalized parametric IR → validation → OpenSCAD.

**METRICS:**

- accept/reject decision accuracy;
- static OpenSCAD syntax validity among accepted prompts;
- exact constraint adherence on expected-valid prompts;
- unsafe acceptance count;
- optional OpenSCAD kernel compile success when the executable is available.

**FOLLOW-UP SUCCESS GATE:**

- `structured_ir` decision accuracy = 100% on the frozen benchmark;
- `structured_ir` constraint adherence = 100%;
- `structured_ir` unsafe acceptances = 0;
- `structured_ir` constraint adherence > `direct_regex` constraint adherence.

This gate is a regression/reproduction gate for the current benchmark, not a new unbiased hypothesis test because the first local result has already been observed.

## Negative controls and failure classes

- unsupported geometry families;
- underspecified prompts;
- invalid geometric constraints;
- safety-envelope violations;
- code-like prompt fragments;
- wording variants that expose parser-coverage failures;
- accepted outputs that omit required geometry.

## Reproduce

```bash
node --test tests/nlpToCad.test.mjs tests/nlpToCadBenchmark.test.mjs
node portfolio/project2424/projects/T2424-0037/experiment/evaluate.mjs
python3 -m http.server 8000 --directory portfolio/project2424/projects/T2424-0037
```

Then open `/web/` for the local browser demo.

If OpenSCAD is installed, `evaluate.mjs` also attempts STL compilation for every expected-valid structured-IR case. If it is absent, the kernel metric is reported as unavailable rather than fabricated.

## Interpretation rule

Passing this protocol supports only the bounded controlled-compiler and frozen-benchmark comparison. It must not be upgraded to arbitrary NLP-to-CAD, manufacturing, CAD-kernel certification, scientific novelty, or submission-readiness claims.
