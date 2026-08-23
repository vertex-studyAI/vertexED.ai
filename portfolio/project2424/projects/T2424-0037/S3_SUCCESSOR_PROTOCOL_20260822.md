# T2424-0037 / NeuroCAD — S3 Successor Protocol

**Protocol ID:** `T2424-0037-S3-SUCCESSOR-20260822`  
**Status:** `PROTOCOL_FROZEN / DATASET_AND_MODEL_IDENTITY_BLOCKED`  
**Created:** 2026-08-22  
**Historical v1/v2 results:** immutable and not reused as confirmatory evidence.

## 1. Why this successor exists

The historical NeuroCAD evidence is deliberately narrow:

- v1 held-out rectangular-plate benchmark: 19/20 for the typed/validated compiler versus 12/20 for direct flat extraction;
- the signed-negative failure is preserved;
- post-result parser hardening is engineering evidence and does not rewrite v1;
- the later matched validation ablation shows the earlier gap is validation-dominant on the reused 20-case diagnostic.

Therefore the next scientific question cannot be "does the old typed parser work?" and cannot reuse the same 20 cases to argue novelty.

Current 2026 literature also raises the evaluation bar. The successor must be compatible with the evaluation ideas represented by:

- Text2CAD-Bench, arXiv:2605.18430 — 600 human-curated examples across four complexity levels;
- CADTestBench / Text-to-CAD Evaluation with CADTests, arXiv:2605.07807 — executable geometric/topological tests;
- MUSE, arXiv:2605.28579 — manufacturability, functionality, and assemblability-oriented evaluation;
- AssemCAD, arXiv:2607.05123 — typed/verifiable assembly specifications and geometric evidence.

These references define the novelty/evaluation pressure; they are not claimed as reproduced baselines yet.

## 2. Frozen research question

> Under matched foundation-model/provider/budget conditions, does generating a typed, validated intermediate CAD specification before backend code improve executable semantic correctness and fail-closed safety on genuinely broader text-to-CAD tasks compared with direct CAD program generation and execution-repair baselines?

## 3. Frozen hypotheses

### Primary hypothesis H1

On the fixed successor benchmark, the typed-IR pipeline will improve **semantic test pass rate** over the strongest matched direct-generation baseline by at least **10 percentage points absolute**.

### Safety hypothesis H2

On invalid, contradictory, or unsafe prompts, the typed-IR pipeline will improve **correct reject/abstain rate** over the strongest matched direct-generation baseline by at least **15 percentage points absolute**, without reducing valid-case semantic pass rate by more than **5 percentage points**.

### Editability hypothesis H3

For tasks whose target representation supports reopen/edit checks, the typed-IR pipeline will improve **reopen-and-edit success** by at least **10 percentage points absolute** over the strongest matched direct-generation baseline.

## 4. Falsifiers

The successor mechanism claim is falsified if any of the following holds on the untouched evaluation split:

1. H1 delta is < +0.10 against the strongest matched direct-generation baseline;
2. H2 reject/abstain delta is < +0.15 or valid semantic pass rate regresses by > 0.05;
3. the strongest matched baseline equals or exceeds the typed-IR system on the primary semantic metric while using no more provider calls/tokens and comparable backend execution budget;
4. gains disappear under provider/backbone replication;
5. gains are explained by validation alone in the matched validation ablation.

A failed gate is retained as a negative result. Do not retune thresholds, replace the primary baseline, drop adverse cases, or select favorable seeds after opening the evaluation split.

## 5. Benchmark design — fixed before execution

Target size: **150 cases**.

The benchmark must include genuinely broader geometry/engineering structure than the historical rectangular-plate grammar.

| Stratum | Cases | Purpose |
|---|---:|---|
| Basic parametric single-part | 25 | boxes, cylinders/tubes, plates, simple revolved/extruded forms |
| Feature composition | 30 | holes, slots, pockets, fillets/chamfers where backend supports them |
| Multi-step constraint tasks | 25 | dimensions, relative placement, symmetry, clearances, repeated features |
| Assembly/interface tasks | 25 | multi-part interfaces, mates/ports/fit relations where representation supports them |
| Ambiguous/paraphrased requests | 20 | linguistic robustness without changing engineering target |
| Invalid/contradictory/unsafe tasks | 25 | impossible dimensions, inconsistent constraints, unsupported/unsafe specifications |
| **Total** | **150** | |

### Data identity requirement

Before execution, materialize and hash the exact benchmark records. Each row must contain:

- immutable case ID;
- prompt text;
- source (`external_benchmark`, `human_curated`, or `generated_from_frozen_template`);
- source record ID where applicable;
- difficulty/stratum;
- expected executable tests;
- expected invalid/reject behavior where applicable;
- backend/representation requirements.

No case may be edited after the evaluation split is opened. If a case is discovered to be malformed, retain it and mark it through a predeclared adjudication process rather than silently replacing it.

## 6. Required external benchmark adapters

Before S3 evaluation, implement at least **two** adapters to contemporary public evaluation surfaces where licensing/access permits. Priority order:

1. CADTestBench/CADTests-style executable tests;
2. Text2CAD-Bench task records;
3. MUSE-compatible assembly/design-intent subset when a compatible backend exists.

If exact external assets cannot be redistributed, store source IDs + checksums + deterministic fetch instructions rather than copying restricted content.

## 7. Systems / baselines

All model-based systems must use the same provider/model version, temperature/sampling policy, maximum attempts, prompt-context budget, and backend execution budget unless a deviation is explicitly declared as a separate efficiency comparison.

### M0 — typed-IR successor

Natural language -> typed CAD specification -> schema/constraint validation -> deterministic backend emitter -> executable tests.

Exact model/provider and prompts are **UNSET** and must be frozen before evaluation.

### B0 — matched direct program generation

Same model/provider/budget -> direct backend CAD program -> executable tests. No typed IR.

### B1 — matched direct generation + one execution-repair attempt

Same model/provider/budget. One repair round may consume an execution error/test failure under a predeclared repair policy.

### B2 — direct generation + matched fail-closed validation

Direct generation receives the same deterministic post-generation validation checks available to M0 where representation permits. This baseline tests whether validation, rather than typed IR, explains the gain.

### B3 — constrained/template baseline

A non-LLM deterministic or retrieval/template system for the subset it can express. Report coverage separately; do not score unsupported cases as silent successes.

Historical `direct_flat_extraction` may be retained only as a legacy diagnostic and **cannot** be the strongest baseline used for the S3 promotion claim.

## 8. Frozen metrics

### Primary

`semantic_test_pass_rate` — fraction of cases passing all predeclared executable semantic/geometric/topological tests.

### Secondary

- `syntax_or_parse_success`;
- `backend_execution_success`;
- `geometry_validity_rate`;
- `constraint_satisfaction_rate`;
- `invalid_correct_reject_rate`;
- `unsafe_accept_rate`;
- `reopen_edit_success_rate` where supported;
- `provider_calls_per_case`;
- `input_output_tokens_per_case` where provider exposes counts;
- `wall_clock_seconds_per_case`;
- `backend_runtime_seconds_per_case`.

Do not substitute visual plausibility for executable semantic correctness.

## 9. Statistics

The 150-case benchmark is paired across systems.

Required reporting:

- paired per-case outcome table;
- absolute deltas;
- bootstrap 95% confidence intervals over cases, stratified by benchmark stratum;
- McNemar exact test for paired binary primary outcomes when applicable;
- Holm correction across the predeclared H1/H2/H3 confirmatory family;
- per-stratum effect sizes and failure counts.

No significance claim from the historical deterministic 20-case study transfers to this successor.

## 10. Ablations

At minimum execute:

1. `NO_TYPED_IR`: direct model output with matched deterministic validation;
2. `NO_VALIDATION`: typed IR but no fail-closed constraint validation before backend emission;
3. `NO_REPAIR`: remove any allowed execution-repair loop;
4. `SCHEMA_ONLY`: schema typing without geometric/engineering constraint checks.

The causal mechanism claim requires that typed structure contribute beyond validation alone. If the matched validation baseline closes >=80% of M0's advantage, classify the mechanism as `VALIDATION_DOMINANT_OR_NONUNIQUE`.

## 11. Split/freeze order

The order is mandatory:

1. materialize benchmark source records;
2. define train/dev/evaluation split and hash all record IDs/content;
3. keep evaluation prompts/results unopened to method-development code where operationally possible;
4. freeze M0 implementation commit;
5. freeze B0-B3 implementation commits/configs;
6. freeze provider model IDs, prompts, budgets, retry/repair policy;
7. write an `EXECUTION_AUTHORIZATION.json` containing all hashes;
8. execute all systems across the same evaluation records;
9. retain every output including failures;
10. compute metrics with an evaluator that does not modify model outputs.

## 12. Promotion gates

### S4 successor evidence

May be assigned only after:

- all 150 cases execute under the frozen harness;
- raw per-case outputs are retained;
- all four baseline families are attempted and limitations documented;
- primary metrics + CIs are computed;
- negative outcomes are preserved.

### S3 candidate

May be assigned only if, in addition:

- at least two current external benchmark adapters are included;
- H1/H2/H3 outcomes are reported without threshold changes;
- all four ablations are complete;
- independent clean-worktree reproduction passes;
- a current related-work/novelty audit is complete;
- manuscript claims exactly match the evidence.

Passing these gates does not imply top-conference readiness.

## 13. Current blocker

`DATASET_AND_MODEL_IDENTITY_BLOCKED`

This protocol deliberately does **not** authorize the confirmatory evaluation yet because the exact external benchmark records/checksums, provider/model identity, and matched baseline implementations are not frozen.

The next admissible work is implementation/materialization on development data only. Do not produce S3 results until `EXECUTION_AUTHORIZATION.json` exists and all preconditions above are hashed.

## 14. Historical integrity lock

Never overwrite or reinterpret:

- v1 19/20 typed result;
- v1 12/20 direct-flat result;
- the signed-negative adverse case;
- the later engineering repair;
- the v2 `VALIDATION_DOMINANT` component diagnosis.

The successor is a new hypothesis, new benchmark family, and new evidence lineage.
