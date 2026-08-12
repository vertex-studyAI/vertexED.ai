# Hercules — evidence-backed maturity and H0 gate

**Evidence cutoff:** 12 August 2026

## Current maturity

Hercules is a model-architecture research line, but the current connected execution surface does not establish a canonical Hercules training package, checkpoint, tokenizer/data pipeline, completed training run, evaluation artifact or released weight set.

Therefore do not describe the proposed 8–12B target, Mesh Convolution Transformer, JEPA/selective-predictor ideas or local-AGI label as an existing trained model.

## Architecture policy

### Retain

- local-first / consumer-hardware constraint;
- explicit RAM, latency and throughput measurement;
- tiny controlled baselines before scaling;
- one architectural modification per ablation stage;
- checkpoint and reproduction gates before model claims.

### Defer until baseline evidence

- mesh/convolutional Transformer changes;
- JEPA-inspired predictor objectives;
- selective prediction;
- aggressive quantization beyond post-baseline engineering measurement.

### Reject as evidence

- combining speculative mechanisms before isolated ablations;
- parameter-count targets as proof of implementation;
- a toy mechanism described as a Hercules release;
- quantization alone as proof of architectural value;
- Olympus-scale training before Hercules has a reproducible small baseline.

## Maturity ladder

### H0 — minimal runnable reference

Purpose: prove model/data/train/eval/checkpoint plumbing, not novelty.

Freeze a CPU/Mac-friendly causal reference model with:

- **≤10M parameters**;
- context length 128;
- deterministic seed `2424`;
- tiny generated or clearly licensed dataset;
- one train command;
- one evaluation command;
- raw JSON evidence retained under a stable path.

A reasonable pre-freeze starting configuration is `d_model=192`, 4 layers, 4 heads, MLP ratio 4, batch size 8, AdamW, learning rate `3e-4`, fp32. The implementation must report the exact parameter count.

### H1 — one Hercules modification

Only after H0 passes, add **one** bounded mechanism with a frozen hypothesis. Prefer a clearly isolated local-mixing/convolutional component because memory, throughput and loss can be compared directly against H0.

Keep data, optimizer, training steps, parameter budget and evaluation protocol matched. If parameter count differs, report it and add a parameter-matched control.

### H2 — second isolated modification

Add a second idea only after H1 produces a reproducible predeclared gain without breaking memory/latency guardrails. Test H2 independently against H0 before combining it.

### H3 — combined system

Combine H1 + H2 only after both have isolated evidence. A combined win without ablation does not establish mechanism value.

## H0 mandatory tests

Hercules is not `TESTED` until all ten pass:

1. instantiate model and print exact parameter count;
2. finite forward loss/logits;
3. finite backward gradients;
4. overfit a fixed tiny dataset;
5. optimizer step changes parameters;
6. checkpoint save/load roundtrip;
7. loaded checkpoint reproduces logits within frozen tolerance;
8. inference/generation smoke;
9. deterministic same-seed repeat;
10. fail-closed invalid-config/input checks.

## Retained outputs

Record:

- parameter count;
- peak memory;
- training throughput;
- inference throughput;
- first/final loss;
- tiny-overfit metric;
- checkpoint size;
- median fixed-shape inference latency;
- hardware, OS and runtime versions.

## First executable experiment

**Question:** can the canonical Hercules path instantiate, train, overfit, checkpoint and reload a small reference Transformer reproducibly on consumer hardware?

**Primary gate:** all ten H0 tests pass and the tiny overfit reaches a frozen target without NaN/Inf, while remaining within the declared hardware budget.

Synthetic H0 data is plumbing evidence only and must not be represented as language-model capability.

## Source-of-truth blocker

Do not invent a second Hercules implementation inside the portfolio control repository merely to claim progress. Recover or expose the canonical Hercules source first, then execute H0 there. A trained-model claim requires canonical source, pinned config/environment, checkpoint, data provenance, reproducible commands and measured model/runtime metrics.

## Relationship to Olympus

Hercules is the empirical model-architecture prerequisite; Olympus is the research-runtime/control-plane line. No larger Olympus model-scale experiment should be scheduled until a small learned mechanism survives Hercules-style matched baselines and ablations.
