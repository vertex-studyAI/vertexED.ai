# T2424-0037 NeuroCAD — Held-out Linguistic Template Protocol v1

**Frozen before first execution of this benchmark.**

## Research question

Does the existing typed/validated controlled-language compiler preserve exact geometry and fail-closed behavior on held-out linguistic templates that were absent from the original 20-case benchmark, and does it outperform a direct flat-regex extraction baseline on the same fixed cases?

## Scope

This is a deterministic controlled-language robustness benchmark for the existing rectangular-plate compiler. It is **not** a claim about arbitrary natural-language CAD, learned models, general CAD generation, manufacturing validity, or a model-provider comparison.

The existing `src/core.mjs` method is frozen for this experiment. Do not alter its parser, safety envelope, target geometry, or accepted part family after seeing benchmark results.

## OOD definition

The benchmark uses fixed linguistic templates not present verbatim in `benchmark/prompts.json`, including combinations of:

- `of` after the part noun;
- explicit `mm` tokens around dimensions;
- `wide and` dimension phrasing;
- `dia` and `r` hole-size abbreviations;
- `of` in thickness/radius/diameter/inset phrases;
- case variation;
- multiplication-sign (`×`) dimension notation;
- invalid inputs that probe object class, hole count, safety envelope, missing parameters, and non-positive dimensions.

This is **template OOD within the declared rectangular-plate language**, not domain OOD to new part families.

## Fixed benchmark

Dataset: `benchmark/ood_prompts_v1.json`

- total cases: 20;
- valid target cases: 12;
- invalid/fail-closed cases: 8;
- no random seeds;
- no train/dev/test tuning because the compiler is deterministic and already frozen.

## Systems

### M1 — typed validated compiler

Existing `parsePlatePrompt` → typed rectangular-plate IR → safety/geometry validation → OpenSCAD generation.

### B0 — direct flat extraction baseline

`benchmark/direct_baseline.mjs` performs direct numeric field extraction and geometric layout without the method's typed validation/safety envelope. It is intentionally simple but executable and matched to the same prompt/target representation.

There is no external model provider in this package, so a same-provider LLM comparison is **not applicable** to this controlled deterministic benchmark. A model-based direct-generation baseline remains a later external-validation gate.

## Metrics

For each system report:

1. valid exact-geometry accuracy;
2. invalid-input rejection accuracy;
3. overall task success, where a valid case succeeds only on exact target geometry and an invalid case succeeds only if rejected;
4. accepted-invalid count;
5. valid failure taxonomy.

Primary effect:

`delta_overall = overall_success(M1) - overall_success(B0)`.

## Development gate

The existing method passes this bounded held-out-template gate only if all are true:

- valid exact-geometry accuracy ≥ 0.80;
- invalid-input rejection accuracy ≥ 0.80;
- `delta_overall ≥ 0.15` over B0.

Otherwise record `FAIL_HELD_OUT_TEMPLATE_GATE` and preserve the negative result. Do not change cases, thresholds, regexes, or metrics after observing the result.

This gate is descriptive and engineering-oriented. With 20 deterministic cases it does not support statistical-significance claims.

## Failure taxonomy

Use these labels where applicable:

- `OBJECT_CLASS_REJECTED`
- `DIMENSION_PARSE_FAILURE`
- `NON_POSITIVE_DIMENSION`
- `DIMENSION_SAFETY_LIMIT`
- `UNSUPPORTED_HOLE_COUNT`
- `MISSING_HOLE_SIZE`
- `HOLE_GEOMETRY_INVALID`
- `TARGET_MISMATCH`
- `UNEXPECTED_ACCEPT`
- `UNEXPECTED_REJECT`

## Artifact contract

The first execution must retain:

- repository commit SHA;
- this protocol file;
- benchmark JSON;
- raw per-case outputs for both systems;
- aggregate metrics;
- gate verdict;
- Node/runtime environment through GitHub Actions metadata;
- test result;
- uploaded artifact digest when available.

## Claim boundary

A PASS means only: the frozen deterministic rectangular-plate compiler generalized to this fixed held-out linguistic-template set and outperformed the direct flat-extraction baseline under the frozen metrics.

It does **not** establish:

- general NLP-to-CAD ability;
- OOD generalization to new geometry families;
- superiority to LLM/code-generation systems;
- real CAD-kernel execution unless separately measured;
- manufacturing correctness;
- research-paper novelty.
