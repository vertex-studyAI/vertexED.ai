# T2424-1768 — RESULTS

Evidence date: 2026-08-12
Fresh run: GitHub Actions `31616573215`, job `94180746280`
Frozen source base: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`

## Hypothesis

On the frozen scalar fixture, explicit caller-supplied output contracts should reject an injected out-of-contract expert before mixture aggregation, reducing corrupted-condition error while leaving the matched clean control unchanged.

## Task

- 81 deterministic scalar samples over `x ∈ [-1,1]`;
- 3 fixed experts;
- equal fixed router scores;
- accepted output interval `[-0.6, 1.1]`;
- corrupted condition: candidate C adds `+6` when `x > 0.2`;
- clean condition: same candidate without the injected violation.

## Baseline and method

- baseline: unverified fixed-score mixture;
- proposed method: contract-filtered mixture with explicit accept/reject audit trail and fail-closed accepted-expert quorum.

## Metrics and result

| Condition | Verified MAE | Unverified MAE | Rejected-expert rate | Exhausted rate |
|---|---:|---:|---:|---:|
| Corrupted | 0.01266608 | 0.80259095 | 0.13168724 | 0 |
| Clean | 0.01257873 | 0.01257873 | 0 | 0 |

Clean verified-minus-unverified MAE delta: `0`.

All four predeclared mechanics gates passed, giving verdict `PASS_CONTROLLED_SELF_VERIFICATION_MECHANICS`. All 7 focused tests passed.

## Seed / uncertainty policy

This is a deterministic fixture with no stochastic training. Repeated random seeds would not constitute meaningful independent statistical samples. The result is therefore reported as an exact mechanics reproduction rather than an inferential significance claim.

## Limitations

The result does not establish:

- correctness of arbitrary verifier rules;
- independence of a verifier from its expert;
- rejection of plausible in-bound errors;
- learned routing or learned verification;
- real Scientific-ML performance benefit;
- calibration, formal verification or safety guarantees;
- novelty or publication readiness.

The strong corrupted-condition improvement is intentionally easy because the injected violation is obvious and outside the frozen contract. A decisive scientific follow-up requires realistic in-bound failures, domain-derived verifiers and robust-aggregation baselines.