# Master Portfolio Status

Updated: 11 August 2026

This dashboard is evidence-limited. Repository state, exact-head CI, retained scientific artifacts, preview/deployment state and production proof remain separate evidence tiers.

| Project | Canonical source | Current state | Verified evidence | Main blocker / next gate |
|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / SOURCE RELEASE CANDIDATE / MANUAL PROD-ID GATE | Repository CI/browser gates operational. Read-only Supabase metadata showed RLS on all observed public tables and no PUBLIC execute on observed privileged functions. Canonical build-revision recovery PR #233 is exact-head green. | PR #233 is manual/no-deploy. Public production is behaviorally healthy but immutable serving SHA remains unproven. Supabase advisor still reports leaked-password protection disabled + Postgres security upgrade available. |
| Project 2424 | frozen First-100 queue + `portfolio/project2424/` | ACTIVE / 12 MERGED TESTED / 9 GREEN MANUAL / 0 CERTIFIED | 12 queue-consistent runnable/tested implementations merged; PST/NPMS are two additional merged evidence-boundary recoveries; nine distinct current manual First-100 heads independently confirmed exact-head green. | `T2424-0050` identity collision remains on `main`; all nine review paths explicitly require manual decision and do not change counts. |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / NEGATIVE-INCONCLUSIVE ARC LINE | PR #55 merged fail-closed ARC-v5 negative-result slicing; exact head passed CI, Quick Checks and Research QA. Locked confirmatory test remains forbidden for hypothesis rescue. | Superiority/mechanism claims remain unsupported. Publication provenance/license/authorship remains owner-blocked. |
| Notes-to-Video | `vertex-studyAI/Text-To-Video` | SHIPPABLE LOCAL PROTOTYPE / DURABLE LOCAL WORKER | Durable queue merged; bounded attempt processor merged; queue→verified-encoder worker shipped through PR #19 / merge `7a077016174477f7aa169910f473d19a83766ae3`. | Still local/single-host. Draft API lifecycle and content-addressed storage recoveries remain separately manual. Remote artifact finalization/hosting/narration/distributed semantics unvalidated. |
| FinanceMeta | `build-the-future-11/finance4all-global-reach` | ACTIVE / RECOVERABLE / WRITE-BLOCKED | Current `main` still shows broad profile-update + notification-insert risks. Existing hardening branch remains about 41 commits ahead / 0 behind inspected `main`. VertexED control-plane PR #245 also contains a deterministic read-only authorization-hardening overlay with exact-head validation. | Target GitHub writes return `403`; FinanceMeta Supabase not connected. No live RLS change or production-fixed claim. PR #245 is manual/control-plane only. |
| The Bu1LD | `ryangomez010/bu1ld-landing` | SOURCE RELEASE CANDIDATE / EXTERNAL VERIFY BLOCKED | `main` has typecheck/lint/tests/build/release gates and strict production mode with Supabase schema/RLS verification. Obvious Cursor branches are subsumed. | DB apply/verify, OAuth/Auth URLs, env vars, email and seven-role allow/deny smoke require authorized real environment. |
| Atlas | prior canonical reference `build-the-future-11/Atlas` | `BLOCKED_SOURCE` | No installed Atlas repo/source/runtime is exposed through current GitHub installation. | Expose canonical source before any orchestration/runtime claim. |
| Percy | local/runtime source tracked separately | `BLOCKED_SOURCE / BLOCKED_RUNTIME` | No local SQLite DB, worker heartbeat, task queue or runtime source is exercisable through available connector. | Expose local source/runtime; then backup/integrity-check DB, inspect leases/heartbeats and prove one persisted task progression. |

## Project 2424 accounting

- Frozen queue entries: **100**
- Queue-consistent runnable/tested implementations merged: **12**
- Merged evidence-boundary recoveries excluded from implementation count: **2** (`T2424-0016`, `T2424-0019`)
- Exact-head-green manual First-100 review packages: **9**
- Certified complete: **0 / 100**
- Research-complete: **0**
- Known unresolved current-main registry collision: **1** (`T2424-0050`)

## Exact-head-green manual First-100 queue

These packages are **not merged and not counted**. Each explicitly says manual review / no auto-merge / no deploy.

| PR | ID | Project | Current head | CI |
|---:|---|---|---|---:|
| #230 | `T2424-0050` | Darcy Latent Operator | `0131c7d33e967f55e8b07ff5bfc1f03feb164f01` | `31458049157` |
| #231 | `T2424-0024` | Trust Under Uncertainty | `a15f31fbcbef6ab5868cb4f8a30e806f4d8721ca` | `31458059377` |
| #239 | `T2424-0026` | Counterfactual Defect Worlds | `596cb91d0a36a163cb9fab8745f65cbfb1ec47b6` | `31458068712` |
| #234 | `T2424-0028` | Residual Event Tokenization | `bbb173fc2cd93e588883b3798de9712cb29094eb` | `31458080289` |
| #232 | `T2424-0029` | Representation Phase Transitions for PDEs | `f22ab98f2bf93a3437153cba2f2ada6f9593570d` | `31458091370` |
| #238 | `T2424-0035` | Grokking Agent | `bf229ed56b05bfeab3017616f65454aa53cf045a` | `31458102895` |
| #236 | `T2424-0037` | NLP-to-CAD | `83bdeb2c62be88f4b8d84c1a924dd6ec8fd48fa8` | `31458112736` |
| #241 | `T2424-0054` | Theory-Manifold Experiment Planner | `18c41b914a331e3f617026492900b0f7890eef11` | `31458120484` |
| #242 | `T2424-0027` | Sapir–Whorf Latent Tongue | `6e71f109db7bba64e222029f298072ed64cc42de` | `31457981699` |

## Latest tangible execution milestones

### Notes-to-Video

1. Durable local render queue shipped through PR #13 after full workspace/media CI.
2. Bounded queue attempt/retry processor merged subsequently.
3. Queue→encoder handoff shipped through PR #19 at merge `7a077016174477f7aa169910f473d19a83766ae3`, composing durable ownership with the verified FFmpeg encoder, safe deterministic MP4 naming, atomic promotion and a one-job CLI.
4. Duplicate/stale PRs #17 and #20 were closed unmerged after canonical shipment.
5. Draft PR #16 (API lifecycle) and draft PR #21 (local content-addressed store) remain separate product decisions and are not auto-merged.

### T2424-0027 — new evidence-backed package

PR #242 implements a deterministic concept-vs-language latent diagnostic. Initial CI exposed derived evidence and verifier defects; those were repaired without changing the frozen generator, protocol, thresholds, retained raw result or verdict. Exact head `6e71f109db7bba64e222029f298072ed64cc42de` passed canonical CI `31457981699` including release, browser and accessibility jobs.

Actual retained normalized leakage reduction is `0.9583333333333334`, not a rounded/fabricated `1.0`. Linked preview statuses are externally capacity-blocked, and PR #242 is manual/unmerged.

### T2424-0050 — registry integrity

PR #230 is the canonical current manual repair. It restores Darcy, preserves Benchmark Augmentation Theory as auxiliary work and adds frozen queue↔package identity regression. Current head `0131c7d...` passed CI `31458049157`. It is not counted until manual integration.

### VertexED production identity

Draft PR #233 recovers build-stamped immutable revision identity and fail-closed deploy build requirements on source. It is exact-head green/manual. No release was authorized; public serving SHA remains unproven.

### FinanceMeta control-plane recovery

Draft/manual PR #245 contains a three-file VertexED control/certification overlay for the immutable FinanceMeta target, with canonical CI + FinanceMeta authorization validation + integrated release overlay all green on its recorded head. It does not write the target repo or live Supabase and remains manual.

### LAM-JEPA

PR #55 merged negative-result slicing and claim enforcement without accessing locked confirmatory/test data or changing a failed scientific hypothesis.

## Safety boundary

- Production deployments performed: **0**
- Production database mutations performed: **0**
- Secrets printed/committed/rotated: **0**
- Force-pushes/destructive shared-history rewrites: **0**
- Scientific thresholds weakened after observation: **0**
- Negative/inconclusive research relabelled positive: **0**
- Manual packages counted as merged: **0**
- Auxiliary/evidence-only packages double-counted as frozen queue implementations: **0**
