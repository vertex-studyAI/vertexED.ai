# IRIS common adaptation harness v1 — RESULTS

**Experiment:** `EXP-DEV-20260813-IRIS-COMMON-ADAPTATION-HARNESS-V1`  
**Status:** **GREEN — correctly executed negative development gate**  
**Scientific verdict:** `NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE`  
**Protocol SHA-256:** `0cdf22c97ddb9459182175e7c17bf51906088f5d3a7ec10131edfa650d2edbdd`  
**Confirmatory seeds accessed:** **No** (`1000–1029` remained quarantined).

## Question

Do the existing PABIM persistence/bounded-influence mechanics retain their heavy-tail benefit while matching strong fixed robust controls and simple change-aware controls on persistent shifts when evaluated in one common development harness with pre-frozen adaptation metrics?

## Frozen protocol

The protocol was written before execution. It fixes development seeds `0–9`, nine stress/shift conditions, eight methods, and the advancement gate. The primary adaptation metrics are the already-frozen `TWMSE25`, right-censored recovery behavior, `POST_MSE50PLUS`, and false-open rate. Reserved confirmatory seeds `1000–1029` are explicitly forbidden.

The five frozen gate components were:

1. Gaussian clean non-inferiority vs Huber (`PABIM / Huber MSE <= 1.05`);
2. at least two >=5% PABIM improvements over Huber among five adverse corruption conditions;
3. PABIM adverse mean MSE within 5% of the per-condition best fixed robust control (`Huber`, `HTAM`, `student_t_matched_alpha`);
4. regime `TWMSE25` and recovery no worse than both Huber and confirmed-streak Huber;
5. mean PABIM false-open rate <=0.15 on the frozen no-persistent-change diagnostic set.

All five had to pass.

## Result

| Frozen criterion | Outcome |
|---|---|
| Clean non-inferiority | **PASS** — ratio `1.0423` |
| Heavy-tail/corruption information gain | **PASS** |
| Strong fixed-robust-control guardrail | **FAIL** |
| Persistent-shift adaptation gate | **FAIL** |
| False-open guardrail | **PASS** — mean `0.1015` |

Therefore the frozen verdict is **`NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE`**. No successor confirmatory seeds are authorized.

### Adverse-condition MSE

| Condition | Huber MSE | PABIM MSE | PABIM improvement vs Huber | Best fixed robust MSE | Best fixed control |
|---|---:|---:|---:|---:|---|
| `student_t2` | 0.069947 | 0.058970 | +15.69% | 0.036743 | `student_t_matched_alpha` |
| `student_t3` | 0.056110 | 0.050950 | +9.20% | 0.033453 | `student_t_matched_alpha` |
| `contaminated` | 0.053322 | 0.050485 | +5.32% | 0.034019 | `student_t_matched_alpha` |
| `spikes` | 0.046525 | 0.046197 | +0.70% | 0.031841 | `student_t_matched_alpha` |
| `burst` | 0.055188 | 0.091928 | -66.57% | 0.031453 | `student_t_matched_alpha` |

Across the five adverse conditions, PABIM mean MSE is **0.059706**, versus **0.033502** for the mean of the per-condition best fixed robust controls. This is far outside the frozen +5% guardrail.

### Persistent regime shift

| Method | Overall MSE | TWMSE25 | Recovery fraction | Median recovery steps | POST_MSE50PLUS |
|---|---:|---:|---:|---:|---:|
| Huber | 0.056618 | 0.246105 | 1.00 | 28.0 | 0.043614 |
| Confirmed-streak Huber | 0.052218 | 0.162633 | 1.00 | 18.5 | 0.044374 |
| PABIM | 0.056607 | 0.215731 | 1.00 | 24.0 | 0.045382 |

PABIM has lower `TWMSE25` than plain Huber, but it loses to confirmed-streak Huber on both the frozen transition-window metric and median recovery time. That directly falsifies the persistent-shift advancement gate.

## Invalid attempt 1 and repair lineage

Attempt 1 generated `raw.csv` and `summary.csv` but failed while JSON-serializing NumPy boolean values. It is retained as **invalid pre-completion evidence**. The only repair casts gate booleans to native Python `bool`; seeds, generators, methods, parameters, metrics, thresholds, and gate arithmetic are unchanged.

The repaired attempt reproduces attempt 1's scientific outputs byte-for-byte:

- raw CSV SHA-256: `5f1bfb8cfc8114583e0e55d491d2776522cc9d1e4451289ef260c502e27c501e` in both attempts;
- summary CSV SHA-256: `62355d6aa7eff081e3a940bae65a6ec71a55f789f9e48f398e1031439dc34c1b` in both attempts.

This supports the classification of the defect as reporting/plumbing only.

## Independent verification

`verify.py` recomputed the frozen criteria from retained `raw.csv`/`summary.csv`, confirmed **720 raw rows**, found **no overlap with reserved confirmatory seeds**, and reproduced the negative verdict. Independent verifier status: **PASS**.

## Uncertainty

Each method/condition summary uses `n=10` development seeds and retains sample standard deviation for MSE and `TWMSE25`. This is development evidence, not confirmatory significance testing. No significance claim is made.

## Limitations

- synthetic scalar state tracking only;
- no external temporal dataset;
- no GRU/LSTM/SSM comparator in this specific common harness;
- no confirmatory seeds;
- current PABIM mechanism was not designed anew for this harness;
- the fixed Student-t control is especially strong, so the result does not identify whether a different learned mechanism could beat it;
- novelty and submission readiness are not established.

## Scientific conclusion

The existing PABIM mechanism shows real localized robustness information but does **not** meet the pre-frozen development advancement gate once strong fixed robust controls and adaptation behavior are evaluated together. The correct next state is to **stop this mechanism line from confirmatory evaluation**, preserve the negative result, and only test a separately motivated successor under a new frozen protocol.
