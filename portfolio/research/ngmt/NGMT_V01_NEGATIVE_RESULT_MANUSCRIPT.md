# NGMT v0.1: A Frozen Negative Result for Student-t Online Memory in a Tiny Transformer

## Abstract

We evaluated whether an explicitly heavy-tailed Student-t online memory improves next-step
prediction over matched no-memory, kernel-memory, and Gaussian-mixture-memory arms in a tiny
causal Transformer. The development protocol, seeds, tasks, budgets, arithmetic, and advancement
thresholds were frozen before implementation and result observation. Across paired seeds
`[11,23,37]`, the Student-t arm improved the five-condition adverse aggregate over Gaussian
memory by `0.4946% ± 1.5472%` sample SD and over kernel memory by `0.4393% ± 1.1529%`, far below
the preregistered `5%` and `3%` requirements. Its clean-Gaussian regression relative to Gaussian
memory was `0.9600% ± 2.7060%`, within the allowed `2%` guardrail. All arms had 6,049 trainable
parameters; B1-B3 each had 18 online-memory scalars; no B3 seed diverged. The frozen verdict is
`NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`: the mechanism-advantage hypothesis is unsupported. This
synthetic three-seed study does not support significance, general Transformer or long-context
claims, real-data claims, or publication readiness.

## 1. Research question

Under equal trainable-network size and equal B1-B3 online-memory capacity, does Student-t mixture
memory improve held-out next-step MSE under heavy tails, multimodality, regime switching, outlier
bursts, and nonstationarity without materially degrading a clean Gaussian control?

NGMT v0.1 is distinct from the T2424-0025 weighted-median precursor. The precursor supplies no
positive evidence for this learned B0-B3 experiment.

## 2. Frozen protocol

Four pre-implementation commits froze the B0-B3 mechanisms, write-then-read ordering, prediction
anchors, Transformer defaults, batching, and paired-seed arithmetic. Implementation followed at
commit `540c471c329244363e18193b4ae982ffafc00b44`; the scientific degrees of freedom were not
changed after observing results.

All arms use a scalar-input causal Transformer with `d_model=24`, one encoder block, three
attention heads, feed-forward width 48, context length 16, an identical two-scalar memory-feature
projection, and an identical predictor head. The arm difference is the non-gradient online
memory rule:

- B0: no external memory, with zero memory features and the projection retained for parameter matching;
- B1: standard kernel/similarity memory;
- B2: Gaussian-mixture probabilistic memory;
- B3: Student-t mixture responsibilities with `nu=3` and bounded heavy-tail write influence.

B1-B3 use six slots storing location, dispersion, and mass: 18 scalar state values per sequence.
All four trainable networks contain exactly 6,049 parameters.

## 3. Data and evaluation

Sequences have length 80. Prediction anchors are exactly `[31,47,63,78]`, each using the trailing
16 observations and online memory through the current observation to predict the next scalar.
Training contains Gaussian AR, Student-t AR, two-mode switching, and regime-switching AR sequences.
Held-out evaluation retains six named conditions: `gaussian_clean`, `student_t`, `two_mode`,
`regime_switch`, `outlier_bursts`, and `nonstationary_mixture`.

Training seeds are exactly `[11,23,37]`; evaluation uses seed `10000 + training_seed`. Per seed,
there are 640 training sequences, 160 validation sequences, and 120 held-out sequences per
condition. Optimization uses AdamW, learning rate `3e-3`, weight decay `1e-4`, batch size 64, six
epochs, next-step MSE, float32 CPU execution, and no early stopping or post-result search.

The primary adverse aggregate is the unweighted within-seed mean MSE over the five non-clean
conditions. The clean condition may not be omitted. With three seeds, no statistical-significance
claim is permitted.

## 4. Results

Mean MSE ± sample SD across the three paired seeds:

| Condition | B0 | B1 | B2 | B3 |
|---|---:|---:|---:|---:|
| Gaussian clean | 0.139270 ± 0.014639 | **0.133579 ± 0.006401** | 0.135369 ± 0.006292 | 0.136770 ± 0.009683 |
| Student-t | 0.178662 ± 0.043983 | **0.171299 ± 0.050169** | 0.172032 ± 0.049209 | 0.175590 ± 0.047852 |
| Two-mode | 0.454422 ± 0.092348 | **0.450647 ± 0.080080** | 0.452293 ± 0.088570 | 0.451210 ± 0.087277 |
| Regime switch | 0.124937 ± 0.025668 | **0.117672 ± 0.017520** | 0.121314 ± 0.020073 | 0.120015 ± 0.020236 |
| Outlier bursts | 1.358840 ± 0.321930 | 1.348643 ± 0.303248 | 1.338377 ± 0.286483 | **1.334157 ± 0.313956** |
| Nonstationary mixture | 0.882721 ± 0.051553 | 0.881757 ± 0.043652 | 0.886406 ± 0.056120 | **0.878572 ± 0.050395** |

The approximate adverse-condition mean MSE values were B0 `0.599916`, B1 `0.594004`, B2
`0.594084`, and B3 `0.591909`. B3's small point advantage did not approach either frozen
advancement threshold.

| Frozen criterion | Observed | Required | Result |
|---|---:|---:|---|
| B3 relative improvement over B2 | 0.4946% | at least 5% | FAIL |
| B3 relative improvement over B1 | 0.4393% | at least 3% | FAIL |
| B3 clean regression versus B2 | 0.9600% | at most 2% | PASS |
| B3 divergent seeds | 0/3 | 0 | PASS |
| Trainable parameters | 6,049 each | identical | PASS |
| B1-B3 memory capacity | 18 scalars each | identical | PASS |

The paired effects were inconsistent: B3 was worse than B2 on seeds 11 and 23 and better on seed
37. Because two required scientific-effect gates failed, the conjunction failed regardless of
the execution and fairness controls.

## 5. Reproducibility and failure handling

The first attempted Actions run failed before scientific training because of Python 3.13 dynamic
test-loader plumbing. It is retained as `INVALID_EXECUTION_PLUMBING_FAILURE_PRE_SCIENTIFIC_RUN`;
it is not scientific evidence. Only the loader was fixed. The first valid run completed 12 arm/seed
trainings and retained the frozen negative verdict.

An unchanged-protocol replay reproduced all condition summaries, paired effects, criteria,
parameter counts, memory capacities, 12 training histories, and 12 checkpoint SHA-256 hashes.
Only runtime fields and consequently container-level JSON/ZIP hashes differed. This is
project-controlled replay evidence, not independent implementation replication.

## 6. Interpretation and limitations

The explicit Student-t memory executed without divergence and under matched budgets, but the
observed effects were too small and inconsistent to validate the proposed mechanism. The result
falsifies advancement under NGMT v0.1's frozen gate; it does not falsify all robust memories,
Transformers, probabilistic memory, or heavy-tail modeling.

Limitations include synthetic sequences, a tiny Transformer, only three paired seeds, fixed
online-memory hyperparameters, MSE/MAE next-step prediction, no natural-language or external
dataset, and no independent implementation replication. Mechanism-isolation ablations were
preregistered only after a positive gate and are not authorized as a rescue for this failure.

## 7. Conclusion

Under the frozen NGMT v0.1 development protocol, Student-t online memory did not deliver the
required adverse-condition advantage over standard or Gaussian memory. The defensible conclusion
is negative/inconclusive. No superiority, statistical significance, broad generalization,
external validation, novelty, or submission-readiness claim is supported.

The protocol, seeds, conditions, thresholds, negative verdict, and stop rules remain frozen. Any
successor requires a separately versioned preregistration.
