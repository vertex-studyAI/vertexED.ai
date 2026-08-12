# RESEARCH_STATUS

As of: 2026-08-12 execution pass

Research maturity is assigned from evidence, not names, merges or intended scale.

| Research line | Current evidence class | What is actually supported | Missing promotion evidence |
|---|---|---|---|
| T2424-0037 controlled NLP-to-CAD | TESTED + MERGED / CONTROLLED BENCHMARK ONLY | recovery restored controlled parser, guarded parametric CAD generator, deterministic 20-prompt evaluator, web demo and focused tests; initial CI exposed one syntax defect; repaired head `7c79da9a...` passed canonical CI run #914; PR #266 merged | real CAD backend execution, geometry verification, broader/uncontrolled language benchmark, stronger adversarial inputs, independent reproduction before stronger claim |
| T2424-0050 Darcy Latent Operator | TESTED IDENTITY REPAIR INTEGRATED | observed main history restores canonical frozen identity and bounded regressions while explicitly avoiding Certified Complete/research-complete claims | actual operator experiment, baselines, measured results, independent reproduction |
| Olympus/Hercules | TESTED_NOT_SCALED | inspected PR #257 contains baseline/ablation harnesses, manifests and qualification gates; canonical CI was green | O2 matched-budget architecture ablation on real hardware; downstream evidence and stability/resource comparison |
| Percy reliability research/engineering | TESTED ARTIFACTS / RUNTIME BLOCKED | inspected PR #257 records recovery, reliability, restart/migration and provider-protocol tests plus production qualification tooling | real live runtime state, physical cross-host/macOS qualification, durable task progression under interruption |
| Project 2424 Atlas | VERIFIED CLASSIFIER/SNAPSHOT TOOLING | inspected PR #262 had green canonical CI and classified 51 research entries: 32 IMPLEMENTED, 1 RUNNABLE, 18 TESTED; none should be promoted merely from the atlas | experiments, analysis, paper/release gates per project |
| LAM-JEPA | VALID NEGATIVE / INCONCLUSIVE LINE | portfolio evidence preserves a fail-closed negative/inconclusive result and forbids relabeling it as positive | any new hypothesis requires preregistered new evidence, not threshold retuning or hidden confirmatory-test access |

## NeuroCAD evidence boundary

The current controlled benchmark measures parsing/IR validity, deterministic geometry-target matching, constraint satisfaction and source generation for a fixed 20-prompt set. The evaluator itself explicitly leaves backend execution unmeasured. Therefore:

- `TESTED`: supported for the controlled implementation/integration.
- `MERGED`: supported by PR #266 state.
- `BACKEND_EXECUTED`: not demonstrated by this evidence.
- `GENERAL NLP-TO-CAD`: not demonstrated.
- `RESEARCH_COMPLETE`: not demonstrated.
- `RELEASED`: not demonstrated by this pass.

## Olympus maturity ladder

- O0 — toy architecture validation: evidence exists in the inspected research harness.
- O1 — small controlled baseline: test/miniature evidence exists, but claims remain bounded to the recorded setup.
- O2 — architecture ablation: **NEXT GATE; not yet demonstrated at the required real-hardware matched-budget standard.**
- O3 — medium-scale replication: NOT DEMONSTRATED.
- O4 — optimized local release: NOT DEMONSTRATED.
- O5 — larger-scale training: NOT JUSTIFIED by current evidence/resources.

## Research claim rules

1. A paper is not promoted without measured central results.
2. Green unit tests prove implementation behavior, not scientific advantage.
3. A merge proves integration state, not research validity.
4. Architecture training alone is not evidence of superiority.
5. Failed or inconclusive experiments remain valid outputs and must not be renamed into wins.
6. Exact datasets, tokenizers, parameter budgets, optimizer/training budgets and evaluation suites must match for comparative architecture claims.
