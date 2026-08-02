# Portfolio Control Center

**As of:** 2 August 2026  
**Machine-readable source:** `portfolio/portfolio.yaml`  
**Current host:** temporary, inside `vertex-studyAI/vertexED.ai`, until a dedicated control repository is created and connected.

## Current objective

Complete the three active product certification tracks: VertexED authenticated production, FinanceMeta security and release hardening, and The Bu1LD strict production and role-journey certification. Project 2424 remains next once the canonical implementation workspace is connected.

## Verified current state

- VertexED's public production gate is complete. PRs #9 and #12 are merged, both Vercel projects are healthy, and 52/52 live public browser checks passed across desktop, tablet, and mobile.
- VertexED's remaining boundary requires disposable authenticated sessions and production Supabase/Vercel access. Issue #13 is authoritative.
- The canonical FinanceMeta portal is `build-the-future-11/finance4all-global-reach` at visible main `fbdd503223edc5b1780509720391083f485a4a85`.
- FinanceMeta main still has no GitHub Actions workflow, no one-command release gate, and only a placeholder truth test. A guarded hardening runner is prepared, but GitHub branch creation returns integration-level `403` and its production Supabase project is not connected.
- The accessible Bu1LD member platform is `ryangomez010/bu1ld-landing`, deployed at `https://thebu1ld.com`, with visible main `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`.
- The Bu1LD repository records a passing local `release:check` with 95 tests, TypeScript, ESLint, and production client/SSR builds. Its own verdict remains closed-beta ready, not production-certified, until `release:prod` passes against the real Supabase and server runtime. Issue #16 is authoritative.
- The private `THE-BU1LD/the-bu1ld-nexus-main` and `THE-BU1LD/labos` repositories remain inaccessible through the current GitHub installation.
- LAM-JEPA has one visible commit, no discovered tests or CI, no reproduced benchmark artifact, and no named owner.
- Text-to-Video has one visible commit and a pnpm workspace scaffold, but no discovered test implementation, deployment, user evidence, or owner.

## Executive queue

| Rank | Project | State | Verified maturity | Current milestone | Main blocker | Next action | Priority |
|---:|---|---|---|---|---|---|---:|
| 1 | VertexED.ai | ACTIVE | Public release verified | Authenticated production certification | Disposable admin/user sessions and production dashboard access | Execute issue #13 when access is supplied | 3000 |
| 2 | FinanceMeta | ACTIVE | Canonical portal accessible; release and authorization quality weak | Visitor → activity → saved progress → return | GitHub write integration, production Supabase, deployment URL, and test account | Grant access, apply the prepared hardening patch, and verify the golden journey | 1440 |
| 3 | The Bu1LD | ACTIVE | Live product and strong repository-local release package | Strict production environment and seven-role certification | GitHub write integration, production Supabase/Cloudflare, role accounts, and server secrets | Execute issue #16 after access is connected | 1280 |
| 4 | Project 2424 / Typhon | BLOCKED | Registry and historical reports only | Verify registry and select exactly five flagships | Implementation workspace and raw experiment evidence unavailable | Connect canonical source and artifacts | Unscored |
| 5 | Inkling | BLOCKED | User-reported VM records only | Control-plane verification | Cloud and source access unavailable | Connect repository and cloud state | Unscored |
| 6 | FCC | BLOCKED | User-reported local service only | Routing and reliability verification | Source and running service unavailable | Connect source and service evidence | Unscored |
| 7 | LAM-JEPA | PAUSED | One-commit research scaffold | None while paused | No owner, tests, CI, or reproduced benchmark | Assign a seven-day owner gate or leave paused | Unscored |
| 8 | Text-to-Video | PAUSED | One-commit product scaffold | None while paused | No owner, tests, deployment, or user evidence | Preserve and leave paused | Unscored |
| 9–19 | Hercules, Olympus, APEN, PEN, RIPII, PI-JEPA, Eigen-JEPA, Eigen-Finance, NeuroCAD, Colorworld, Speechly | BLOCKED | Planning or identity evidence only | Evidence verification | Canonical source and artifacts unavailable | Connect sources before activation | Unscored |

## Portfolio decisions

- **Active products:** VertexED, FinanceMeta, and The Bu1LD. This reaches the maximum of three; no fourth product may be activated until one reaches maintenance or is paused.
- **Active flagship research:** zero. No connected candidate has sufficient code and experiment evidence for an honest active designation.
- **The Bu1LD:** ACTIVE because a live, substantive member platform and repository-local release package are now verified. Production certification remains blocked and must not be claimed complete.
- **LAM-JEPA:** PAUSED until a named owner can install, run a seeded benchmark, add tests and CI, and commit raw results within seven days.
- **Text-to-Video:** PAUSED until it can produce a tested end-to-end demo within seven days and directly strengthen VertexED's stable learning journey.
- **PEN / APEN and Eigen-Finance / Eigen-JEPA:** consolidation is a proposal, not a verified repository decision.

## Evidence hierarchy

Repository state, reproducible commands, captured tests, deployed journeys, raw experiment artifacts, and production logs outrank READMEs, plans, historical prompts, and user-reported scale. Unknown evidence remains unknown.

## Access boundary

Direct repository discovery recovered the FinanceMeta portal and The Bu1LD landing/member platform even though neither appeared in the initial installation inventory. GitHub writes to both owner-account repositories still fail at the integration boundary. The private Bu1LD Nexus and LabOS repositories, Project 2424 implementation workspace, production Supabase projects, Cloudflare, and local/cloud infrastructure remain unavailable. A dedicated portfolio-control repository should be created and this directory migrated without rewriting its history.
