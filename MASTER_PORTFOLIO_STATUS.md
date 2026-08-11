# Master Portfolio Status

Updated: 11 August 2026

This status is evidence-limited. It records only repositories, CI, database metadata, and artifacts actually visible in the connected tools. It does not convert queues, speculative roadmaps, deployment intent, or green source tests into production or scientific-completion claims.

| Project | Canonical repo/source | State | Tests/evidence | Main blocker | Best next artifact | Priority | Owner |
|---|---|---|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / RELEASE-CANDIDATE SOURCE | Canonical CI passed on all three Project 2424 recovery heads landed in this continuation. Live connected Supabase metadata shows RLS enabled on every public table; the two public-schema `SECURITY DEFINER` functions have explicit `search_path` settings and no PUBLIC execute privilege. | Exact immutable revision serving the public production domain and authenticated production journeys remain unproven. Supabase advisor also reports leaked-password protection disabled and an available Postgres security-patch upgrade. | Prove live revision + authenticated disposable-account journey; enable leaked-password protection and schedule controlled Postgres upgrade | P0/P1 | VertexED |
| Project 2424 | implementation packages tracked under `portfolio/project2424/` in this repo; historical/local source identity remains separately tracked | ACTIVE / RECOVERED TOOLING | `8` runnable/tested First-100 packages are merged on `main` after T2424-0046, T2424-0050 and T2424-0053 recovery. Certified complete remains `0 / 100`. | Most First-100 entries still lack the nine-gate completion evidence package; several older PRs carry explicit no-auto-merge boundaries. | Land only evidence-cleared recovery work, then add raw artifacts, ablation/negative analysis and independent QA to the strongest packages | P0 | Project 2424 |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / ACTIVE | Current research status records a reproducible external ARC pipeline and retained negative/inconclusive validation; the confirmatory test remains locked for the failed line. | Current evidence does not support ARC superiority/mechanism claims; publication provenance/licensing remains open. | Preserve the stop rule; package the negative result and start any new hypothesis under a separately frozen protocol | P0 research | LAM-JEPA |
| Notes-to-Video | `vertex-studyAI/Text-To-Video` | SHIPPABLE LOCAL PROTOTYPE | Existing repository evidence records local render/smoke verification. | Production rendering/hosting, durable queue/storage lifecycle and real narration pipeline remain outside the validated local prototype. | Production-grade render queue/storage boundary or retain as a polished local demo | P1 | Text-To-Video |
| FinanceMeta | `build-the-future-11/finance4all-global-reach` | ACTIVE / RECOVERABLE | Repo is now connector-visible. Current `main` still exposes an over-broad own-profile UPDATE policy and an authenticated notification INSERT policy. Existing branch `cursor/membership-security-supabase-fix` is `41` commits ahead / `0` behind `main` and contains later security hardening, CI, tests and release work. | GitHub integration can read the repo but branch creation and PR creation both returned `403 Resource not accessible by integration`; production Supabase is not connected here. | Restore GitHub write permission or open the existing hardening branch as a PR, then require exact-head CI and real Supabase RLS verification before applying migrations | P0/P1 | FinanceMeta |
| The Bu1LD | `ryangomez010/bu1ld-landing` | ACTIVE / RELEASE-CANDIDATE SOURCE | Repo is connector-visible. Two obvious Cursor branches are fully subsumed by `main` (`0` commits ahead). `main` has CI for typecheck/lint/tests/build/release check and a strict production gate that adds Supabase schema/RLS verification. | Its own remaining-actions artifact says only credentialed/external steps remain: DB apply/verify, auth URLs, deployment variables, email configuration and seven-role smoke tests. Bu1LD Supabase is not connected here. | Run `release:prod` in the real deployment environment and complete seven-role smoke certification after credential/configuration setup | P0/P1 | The Bu1LD |
| Atlas | prior canonical reference `build-the-future-11/Atlas`; not exposed to this GitHub installation | BLOCKED | No current connector-visible source evidence in this execution window. | Canonical repository/runtime remains unavailable through this connector. | Expose canonical Atlas repo, then inspect orchestration/runtime state | P1 | Atlas |
| Percy | local control-plane source tracked separately; no connector-visible canonical repo | BLOCKED / RECOVERABLE | Prior schema/runtime failure evidence exists, but no current local SQLite/runtime can be exercised here. | Local source/runtime is not available through this connector. | Repair from the local source and prove real worker liveness/state recovery | P0 | Percy |

## Changes executed in this continuation

1. Closed stale superseded Project 2424 PRs #189 and #191 without merging.
2. Merged PR #192, T2424-0046 Auto-Research Foundry, after exact-head CI success; merge commit `d15703b0fdd63dc5d6d2ff7fca12d5d27a432502`.
3. Recovered stale T2424-0050 onto current `main`, created PR #199, waited for full canonical CI success, then merged it as `615fb12f26963a355553f10379df85d26323c4ea`.
4. Closed superseded T2424-0050 PR #193 after the clean recovery landed.
5. Recovered T2424-0053 Scientific Motif Dictionary as PR #203, forced fresh final-base CI, then merged it as `c587f4e0fa91c59e82099d2fb9c68dea3abe8a16`; stale PR #179 was closed unmerged.
6. Reclassified FinanceMeta and Bu1LD from “repository inaccessible” using live connector evidence; no production DB migration or deployment was performed.
7. Performed read-only VertexED Supabase security metadata checks; no user rows, secrets, DDL or production mutations were touched.

## Claim boundary

- No production deployment was performed.
- No production database mutation was performed.
- No First-100 project was promoted to `Certified complete` without the nine required evidence gates.
- No research result was invented or upgraded from negative/inconclusive to positive.
- FinanceMeta write access remains blocked even though its repository is readable.
- Green source/CI/browser evidence is not treated as proof of the immutable revision currently serving the public production domain.
