# NGMT v0.1 — Frozen B0–B3 Development Protocol

**Protocol freeze date:** 13 August 2026  
**Protocol status:** FROZEN BEFORE IMPLEMENTATION OR RESULT OBSERVATION  
**Relationship to T2424-0025:** new learned sequence experiment; T2424-0025 is precursor evidence only and contributes no positive result to this protocol.

## Research question

Under equal trainable-network size and equal B1–B3 online-memory state capacity, does an explicitly heavy-tailed non-Gaussian external memory improve next-step sequence prediction under heavy tails, multimodality and regime switching relative to no external memory, standard kernel memory and Gaussian probabilistic memory without materially degrading a clean Gaussian control?

## Hypothesis

A Student-t mixture memory will be less dominated by extreme observations than Gaussian responsibility/update rules while retaining multimodal state, producing lower held-out prediction MSE in heavy-tailed and regime-switching conditions.

This is a falsifiable hypothesis, not an existing result.

## Shared learned model

All four arms use the same tiny causal sequence backbone and predictor:

- scalar input projected to `d_model = 24`;
- learned positional embedding;
- one causal Transformer encoder block;
- `3` attention heads;
- feed-forward width `48`;
- context window `16` tokens;
- shared memory-feature projection accepting exactly two scalar memory features (`location`, `dispersion`);
- final MLP predicts the next scalar.

For **B0**, the two memory features are fixed zeros. The memory-feature projection remains instantiated and trainable so B0–B3 have the same gradient-active parameter count. B1–B3 differ only in the non-gradient online memory state/read/write rule.

No arm receives a larger Transformer, longer context, extra learned projection, extra optimizer steps or extra training examples.

## Online memory state

B1–B3 each use `K = 6` slots. Every slot stores exactly three scalar runtime values:

`(location μ_k, dispersion v_k, mass n_k)`.

Runtime memory state is reset at the beginning of every sequence and is not a learned parameter. B1–B3 therefore have equal slot count and equal scalar state capacity (`18` scalars).

Initial state for every slot:

- `μ_k = 0`;
- `v_k = 1`;
- `n_k = 1e-3`.

The first `K` observations deterministically seed slot locations in order; subsequent observations use the arm-specific responsibilities below. No result-dependent reinitialization is allowed.

## B0 — no external memory

- memory read: `(0, 0)`;
- no online memory state is used for prediction;
- the shared memory projection remains present for parameter matching.

## B1 — standard kernel memory

For query/observation `x`, responsibilities are

`r_k ∝ exp(-(x - μ_k)^2 / (2 τ^2))`, with fixed `τ = 1.0`.

Read:

- location feature `m = Σ r_k μ_k`;
- dispersion feature `d = sqrt(Σ r_k max(v_k, 1e-6))`.

Write with fixed online step `α_k = min(0.25, r_k / (n_k + r_k + 1e-6))`:

- `μ_k ← μ_k + α_k (x - μ_k)`;
- `v_k ← (1-α_k) v_k + α_k (x - μ_k)^2`;
- `n_k ← n_k + r_k`.

This is the ordinary similarity-memory reference.

## B2 — Gaussian probabilistic memory

Responsibilities use a diagonal one-dimensional Gaussian mixture:

`r_k ∝ n_k * Normal(x | μ_k, v_k + ε)`, `ε = 1e-4`.

Read uses the same two features as B1:

- `m = Σ r_k μ_k`;
- `d = sqrt(Σ r_k max(v_k, ε))`.

Write uses the same bounded step expression as B1 and ordinary moment residuals:

- `μ_k ← μ_k + α_k (x - μ_k)`;
- `v_k ← (1-α_k) v_k + α_k (x - μ_k)^2`;
- `n_k ← n_k + r_k`.

## B3 — proposed non-Gaussian memory

B3 is a mixture of Student-t components with fixed degrees of freedom `ν = 3`.

Responsibilities:

`r_k ∝ n_k * StudentT_ν(x | μ_k, s_k^2 = v_k + ε)`.

For standardized squared residual

`δ_k^2 = (x - μ_k)^2 / (v_k + ε)`, define robust influence

`w_k = (ν + 1) / (ν + δ_k^2)`.

Read uses exactly the same two output dimensions:

- `m = Σ r_k μ_k`;
- `d = sqrt(Σ r_k max(v_k, ε))`.

Write uses the same bounded base step but multiplies the location/dispersion update by `w_k`:

- `β_k = α_k w_k`;
- `μ_k ← μ_k + β_k (x - μ_k)`;
- `v_k ← (1-β_k) v_k + β_k (x - μ_k)^2`;
- `n_k ← n_k + r_k`.

The operationally non-Gaussian property is therefore explicit: Student-t mixture responsibilities plus bounded heavy-tail influence in the online write rule. This is not a median/trimmed-mean relabeling.

## Synthetic sequence tasks

Each sequence has length `80`. The Transformer predicts `x[t+1]` from the trailing context ending at `t`, while online memory has observed the full prefix through `t`.

Training mixtures use equal numbers from four regimes:

1. **Gaussian AR:** `x_t = 0.75 x_{t-1} + ε_t`, `ε ~ N(0, 0.35^2)`.
2. **Student-t AR:** same dynamics, `ε = 0.20 * t_ν`, `ν = 2.5`.
3. **Two-mode switching:** latent mean switches between `-1.5` and `+1.5` with probability `0.04`; observation noise `N(0, 0.25^2)`.
4. **Regime-switch AR:** AR coefficient switches between `0.85` and `-0.45` with probability `0.035`; noise `N(0, 0.25^2)`.

Held-out evaluation contains six named conditions:

- `gaussian_clean`;
- `student_t`;
- `two_mode`;
- `regime_switch`;
- `outlier_bursts`: Gaussian AR with probability `0.06` additive `N(0, 4^2)` shocks;
- `nonstationary_mixture`: two-mode process whose switch probability changes halfway from `0.01` to `0.12`.

No condition may be removed or renamed after results are observed.

## Data and seeds

Development study only.

Training seeds: exactly `[11, 23, 37]`.

For each training seed:

- 640 training sequences total (`160` per training regime);
- 160 validation sequences total (`40` per training regime);
- 120 held-out sequences per evaluation condition;
- evaluation RNG seed = `10000 + training_seed`.

Data are generated algorithmically by the committed runner. All arms under a given training seed receive byte-identical generated arrays and ordering.

## Training protocol

- optimizer: AdamW;
- learning rate: `3e-3`;
- weight decay: `1e-4`;
- batch size: `64` prediction windows;
- epochs: `6`;
- gradient clipping: global norm `1.0`;
- loss: next-step MSE;
- device: CPU for the first canonical run;
- dtype: float32;
- deterministic seeds set for Python, NumPy and PyTorch where applicable;
- no early stopping;
- no hyperparameter search after observing this protocol's results.

Each arm is initialized from the same trainable parameter state within a training seed before optimization starts.

## Primary metrics

Per evaluation condition and seed:

- next-step MSE;
- next-step MAE;
- sample count;
- trainable parameter count;
- runtime;
- failed/divergent run status.

Aggregate across the three paired seeds with mean, sample SD and `n=3`.

Primary adverse-condition aggregate is the unweighted mean MSE across:

`student_t`, `two_mode`, `regime_switch`, `outlier_bursts`, `nonstationary_mixture`.

`gaussian_clean` is the clean-control metric and must not be omitted.

With only three seeds, this study must not claim statistical significance. Paired bootstrap intervals may be reported descriptively but are not a significance claim.

## Frozen advancement rule

B3 passes the v0.1 development gate only if **all** are true:

1. mean paired relative MSE improvement of B3 over B2 on the adverse-condition aggregate is at least `5%`;
2. B3 also beats B1 on the adverse-condition aggregate by at least `3%`;
3. B3 does not regress against B2 on `gaussian_clean` by more than `2%` relative MSE;
4. no B3 seed fails/diverges;
5. B1/B2/B3 use equal runtime memory capacity and all four arms have identical trainable parameter counts.

Otherwise the verdict is `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

The gate may not be changed after results are observed.

## Required ablation if B3 passes

A positive development gate is not sufficient for a mechanism claim. Before promotion, run a separately frozen ablation that replaces Student-t responsibilities with Gaussian responsibilities while retaining the B3 robust influence update, and another that keeps Student-t responsibilities but removes robust influence. If the effect does not localize, report the mechanism as unresolved.

## Evidence contract

First execution must retain:

- protocol commit SHA and source execution SHA;
- exact command;
- Python/package versions;
- CPU/device/dtype;
- parameter count for every arm;
- data-generation configuration and seeds;
- per-seed/per-condition raw metrics;
- aggregate mean/sample SD/n;
- wall-clock runtime per arm/seed;
- stdout/stderr;
- machine-readable verdict;
- artifact SHA-256 manifest.

If an implementation bug invalidates the first run, preserve that run, document the bug, fix in a new commit and rerun under a new evidence ID. Do not overwrite the old result.

## Claim boundary

Even a PASS is only evidence for this tiny synthetic development task. It is not evidence of general Transformer superiority, language-model memory improvement, long-context superiority, AGI, real-data performance, or publication readiness.
