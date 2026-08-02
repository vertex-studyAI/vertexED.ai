# Portfolio Control Center

**As of:** 2 August 2026  
**Machine-readable source:** `portfolio/portfolio.yaml`  
**Current host:** temporary, inside `vertex-studyAI/vertexED.ai`, until a dedicated control repository is created and connected.

## Current objective

Complete the three active product certification tracks while restoring Project 2424's canonical source to a verified Inkling Git checkout. Research activation remains frozen until the current repository, dirty working-tree overlay, tests, experiments, and conflicting project counts are reconciled.

## Verified current state

- VertexED's public production gate is complete. PRs #9 and #12 are merged, both Vercel projects are healthy, and 52/52 live public browser checks passed across desktop, tablet, and mobile.
- VertexED's remaining boundary requires disposable authenticated sessions and production Supabase/Vercel access. Issue #13 is authoritative.
- The canonical FinanceMeta portal is `build-the-future-11/finance4all-global-reach` at visible main `fbdd503223edc5b1780509720391083f485a4a85`.
- FinanceMeta main still has no GitHub Actions workflow, no one-command release gate, and only a placeholder truth test. A guarded hardening runner is prepared, but GitHub branch creation returns integration-level `403` and its production Supabase project is not connected. Issue #19 is authoritative.
- The accessible Bu1LD member platform is `ryangomez010/bu1ld-landing`, deployed at `https://thebu1ld.com`, with visible main `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`.
- The Bu1LD repository records a passing local `release:check` with 95 tests, TypeScript, ESLint, and production client/SSR builds. Its own verdict remains closed-beta ready, not production-certified, until `release:prod` passes against the real Supabase and server runtime. Issue #16 is authoritative.
- Project 2424's canonical current source was observed at `/Volumes/PRO-BLADE/Atlas/Project-2024/Project_2424`, on `main`, with local bundle origin `/Volumes/PRO-BLADE/Project-2024/Project_2424_Execute_Now/Project_2424_Ready.bundle` and substantial uncommitted seven-phase work.
- The prior Inkling sync was not a repository restore: `/home/ryan/projects/project-2424` contained only `INKLING.md`. The same flawed sync reused the Project 2424 source under FinanceMeta and The Bu1LD labels, so its project-specific pass messages are not trusted.
- Historical Project 2424 handoffs disagree across 24 source-ready projects, 34 source-backed projects, 55 locally accepted projects, and 2,424 proposal contracts. None is treated as current until the restored source is rerun and reconciled.
- `portfolio/scripts/restore_project2424_to_inkling.sh` now provides a preservation-first restore: complete Git bundle, staged/unstaged patches, untracked archive, transfer hashes, isolated cloud staging, `git fsck`, prior-directory backup, atomic promotion, optional isolated quality gate, and retained evidence. Issue #20 is authoritative.
- The private `THE-BU1LD/the-bu1ld-nexus-main` and `THE-BU1LD/labos` repositories remain inaccessible through the current GitHub installation.
- LAM-JEPA and Text-to-Video remain paused because neither has a named owner and current reproduced evidence.

## Executive queue

| Rank | Project | State | Verified maturity | Current milestone | Main blocker | Next action | Priority |
|---:|---|---|---|---|---|---|---:|
| 1 | VertexED.ai | ACTIVE | Public release verified | Authenticated production certification | Disposable admin/user sessions and production dashboard access | Execute issue #13 when access is supplied | 3000 |
| 2 | FinanceMeta | ACTIVE | Canonical portal accessible; release and authorization quality weak | Visitor → activity → saved progress → return | GitHub write integration, production Supabase, deployment URL, and test account | Execute issue #19 | 1440 |
| 3 | The Bu1LD | ACTIVE | Live product and strong repository-local release package | Strict production environment and seven-role certification | GitHub write integration, production Supabase/Cloudflare, role accounts, and server secrets | Execute issue #16 | 1280 |
| 4 | Project 2424 / Typhon | BLOCKED | Canonical local Git source identified; cloud copy failed | Preservation-first Inkling restore and baseline reconciliation | PRO-BLADE-only source, dirty overlay, marker-only cloud directory, historical-only test claims | Run the versioned restore tool with `--verify`, then execute issue #20 | Unscored |
| 5 | Inkling | BLOCKED | Core services historically healthy; project checkout integrity failed | Restore real Git checkouts and re-audit security/recovery | No cloud connector in this session; marker-only project directories; prior wildcard CORS warning | Restore Project 2424, then audit all project directories and Open WebUI CORS | Unscored |
| 6 | FCC | BLOCKED | User-reported local service only | Routing and reliability verification | Source and running service unavailable | Connect source and service evidence | Unscored |
| 7 | LAM-JEPA | PAUSED | One-commit research scaffold | None while paused | No owner, tests, CI, or reproduced benchmark | Assign a seven-day owner gate or leave paused | Unscored |
| 8 | Text-to-Video | PAUSED | One-commit product scaffold | None while paused | No owner, tests, deployment, or user evidence | Preserve and leave paused | Unscored |
| 9–19 | Hercules, Olympus, APEN, PEN, RIPII, PI-JEPA, Eigen-JEPA, Eigen-Finance, NeuroCAD, Colorworld, Speechly | BLOCKED | Planning or identity evidence only | Evidence verification | Canonical source and artifacts unavailable until Project 2424 recovery | Recover and reconcile Project 2424 before activation | Unscored |

## Portfolio decisions

- **Active products:** VertexED, FinanceMeta, and The Bu1LD. This reaches the maximum of three; no fourth product may be activated until one reaches maintenance or is paused.
- **Active flagship research:** zero. Recovering a repository is not equivalent to verifying a research result.
- **Project 2424:** remains BLOCKED, but no longer because the source identity is unknown. The source is identified; the immediate gate is lossless restoration and evidence reconciliation.
- **The Bu1LD:** ACTIVE because a live, substantive member platform and repository-local release package are verified. Production certification remains blocked and must not be claimed complete.
- **LAM-JEPA:** PAUSED until a named owner can install, run a seeded benchmark, add tests and CI, and commit raw results within seven days.
- **Text-to-Video:** PAUSED until it can produce a tested end-to-end demo within seven days and directly strengthen VertexED's stable learning journey.
- **PEN / APEN and Eigen-Finance / Eigen-JEPA:** consolidation is a proposal, not a verified repository decision.

## Project 2424 recovery contract

Run from the Mac with the PRO-BLADE mounted and authenticated `gcloud` access:

```bash
bash portfolio/scripts/restore_project2424_to_inkling.sh --verify --keep-local-package
```

The script must not be replaced with `tar`-only copying, `git reset --hard`, `git clean -fd`, or in-place cloud overwrite. Completion requires the promoted Inkling directory to be a valid Git repository with the source HEAD, preserved overlay, transfer hashes, recovery evidence, and a captured quality-gate result.

## Evidence hierarchy

Repository state, reproducible commands, captured tests, deployed journeys, raw experiment artifacts, and production logs outrank READMEs, plans, historical prompts, and user-reported scale. Unknown evidence remains unknown.

## Access boundary

Direct repository discovery recovered the FinanceMeta portal and The Bu1LD platform, but GitHub writes to both owner-account repositories still fail at the integration boundary. Project 2424 execution requires the user's Mac, mounted PRO-BLADE, and GCP authentication; those systems are not connected to this session. The private Bu1LD Nexus and LabOS repositories, production Supabase projects, Cloudflare, and FCC remain unavailable. A dedicated portfolio-control repository should be created and this directory migrated without rewriting its history.
