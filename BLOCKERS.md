# BLOCKERS

**As of:** 2026-08-23 execution run. Only blockers that prevent a stronger evidence claim are listed.

## P0 PRODUCT — VertexED exact production identity + authenticated journey
Repository-side release evidence is strong, including the current private-beta QA contract merged in PR #495. The latest retained production-health failure is still issue #137 / run `32637040541`: the public surface is reachable and logged-out boundaries pass, but `/api/health` does not expose the required immutable deployed revision. Both connected Vercel project contexts remain subject to free-tier deployment-rate limiting and the canonical project/domain owner has not been proven through the connected surface.

Remaining release gates:
- identify the single Vercel project that owns `www.vertexed.app`;
- deploy a current release-relevant `main` revision once capacity is available;
- prove body + `X-VertexED-Revision` expose that exact immutable SHA;
- run the disposable private-beta journey in issue #13, including persistence, recovery, logout rejection and two-account isolation;
- resolve the two Supabase platform warnings tracked in #42 without unapproved billing or unsafe upgrade behavior.

Do not weaken the revision assertion, substitute logged-out smoke evidence for authenticated certification, expose credentials, or buy deployment capacity without an explicit owner decision.

## P0 PRODUCT — NeuroCAD public artifact certification + external validation
PR #497 merged as `54d12ecd5956292b59d6627f912a214e9f9c9136`, replacing the blocked Pages/Vercel publication path with an immutable commit-pinned CDN release workflow. The workflow has created branch `neurocad-public` at release commit `e184db4673c266a8f36301668ec923fbe00267fc`. The generated `index.html` is stamped with source revision `54d12ecd5956292b59d6627f912a214e9f9c9136` and artifact revision `sha256:aa1aa53d82c6d8aa1bbef4eddde4d205ec80f77d08ccae42d7e29984a93605cb`.

Publication alone is not the final product gate. Remaining:
- retain a successful public flagship browser-certification run against the immutable CDN URL before closing G12;
- preserve the `VALIDATION_DOMINANT` scientific result and bounded Alpha claims;
- complete external engineering pilots: outreach alone is not validation;
- reach at least three evidence-backed design partners, two repeat tests and one bounded organization pilot before any enterprise-ready claim.

## P0 — Percy authoritative live state
Live Mac SQLite/WAL/checkpoint/process/worktree state is unavailable through the connected GitHub/Supabase surfaces. Preserve/hash DB + WAL + checkpoint, run integrity/schema checks, reconcile counters/leases/heartbeats/stale workers and dirty worktrees, and independently recount. Never reset or create a replacement DB to manufacture a pass.

## P0 — Project 2424 canonical source + provenance closure
The control-plane closure work in PR #492 is still draft and must preserve negative/mixed/falsified outcomes. Umbrella source/ancestry/dirty-overlay recovery remains external for claims that depend on the canonical historical source. Issue #496 tracks the remaining evidence-changing work: authoritative historical-to-current lineage, First-100 reconciliation, PST/NPMS canonical source identity, Darcy 2D successor freeze, NeuroCAD successor identities and the IRIS exact-provenance edge.

Never infer `P2424-*` ↔ `T2424-*` identity from numeric suffix alone. Registry/proposal counts are not implementation or completion counts.

## P0 — LAM owner release metadata + external validation
Scientific negative result and internal evidence package are closed. Remaining: owner-approved license/redistribution, author list/order, `CITATION.cff`, immutable release revision/tag, and genuinely independent reproduction/review of packet `218ea1bea686cdf8c281520b2b636897bc8b8dd2`.

## P0 PRODUCT — FinanceMeta source hardening publication
Canonical target is `build-the-future-11/finance4all-global-reach`. The confirmed role-escalation risk and prepared hardening package remain tracked in issue #19. This connector can read the repository but does not currently have the owner write path or FinanceMeta Supabase project required to apply and production-certify the remediation. Source readiness is not production authorization.

Required external dependency: owner-authorized repository write access plus the FinanceMeta production Supabase target. Then apply the guarded hardening branch/migration, run exact-head CI/security gates, and verify normal-member role escalation is impossible before production certification.

## P0 PRODUCT — The Bu1LD production
Canonical accessible source remains `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`. Live production certification is still blocked by inaccessible production Supabase/Cloudflare configuration and the unresolved production hydration/deployment-skew issue #84. Source-gate evidence must not override live role-journey requirements in #16.

Required: exact deployed revision, coherent SSR/client build, clean hydration on desktop/mobile, production schema/RLS checks, seven-role journey, recovery/notification/export/deletion checks and cleanup evidence.

## P1 — IRIS exact residual provenance
Checksum-backed retained source/package lineage is recovered via `d92e06deaa893bfb8273f3f781105ecb155e8aca`. Remaining: exact canonical development trajectories and exact frozen adaptation-metric provenance, then cross-hash the six frontier systems/parameters and input manifest. Seeds `1000–1029` remain forbidden; approximate regeneration is prohibited.

## P1 — Darcy 2D successor freeze
The retained T2424-0050 parent remains `HOLD / MIXED_ROBUSTNESS` and must not be rescue-tuned. Before new training or test-outcome access, freeze the 2D generator/dataset hashes, ID/OOD/resolution-transfer splits, harmonic/arithmetic/PCA controls, matched FNO + DeepONet comparators, seeds, metrics, falsification criteria, compute accounting, environment/hardware/model budgets and an execution-authorization manifest. No closure automation may auto-merge/deploy this experiment.

## P1 — NPMS source identity
Recover the original canonical source/config/result/evidence tree or close the canonical package explicitly as `SOURCE_BLOCKED`. Do not silently substitute later derived Atlas bundles. Preserve the current `PARAMETER_CONFOUNDED_OR_NON_UNIQUE` mechanism boundary and known negative cases.

## Scheduling guard
Zero new major scientific experiment runs are authorized merely because a lane is blocked. Prefer closure, provenance recovery, reproducibility and independently reviewable evidence over speculative substitute projects.
