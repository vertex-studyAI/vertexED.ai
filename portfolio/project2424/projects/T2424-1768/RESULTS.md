# T2424-1768 Results — Self-Verifying MoE Synthetic Contract Screen

**Fresh rerun:** 12 August 2026  
**Audited head:** `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`  
**Boundary:** synthetic contract-filtering mechanics only; no general MoE, verifier, or real-task advantage claim.

## Experiment contract

**Hypothesis.** On a frozen scalar-mixture fixture with one deliberately corrupted expert, caller-supplied output contracts should reject the injected out-of-bound predictions and prevent them from contaminating the mixture without changing the clean-control output.

**Task.** 81 deterministic scalar inputs spanning `[-1, 1]`; three fixed experts; uniform router; one expert adds `+6` for `x > 0.2` in the corrupted condition.

**Baseline.** Unverified uniform mixture of all three experts.

**Proposed method.** Same experts/router, but reject expert outputs outside frozen range `[-0.6, 1.1]` before aggregation.

**Metrics.** Mean absolute error, rejected-expert rate, exhausted-mixture rate, clean-control delta.

**Seed policy.** No stochastic seed is used; the fixture is fully deterministic. Repetition would reproduce identical values rather than estimate sampling uncertainty.

## Exact-source provenance

- `src/selfVerifyingMoe.mjs`: `56a232a680430671abef284e685a6dfc0b23b0cd`;
- `experiment/syntheticBenchmark.mjs`: `680e642202e0cce7d83de03b33390f45100f0828`.

Fresh environment: Node.js `v22.16.0`, Linux x86_64 kernel `6.18.35`. Runtime: `0.02 s` wall-clock.

## Fresh result

| Condition | Verified MAE | Unverified MAE | Rejected expert rate | Exhausted rate |
|---|---:|---:|---:|---:|
| Corrupted | 0.0126660765 | 0.8025909493 | 0.1316872428 | 0 |
| Clean | 0.0125787338 | 0.0125787338 | 0 | 0 |

Clean delta: `0`.

All frozen mechanical gates passed, yielding `PASS_CONTROLLED_SELF_VERIFICATION_MECHANICS`.

## Uncertainty

There is no seed-based uncertainty estimate because the current fixture is deterministic. That is a limitation, not evidence of zero real-world uncertainty. A stronger experiment must introduce heterogeneous tasks, expert families and corruption regimes and report repeated-run variability.

## Limitations / next gate

1. synthetic one-dimensional regression only;
2. fixed experts and fixed uniform router;
3. verifier is a hand-written range check that knows the relevant failure mode;
4. no ambiguous/adversarial in-bound corruption;
5. no false-accept/false-reject calibration curve;
6. no cost/latency comparison;
7. no learned MoE baseline or real data.

**Verdict:** fresh exact-source reproduction supports the narrow contract-filtering mechanic only.
