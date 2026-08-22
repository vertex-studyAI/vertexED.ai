# IRIS source recovery — 2026-08-14

**Recovery task:** `IRIS-FRONTIER-SOURCE-001`  
**State after 2026-08-22 re-verification:** `PARTIALLY_RECOVERED / PROTOCOL_BLOCKED_ON_EXACT_TRAJECTORY_IDENTITY_ONLY`  
**Scientific boundary:** this recovery changes no IRIS result, parameter, seed, threshold, hypothesis verdict or confirmatory-data state. Seeds `1000–1029` remain forbidden.

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

This exactly matches the source-lineage hash recorded in the common-harness protocol.

### 5. Frozen adaptation-metric specification

The formerly missing standalone specification is present on canonical `main`:

`portfolio/research/IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md`

Git blob SHA:

`6f4d6a47e3727596b21714bc269cd8ba5844d2fa`

The frozen definitions include `TWMSE25` with `W=25`, five-sample recovery within `0.10 * D`, `POST_MSE50PLUS` beginning at `t0+50`, and the false-open diagnostic. This closes the stale metric-spec provenance blocker. The existing `RESEARCH_STATUS.md` separately records the executable metric provenance hashes and semantic match.

## What is now established

The retained source/evidence chain now concretely establishes:

1. v0.2 bundle identity and manifest integrity;
2. stronger-baseline addendum identity and integrity;
3. common-adaptation-harness artifact and exact source-lineage archive;
4. retained v0.2 development result tables/configuration/environment evidence;
5. frozen adaptation-metric specification identity;
6. executable metric provenance and semantic match as recorded in `RESEARCH_STATUS.md`.

## Remaining frozen-protocol gap

The only unresolved frontier-source gate is **canonical development trajectory identity**.

The recovered packages retain per-seed/per-condition metric/result rows and deterministic generator implementations, but no separately identified canonical observation/state trajectory archive has been established, and no pre-existing authoritative evidence has yet been found proving that the frozen protocol intentionally defines those trajectories by a byte-identical deterministic generator/source hash.

The frontier protocol explicitly forbids regenerating approximately equivalent data and calling it the same experiment. Deterministic-looking generator code alone is not sufficient authorization.

## Execution verdict

**Do not run `IRIS-FRONTIER-DEV-20260814` yet.**

Current verdict:

`PARTIALLY_RECOVERED / PROTOCOL_BLOCKED_ON_EXACT_TRAJECTORY_IDENTITY_ONLY`

## Exact next recovery actions

1. Locate a retained archive/file whose manifest identifies the exact development observation/state trajectories used by the frozen development package, **or** a prior authoritative evidence record proving byte-identical deterministic equivalence to a specific generator/source/config hash.
2. Cross-check that identity against the already recovered v0.2/addendum/common-harness lineage.
3. Create an execution manifest listing every input hash and independently verify that confirmatory seeds `1000–1029` remain inaccessible.
4. Only after the trajectory-identity gate closes may the frozen frontier development run execute.
5. If the trajectory identity cannot be recovered, retain `PROTOCOL_BLOCKED`; do not reimplement or approximate the frontier.

## Non-rescue rule

The existing IRIS v0.2 mixed/negative package remains unchanged. The common adaptation harness remains a negative development result. No new architecture is authorized, no confirmatory seeds are unlocked, and no positive mechanism claim is created by this recovery update.
