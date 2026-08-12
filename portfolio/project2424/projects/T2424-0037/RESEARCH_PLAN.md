# NLP-to-CAD / NeuroCAD — research plan

## Current evidence

The current package is a **tested controlled-language compiler demo**, not general NLP-to-CAD research. It parses a narrow plate/panel/bracket grammar into a numeric `rectangular_plate` intermediate representation, validates bounds, then generates OpenSCAD/SVG from compiler-owned templates.

A deterministic 20-prompt benchmark is provided in `benchmark/run.mjs`. It covers accepted geometry, diameter/radius normalization, default and explicit insets, complexity tiers, unsupported geometry, unsupported hole counts, unsafe dimensions/insets, and an injection-like suffix that must not enter executable CAD source.

## Research hypothesis

> For constrained parametric CAD tasks, a structured intermediate representation with explicit geometric validation will produce higher executable-validity and constraint-adherence rates than direct natural-language-to-CAD-code generation, especially as instructions become compositional or adversarial.

This is **not yet supported** by comparative experiments. The current implementation establishes only the structured-IR side of the comparison.

## Three architectural baselines

### B0 — Direct code generation

Natural language → OpenSCAD text.

Purpose: measure the tempting simplest baseline. It must run only inside a restricted sandbox and must never interpolate or execute arbitrary user-provided source directly.

Status: **not implemented in this package**.

### B1 — Structured IR compiler (current)

Natural language → typed numeric IR → validation → OpenSCAD/SVG.

Purpose: isolate the value of a constrained intermediate representation and fail-closed parser.

Status: **implemented and regression-tested** for one rectangular-part family.

### B2 — Structured IR + geometric verifier

Natural language → typed IR → validation → CAD kernel/model construction → independent geometric checks → output.

Purpose: distinguish parser correctness from actual geometry/kernel validity and enable stronger constraint metrics.

Status: **planned**; requires a real CAD backend such as CadQuery/OpenCascade or equivalent.

## Benchmark metrics

For every prompt family report:

- parse/syntax validity;
- compilation/execution success;
- geometry validity;
- dimension accuracy;
- constraint satisfaction;
- success by prompt-complexity tier;
- rejection precision for unsupported/unsafe prompts;
- latency and generated representation size where relevant.

The current deterministic benchmark should be treated as a smoke benchmark, not a research result.

## Failure taxonomy

1. **Parse miss** — supported intent is rejected.
2. **False accept** — unsupported/unsafe intent is accepted.
3. **Dimension error** — width/height/thickness/radius differs from target.
4. **Layout error** — correct counts but incorrect locations/relations.
5. **Constraint error** — geometry violates declared insets/bounds/relationships.
6. **Code validity error** — emitted CAD program is syntactically invalid.
7. **Kernel error** — program parses but produces invalid/non-manifold/empty geometry.
8. **Injection/safety error** — user text reaches executable source or unsafe operations.
9. **Ambiguity error** — multiple plausible interpretations are silently guessed instead of surfaced/rejected.
10. **Composition failure** — simple primitives work individually but fail under multiple simultaneous constraints.

## Next experiment before a paper claim

1. Freeze at least 3 parametric part families, not only plates.
2. Build 60–100 prompts with held-out compositional variants and negative controls.
3. Implement B0 and B2 under the same prompt set.
4. Predeclare exact metrics and success thresholds before observing held-out results.
5. Run all baselines on the same machine/runtime and retain raw outputs.
6. Compare validity/constraint adherence overall and by complexity tier.
7. Preserve failures and do not tune on the final held-out set.

## Paper-readiness rule

A demo screenshot and passing deterministic prompts are not enough. The project becomes a serious manuscript candidate only after B0/B1/B2 comparative results exist, a real CAD kernel independently validates output geometry, the benchmark contains held-out compositional tasks, and all raw outputs/configs are reproducible.
