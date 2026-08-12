# T2424-1768 — Self-Verifying Mixture-of-Experts Engine for Scientific ML Benchmarking

**First-100 rank:** 53  
**Track:** E — Cheap falsification screen  
**Package type:** deterministic research/developer prototype  
**Claim boundary:** contract-checking mechanics on a synthetic scalar fixture only.

## Research question

Can a mixture-of-experts execution layer use explicit, caller-supplied output contracts to reject an injected contract-violating expert before aggregation, while leaving a matched clean control unchanged?

This package deliberately asks that narrow question. It does **not** treat a verifier as a proof of correctness and does not claim Scientific-ML benchmark superiority.

## Mechanism

`executeSelfVerifyingMoe`:

1. executes each scalar expert;
2. requires a separate `verify({ sample, prediction })` contract for every expert;
3. records every acceptance/rejection in an audit trail;
4. aggregates only accepted expert predictions with deterministic softmax weights;
5. fails closed when fewer than `minAccepted` experts pass verification.

The verifier is supplied by the caller. A weak, circular, leaked-target, or incorrectly specified verifier can still accept bad outputs. The engine only makes the verification boundary explicit and auditable.

## Files

```text
T2424-1768/
├── README.md
├── STATUS.md
├── src/
│   └── selfVerifyingMoe.mjs
└── experiment/
    └── syntheticBenchmark.mjs
```

Repository regression coverage:

```text
tests/project2424T1768SelfVerifyingMoe.test.mjs
```

## Frozen synthetic falsification screen

The benchmark uses 81 deterministic scalar samples over `x ∈ [-1, 1]` and three fixed experts with equal router scores.

All experts share a frozen output contract:

```text
-0.6 <= prediction <= 1.1
```

Two conditions are evaluated:

### Corrupted condition

`candidate-c` receives a predeclared `+6` output violation when `x > 0.2`. The unverified mixture still aggregates that output. The self-verifying engine must reject it.

### Clean control

The same candidate runs without the injected violation. Every output should remain inside the frozen bound, no expert should be rejected, and the verified and unverified mixtures must match to numerical tolerance.

## Predeclared gates

The mechanics screen passes only if all four conditions hold:

1. at least one injected violation is rejected;
2. corrupted-condition verified MAE is less than half the unverified-mixture MAE;
3. the clean control rejects zero experts and matches the unverified mixture within `1e-12` MAE delta;
4. neither condition exhausts the accepted-expert quorum.

The resulting verdict is one of:

- `PASS_CONTROLLED_SELF_VERIFICATION_MECHANICS`
- `FAIL_CONTROLLED_SELF_VERIFICATION_MECHANICS`

No threshold should be changed after observing a result merely to rescue the mechanism.

## Run

From the repository root:

```bash
node portfolio/project2424/projects/T2424-1768/experiment/syntheticBenchmark.mjs
node --test tests/project2424T1768SelfVerifyingMoe.test.mjs
npm test
npm run ci
```

## What the screen can establish

If green, it establishes only that this implementation:

- makes accept/reject decisions explicit;
- prevents a frozen class of synthetic out-of-bound expert outputs from entering the mixture;
- fails closed when the accepted-expert quorum is missing;
- preserves the matched clean control on the frozen fixture.

## What it cannot establish

It does **not** establish:

- correctness of arbitrary verifier rules;
- independence of a verifier from its expert;
- robustness to plausible in-bound errors;
- learned gating or learned verification;
- real Scientific-ML workload benefit;
- calibration, uncertainty quality, theorem proving, formal verification, or safety guarantees;
- state-of-the-art performance, novelty, publication readiness, or research completion.

## Next evidence gate

A scientifically stronger follow-up should freeze a small real Scientific-ML task **before** evaluation, use verifiers derived from domain constraints that do not access ground-truth targets, inject both obvious out-of-contract and plausible in-bound failures, compare against an unverified ensemble and at least one robust aggregation baseline, run multiple seeds where learning is involved, and retain raw predictions plus verifier decisions for independent recomputation.
