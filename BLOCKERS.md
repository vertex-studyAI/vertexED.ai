# BLOCKERS

**As of:** 2026-08-14 after LAM internal evidence closure, IRIS checksum-backed source recovery, Darcy v2 pre-outcome materialization, latest VertexED production evidence, and FinanceMeta/Bu1LD source recovery. Only blockers that prevent a stronger evidence claim are listed. Closed gates are not retained as blockers.

## P0 — Percy authoritative live state
Existing Mac SQLite/WAL/process/worktree state is not visible from this execution surface. Run `PERCY-STATE-001` non-destructively: snapshot/hash SQLite + WAL + checkpoint state, run integrity/schema checks, reconcile queue counters, leases, heartbeats and stale workers, record dirty worktrees, then independently recount. Do not reset, replace, truncate, vacuum-away evidence, or reconstruct the DB to make counters clean.

## P0 — Project 2424 canonical source recovery
Selected child evidence remains preserved, but umbrella canonical source / dirty-overlay recovery depends on preserved local or Inkling state. Recover verified HEAD/ancestry, overlay manifest + hashes and canonical child map before source-dependent new experiments. Registry count is not research completion. Run a bounded reproduction only when separately authorized and needed to resolve an evidence question.

## P0 product — VertexED exact production revision + authenticated golden journey
Latest scheduled Production Health Monitor `31817794439` on workflow commit `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d` failed all three bounded attempts because live `/api/health` returned healthy but omitted revision identity while the retained monitor expected deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin protection and untrusted-origin rejection passed. Evidence artifact: `production-health-31817794439`, artifact ID `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.

Required closure: identify the canonical Vercel project/deployment, prove the exact served revision without weakening the revision contract or spending for capacity, make the recurring production monitor pass, then execute the disposable-account authenticated core journey with isolation, persistence, recovery/logout, admin-boundary and cleanup evidence.

Connected Supabase database controls are materially stronger than older snapshots, but two advisor actions remain open: leaked-password protection is disabled, and a hosted PostgreSQL security update is available. These warnings are not proof of exploitation and are not grounds to fabricate a release incident.

## P0 — LAM-JEPA owner-controlled release metadata + outside validation
LAM's negative scientific result, source/method reconciliation, raw-artifact provenance, deterministic paper assets and internal skeptical-review package are closed on canonical `LAM-JEPA/main`. Numeric-basis guard is `bf8311e1a4d240e2891e51af38eaf7754944e300`; immutable external reproduction/review packet is `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.

Remaining blockers are intentionally human/external only:
- owner-approved license / redistribution compatibility decision;
- approved author list and order;
- owner-approved `CITATION.cff` / immutable release revision or tag;
- genuinely independent outside reproduction and skeptical review.

Do not infer authorship, licensing or external validation from repository history or packet readiness. Superiority/planner/target claims remain unsupported.

## P0 product — FinanceMeta source review gate
Canonical portal source is recovered at `build-the-future-11/finance4all-global-reach`. Existing branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is verified as 41 commits ahead of `main` and 0 behind and contains the retained security/release-candidate work, including migrations `018`–`021`.

This execution surface cannot open the PR: connector write attempt returned `403 Resource not accessible by integration`, and no authenticated `gh` CLI is available. Required closure: an owner-authorized GitHub identity with write scope opens that **existing** branch against `main`, exact-head CI runs, and the source/security diff is reviewed. Do not recreate the 41 commits in the control repository.

## P0 product — FinanceMeta live production qualification
Even after source review, production remains externally blocked until the owner-controlled Supabase/deployment surfaces are verified. Required closure: verify the intended migration/RLS state including migration `021` where applicable; set the authorized production environment; deploy an exact reviewed revision; run authenticated multi-account core-flow, cross-user isolation/denial, recovery/logout and cleanup checks. Branch-authored local test reports and a green source PR are not live production evidence.

## P0 product — The Bu1LD live production qualification
Canonical source recovery is no longer the blocker: `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` is directly recovered. Production Supabase/auth-provider/domain/deployment surfaces and disposable role-separated accounts remain unavailable. Required closure: exact served revision, migration/schema state, OAuth/domain configuration, hydration, RLS/role/object authorization, seven-role journey, recovery/logout and cleanup evidence. Do not substitute source/release documents for production evidence.

## P1 — IRIS exact residual provenance for frozen baseline-frontier protocol
The successor search is closed and no new architecture is authorized. Substantial exact retained source/package lineage is now checksum-recovered and recorded via canonical merge `d92e06deaa893bfb8273f3f781105ecb155e8aca`.

The remaining blocker is narrower: recover the exact canonical development trajectories and the exact frozen adaptation-metric provenance edge, then cross-hash the six frontier systems/parameterizations and generate a complete input-hash execution manifest. If those edges cannot be recovered, record `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data. Confirmatory seeds `1000–1029` remain quarantined.

## P1 — NPMS canonical source identity
Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment. Deliver canonical source identity + hashes + clean comparison against retained bounded evidence, or a precise `SOURCE_UNRECOVERED` verdict. Preserve known negative spectral/switching/truncation cases; do not invent a replacement implementation.

## P1 — Darcy v2 remaining pre-outcome freeze
`DARCY-FREEZE-001 / darcy-operator-ood-v2` is frozen before outcome, and merge `4280156c94fdac3e92ff300e743e2f2899cd4869` already landed the deterministic 8,192-case generator/spec, M1/A1/A2/B1 controls, machine-readable lock and tests with `training_authorized=false`.

Remaining gate: commit B2 PCA+ridge, B3 FNO and B4 DeepONet implementations plus eligibility tests; exact dependency/environment lock; hardware identity; fixed parameter/compute budgets; and the final generated split-manifest hash. No learned training, ID-test or OOD evaluation is authorized until those inputs are immutable and independently checked. Material post-outcome changes require a new protocol version.

## P1 — APEN / Eigen-JEPA
Secondary research lines remain behind their predeclared stronger learned/statistical controls and natural/OOD gates. Existing mixed/negative evidence remains visible; no in-place rescue.

## P1 — NeuroCAD new scientific claim
The old typed-parser causal interpretation is falsified by the component-v2 diagnostic and is not an open blocker to be rescued. Any new paper-level claim requires a genuinely fresh broader benchmark and competent contemporary direct/program-generation baseline. Do not tune the old 20 cases.

## P1 — Hercules / Olympus
No significant compute until decisive matched protocols are frozen. Architecture names, parameter targets and runtime/governance demos are not trained-model capability evidence.

## Scheduling guard
Zero new major scientific experiment runs are authorized while these higher-information source/live-state gates remain open. Unused compute stays unused rather than becoming low-information work.
