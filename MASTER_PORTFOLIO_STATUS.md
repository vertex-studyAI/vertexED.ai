# Master Portfolio Status

**Updated:** 11 August 2026 — final latest-base checkpoint  
**VertexED monorepo main:** `662de36af18b1251e6441391ac3fc06df7a3bf71`

Repository green is not production proof; synthetic evidence is not external validation; recovered evidence is not recovered source. Open/manual-gated PRs do not change merged counts.

## Portfolio summary

| Project | State | Verified current evidence | Main blocker / next gate |
|---|---|---|---|
| VertexED.ai | ACTIVE / LATEST-BASE-GREEN MANUAL REVIEW PATHS | #233 final head `ca9b06b3a208c0f55d9c0c8a287691c3ae1bbba5`: CI `31458194462` SUCCESS + Production Health Monitor `31458194479` SUCCESS. #240 final head `25d739d84b5649a14fec5c4db1dfc129bf337303`: CI `31458207037` SUCCESS. Both were rechecked after main #243. | Both remain draft/manual/no-deploy. Public exact serving SHA and disposable-account authenticated production journey remain unproven. Vercel preview hit the free-plan daily deployment cap. |
| Project 2424 | ACTIVE / 12 MERGED TESTED + 2 EVIDENCE RECOVERIES | Frozen queue 100; 12 queue-consistent runnable/tested merged; PST/NPMS evidence recoveries merged but excluded from implementation count; 0 Certified complete; 8 latest-base-green manual review paths. | `T2424-0050` collision remains on main until #230 manual merge decision. Open green PRs do not change counts. |
| LAM-JEPA | RESEARCH-ONLY / NEGATIVE-INCONCLUSIVE | Current main `f9b10c768d7e93eccb440761306bd992c3ec6a5a` includes retained-row negative slicing and fail-closed ARC claim enforcement. | ARC superiority remains unsupported / `RESEARCH_COMPLETE_FALSE`; do not tune locked confirmatory data or weaken thresholds. Licensing/citation provenance remains human-gated. |
| Text-To-Video | SHIPPABLE LOCAL PROTOTYPE / DURABLE SINGLE-HOST QUEUE MERGED | Current main `73495ed6a7cba09330b6eb86447679874c3f2d45` includes durable local queue + leases/recovery + bounded attempt policy. #16 head `98fd04b04e43b91c229820ac5386db78d5f3ff8a`, CI `31457181357` SUCCESS; #9 remains green draft local content-addressed storage. | No distributed exactly-once guarantee, cloud durability, hosted rendering, production narration, autoscaling, deployment or SLO. |
| FinanceMeta | ACTIVE / SECURITY RECOVERY SOURCE-VISIBLE / WRITE BLOCKED | Inspected `build-the-future-11/finance4all-global-reach` main `fbdd503223edc5b1780509720391083f485a4a85`; `cursor/membership-security-supabase-fix` was +41 / -0 with later RLS/profile/notification/security-definer hardening. | Fresh recovery PR and collaborator-permission introspection both return `403 Resource not accessible by integration`. Production Supabase final policy state remains unverified; no migration applied. |
| The Bu1LD | ACTIVE / RELEASE SOURCE-VISIBLE / WRITE BLOCKED | `ryangomez010/bu1ld-landing` main `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`; source has typecheck/tests/lint/build, Supabase verify/RLS and strict release checks. | Creating a safe CI branch returns `403 Resource not accessible by integration`. Real Supabase/Auth/email environment plus seven-role allowed/forbidden smoke certification remain external gates. |
| Atlas | BLOCKED_SOURCE | Prior canonical `build-the-future-11/Atlas` resolves 404; no unrelated public repo substituted. | Expose/create canonical Atlas source, then inspect scheduler/workers/state/persistence/logs/recovery/concurrency. |
| Percy | BLOCKED_SOURCE / BLOCKED_RUNTIME | No current Percy source/SQLite/runtime is exposed. | Real health proof must show process alive + task claimed + heartbeat + persisted state + progress + failure recovery. |
| RIS | LOW-MATURITY PROTOTYPE | Small finite-difference Hessian demonstration; no strong current CI/research evidence surfaced. | Lower value than canonical active products; add protocol/tests/evidence before strong research claims. |
| IY-ERN | LANDING APP / LOW CURRENT LEVERAGE | Basic Vite/React app. | No urgent verified P0 surfaced. |
| FinanceMeta-Global | SHOWCASE / LOW CURRENT LEVERAGE | Showcase/code collection. | Canonical FinanceMeta product/security repo has higher execution value. |
| FinanceMeta-Landing | LEGACY LANDING APP | Older Vite/React landing app. | Canonical FinanceMeta application has higher execution value. |

## Project 2424 accounting

```text
queue entries:                         100
queue-consistent runnable merged:       12
queue-consistent tested merged:         12
evidence-only merged recoveries:         2
Certified complete:                    0/100
research-complete:                       0
current-main registry collisions:        1
latest-base-green manual review paths:   8
```

Final post-#243 review heads/runs:

- #230 `T2424-0050` — `0131c7d33e967f55e8b07ff5bfc1f03feb164f01`, CI `31458049157` SUCCESS
- #231 `T2424-0024` — `a15f31fbcbef6ab5868cb4f8a30e806f4d8721ca`, CI `31458059377` SUCCESS
- #239 `T2424-0026` — `596cb91d0a36a163cb9fab8745f65cbfb1ec47b6`, CI `31458068712` SUCCESS
- #234 `T2424-0028` — `bbb173fc2cd93e588883b3798de9712cb29094eb`, CI `31458080289` SUCCESS
- #232 `T2424-0029` — `f22ab98f2bf93a3437153cba2f2ada6f9593570d`, CI `31458091370` SUCCESS
- #238 `T2424-0035` — `bf229ed56b05bfeab3017616f65454aa53cf045a`, CI `31458102895` SUCCESS
- #236 `T2424-0037` — `83bdeb2c62be88f4b8d84c1a924dd6ec8fd48fa8`, CI `31458112736` SUCCESS
- #241 `T2424-0054` — `18c41b914a331e3f617026492900b0f7890eef11`, CI `31458120484` SUCCESS

All remain draft/manual-gated. `T2424-0024` is the strongest certification-depth package but remains `CERTIFICATION_PENDING`, synthetic-only.

## VertexED latest-base evidence

### #233 — immutable build identity

Final head `ca9b06b3a208c0f55d9c0c8a287691c3ae1bbba5` passed canonical CI `31458194462` and Production Health Monitor PR validation `31458194479` after `main` #243. The refresh stayed within the original seven changed files by touching only the already-changed build-revision test. No production deployment occurred.

### #240 — account-scoped transient learner isolation

Final head `25d739d84b5649a14fec5c4db1dfc129bf337303` passed canonical CI `31458207037` after `main` #243, including build/test, production-browser and local keyboard-accessibility jobs. The refresh stayed within the original ten-file scope by touching only the already-changed account-storage regression file. No production mutation occurred.

## Main monitoring change

PR #243 merged as `662de36af18b1251e6441391ac3fc06df7a3bf71`. It deduplicates repeated production-health incidents by updating the open incident body in place while preserving Actions runs/artifacts as the chronological evidence trail. It does not prove production identity or authenticated journeys.

## Cleanup / safety

Superseded Project 2424 PRs closed unmerged: **13** — #210, #216, #219, #222, #223, #224, #227, #163, #165, #167, #170, #225, #228. Additional stale product lineage #184/#148 and Text-To-Video #10/#14 are closed in favor of current-main replacements.

Production deployments: **0**. Production DB mutations: **0**. Manual merge gates bypassed: **0**. Force-pushes: **0**. Scientific thresholds weakened: **0**. Negative results relabelled positive: **0**. Missing research source reconstructed from prose: **0**. Atlas/Percy liveness fabricated: **0**. Auxiliary First-100 double-counting: **0**.
