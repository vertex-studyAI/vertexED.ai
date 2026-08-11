# Master Portfolio Status

Updated: 11 August 2026

This dashboard is evidence-limited. Repository state, exact-head CI, retained scientific artifacts, and read-only connected-service observations are kept separate from production deployment and external validation claims.

| Project | Canonical source | Current state | Verified evidence | Main blocker / next gate |
|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / SOURCE RELEASE CANDIDATE / MANUAL PROD-ID GATE | Current source CI/browser gates remain operational. Read-only Supabase metadata showed RLS on all observed public tables and no PUBLIC execute on observed `SECURITY DEFINER` functions. Canonical build-revision recovery PR #233 is exact-head green. | PR #233 is manual/no-deploy. Public production is behaviorally healthy but the immutable SHA actually serving `www.vertexed.app` remains unproven. Supabase advisor still reports leaked-password protection disabled and an available Postgres security upgrade. |
| Project 2424 | frozen First-100 queue + `portfolio/project2424/` | ACTIVE / 12 MERGED TESTED / 0 CERTIFIED | 12 queue-consistent runnable/tested implementations are merged. PST and NPMS have two additional merged evidence-boundary recoveries, excluded from the implementation count. | `T2424-0050` identity collision remains on `main`; PR #230 is exact-head green but manual/no-deploy. New `T2424-0027` package PR #242 is exact-head GitHub-Actions green but manual-gated with external preview build-rate-limit. |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / NEGATIVE-INCONCLUSIVE ARC LINE | PR #55 merged fail-closed ARC-v5 negative-result slicing. Its exact head passed CI, Quick Checks and Research QA. Locked confirmatory test remains forbidden for hypothesis rescue. | Superiority/mechanism claims remain unsupported. Publication provenance/license/authorship decision remains owner-blocked. |
| Notes-to-Video | `vertex-studyAI/Text-To-Video` | SHIPPABLE LOCAL PROTOTYPE / DURABLE LOCAL WORKER | Durable file-backed render queue merged; bounded attempt processor merged; queue→verified-encoder one-job worker shipped on `main` through PR #19 / merge `7a077016174477f7aa169910f473d19a83766ae3`. | Still local/single-host: remote artifact storage, transactional queue/media finalization, hosted download, production narration, deployment and distributed exactly-once semantics remain outside validated scope. Draft API lifecycle/content-addressed-store work remains separately gated. |
| FinanceMeta | `build-the-future-11/finance4all-global-reach` | ACTIVE / RECOVERABLE / WRITE-BLOCKED | Current `main` still shows broad profile-update and notification-insert boundaries. `cursor/membership-security-supabase-fix` remains about 41 commits ahead / 0 behind inspected `main`, containing later RLS/profile/notification hardening, CI and E2E work. | GitHub branch/PR writes return `403 Resource not accessible by integration`; FinanceMeta Supabase is not connected. Require writable recovery PR + exact-head CI + real final RLS verification. |
| The Bu1LD | `ryangomez010/bu1ld-landing` | SOURCE RELEASE CANDIDATE / EXTERNAL VERIFY BLOCKED | `main` has typecheck/lint/tests/build/release gates and strict production mode with Supabase schema/RLS verification. Obvious Cursor branches are already subsumed. | DB apply/verify, OAuth/Auth URLs, env vars, email configuration and seven-role allow/deny smoke tests require real environment/credentials. |
| Atlas | prior canonical reference `build-the-future-11/Atlas` | `BLOCKED_SOURCE` | No installed Atlas repository/source/runtime is exposed through the active GitHub installation. | Expose canonical source before any orchestration/runtime claim. |
| Percy | local/runtime source tracked separately | `BLOCKED_SOURCE / BLOCKED_RUNTIME` | No local SQLite database, worker heartbeat, task queue or runtime source is exercisable through the available connector. | Expose local source/runtime; then backup DB, integrity-check, inspect leases/heartbeats, run one real task and prove persisted progression. |

## Project 2424 accounting

- Frozen queue entries: **100**
- Queue-consistent runnable/tested implementations merged: **12**
- Merged evidence-boundary recoveries excluded from implementation count: **2** (`T2424-0016`, `T2424-0019`)
- Certified complete: **0 / 100**
- Research-complete: **0**
- Known unresolved current-main registry collision: **1** (`T2424-0050`)
- Exact-head-green manual packages not counted as merged: `T2424-0050` PR #230; `T2424-0027` PR #242

## Latest tangible execution milestones

### Notes-to-Video

1. Durable local render queue shipped through PR #13: file-backed job state, idempotency, leases/heartbeats, stale-lease recovery, cancellation, retry/failure states, atomic persistence, fail-closed state validation and focused tests.
2. Bounded local attempt policy merged subsequently.
3. Queue→encoder handoff shipped through PR #19 at merge `7a077016174477f7aa169910f473d19a83766ae3`, composing durable queue ownership with the existing verified FFmpeg encoder, deterministic safe MP4 naming, atomic media promotion and a one-job CLI.
4. Duplicate/stale recovery PRs #17 and #20 were closed unmerged after the canonical current-main lineage shipped.

### T2424-0027 — new evidence-backed package

PR #242 implements a deterministic concept-vs-language latent diagnostic. The first CI attempts exposed derived evidence and verifier defects; those were repaired without changing the frozen generator, protocol, thresholds, raw result or verdict. Exact head `6e71f109db7bba64e222029f298072ed64cc42de` passed canonical CI `31457981699` including release, browser and accessibility jobs.

The retained normalized leakage-reduction value is `0.9583333333333334`, not a rounded/fabricated `1.0`. PR #242 remains draft/manual and unmerged because external linked preview statuses are capacity-blocked; therefore the merged First-100 count remains 12.

### T2424-0050 — registry integrity

Canonical current repair is PR #230, not the older #216 lineage. It is exact-head green and adds a frozen queue↔package identity regression while preserving Benchmark Augmentation Theory as auxiliary work. It remains manual/no-deploy and is not counted.

### VertexED production identity

Canonical source-side recovery is draft PR #233. It adds a build-stamped immutable revision fallback and fail-closed deploy build requirement while preserving current health/readiness logic. Source CI is green, but no production deploy was authorized and the public domain has not been proven to serve that exact SHA.

### LAM-JEPA

Negative-result analysis advanced rather than being tuned away: PR #55 merged fail-closed slicing of the unlocked repaired ARC-v5 validation evidence and refuses locked confirmatory/test access.

## Safety boundary

- Production deployments performed: **0**
- Production database mutations performed: **0**
- Secrets printed/committed/rotated: **0**
- Force-pushes or destructive shared-history rewrites: **0**
- Negative/inconclusive research relabelled positive: **0**
- Auxiliary or evidence-only packages double-counted as frozen queue implementations: **0**
