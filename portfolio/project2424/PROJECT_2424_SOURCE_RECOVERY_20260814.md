# Project 2424 source recovery — 2026-08-14

**Recovery task:** `P2424-CANON-001`  
**State after this recovery:** `HISTORICAL_WAVE001_BASE_RECOVERED / LATER_OVERLAY_AND_IDENTITY_MAP_UNRESOLVED`  
**Boundary:** this proves one retained historical Wave-001 Git source artifact and a fresh clean-clone quality-gate run. It does **not** prove that its `P2424-*` registry is the present-day `T2424-*` map, does not recover the later dirty workspace overlay, and does not turn 2,424 registry rows into 2,424 implemented or completed research projects.

## 1. Manifest-selected bundle

Retained `PACKAGE_MANIFEST.json` records:

- `Project_2424_Ready.bundle`
- size `1,933,974` bytes
- SHA-256 `4c685af70d84052c026602ff7336a522c741d91fb480038e980c21f0bbc63ece`

The Library contains two similarly named bundles. The manifest-sized artifact is `Project_2424_Ready(1).bundle` and independently hashes to exactly:

`4c685af70d84052c026602ff7336a522c741d91fb480038e980c21f0bbc63ece`

A second older `Project_2424_Ready.bundle` is smaller (`1,898,474` bytes) and hashes to:

`2c38df0f5793f82a3833ce98547127c2732a007baf40ee8c7f330f58299bd6b3`

It is a different historical artifact and must not silently replace the manifest-selected bundle.

## 2. Git history verification

The checksum-matched bundle was cloned into a disposable clean directory and verified in repository context.

Verified facts:

- bundle integrity: PASS;
- complete history: yes;
- branch: `main`;
- HEAD / tag `wave-001-push-ready`: `ff609f335f91297357b430a2531633fe111cd5a9`;
- tag `wave-001-verified-source`: `04db4e70c2daea225c6660cb41763356c8d6cf2e`;
- commit count: `9`.

The history ends with the push-ready packaging commit after source restoration, runtime/evidence work, four stronger experimental packages, GitLab handoff/bootstrap verification, and final evidence sealing.

The older same-named bundle ends three commits earlier at `bdf658ee64cc66dab14b628a75fa3f34875a2d81`.

## 3. Historical-anchor boundary

The often-cited Project 2424 SHA:

`5952dd236638b48514071918fd083079fa517f03`

is **not present** in this checksum-matched bundle's complete history.

Therefore it remains a separate historical-documentation anchor unless another recovered lineage proves the relationship. Do not assert it as an ancestor of `ff609f3` from name/history alone.

## 4. Registry and source-backed counts

Fresh validation of the recovered source reports:

- project registry rows: `2,424`;
- unique project IDs: `2,424`;
- unique repository slugs: `2,424`;
- source packages actually present: `24`;
- projects without source in this bundle: `2,400`.

The 24 source-backed Wave-001 packages reconcile to:

- `4` `EXPERIMENTALLY_VALIDATED` within controlled scopes;
- `4` `EXECUTABLE_DEMONSTRATION`;
- `16` `COMPACT_BASELINE_OR_IDEA_TEST`.

The retained final handoff explicitly records:

- independently reproduced: `0`;
- release: `RELEASE_REJECTED`;
- release reason: 2,400 registry records lack source and no project is independently reproduced.

This is the correct boundary for the historical bundle.

## 5. Fresh clean-clone quality gate

The recovered bundle itself was left immutable. In a disposable clean clone:

```bash
python3 scripts/run_quality_gate.py
```

returned:

`QUALITY_GATE_PASSED`

Fresh reports show:

- registry `2424 / 2424` unique;
- root/shared/runtime gate pass;
- 24/24 project suites pass;
- 75 project tests detected;
- 24/24 bounded pilot commands execute successfully;
- workspace audit pass;
- GitLab bootstrap dry-run pass;
- 4 controlled experimental validations, 4 executable demos, 16 compact tests;
- independent reproduction count remains 0;
- final release remains rejected.

The rerun rewrites timestamp/commit-bearing generated evidence in the disposable clone. Those generated changes were not committed back to the recovered artifact.

This is a fresh source-package verification, not outside independent scientific reproduction.

## 6. Identity-map collision: three incompatible maps now evidenced

Numeric ID suffixes are **not safe canonical keys across retained Project 2424 artifacts**.

### A. Recovered Wave-001 Git source

The source directory for historical `P2424-0038` is an uncertainty-aware autonomous-replication scientific agent.

### B. Retained Percy/Project-2424 Codex handoff registry

`PROJECT_2424_REGISTRY.json` contains 2,424 rows but assigns:

- `P2424-0038` → **Typed Multi-Agent Evidence Ledger**;
- `P2424-0050` → **Event-Sourced Release Controller**;
- `P2424-0019` → **HELIOS**;
- `P2424-1863` → **Adaptive-Precision KV Cache for Kv Cache**.

### C. Present-day control repository

The current `T2424-*` queue assigns, among others:

- `T2424-0038` → **Obscured Records Agent**;
- `T2424-0050` → **Darcy Latent Operator**;
- `T2424-0019` → **Neural Predictive Memory Spectroscopy**;
- `T2424-1863` → **Resource-Bounded Local Operator for Scientific Forecasting**.

Thus even the historical `P2424-*` artifacts disagree with each other before comparison with the later `T2424-*` namespace.

The correct inference is **not** that one of these registries should overwrite the others. The correct inference is that Project 2424 underwent one or more remaps/canonicalization migrations whose exact provenance still needs recovery.

## 7. Later dirty-overlay boundary

Historical sync logs identify a later local workspace:

`/Volumes/PRO-BLADE/Atlas/Project-2024/Project_2424`

with origin pointing at the push-ready bundle and a large then-untracked overlay of reports/scripts/shared runtime/tests. The workspace was recorded at roughly 743 MB before archival/sync.

That live Mac workspace is unavailable in the current environment, and no checksum-identified byte-identical full overlay archive was recovered in this pass.

Therefore `P2424-CANON-001` is **materially narrowed but not fully closed**.

## 8. Correct state transition

Replace broad source state:

`BLOCKED_EXTERNAL_SOURCE`

with:

`WAVE001_BASE_RECOVERED / LATER_OVERLAY_AND_IDENTITY_CANONICALIZATION_BLOCKED`

Closed:

1. manifest-selected historical Wave-001 bundle recovery;
2. bundle SHA/integrity/complete-history verification;
3. historical Wave-001 HEAD/tag identity;
4. 2,424-row registry validation;
5. truthful source-backed count (`24`, not `2,424`);
6. fresh clean-clone quality-gate run.

Still open:

1. recover/hash the later dirty Mac overlay or byte-identical archive;
2. recover migration/canonicalization records explaining the competing `P2424-*` maps and transition to current `T2424-*` identities;
3. build a collision table and provenance-backed child map;
4. preserve current bounded `T2424-*` implementations/negative results separately until a mapping edge is proven.

## 9. Non-promotion rule

This recovery does **not** authorize a mass 2,424-project execution wave and does not support calling 2,424 projects implemented, research-complete, publishable or independently reproduced.

Strongest verified statement:

> A checksum-matched historical Wave-001 Git source package is recovered and freshly verified. It contains a valid 2,424-row registry and 24 source-backed bounded packages. Multiple retained registries conflict on numeric identities, and the later dirty overlay/current `T2424-*` canonicalization remains unresolved.
