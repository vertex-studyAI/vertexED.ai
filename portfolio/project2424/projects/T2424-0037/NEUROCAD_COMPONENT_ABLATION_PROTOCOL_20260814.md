# NeuroCAD Component Ablation Diagnostic v2

**Frozen:** 2026-08-14 before first execution of this diagnostic.  
**Status:** deterministic mechanism diagnostic; **not** the learned/direct dangerous-baseline experiment and **not** a replacement for frozen v1 evidence.

## Question

How much of the current NeuroCAD advantage over the original direct flat-extraction baseline is explained by adding an explicit fail-closed safety/geometry validation layer, rather than by the typed/parser path itself?

## Why this is needed

The frozen v1 held-out benchmark compared the typed/validated compiler with a deliberately weak direct extractor. Contemporary text-to-CAD work and the reviewer attack make that comparison insufficient for a broad mechanism claim. Before spending external model budget, this cheap deterministic ablation tests one obvious confound: **validation alone may explain most of the observed gain.**

## Evidence boundary

- The original v1 result remains immutable: 19/20 versus 12/20, including retained case `O018` negative-width failure.
- Current `main` contains a separately versioned post-result negative-number safety repair. This diagnostic evaluates the **current implementation** and does not rewrite v1.
- The same fixed `benchmark/ood_prompts_v1.json` cases are reused only as a **component diagnostic**. They are no longer treated as unseen data for the current implementation.
- No statistical-significance claim is authorized; the benchmark is 20 deterministic cases.

## Systems

### M2 — current typed/validated compiler

Current `parsePlatePrompt` on `main`, including the post-v1 negative-number repair, followed by existing OpenSCAD generation checks.

### B0 — original direct flat extraction

Existing `directFlatParse`, with no object whitelist or matched safety/geometry validation.

### B1 — direct extraction + matched fail-closed validation

`validatedDirectParse` first uses the same direct flat extractor, then applies a separately implemented fail-closed validation layer covering:

- supported object class;
- finite positive width, height and thickness;
- planar/thickness safety limits;
- allowed hole counts `0,1,2,4`;
- required positive hole radius when holes exist;
- hole count consistency;
- hole radius versus part dimensions;
- hole centers staying inside the part with radius clearance.

B1 intentionally does **not** call `parsePlatePrompt` and does not inherit its dimension/template regex. It is designed to ask whether the weak B0 result was mostly a missing-validation artifact.

## Dataset

Exactly `benchmark/ood_prompts_v1.json`:

- 20 total;
- 12 valid;
- 8 invalid;
- no random seeds.

The dataset file is not changed for this diagnostic.

## Metrics

For each system:

1. valid exact-geometry accuracy;
2. invalid-input rejection accuracy;
3. overall success;
4. accepted-invalid count;
5. valid-failure count.

Derived diagnostics:

`original_gap = overall(M2) - overall(B0)`

`remaining_gap = overall(M2) - overall(B1)`

`validation_recovery_fraction = (overall(B1) - overall(B0)) / original_gap`

If `original_gap <= 0`, report the recovery fraction as not applicable and do not infer a mechanism.

## Frozen interpretation

This diagnostic does not create a superiority claim. It classifies the confound as follows:

- **VALIDATION_DOMINANT** if `validation_recovery_fraction >= 0.80` **and** `remaining_gap <= 0.05`.
- **PARSER_OR_TYPED_PATH_REMAINS_MATERIAL** if `validation_recovery_fraction <= 0.20` **and** `remaining_gap >= 0.15`.
- **MIXED_OR_UNRESOLVED** otherwise.

### Falsifier

A claim that the current v1 advantage specifically demonstrates a typed-IR/parser mechanism is **falsified for this benchmark** if the outcome is `VALIDATION_DOMINANT`. The software can still be useful; the broad mechanism claim must be removed.

A `PARSER_OR_TYPED_PATH_REMAINS_MATERIAL` outcome still does **not** establish typed-IR novelty. It only shows that matched validation did not explain most of this small benchmark gap.

## Verification

The first run must retain:

- Git commit SHA;
- this frozen protocol;
- unchanged benchmark JSON identity;
- raw per-case outputs for M2/B0/B1;
- aggregate metrics and derived gaps;
- interpretation label;
- Node/npm/kernel environment;
- independent contract test output;
- GitHub artifact ID/digest when available.

## Stop rule

Do not edit thresholds, cases, baseline validation rules, or interpretation after the first output. Any repair discovered by this run becomes a new version. Do not use this component diagnostic as a substitute for the still-required contemporary model-based direct/program-generation baseline and broader OOD evaluation.
