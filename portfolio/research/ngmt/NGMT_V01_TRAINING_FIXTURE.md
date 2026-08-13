# NGMT v0.1 Training Fixture Freeze

**Committed before implementation or execution.**

This file closes remaining engineering degrees of freedom in the v0.1 protocol.

## Prediction windows

Each length-80 sequence contributes exactly four next-step examples at observation indices:

`[31, 47, 63, 78]`.

For anchor `t`, the Transformer receives exactly observations `x[t-15]..x[t]` (16 scalars), the online memory feature is the post-write read feature at `t`, and the target is `x[t+1]`.

Therefore per training seed:

- training examples = `640 × 4 = 2560`;
- validation examples = `160 × 4 = 640`;
- each held-out condition contributes `120 × 4 = 480` examples.

No other anchors or sliding-window expansion may be added after results are observed.

## Transformer engineering defaults

- input projection: `Linear(1, 24)`;
- positional representation: learned parameter of shape `(1, 16, 24)`;
- one `TransformerEncoderLayer`;
- `d_model=24`;
- `nhead=3`;
- feed-forward width `48`;
- activation `GELU`;
- dropout `0.0`;
- batch-first tensors;
- default post-norm Transformer encoder ordering (`norm_first=False`);
- memory projection: `Linear(2,24)`;
- combination: last causal Transformer state plus projected memory features;
- prediction head: `LayerNorm(24) -> Linear(24,24) -> GELU -> Linear(24,1)`;
- causal attention mask is upper-triangular `-inf` above the diagonal;
- no target leakage or future-token access.

## Initialization and batching

Within each training seed, instantiate one base model after seeding PyTorch with that training seed and copy its exact initial `state_dict` to B0, B1, B2 and B3.

For every epoch, all four arms use the same deterministic training-example permutation generated from seed:

`100000 + 1000 * training_seed + epoch`.

Batch size remains the protocol-frozen `64`; no dropping of the final batch.

Validation is descriptive only. It is not used for early stopping, hyperparameter selection or checkpoint selection in v0.1.

## Numerical handling

- all network tensors: float32;
- online memory feature generation: NumPy float64, cast to float32 when passed to the network;
- softmax responsibilities computed after subtracting the maximum log responsibility;
- variance/scale floor `1e-4` where specified;
- if any arm produces non-finite loss or metric, retain the failed run and mark that seed/arm divergent.
