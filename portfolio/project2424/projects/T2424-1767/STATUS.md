# T2424-1767 Status

**Project:** Resource-Bounded Mixture-of-Experts Operator for Scientific ML Benchmarking

## Current state

`TESTED_TOOL / EXACT_HEAD_CI_VERIFIED / MERGED / REAL_WORKLOAD_VALIDATION_PENDING`

## Verified integration evidence

Canonical PR #162 passed exact-head GitHub Actions CI run `31409012137` on head `1496c991a3b00473700b2f4c3d173d428f793e9b` and merged as commit `8c4bb2b31140f8e580135a5595f2731b0068d146`.

An older separate cheap-screen implementation was intentionally superseded so this ID is not double-counted.

## Substance present

- [x] working resource-bounded routing implementation
- [x] explicit expert costs and per-sample budget
- [x] deterministic score-per-cost routing
- [x] top-K cap and fail-closed impossible-budget behavior
- [x] selected-expert softmax mixture
- [x] deterministic synthetic resource/error frontier
- [x] root-level regression tests
- [x] reproducible commands
- [x] exact-head canonical CI
- [x] canonical merge
- [x] limitations and claim boundary

## Current interpretation

The software/tool prototype is GREEN.

The Scientific-ML research claim is not green: costs remain abstract, the benchmark is synthetic, and there is no retained real-workload or independent scientific evidence establishing superiority.

## Not claimed

- validated Scientific-ML superiority;
- measured wall-clock or memory efficiency;
- real-workload quality/resource frontier;
- publication novelty;
- independent external validation;
- research completion.

## Next scientific gate

Use a frozen real Scientific-ML workload, measured wall-clock/memory/accelerator costs, matched strong routing baselines, retained raw outputs, uncertainty, and independent reproduction. Preserve any failure to beat simple routing controls.
