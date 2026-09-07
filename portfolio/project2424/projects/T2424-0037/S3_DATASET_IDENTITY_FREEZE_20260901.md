# NeuroCAD / T2424-0037 — S3 external dataset identity freeze

Freeze date: **2026-09-01**

Status: **IDENTITY FREEZE ADVANCED / CONFIRMATORY EXECUTION STILL UNAUTHORIZED**

This record advances only the external-dataset identity gate for the S3 successor protocol. It does not materialize benchmark files, open an evaluation split, run NeuroCAD, run any baseline, or create a scientific result.

## Selected external benchmark identities

### CADTestBench

- Hugging Face dataset: `dimitrismallis/CADTestBench`
- License: MIT
- Frozen immutable dataset revision: `2b9a4a972d142d2bc634d072e9d4485f171ced06`
- Revision evidence: Hugging Face commit page identifies verified commit `2b9a4a9` and expands it to the full immutable revision above.
- Benchmark boundary: 200 CAD programs; abstract and detailed prompt partitions; executable CAD tests.
- Selected S3 role: primary executable semantic/geometric/topological external adapter.
- Materialized locally: **NO**
- File/content SHA-256 manifest frozen: **NO**

### MUSE

- Hugging Face dataset: `dongxiaoyu/MUSE`
- Dataset license: CC-BY-4.0
- Frozen immutable dataset revision: `f8a1dc45d1ea73df4161e8a1caf1d503c5358c30`
- Revision evidence: Hugging Face commit page identifies verified commit `f8a1dc4` and expands it to the full immutable revision above.
- Benchmark boundary: 106 engineering CAD design cases with multimodal ground truth and rubric-style evaluation.
- Selected S3 role: secondary engineering-design/rubric external adapter.
- Materialized locally: **NO**
- File/content SHA-256 manifest frozen: **NO**

## What this closes

The previous registry retained only observed revision prefixes (`2b9a4a9`, `f8a1dc4`) and explicitly required recovery of full immutable revisions before materialization. This record closes that specific identity-recovery sub-gate by freezing the full revisions above.

## What remains blocked

Confirmatory S3 execution remains prohibited until all of the following are retained and reviewable:

1. deterministic materialization of the exact revisions above;
2. complete consumed-file inventory for each selected adapter;
3. SHA-256 digest for every consumed benchmark asset (or an unambiguous deterministic aggregate manifest plus file-level mapping);
4. frozen evaluation split/case inclusion rules before outcomes are opened;
5. exact NeuroCAD implementation revision used by S3;
6. exact M0/B0-B3 baseline implementation/model/provider identities;
7. deterministic execution budgets and decoding/runtime settings;
8. any model-judged MUSE rubric stage kept separate and frozen by provider/model/prompt/judge identity;
9. `EXECUTION_AUTHORIZATION.json` explicitly setting authorization true only after the above gates pass.

## Integrity boundary

`confirmatory_execution_authorized` remains **false**. No S3 metric, comparative result, external-validation claim, manufacturing claim, state-of-the-art claim, or mechanism-causality claim follows from freezing these revisions.

Historical NeuroCAD evidence remains unchanged: the retained matched-validation diagnostic is `VALIDATION_DOMINANT`, and the typed-parser-specific causal interpretation remains falsified on the reused diagnostic.

## Source records

- https://huggingface.co/datasets/dimitrismallis/CADTestBench/commit/2b9a4a972d142d2bc634d072e9d4485f171ced06
- https://huggingface.co/datasets/dongxiaoyu/MUSE/commit/f8a1dc45d1ea73df4161e8a1caf1d503c5358c30

This document freezes identities only; it does not substitute for local content hashing or execution authorization.
