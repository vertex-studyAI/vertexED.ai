# T2424-0037 NeuroCAD — Learned Direct-vs-Typed-IR Protocol v2

**Protocol ID:** `NEUROCAD-EXP-001 / learned-direct-vs-ir-v2`  
**Protocol state:** `FROZEN_BEFORE_OUTCOME_EXECUTION`  
**Frozen:** 2026-08-14  
**Parent result:** held-out template v1 remains immutable and is not rerun or retuned by this protocol.  
**Outcome:** `[EXPERIMENT NOT YET RUN]`

## Scientific question

When the **same frozen code language model** receives the **same natural-language CAD request**, does forcing it to emit a small typed intermediate representation that is validated and deterministically compiled improve executable-and-semantically-correct CAD generation relative to asking the model to emit OpenSCAD directly?

This experiment is designed to test the value of the **typed/validated IR boundary**, not to test whether one language model is better than another.

## Hypothesis

For the fixed benchmark and model below, the typed-IR arm will have a higher paired **end-to-end task success rate** than direct OpenSCAD generation because schema restriction and deterministic validation prevent syntax failures, unsafe/unsupported acceptance, and some geometric inconsistencies.

## Falsifier

The scientific superiority hypothesis is falsified for v2 if either condition holds:

1. the typed-IR arm does not exceed the direct-generation arm by the frozen minimum practical effect on the primary metric; or
2. the typed-IR advantage is explained entirely by a looser invalid-input rejection rule, while valid executable semantic accuracy does not improve.

If falsified, preserve the result and retain NeuroCAD as useful controlled software if applicable. Do **not** alter prompts, thresholds, model, decoding, validator, or scoring and rerun v2 as a rescue.

## Frozen model

Both learned arms use exactly the same model weights and inference engine:

- model repository: `Qwen/Qwen2.5-Coder-7B-Instruct-GGUF`;
- repository revision: `13fb94bfda8c8cf22497dc57b78f391a9acb426a`;
- quantization: `Q4_K_M`;
- shard 1 SHA-256: `89f120544682078148c5a86117de9af3a65c339111262f2d3ff01d80d48b14be`;
- shard 2 SHA-256: `0183b3c850cfa96c31082c3af0123115300d3f62798c4448fa8f57bd0eac05e0`;
- license reported by the model repository: Apache-2.0.

Why this model: it is an open, locally runnable code-oriented 7B model with a reproducible GGUF path. This protocol does **not** call it the strongest current coding model. Stronger proprietary or larger-model replication is an external/generalization gate, not part of the internal v2 claim.

### Inference engine freeze

Before the first model output is generated, record and hash the exact `llama.cpp` executable/version used. **Execution is prohibited if the engine version and model shard hashes are not recorded.** The engine version is an environment identity, not a tunable experimental factor.

## Benchmark

Dataset: `benchmark/learned_direct_vs_ir_v2.json`.

Frozen composition:

- 48 total requests;
- 32 valid rectangular-plate requests;
- 16 invalid/unsupported requests;
- fixed case IDs and targets;
- no prompt editing after the first model output is observed.

The valid cases vary paraphrase, units wording, compositional phrasing, hole counts, radius/diameter wording, and dimensions. Invalid cases cover unsupported object classes, non-positive/safety-limit dimensions, unsupported hole counts, missing hole size, invalid inset/radius relations, missing dimensions, unsupported units, and contradictory requests.

This remains a **bounded rectangular-plate benchmark**. It is not general CAD or arbitrary part-family OOD.

## Arms

### M1 — same-model typed IR + frozen validator/compiler

The model must return exactly one JSON object matching this schema:

```json
{
  "decision": "ACCEPT|REJECT",
  "type": "rectangular_plate",
  "units": "mm",
  "width": 0.0,
  "height": 0.0,
  "thickness": 0.0,
  "hole_count": 0,
  "hole_radius": 0.0,
  "inset": 0.0
}
```

For `REJECT`, geometry fields may be omitted and no CAD is generated. For `ACCEPT`, a deterministic v2 validator must enforce the same safety semantics as the frozen project core:

- finite positive width, height and thickness;
- width/height `<= 2000 mm`, thickness `<= 200 mm`;
- hole count only in `{0,1,2,4}`;
- positive radius when holes exist;
- radius `< min(width,height)/2`;
- inset `> radius` and `< width/2` and `< height/2` when holes exist;
- only `rectangular_plate` and `mm` are accepted.

Validated fields are converted to the existing deterministic hole layout and `toOpenScad` path. The validator/compiler cannot call the model a second time or repair model output.

### B1 — same-model direct OpenSCAD generation

The model must return either:

- exactly `REJECT` for an invalid/unsupported request; or
- one OpenSCAD program for a valid request.

The direct arm receives the same user request, one call, the same context budget, same decoding settings, and the same statement of the allowed rectangular-plate/safety envelope. It does **not** receive the target geometry or the IR schema.

No post-generation repair, retry, code execution feedback, syntax correction, hidden example, or human intervention is allowed.

### B0 — deterministic flat-extraction baseline

The existing v1 `benchmark/direct_baseline.mjs` result remains a historical engineering control. It is **not** the primary learned comparator for v2 and must not be substituted for B1 if B1 performs strongly.

## Prompt matching

Both learned arms use a common system preamble describing:

- millimetres as the only accepted unit;
- rectangular plates only;
- maximum dimensions/thickness;
- allowed hole counts `{0,1,2,4}`;
- obligation to reject unsupported/unsafe/contradictory requests.

Only the output contract differs:

- M1: JSON typed-IR contract;
- B1: direct OpenSCAD-or-`REJECT` contract.

The user message containing the CAD request is byte-identical between arms.

Prompt templates must be committed and hashed before first execution. Any material prompt change creates v3 rather than modifying v2.

## Decoding budget

Primary comparison uses deterministic decoding:

- temperature: `0`;
- one generation per case per arm;
- maximum generated tokens: `384` for both arms;
- context limit: identical for both arms;
- no tools, retrieval, execution feedback, hidden chain-of-thought request, or second call;
- no arm-specific few-shot examples.

Because deterministic decoding does not yield a training-seed distribution, the primary uncertainty is across paired benchmark cases, not pseudo-seeds.

A future stochastic robustness study must be separately preregistered; it is not authorized as a way to rescue this result.

## Scoring

### Valid request success

A valid case succeeds only if **all** are true:

1. the system accepts the request;
2. generated OpenSCAD parses and executes in the frozen OpenSCAD backend;
3. a non-empty STL is produced;
4. normalized width, height, thickness, hole count, hole radius and layout match the frozen target within numerical tolerance;
5. no extra geometry outside the requested plate/hole construction is present.

Target numerical tolerance for scalar dimensions/radii: absolute error `<= 1e-6 mm` after normalization. The deterministic M1 compiler should therefore be exact if the model emitted the correct IR.

### Invalid request success

An invalid case succeeds only if the arm rejects before producing an accepted CAD artifact.

- M1 succeeds if model returns `REJECT` **or** the frozen validator rejects an unsafe/unsupported `ACCEPT` object.
- B1 succeeds only if the model returns exactly `REJECT`.

This asymmetry is intentional and is part of the mechanism being tested: whether a typed validation boundary catches unsafe model behavior. It is therefore separately decomposed below so it cannot hide valid-case regressions.

## Primary metric

`end_to_end_success = successful_cases / 48`.

Primary paired effect:

`delta_primary = end_to_end_success(M1) - end_to_end_success(B1)`.

### Frozen advancement criterion

The v2 typed-IR superiority claim advances only if **both** are true:

1. `delta_primary >= 0.10` (at least 10 percentage points on 48 fixed cases); and
2. valid-case executable semantic success for M1 is **not lower** than B1.

No p-value threshold is required. Report the paired effect with a paired bootstrap 95% interval over the 48 fixed cases and the exact discordant-case counts. The interval is descriptive because the benchmark is a fixed designed set, not a random sample from a formally defined population.

A result below the 10-point practical-effect gate is recorded as `NO_DECISIVE_IR_ADVANTAGE_V2`, even if a post-hoc significance test would be favorable.

## Secondary metrics

Report separately, without redefining the primary outcome:

- valid executable semantic success;
- invalid rejection/safety success;
- OpenSCAD parse success;
- non-empty STL success;
- exact/normalized geometry-field accuracy;
- hole-layout accuracy;
- false accept count on invalid cases;
- false reject count on valid cases;
- output-token count;
- wall-clock generation time;
- CAD execution time;
- failures by benchmark stratum.

## Required error taxonomy

At minimum:

- `MODEL_FALSE_REJECT`
- `MODEL_FALSE_ACCEPT`
- `OUTPUT_FORMAT_INVALID`
- `JSON_SCHEMA_INVALID`
- `VALIDATOR_REJECTED_UNSAFE`
- `OPENSCAD_PARSE_FAILURE`
- `OPENSCAD_EXECUTION_FAILURE`
- `EMPTY_STL`
- `DIMENSION_MISMATCH`
- `THICKNESS_MISMATCH`
- `HOLE_COUNT_MISMATCH`
- `HOLE_SIZE_MISMATCH`
- `HOLE_LAYOUT_MISMATCH`
- `EXTRA_GEOMETRY`
- `UNSUPPORTED_OBJECT_ACCEPTED`
- `CONTRADICTORY_REQUEST_ACCEPTED`

## Mechanism ablation

If M1 passes the primary gate, one predeclared ablation is required before a mechanism claim:

### M1-no-validation

Use the exact same model outputs produced for M1. Do **not** regenerate them. Bypass semantic safety rejection and attempt compilation only when the JSON is syntactically parseable and structurally sufficient.

Purpose: estimate how much of M1's advantage comes from the validation boundary rather than from structured generation alone.

If bypassing validation does not materially change failures, do not claim validation is the causal contributor.

## Artifact/provenance contract

The first execution must retain:

- Git commit SHA;
- this protocol and its SHA-256;
- benchmark JSON and SHA-256;
- exact system/user prompt bytes and hashes;
- model repo/revision, quantization and weight hashes;
- `llama.cpp` version/binary hash;
- OpenSCAD version;
- machine/OS information;
- raw model text for every arm/case;
- parsed IR/direct code outputs;
- validator decisions;
- generated `.scad` and `.stl` artifacts where applicable;
- raw per-case metric JSON;
- aggregate table;
- paired-bootstrap script/output;
- failure taxonomy;
- total runtime/token counts;
- exact reproduction commands.

Every manuscript number must trace:

`claim -> table/figure -> processed metrics -> per-case record -> raw model output -> prompt/model/config -> code commit`.

## Stop rules

- Do not modify v1 or this v2 protocol after observing v2 outputs.
- If model weights/hashes cannot be reproduced, block execution.
- If prompt hashes differ across reruns, do not combine results.
- If the learned direct arm cannot be run, v2 remains **BLOCKED**, not positive by comparison with the old regex baseline.
- If M1 misses the frozen advancement criterion, close the superiority hypothesis as negative/inconclusive for v2; do not tune the prompt against these 48 cases.
- Any new part-family, stronger model, prompt strategy, retry/repair loop or CAD representation is v3+ with a new protocol.

## Claim boundary if PASS

A PASS supports only:

> On this fixed 48-case bounded rectangular-plate benchmark, using the same frozen Qwen2.5-Coder-7B-Instruct model, a typed/validated IR boundary improved end-to-end executable semantic task success over direct one-shot OpenSCAD generation by at least the preregistered practical-effect threshold, without reducing valid-case executable semantic success.

It does **not** establish general NLP-to-CAD superiority, arbitrary CAD generation, manufacturing validity, superiority to stronger proprietary/larger models, or a novel general program-synthesis mechanism.

## Claim boundary if FAIL

A FAIL is retained as evidence that, under the frozen model/benchmark/budget, the typed IR boundary did not provide a decisive end-to-end advantage. Software usefulness of deterministic validation remains a separate engineering claim.
