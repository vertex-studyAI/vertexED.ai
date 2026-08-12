# RESEARCH_STATUS

As of: 2026-08-12 18:02 IST

Research maturity is assigned from evidence, not names or intended scale.

| Research line | Current evidence class | What is actually supported | Missing promotion evidence |
|---|---|---|---|
| T2424-0037 controlled NLP-to-CAD | IMPLEMENTED / PRIOR EVALUATION EXISTS / NEW-HEAD CI PENDING | current recovery PR #266 restores the controlled parser, guarded parametric CAD generator, deterministic 20-prompt evaluator, web demo and focused tests onto a recent main base | green CI for recovery head, current-main refresh if needed, broader/uncontrolled language benchmark, backend/CAD execution coverage, independent reproduction before stronger claim |
| T2424-0050 Darcy Latent Operator | TESTED IDENTITY REPAIR INTEGRATED | current main `e9a3ba18...` restores canonical frozen identity and bounded regressions while explicitly avoiding Certified Complete/research-complete claims | actual operator experiment, baselines, measured results, independent reproduction |
| Olympus/Hercules | TESTED_NOT_SCALED | inspected PR #257 contains baseline/ablation harnesses, manifests and qualification gates; canonical CI was green | O2 matched-budget architecture ablation on real hardware; downstream evidence and stability/resource comparison |
| Percy reliability research/engineering | TESTED ARTIFACTS / RUNTIME BLOCKED | inspected PR #257 records recovery, reliability, restart/migration and provider-protocol tests plus production qualification tooling | real live runtime state, physical cross-host/macOS qualification, durable task progression under interruption |
| Project 2424 Atlas | VERIFIED CLASSIFIER/SNAPSHOT TOOLING | inspected PR #262 had green canonical CI and classified 51 research entries: 32 IMPLEMENTED, 1 RUNNABLE, 18 TESTED; none should be promoted merely from the atlas | experiments, analysis, paper/release gates per project |
| LAM-JEPA | VALID NEGATIVE / INCONCLUSIVE LINE | portfolio evidence preserves a fail-closed negative/inconclusive result and forbids relabeling it as positive | any new hypothesis requires preregistered new evidence, not threshold retuning or hidden confirmatory-test access |

## Olympus maturity ladder

- O0 — toy architecture validation: evidence exists in the inspected research harness.
- O1 — small controlled baseline: test/miniature evidence exists, but keep claims bounded to the recorded setup.
- O2 — architecture ablation: **NEXT GATE; not yet demonstrated at the required real-hardware matched-budget standard.**
- O3 — medium-scale replication: NOT DEMONSTRATED.
- O4 — optimized local release: NOT DEMONSTRATED.
- O5 — larger-scale training: NOT JUSTIFIED by current evidence/resources.

## Research claim rules

1. A paper is not promoted without measured central results.
2. Green unit tests prove implementation behavior, not scientific advantage.
3. Architecture training alone is not evidence of superiority.
4. Failed or inconclusive experiments remain valid outputs and must not be renamed into wins.
5. Exact datasets, tokenizers, parameter budgets, optimizer/training budgets and evaluation suites must match for comparative architecture claims.
