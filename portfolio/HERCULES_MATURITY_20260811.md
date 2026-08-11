# Hercules — Evidence-Backed Maturity and H0 Gate — 11 August 2026

## Current verified maturity

**Classification: D — mostly design/specification / Concept.**

Connected evidence establishes a frozen Project 2424 identity for `T2424-0001 — Hercules Local AGI`, placed in the `D — Architecture → surrogate` track, plus portfolio planning references. The expected canonical package path is not present on connected current `main`; no canonical Hercules model source, tokenizer/data pipeline, training run, checkpoint, evaluation artifact, or released model is verified on this execution surface.

Therefore:

- implementation: **not verified**;
- tested: **not verified**;
- trained: **not verified**;
- evaluated: **not verified**;
- released: **no**.

Do not describe an 8–12B or other parameter-scale target as an existing model.

## Architecture decisions

### Retain

- local-first / consumer-hardware constraint;
- explicit memory, latency and throughput measurement;
- tiny controlled experiments before scaling;
- one architectural modification per ablation stage;
- checkpoint/reproduction requirements before any model claim.

### Defer until baseline evidence

- mesh/convolutional Transformer elements;
- JEPA-inspired prediction objectives;
- selective-predictor mechanisms;
- quantization beyond a simple post-baseline engineering measurement.

### Reject as current evidence

- combining several speculative modifications before isolated ablations;
- treating parameter-count targets as proof of implementation;
- calling a toy mechanism a trained Hercules release;
- using quantization alone as evidence that a new architecture works;
- escalating to Hermes/Olympus-scale training before Hercules has a reproducible H0/H1 comparison.

## Baseline ladder

### H0 — minimal runnable reference

Purpose: prove the model/data/train/eval/checkpoint plumbing, not architectural novelty.

Target constraints:

- causal Transformer/reference model;
- **≤10M parameters** for the first engineering gate;
- context length 128;
- deterministic seed `2424`;
- CPU/Mac-friendly tiny run;
- generated or clearly licensed tiny dataset only;
- one command for train and one command for evaluation;
- raw JSON metrics retained under a stable evidence path.

Suggested initial configuration (may be adjusted only before the protocol is frozen):

```yaml
seed: 2424
vocab_size: 4096
context_length: 128
d_model: 192
n_layers: 4
n_heads: 4
mlp_ratio: 4
dropout: 0.0
batch_size: 8
optimizer: adamw
learning_rate: 0.0003
precision: fp32
```

The exact parameter count must be reported by the implementation; do not infer it from the config in public copy.

### H1 — one Hercules modification

Only after H0 passes all engineering gates, introduce **one** modification with a frozen hypothesis. The preferred first research candidate is a bounded local-mixing/convolutional component replacing or augmenting a clearly identified reference sub-block because its cost/benefit can be measured directly against H0.

H1 must keep data, optimizer, training steps, parameter budget and evaluation protocol as matched as practical. If parameter count changes, report the difference and include a parameter-matched control.

### H2 — second isolated modification

Add a second idea only if H1 produces a reproducible gain on its predeclared metric without violating memory/latency guardrails. Test the second idea independently against H0 before combining it with H1.

### H3 — combined system

Combine H1 + H2 only after both have individual ablation evidence. A combined win without isolated evidence does not establish which mechanism helped.

## H0 mandatory tests

The first Hercules implementation is not considered **Tested** until all of these pass:

1. model instantiation with parameter count printed;
2. forward pass on one batch with finite logits/loss;
3. backward pass with finite gradients;
4. tiny overfit test on a fixed tiny dataset;
5. optimizer step changes at least one trainable parameter;
6. checkpoint save/load roundtrip;
7. loaded checkpoint reproduces logits within a declared numerical tolerance;
8. inference/generation smoke test;
9. deterministic same-seed repeat for the tiny gate;
10. fail-closed input/config validation for obvious invalid dimensions.

## H0 measured outputs

Retain machine-readable metrics for:

- parameter count;
- peak resident memory / peak accelerator memory where available;
- training tokens or examples per second;
- inference tokens per second;
- first-step and final tiny-run loss;
- tiny-overfit accuracy/perplexity or exact task metric;
- checkpoint size;
- median inference latency over a fixed prompt/input shape;
- hardware/OS/runtime versions.

## Executable first experiment contract

The next valid experiment is **H0 engineering validation**, not an 8–12B training run.

### Research/engineering question

Can the canonical Hercules code path instantiate, train, overfit, checkpoint and reload a small reference Transformer reproducibly on the available local hardware?

### Hypothesis

A ≤10M-parameter reference configuration will complete the full H0 gate on consumer hardware with finite loss/gradients, deterministic tiny-run behavior, successful checkpoint roundtrip and usable measured memory/latency.

### Data

Use a deterministic synthetic sequence task for the first plumbing gate (for example copy/next-token patterned sequences) or a tiny clearly licensed text corpus already present in the canonical source. Synthetic H0 data must never be represented as language-model quality evidence.

### Primary pass/fail metric

All ten H0 mandatory tests pass and the tiny overfit reaches its frozen target.

### Guardrails

- peak memory must fit the declared local hardware budget;
- no NaN/Inf loss or gradients;
- checkpoint roundtrip must pass;
- same-seed rerun must reproduce the frozen tiny metrics within tolerance.

### Output paths

The canonical source should retain something equivalent to:

```text
hercules/
  configs/h0.yaml
  src/
  tests/
  scripts/train.py
  scripts/eval.py
  evidence/h0/<run-id>/metrics.json
  evidence/h0/<run-id>/environment.json
  evidence/h0/<run-id>/checkpoint/
```

Exact paths should follow the recovered repository rather than creating a second competing Hercules tree in the portfolio control repository.

## Why H0 was not executed in this session

The connected control repository does not expose a canonical Hercules implementation package to run. Creating a new model implementation here would invent a second source of truth and would not satisfy the requirement to inspect/repair the actual Hercules project. The correct action is to recover/connect canonical source first, then execute H0 there.

## Evidence required before public model claims

Before saying **“Hercules model exists”**:

- canonical source repository/path;
- pinned environment/config;
- model instantiation and test evidence;
- real checkpoint produced by that source;
- training-data provenance and license;
- reproducible training/evaluation commands;
- measured parameter/memory/latency/throughput values;
- baseline comparison and retained raw metrics.

Before saying **“Hercules architecture improves X”**:

- matched H0/H1 protocol;
- predeclared primary metric and failure threshold;
- isolated ablation;
- multiple seeds where stochastic training matters;
- uncertainty/error bars where appropriate;
- independent reproduction or QA of raw evidence.

Before saying **“Hercules is released”**:

- downloadable/accessible model artifact;
- immutable version/checksum;
- model card with limits and intended use;
- license and training-data disclosure appropriate to the artifact;
- inference command tested from a clean environment;
- evaluation table tied to the released checksum.

## Relationship to Olympus

Hercules should be the empirical prerequisite for Olympus, not a parallel speculative scale line. Olympus O0/O1 work may reuse only mechanisms that survive Hercules-style small controlled ablations. No Hermes or larger Olympus training should be scheduled because of a name or target parameter count; scaling requires a demonstrated small-model effect plus explicit compute/resource justification.
