# NGMT v0.1 manuscript claim audit

## Verdict

**PASS — negative-result source is evidence-bounded.** The manuscript introduces no new
experiment, analysis choice, significance test, causal rescue, or readiness claim.

## Claim reconciliation

| Claim class | Frozen evidence | Manuscript disposition |
|---|---|---|
| Experiment identity | `NGMT-v0.1-frozen-2026-08-13` | Exact identity retained |
| Scientific verdict | `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01` | Exact verdict retained |
| Model scope | Tiny causal Transformer, synthetic development task | No general Transformer/LM claim |
| Arms | B0 no memory; B1 kernel; B2 Gaussian; B3 Student-t | Mechanisms described without inflation |
| Parameter fairness | 6,049 trainable parameters each | Exact matched count retained |
| Memory fairness | 18 scalars each for B1-B3 | Exact runtime capacity retained |
| Seeds | `[11,23,37]` | No seed expansion |
| Conditions | Six retained, five adverse plus clean control | No condition dropped or renamed |
| B3 versus B2 | `0.004945732296129727`; threshold `0.05`; FAIL | Reported as `0.4946%`, no superiority |
| B3 versus B1 | `0.004392875989642753`; threshold `0.03`; FAIL | Reported as `0.4393%`, no superiority |
| Clean guardrail | `0.009600300111813348`; maximum `0.02`; PASS | Guardrail pass does not rescue conjunction |
| Divergence | 0/3 B3 seeds | Execution control only |
| Invalid attempt | Pre-training loader failure | Explicitly excluded from scientific evidence |
| Replay | Exact scientific payload/checkpoints; runtime differs | Project-controlled, not external replication |
| Significance | Forbidden at n=3 | No p-value or significance language |
| T2424-0025 | Distinct precursor; no positive contribution | No promotion to NGMT evidence |
| Ablations | Conditional on positive gate | Not run or proposed as rescue |
| Readiness | `preprint_ready=false` | Source is not called submission-ready |

## Fail-closed boundaries

- `hypothesis_supported=false`.
- `mechanism_advantage_supported=false`.
- No rescue tuning, seed expansion, condition dropping, threshold movement, or favorable-subset analysis.
- No independent implementation, real-data, natural-language, long-context, external-validation,
  statistical-significance, novelty, or publication claim.
- Any successor requires a new versioned protocol.

The manuscript changes presentation only. It does not modify a scientific file, metric, seed,
threshold, condition, protocol commit, implementation commit, artifact identity, or verdict.
