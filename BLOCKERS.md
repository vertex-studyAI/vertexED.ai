# BLOCKERS

**As of:** 2026-08-14 after LAM internal evidence closure, Darcy v2 protocol freeze, latest VertexED production evidence, and FinanceMeta source recovery. Only blockers that prevent a stronger evidence claim are listed. Closed gates are not retained as blockers.

## P0 — Percy authoritative live state
Existing Mac SQLite/WAL/process/worktree state is not visible from this execution surface. Run `PERCY-STATE-001` non-destructively: snapshot/hash SQLite + WAL + checkpoint state, run integrity/schema checks, reconcile queue counters, leases, heartbeats and stale workers, record dirty worktrees, then independently recount. Do not reset, replace, truncate, vacuum-away evidence, or reconstruct the DB to make counters clean.

## P0 — VertexED exact production revision + authenticated golden journey
Latest scheduled production-health run `31817794439` on workflow commit `d5e9fcaa8de4e49b236b18ff7d3c515ed5f1ed6d` failed all three bounded attempts because live `/api/health` returned healthy but omitted revision identity while the retained monitor expected deploy-relevant revision `e2ecd19ed9816f8f36369c7dc0f38e39942ca73a`. Homepage, API-router, malformed-waitlist, logged-out AI/user/admin protection and untrusted-origin rejection passed. Evidence artifact: `production-health-31817794439`, artifact ID `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a`.

Both connected Vercel project statuses on the control head currently report deployment rate limiting. Required closure: wait for existing authorized capacity or an explicitly owner-authorized path; identify the canonical Vercel project/deployment; deploy an exact verified runtime revision without weakening the revision contract; prove `/api/health` body/header revision equality; make the recurring production monitor pass; then execute the disposable-account authenticated core journey with cleanup evidence. Do not incur paid-resource charges or add product features to work around deployment-identity uncertainty.

## P0 — Project 2424 canonical source recovery
Selected child evidence remains preserved, but umbrella canonical source / dirty-overlay recovery depends on preserved local or Inkling state. Recover verified HEAD/ancestry, overlay manifest + hashes, smallest authorized baseline rerun and canonical child map before source-dependent new experiments. Registry count is not research completion.

## P0 — LAM-JEPA owner-controlled release metadata + outside validation
LAM's negative scientific result, source/method reconciliation, raw-artifact provenance, deterministic paper assets and internal skeptical-review package are closed on canonical `LAM-JEPA/main`. Numeric-basis guard is `bf8311e1a4d240e2891e51af38eaf7754944e300`; immutable external reproduction/review packet is `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.

Remaining blockers are intentionally human/external only:
- owner-approved license / redistribution compatibility decision;
- approved author list and order;
- owner-approved `CITATION.cff` / immutable release revision;
- genuinely independent outside reproduction and skeptical review.

Do not infer authorship, licensing or external validation from repository history or packet readiness. Superiority/planner/target claims remain unsupported.

## P0 product — FinanceMeta source review gate
Canonical portal source is recovered at `build-the-future-11/finance4all-global-reach`. Branch `cursor/membership-security-supabase-fix` is 41 commits ahead of `main` and 0 behind and contains the retained security/release-candidate work, including migrations `018`–`021` and verification tooling.

This execution surface cannot open the PR in that personal repository: connector write attempt returned `403 Resource not accessible by integration`, and no authenticated `gh` CLI is available. Required closure: an owner-authorized GitHub identity with write scope opens that **existing** branch against `main`, exact-head CI runs, and the source/security diff is reviewed. Do not recreate the 41 commits in the control repository and do not call the branch production-deployed.

## P0 product — FinanceMeta live production qualification
Even after source review, production remains externally blocked until the owner-controlled Supabase/deployment surfaces are verified. Required closure: apply and verify the complete intended migration/RLS state including `021_analytics_journey_events.sql`; set the authorized production environment; deploy an exact reviewed revision; run authenticated multi-account core-flow, cross-user isolation/denial, persistence, recovery/logout and cleanup checks. Branch-authored local test reports and a green source PR are not live production evidence.

## P1 — The Bu1LD target access
Canonical writable target/runtime surface remains unavailable from this execution surface. Production authorization, RLS/role boundaries, deployment identity and authenticated seven-role golden-journey evidence remain externally blocked. Do not substitute control-repo activity for production evidence.

## P1 — IRIS exact retained source for frozen baseline-frontier protocol
The current successor search is closed and no new architecture is authorized. `IRIS_BASELINE_FRONTIER_PROTOCOL_20260814.md` is frozen; execution is blocked on exact retained development trajectories, implementations/parameters and metric code. If exact source cannot be recovered, record `PROTOCOL_BLOCKED`; do not regenerate approximately equivalent data. Confirmatory seeds `1000–1029` remain quarantined.

## P1 — NPMS canonical source identity
Recover the original NPMS scientific source/config/checkpoint before any new natural/OOD experiment. Deliver canonical source identity + hashes + clean rerun against retained bounded evidence, or a precise `SOURCE_UNRECOVERED` verdict. Preserve known negative spectral/switching/truncation cases; do not invent a replacement implementation.

## P1 — Darcy v2 implementation/config/hash gate
`DARCY-FREEZE-001 / darcy-operator-ood-v2` is already frozen before any v2 outcome. The remaining gate is `DARCY-V2-MATERIALIZE-002`: commit the exact generator/source revision, split/data manifests and hashes, reference-solver tests, learned implementations, library versions, model budgets, optimizer/tuning grid, seeds, hardware/compute cap and dataset identities required by the protocol. No v2 training, ID-test or OOD-test outcome is authorized until those inputs are immutable. Material post-outcome changes require a new protocol version.

## P1 — APEN / Eigen-JEPA
Secondary research lines remain behind their predeclared stronger learned/statistical controls and natural/OOD gates. Existing mixed/negative evidence remains visible; no in-place rescue.

## P1 — NeuroCAD new scientific claim
The old typed-parser causal interpretation is falsified by the component-v2 diagnostic and is not an open blocker to be rescued. Any new paper-level claim requires a genuinely fresh broader benchmark and competent contemporary direct/program-generation baseline. Do not tune the old 20 cases.

## P1 — Hercules / Olympus
No significant compute until decisive matched protocols are frozen. Architecture names, parameter targets and runtime/governance demos are not trained-model capability evidence.

## Scheduling guard
Zero new major scientific experiment runs are authorized while these higher-information source/live-state gates remain open. Unused compute stays unused rather than becoming low-information work.
