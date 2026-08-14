# Project 2424 source recovery — 2026-08-14

**Recovery task:** `P2424-CANON-001`  
**State after this recovery:** `HISTORICAL_WAVE001_BASE_RECOVERED / LATER_OVERLAY_AND_IDENTITY_MAP_UNRESOLVED`  
**Boundary:** this recovery proves a specific retained Wave-001 Git source artifact and a fresh clean-clone quality-gate run. It does **not** establish that the recovered `P2424-*` registry is the present-day `T2424-*` canonical identity map, does not recover the later dirty workspace overlay, and does not convert 2,424 registry rows into 2,424 implemented or completed research projects.

## 1. Manifest-selected Git bundle

A retained `PACKAGE_MANIFEST.json` records the push-ready bundle as:

- name: `Project_2424_Ready.bundle`
- size: `1,933,974` bytes
- SHA-256: `4c685af70d84052c026602ff7336a522c741d91fb480038e980c21f0bbc63ece`

The Library contains two similarly named bundles. This recovery selected the artifact whose byte length matches the manifest:

`Project_2424_Ready(1).bundle`

Observed size:

`1,933,974` bytes

Observed SHA-256:

`4c685af70d84052c026602ff7336a522c741d91fb480038e980c21f0bbc63ece`

This exactly matches the retained package manifest.

A second older Library artifact named `Project_2424_Ready.bundle` has size `1,898,474` bytes and SHA-256:

`2c38df0f5793f82a3833ce98547127c2732a007baf40ee8c7f330f58299bd6b3`

It is therefore a different historical bundle and must not silently replace the manifest-selected artifact.

## 2. Git bundle verification

The checksum-matched bundle was cloned into a disposable clean directory and verified in repository context.

Git reported:

- bundle verification: **OK**;
- complete history: **yes**;
- hash algorithm: SHA-1;
- branch: `main`;
- bundle HEAD: `ff609f335f91297357b430a2531633fe111cd5a9`;
- tag `wave-001-push-ready`: `ff609f335f91297357b430a2531633fe111cd5a9`;
- tag `wave-001-verified-source`: `04db4e70c2daea225c6660cb41763356c8d6cf2e`;
- bundle commit count: `9`.

The nine-commit history is:

1. `f2adb93` — restore Project 2424 Wave 001 source baseline;
2. `b8dc293` — shared research runtime/evidence utilities;
3. `9ac512e` — rebuild four Wave-001 research systems with matched experiments;
4. `73041cc` — leakage-checker experiment-command repair;
5. `b6150c5` — durable GitLab handoff/CI/evidence/status preparation;
6. `bdf658e` — final handoff verification evidence;
7. `0c2d093` — one-command GitLab bootstrap + secure handoff;
8. `04db4e7` — GitLab bootstrap quality-gate verification;
9. `ff609f3` — seal Wave-001 verification evidence and push-ready handoff.

The older same-named Library bundle ends at `bdf658ee64cc66dab14b628a75fa3f34875a2d81` and contains only the first six commits.

## 3. Historical-anchor boundary

The often-cited historical Project 2424 commit:

`5952dd236638b48514071918fd083079fa517f03`

is **not present** in the checksum-matched Wave-001 bundle's complete history.

Therefore that SHA must remain a separate historical-documentation anchor unless another recovered source lineage proves its relationship. It must not be asserted as an ancestor of `ff609f3` merely because older reports mention it.

## 4. Registry truth recovered from the bundle

The recovered repository contains:

- `registry/ALL_PROJECTS.json`;
- `registry/ALL_PROJECTS.csv`;
- `registry/Project_2424_Research_Universe.xlsx`;
- registry validation artifacts.

Fresh validation reports:

- project count: `2,424`;
- unique project IDs: `2,424`;
- unique repository slugs: `2,424`;
- tier distribution: 60 Tier 1, 180 Tier 2, 364 Tier 3, 606 Tier 4, 1,214 Tier 5.

This proves a 2,424-row **registry** in this historical Wave-001 source. It does not prove source, experiments, scientific completion or publication readiness for all rows.

## 5. Source-backed Wave-001 subset

The recovered bundle contains exactly **24** project source directories. Their current source states reconcile to:

- `4` `EXPERIMENTALLY_VALIDATED` within controlled scopes;
- `4` `EXECUTABLE_DEMONSTRATION`;
- `16` `COMPACT_BASELINE_OR_IDEA_TEST`.

The bundle's own final handoff says:

- registered projects: `2,424`;
- projects with source: `24`;
- projects without source: `2,400`;
- independently reproduced: `0`;
- release: `RELEASE_REJECTED`.

The 24 source-backed IDs are:

`P2424-0038`, `P2424-0085`, `P2424-0177`, `P2424-0297`, `P2424-0349`, `P2424-0389`, `P2424-0481`, `P2424-0573`, `P2424-0665`, `P2424-0785`, `P2424-0877`, `P2424-0969`, `P2424-1061`, `P2424-1144`, `P2424-1181`, `P2424-1273`, `P2424-1365`, `P2424-1530`, `P2424-1648`, `P2424-1817`, `P2424-1861`, `P2424-1931`, `P2424-2152`, and `P2424-2305`.

## 6. Fresh clean-clone quality gate

The checksum-matched bundle was left immutable. The complete quality gate was executed in the disposable clone using the repository's documented script:

```bash
python3 scripts/run_quality_gate.py
```

Result:

`QUALITY_GATE_PASSED`

Freshly generated verification reports show:

- registry: `2,424 / 2,424` unique IDs and slugs;
- root/shared/runtime tests: pass;
- Wave-001 project suites: `24 / 24` pass;
- project tests detected: `75`;
- controlled pilot commands: `24 / 24` execute successfully;
- workspace audit: pass;
- GitLab bootstrap dry-run: pass;
- reconciled Wave-001 states: 4 experimentally validated, 4 executable demonstration, 16 compact baseline/idea test;
- independently reproduced: `0`;
- final portfolio release verdict remains: `RELEASE_REJECTED`.

The rerun rewrites timestamp/commit-bearing generated evidence in the disposable clone. Those changes were **not** committed back to the recovered source artifact.

This is a fresh verification of the recovered source package, not an independent outside reproduction and not scientific validation of the entire registry.

## 7. Present-day identity collision boundary

The Wave-001 bundle uses the namespace `P2424-*`. The later portfolio-control repository uses a `T2424-*` queue and has materially different identity assignments.

Concrete example:

- recovered Wave-001 source directory `P2424-0038-*` is an uncertainty-aware autonomous-replication scientific agent;
- present-day control source defines `T2424-0038` as **Obscured Records Agent**.

The later First-100 control record also explicitly warns against double-counting folder names, duplicate branches, auxiliary artifacts and queue identities whose titles disagree with frozen queue assignments.

Therefore this recovery must **not** overwrite the current `T2424-*` child map with the historical `P2424-*` registry merely because both contain 2,424-style IDs.

The relationship may be one of:

- historical registry superseded by a later remap;
- separate `P` and `T` namespaces;
- overlay migration with ID reassignment;
- partial reuse plus collision repairs.

That relationship remains to be proven from retained canonicalization/overlay evidence.

## 8. Later dirty-workspace provenance remains unresolved

Historical sync logs identify a later local Project 2424 workspace at:

`/Volumes/PRO-BLADE/Atlas/Project-2024/Project_2424`

with origin:

`/Volumes/PRO-BLADE/Project-2024/Project_2424_Execute_Now/Project_2424_Ready.bundle`

and record a large set of then-untracked reports, scripts, shared runtime files and tests. The logs also report the workspace at roughly `743 MB` before archival/sync.

That later Mac workspace/dirty overlay is not mounted in the present environment, and no checksum-identified full overlay archive was recovered in this pass.

Accordingly, `P2424-CANON-001` is **not fully closed**.

## 9. Correct recovery verdict

Replace the broad state:

`BLOCKED_EXTERNAL_SOURCE`

with the narrower state:

`WAVE001_BASE_RECOVERED / LATER_OVERLAY_AND_T2424_IDENTITY_RECONCILIATION_BLOCKED`

What is closed:

- exact manifest-selected Wave-001 bundle recovery;
- bundle integrity and complete-history verification;
- Wave-001 HEAD/tag identity;
- clean registry count verification;
- clean Wave-001 quality-gate rerun;
- truthful source-backed count (`24`, not `2,424`).

What remains open:

1. recover/hash the later Mac dirty workspace/overlay or a byte-identical archive;
2. recover the canonical migration/canonicalization record relating `P2424-*` to current `T2424-*` identities;
3. reconcile per-ID collisions without renumbering evidence to make it fit;
4. map the 24 historical Wave-001 source packages to present-day canonical children only where provenance proves the relationship;
5. preserve later bounded `T2424-*` implementations and negative results as separate evidence until that reconciliation is complete.

## 10. Non-promotion rule

This source recovery does **not** authorize a 2,424-project execution wave and does not justify describing Project 2424 as 2,424 implemented, research-complete, publishable or independently reproduced projects.

The strongest verified statement is:

> A checksum-matched historical Wave-001 Git source package has been recovered and freshly verified. It contains a valid 2,424-row idea registry and 24 source-backed bounded packages. Present-day `T2424-*` identity reconciliation and the later dirty overlay remain unresolved.
