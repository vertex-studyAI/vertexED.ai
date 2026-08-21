# IRIS Source Recovery Update — 2026-08-16

**Scope:** provenance reconciliation only.  
**Scientific state:** unchanged; current IRIS/PABIM evidence remains mixed/negative.  
**Execution state:** `PROTOCOL_BLOCKED_ON_CANONICAL_RAW_TRAJECTORY_PROVENANCE`.  
**Confirmatory seeds `1000–1029`: FORBIDDEN / NOT ACCESSED.**

## What changed since the 2026-08-14 recovery note

The earlier `IRIS_SOURCE_RECOVERY_20260814.md` correctly recorded two unresolved provenance edges at that time:

1. canonical raw development trajectories;
2. the standalone adaptation-metric freeze source identity.

The second edge can now be narrowed materially. Current `main` contains the standalone control artifact:

- path: `portfolio/research/IRIS_SEQUENCE_ADAPTATION_METRIC_FREEZE_20260813.md`
- Git blob/content identity observed in the control repository: `6f4d6a47e3727596b21714bc269cd8ba5844d2fa`

The current frontier protocol explicitly names this file as the frozen source of the adaptation metrics. Its definitions include `TWMSE25`, right-censored recovery behavior, `POST_MSE50PLUS`, the gate-bearing false-open diagnostic, the eligible development/stress seed boundary, and the quarantine of confirmatory seeds `1000–1029`.

Therefore the previous coarse statement that the standalone metric freeze is not surfaced in the GitHub control tree is no longer true for the current control-repository state.

## What this does and does not close

This update closes the **control-tree visibility/source-identity gap for the standalone metric-freeze document**.

It does **not** claim that a separately retained historical copy has been proven byte-identical to this Git blob unless an independent retained hash is recovered and compared. It also does not prove that every executable metric implementation in a historical harness is already byte-identical or semantically identical to the frozen definitions. Those are separate verification edges.

Most importantly, the canonical raw-trajectory provenance requirement remains open. The frontier protocol requires exact retained raw development trajectories and explicitly forbids approximately regenerating equivalent data and calling it the same experiment.

## 2026-08-21 direct retained-archive check

A new provenance-only pass materialized and inspected the retained archives named by the existing recovery chain. Their observed SHA-256 identities match the hashes already recorded by the control evidence:

- `IRIS_v0.2_bundle.zip` — `41a8e117b6922c3a6641bd12608d5e4246d305a9c3776a62252869045d83dacf`;
- `IRIS_v0.2_research_package(1).zip` — `5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`;
- `IRIS_v0.2_repro_addendum_20260813.zip` — `7653c87d5effb08da9068630259802d77b34b930083dd160ccea4ce23311175b`;
- `IRIS_common_adaptation_harness_v1_negative_20260813.zip` — `5643b59e9272099e54f04491aa63906d0d186a1a2c525a574f960008e5f19b90`.

This pass did **not** execute any IRIS experiment and did **not** access confirmatory seeds `1000–1029`. It inspected archive inventories and the column headers of retained result tables only.

No separately retained observation/state trajectory corpus was found in those four archive inventories. The files whose names contain `raw` are metric/result tables, not trajectory matrices. Representative headers are:

- v0.2 scalar: `condition,seed,method,mse,mae,tail_mse,recovery_steps`;
- v0.2 sequence: `seed,model,condition,mse,mae,alpha`;
- v0.2 release sequence: `seed,model,condition,mse,mae,tail_mse,alpha,trainable_parameters,recovery_steps`;
- common adaptation harness: `condition,seed,model,mse,mae,tail_mse,twmse25,recovery_steps,recovery_censored,post_mse50plus,false_open_rate`.

The retained archives do contain deterministic generator implementations and frozen development seed/config information. That is useful lineage evidence, but it is **not by itself an authorization to regenerate** the frontier inputs. Section 11 of `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` requires canonical raw development trajectories before execution, and its `PROTOCOL_BLOCKED` rule forbids approximately equivalent regeneration when exact retained inputs cannot be recovered.

Therefore this direct archive check **strengthens rather than closes** the remaining blocker: the currently recovered packages establish exact source/archive identity and metric-row provenance, but they do not surface the required canonical observation/state trajectory corpus or a prior frozen evidence record explicitly defining those trajectories solely by a pinned generator/source/config identity.

## Current execution verdict

Do **not** execute `IRIS-FRONTIER-DEV-20260814` yet.

The blocker can now be stated more precisely as:

`PROTOCOL_BLOCKED_ON_CANONICAL_RAW_TRAJECTORY_PROVENANCE`

The frozen frontier protocol, standalone metric-freeze document, substantial implementation/configuration/source lineage, and environment evidence are present or recovered, but the exact canonical raw development trajectory corpus (or an evidence record proving that exact trajectory identity is intentionally defined by a pinned deterministic generator/source hash) has not yet been established.

## Next admissible work

1. Recover a retained artifact/manifest containing the exact development observation/state trajectories required by the frontier, or evidence that the protocol intentionally defines them by a specific pinned generator/source/config identity.
2. Cross-check any executable adaptation-metric implementation against the frozen formulas and edge-case rules before an execution manifest is authorized.
3. Cross-hash the six primary frontier implementations and parameter files against the recovered v0.2/addendum/common-harness lineage.
4. Build a pre-execution manifest containing every required source hash and an explicit assertion that confirmatory seeds `1000–1029` remain inaccessible.
5. If exact trajectory provenance cannot be recovered, retain `PROTOCOL_BLOCKED`; do not regenerate or substitute trajectories.

## Non-rescue boundary

No scientific result, seed, method parameter, threshold, hypothesis verdict, baseline outcome, or manuscript claim changes in this update. It creates no positive IRIS result, unlocks no confirmatory data, and authorizes no successor mechanism or outcome training.
