# IRIS source recovery — 2026-08-14

**Recovery task:** `IRIS-FRONTIER-SOURCE-001`  
**State after this recovery:** `PARTIALLY_RECOVERED / PROTOCOL_BLOCKED_ON_EXACT_TRAJECTORY_AND_METRIC_PROVENANCE`  
**Scientific boundary:** this recovery changes no IRIS result, parameter, seed, threshold, hypothesis verdict or confirmatory-data state. Seeds `1000–1029` were not accessed.

## Purpose

Recover the exact retained IRIS development source/evidence required by the frozen `IRIS-FRONTIER-DEV-20260814` baseline-frontier protocol. The protocol explicitly forbids approximate regeneration when the exact raw trajectories, implementations or parameterizations are not recoverable.

## Recovered artifacts

### 1. Canonical v0.2 bundle

Library artifact: `IRIS_v0.2_bundle.zip`  
Observed SHA-256:

`41a8e117b6922c3a6641bd12608d5e4246d305a9c3776a62252869045d83dacf`

This exactly matches the retained IRIS reproducibility audit. `MANIFEST_SHA256.txt` was checked after extraction; all listed files passed.

Recovered contents include the v0.2 source, tests, experiment scripts, result CSVs/manifests, requirements lock, environment snapshot and manuscript/research material.

### 2. Stronger-development-baselines reproduction addendum

Canonical Library path:

`/Research/IRIS/IRIS_v0.2_repro_addendum_20260813.zip`

Observed SHA-256:

`7653c87d5effb08da9068630259802d77b34b930083dd160ccea4ce23311175b`

This exactly matches `portfolio/research/evidence/iris-v0.2-development-baselines-20260813.json`.

The archive's `SHA256SUMS.txt` was verified after extraction; all retained entries passed.

Recovered material includes:

- `dev_baselines/confirmed_change_baseline/run.py` + frozen protocol/results;
- `dev_baselines/robust_change_screen/run_robust_change_baselines.py` + frozen protocol/results;
- preserved invalid-v1 lineage for the robust-change diagnostic;
- v0.2 scalar/sequence raw result tables, summaries, manifests and environment evidence.

### 3. Common adaptation harness

Canonical Library path:

`/Research/IRIS/IRIS_common_adaptation_harness_v1_negative_20260813.zip`

Observed archive SHA-256:

`5643b59e9272099e54f04491aa63906d0d186a1a2c525a574f960008e5f19b90`

Its frozen `protocol.json` records IRIS source-lineage SHA-256:

`5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`

The harness retains `run.py`, `verify.py`, protocol, raw/summary results, verdict, invalid-attempt lineage and independent verification. Its existing frozen result remains `NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE`; this recovery does not rerun or reinterpret that result.

### 4. Exact common-harness source-lineage archive

Library artifact:

`IRIS_v0.2_research_package(1).zip`

Observed SHA-256:

`5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`

This exactly matches the source-lineage hash recorded in the common adaptation harness protocol.

Recovered contents include v0.2 release source, scalar/sequence scripts, raw result rows, manifests, environment/research documents, tests and SHA manifest.

## What is now established

The earlier broad statement that the original IRIS source is simply unavailable is too coarse. A substantial retained source/evidence chain is recoverable from the Library and its key hashes match the control-repo evidence.

In particular, the following provenance edges are now concretely recovered:

1. v0.2 bundle identity;
2. v0.2 bundle manifest integrity;
3. stronger-baseline addendum identity;
4. stronger-baseline addendum internal integrity;
5. common-adaptation-harness artifact;
6. the exact source archive named by the common-harness lineage hash;
7. retained v0.2 development result tables/configuration/environment evidence.

## Remaining frozen-protocol gaps

The frozen `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` requires, **before execution**:

- canonical raw development trajectories;
- exact implementations for all six primary systems;
- exact retained parameter/config files;
- metric implementation frozen by `IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md`;
- the frontier protocol;
- environment manifest.

This recovery materially closes the implementation/config/environment/source-lineage side, but two required provenance edges are still not established as exact canonical inputs:

### A. Canonical raw development trajectories

The recovered packages retain per-seed/per-condition **metric/result rows** and deterministic generator implementations, but no separately identified canonical observation/state trajectory archive was found in this recovery pass.

The frontier protocol explicitly says not to regenerate approximately equivalent data and call it the same experiment. Therefore deterministic-looking generator code is not, by itself, permission to reconstruct a replacement trajectory corpus for this frozen protocol.

### B. Frozen adaptation-metric source identity

`IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md` is referenced by the frozen frontier and by the common adaptation harness, but this exact standalone freeze artifact was not surfaced in the current GitHub control tree or Library search during this recovery pass.

The common harness contains implementations of the named adaptation metrics and previously executed evidence, but the missing frozen-source provenance edge must be closed before claiming the frontier uses the exact canonical metric implementation required by its contract.

## Execution verdict

**Do not run `IRIS-FRONTIER-DEV-20260814` yet.**

Current verdict for the source-recovery task:

`PARTIALLY_RECOVERED / PROTOCOL_BLOCKED_ON_EXACT_TRAJECTORY_AND_METRIC_PROVENANCE`

This is narrower and stronger than the previous generic source-blocked state, but it is not an execution authorization.

## Exact next recovery actions

1. Locate a retained archive/file whose manifest identifies the exact development observation/state trajectories used by the frozen development package, or a prior evidence record proving that the frozen protocol intentionally defines those trajectories by a specific byte-identical deterministic generator/source hash.
2. Recover the exact `IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md` artifact or its verified byte-identical source plus hash.
3. Cross-hash the six frontier system implementations/parameterizations against the recovered addendum/common-harness/v0.2 source chain.
4. Only after every required provenance edge is closed, create an execution manifest that lists all input hashes and independently verifies that confirmatory seeds `1000–1029` remain inaccessible.
5. If either required provenance edge cannot be recovered, retain `PROTOCOL_BLOCKED`; do not reimplement the frontier.

## Non-rescue rule

The existing IRIS v0.2 mixed/negative package remains unchanged. The common adaptation harness remains a negative development result. No new architecture is authorized, no confirmatory seeds are unlocked, and no positive mechanism claim is created by source recovery.
