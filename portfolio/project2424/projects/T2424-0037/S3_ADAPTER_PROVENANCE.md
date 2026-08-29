# NeuroCAD S3 — External Adapter Provenance Freeze

**Recorded:** 2026-08-29

This artifact advances the S3 successor benchmark toward authorization without opening the confirmatory split or claiming benchmark materialization that has not occurred.

## Frozen external adapter identities

### CADTestBench

- Upstream code repository: `dimitrismallis/CADTestBench`
- Frozen code revision: `e29283cc61db7329039d95b429766a50bfd37f89`
- Commit date: 2026-05-22T08:05:54Z
- Upstream dataset identity: `dimitrismallis/CADTestBench` on Hugging Face
- Dataset description observed: 200 CAD programs with abstract/detailed prompt variants and executable CAD tests
- License observed: MIT
- Dataset content revision/hash: **NOT YET FROZEN**

### MUSE

- Upstream code repository: `dong7313/muse`
- Frozen code revision: `dcb1638f556e2821170891ccfe744cffc5ac21d1`
- Commit date: 2026-05-28T04:00:48Z
- Upstream dataset identity: `dongxiaoyu/MUSE` on Hugging Face
- Dataset description observed: 106 CAD design cases with natural-language specifications, multimodal ground truth, and rubric-style evaluation
- License observed: CC-BY-4.0
- Dataset content revision/hash: **NOT YET FROZEN**

## What this does and does not establish

This file freezes the exact upstream *code* revisions selected for the two predeclared external adapters. It does **not** establish that the benchmark datasets have been downloaded, materialized, transformed, filtered, split, or content-hashed.

Therefore:

- S3 Adapter identity may advance from ambiguous upstream identity to **CODE REVISION FROZEN / DATA REVISION PENDING**.
- `EXECUTION_AUTHORIZATION.json` must remain absent or fail-closed.
- No confirmatory S3 evaluation is authorized.
- No result may be reported from these adapter identities alone.

## Required next evidence

Before authorization, retain for each adapter:

1. exact Hugging Face dataset commit/revision;
2. immutable manifest of every source file consumed;
3. SHA-256 for each consumed source file or an equivalent deterministic content manifest;
4. deterministic adapter version and transformation configuration;
5. emitted record manifest with stable record IDs;
6. SHA-256 of the emitted benchmark records;
7. frozen development/confirmatory split manifest;
8. proof that adapter validation used development-only records;
9. final repository commit containing the adapter implementation and manifests.

## Integrity constraints

Do not substitute current `main`/`master` pointers for immutable revisions after this freeze. If an upstream dataset changes, either retain this frozen revision or create a new explicitly versioned protocol amendment before any confirmatory execution. Do not choose records based on observed NeuroCAD performance. Do not change thresholds, metrics, sample counts, baselines, or falsifiers after seeing confirmatory outputs.

## Current gate

`S3_EXTERNAL_ADAPTER_CODE_IDENTITY = FROZEN`

`S3_EXTERNAL_DATA_IDENTITY = BLOCKED_PENDING_IMMUTABLE_DATASET_REVISION_AND_CONTENT_HASHES`

`S3_EXECUTION_AUTHORIZATION = FORBIDDEN`
