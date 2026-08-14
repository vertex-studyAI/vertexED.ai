# NeuroCAD Component Ablation v2 — Result

**Date:** 2026-08-14  
**Frozen source/protocol commit:** `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`  
**Workflow:** `31777954088` — SUCCESS  
**Artifact:** `9210587354`  
**Artifact SHA-256:** `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`

## Question

How much of NeuroCAD's current advantage over the original direct flat extractor on the existing 20-case plate diagnostic is explained by adding a matched fail-closed validation layer, rather than by the parser/typed path itself?

The protocol and interpretation thresholds were committed before first execution. The 20 cases are explicitly **reused component-diagnostic cases**, not a new unseen/OOD set.

## Systems and retained result

| System | Valid exact geometry | Invalid rejection | Overall success | Accepted invalid |
|---|---:|---:|---:|---:|
| Current typed + validated compiler (M2) | 1.00 | 1.00 | **1.00** | 0 |
| Original direct flat extraction (B0) | 1.00 | 0.00 | **0.60** | 8 |
| Direct extraction + matched fail-closed validation (B1) | 1.00 | 1.00 | **1.00** | 0 |

Derived diagnostics:

- `original_gap = 0.40`
- `remaining_gap = 0.00`
- `validation_recovery_fraction = 1.00`
- frozen interpretation: **`VALIDATION_DOMINANT`**

Environment retained by the workflow: Node `v22.23.1`, npm `10.9.8`, Ubuntu/Azure Linux kernel `6.17.0-1020-azure`. Contract test: `1/1 PASS`.

## Scientific interpretation

The frozen component diagnostic **falsifies the claim that the current performance gap on these 20 cases specifically demonstrates a typed-IR/parser causal advantage**. A direct extractor equipped with matched fail-closed validation recovered 100% of the B0→M2 gap and matched the current compiler exactly on the diagnostic.

This is a useful negative/mechanism result. It narrows the supported contribution to engineering reliability from explicit validation under the tested grammar rather than a demonstrated typed-representation research mechanism.

## What remains true

The historical frozen v1 result remains unchanged and retained: `19/20` for the then-frozen typed/validated compiler versus `12/20` for the original direct baseline, with the negative-width `O018` failure preserved, and `12/12` valid cases producing non-empty STL. A later versioned safety repair changed the current implementation; this v2 diagnostic does not rewrite v1 history.

## Non-claims

This result does **not** establish:

- general text-to-CAD capability;
- new-part-family OOD generalization;
- superiority to LLM/CAD-program generators;
- novelty of typed IR or validation;
- manufacturing correctness;
- a publication-ready CAD mechanism.

## Next gate

Do **not** tune parser/validator variants on these same 20 cases to rescue the typed-IR story. If NeuroCAD receives further scientific compute, freeze a new benchmark with broader part families/compositional prompts and a competent contemporary direct/program-generation baseline under the same backend and execution/semantic criteria. The product/software line may continue independently of that research gate.
