# WHAT ACTUALLY CHANGED

Execution date: **11 August 2026**  
Final VertexED monorepo main observed: `662de36af18b1251e6441391ac3fc06df7a3bf71`

This handoff records only repository, exact-head CI, retained-result and connected-service evidence. No production deployment, production DB mutation, fake source recovery, fake worker liveness or unsupported scientific claim is included.

## 1. SHIPPED / MERGED

Verified merges during the execution window:

- Project 2424 PST/NPMS canonical identity metadata: PR #226 → `0a9751d6e8b995747c855c64d60bdda9b1891eaf`; evidence tiers unchanged.
- Portfolio checkpoint: PR #229 → `d01b201035195575ee5764fefc9ef108f7e06314`, CI `31456436247` SUCCESS.
- VertexED monitoring: PR #243 → `662de36af18b1251e6441391ac3fc06df7a3bf71`, deduplicating repeated production-health incidents while preserving Actions/artifacts as evidence history.
- LAM-JEPA negative-result hardening is merged; current main `f9b10c768d7e93eccb440761306bd992c3ec6a5a`.
- Text-To-Video durable single-host queue + lease/recovery + bounded attempt policy are merged; current main `73495ed6a7cba09330b6eb86447679874c3f2d45`.

No manual-gated Project 2424/VertexED review PR was auto-merged and no production deployment occurred.

## 2. PROJECT 2424

```text
queue entries:                              100
queue-consistent runnable merged:           12
queue-consistent tested merged:             12
evidence-only merged recoveries:             2
Certified complete:                        0/100
research-complete:                           0
current-main registry collisions:            1  (T2424-0050)
latest-base-green manual review paths:        8
```

### Final latest-base-green manual queue

All eight were rechecked after main #243; only `STATUS.md` integration markers changed in that final refresh.

- #230 — `T2424-0050` Darcy repair — head `0131c7d33e967f55e8b07ff5bfc1f03feb164f01`, CI `31458049157` SUCCESS.
- #231 — `T2424-0024` Trust Under Uncertainty — head `a15f31fbcbef6ab5868cb4f8a30e806f4d8721ca`, CI `31458059377` SUCCESS.
- #239 — `T2424-0026` Counterfactual Defect Worlds — head `596cb91d0a36a163cb9fab8745f65cbfb1ec47b6`, CI `31458068712` SUCCESS.
- #234 — `T2424-0028` Residual Event Tokenization — head `bbb173fc2cd93e588883b3798de9712cb29094eb`, CI `31458080289` SUCCESS.
- #232 — `T2424-0029` Representation Phase Transitions for PDEs — head `f22ab98f2bf93a3437153cba2f2ada6f9593570d`, CI `31458091370` SUCCESS.
- #238 — `T2424-0035` Grokking Agent — head `bf229ed56b05bfeab3017616f65454aa53cf045a`, CI `31458102895` SUCCESS.
- #236 — `T2424-0037` NLP-to-CAD — head `83bdeb2c62be88f4b8d84c1a924dd6ec8fd48fa8`, CI `31458112736` SUCCESS.
- #241 — `T2424-0054` Theory-Manifold Experiment Planner — head `18c41b914a331e3f617026492900b0f7890eef11`, CI `31458120484` SUCCESS.

All remain **DO NOT AUTO-MERGE OR DEPLOY / MANUAL REVIEW REQUIRED** and therefore do not change the 12-project merged count.

### `T2424-0050` P0

#230 restores canonical **Darcy Latent Operator**, preserves Benchmark Augmentation Theory as auxiliary `AUX-P2424-BENCHMARK-AUGMENTATION`, retains both regression suites and adds a fail-closed materialized-package ↔ frozen-queue identity regression.

Retained bounded screen: baseline pressure MAE `0.06589139155637647`; latent MAE `0.0011366559231966065`; relative improvement `0.9787663202281432`; mean flux relative error `1.3693877541812723e-16`; uniform latent MAE `0`.

Boundary: deterministic 1D reduced-resistance mechanism only.

### `T2424-0024` depth

#231 now has immutable source/evidence provenance, retained results, matched overconfidence baseline, explicit calibration-vs-ranking ablation, clean reproduction, bounded verdict and implementation-independent QA. Retained synthetic result: both policies accuracy `0.70`; moderate Brier `0.0400` vs overconfident `0.2542`; moderate ECE `0.2000` vs overconfident `0.2620`; selective-risk points identical because ordering is intentionally preserved.

State remains **CERTIFICATION_PENDING**, not Certified complete; no real-model trustworthiness/deployment/external-validity claim.

### Cleanup

Superseded Project 2424 PRs closed unmerged: **13** — #210, #216, #219, #222, #223, #224, #227, #163, #165, #167, #170, #225, #228.

## 3. VERTEXED

### #233 — immutable build identity

Final post-#243 head `ca9b06b3a208c0f55d9c0c8a287691c3ae1bbba5` passed:

- CI `31458194462` SUCCESS
- Production Health Monitor `31458194479` SUCCESS

The final refresh stayed inside the original seven changed files by touching only the already-changed build-revision test. Source integration is proven; public exact serving SHA is not. No deployment occurred.

### #240 — cross-account transient learner isolation

Final post-#243 head `25d739d84b5649a14fec5c4db1dfc129bf337303` passed CI `31458207037` SUCCESS, including build/test, production-browser and local keyboard-accessibility jobs. The final refresh stayed inside the original ten-file scope by touching only the already-changed account-storage regression.

This is source/test integration evidence, not authenticated production certification.

## 4. FINANCEMETA

Repo `build-the-future-11/finance4all-global-reach`; inspected main `fbdd503223edc5b1780509720391083f485a4a85`; `cursor/membership-security-supabase-fix` was +41 / -0 with later profile-write, notification-policy, membership-integrity and privileged-function hardening.

Fresh recovery PR and collaborator-permission inspection both returned **403 Resource not accessible by integration**. Production Supabase final policy state remains unverified; no production migration was applied and FinanceMeta is not claimed fixed.

## 5. THE BU1LD

Repo `ryangomez010/bu1ld-landing`; main `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`.

Source already has typecheck/tests/lint/build plus Supabase verify/RLS and strict release checks. Creating a safe CI branch returned **403 Resource not accessible by integration**, so no workflow change is claimed.

Remaining real gates: authorized production schema/RLS verification, Auth/OAuth URLs, deployment variables, email, and a seven-role allowed/**forbidden** smoke matrix. No production state was invented or mutated.

## 6. RESEARCH

### PST — `T2424-0016`

`RECOVERED_COMPACT_EVIDENCE / SOURCE_MIGRATION_PENDING / EXTERNAL_BLOCKED`. Controlled negative/control findings remain retained; historical biological headline values remain unverified; original source/checkpoints/raw evidence remain unmigrated.

### NPMS — `T2424-0019`

Evidence recovery remains distinct from source recovery. Missing/spurious-mode, conjugate-pair, resolvent-frequency and delay-PCA/multiscale/switching limitations remain explicit. Original source/config/result/evidence provenance remains unmigrated.

### LAM-JEPA

Current main `f9b10c768d7e93eccb440761306bd992c3ec6a5a`; ARC superiority remains unsupported / `RESEARCH_COMPLETE_FALSE`. Retained-row negative slicing and fail-closed claim enforcement are merged. No confirmatory-set rescue, threshold weakening, seed search or positive relabelling occurred.

## 7. ATLAS / PERCY

### Atlas

`BLOCKED_SOURCE`. Prior canonical `build-the-future-11/Atlas` returns 404. No unrelated public Atlas repo was substituted.

### Percy

`BLOCKED_SOURCE / BLOCKED_RUNTIME`. No current source/SQLite/runtime is exposed. Future health must prove process alive + task claimed + heartbeat + persisted state + progress + failure recovery.

## 8. GITHUB / TEXT-TO-VIDEO

Text-To-Video current main `73495ed6a7cba09330b6eb86447679874c3f2d45` includes durable **single-host local** queue state with leases/recovery and bounded attempt/cancellation-safe processing. Current-main lifecycle replacement #16 head `98fd04b04e43b91c229820ac5386db78d5f3ff8a`, CI `31457181357` SUCCESS. Separate green draft #9 provides content-addressed local media storage.

Boundary: no distributed exactly-once, cloud durability, hosted rendering, production narration, autoscaling, deployment or SLO claim.

```text
Project 2424 stale/duplicate PRs closed unmerged: 13
latest-base-green Project 2424 review paths:       8
latest-base-green VertexED P0 review paths:         2
production deployments:                             0
production DB mutations:                            0
manual merge gates bypassed:                        0
force-pushes:                                       0
```

The five required portfolio ledgers are refreshed together on docs-only draft #235 and are subject to their own exact-head CI/manual review gate.

## 9. FAILURES / BLOCKERS

1. Atlas canonical source/runtime unavailable.
2. Percy source/SQLite/runtime unavailable.
3. FinanceMeta repo readable but connector writes/permission introspection return 403; production Supabase state unverified.
4. Bu1LD repo readable but branch creation returns 403; real-environment seven-role certification unavailable.
5. VertexED public exact SHA/authenticated production journey remains unproven and deployment is owner-gated.
6. Vercel preview hit the free-plan daily deployment limit.
7. PST original source/checkpoint/raw-evidence tree unmigrated.
8. NPMS original source/config/result/evidence tree unmigrated.
9. `T2424-0050` remains colliding on `main` until manual #230 merge decision.
10. Eight Project 2424 and two VertexED review PRs remain unmerged by design.
11. LAM-JEPA release licensing/citation provenance remains a human gate.

## 10. TOP NEXT ACTIONS

1. Human-review the eight latest-base-green Project 2424 PRs; merge only if explicit gates are intentionally cleared.
2. Human-review VertexED #233/#240; deployment remains a separate authorization/live-verification step.
3. Continue depth from the T0024 reference package toward first genuine certifications without upgrading synthetic evidence into real-model claims.
4. Decide whether to integrate Text-To-Video #16/#9 atop the merged single-host durable queue; preserve local-only claims.
5. Restore FinanceMeta/Bu1LD GitHub App write access and authorized production environments before RLS/release claims.
6. Migrate PST/NPMS original source/evidence and rerun cleanly; never reconstruct missing source from prose.
7. Preserve LAM-JEPA negative evidence; any new hypothesis requires a new frozen protocol.
8. Expose/create canonical Atlas source before orchestration work.
9. Expose Percy source/database/runtime before worker-health claims.
10. Regenerate First-100 counts from frozen identity/evidence after any manual merges rather than hand-incrementing them.

## 11. OWNER INTERVENTION REQUIRED

- manual merge decisions for Project 2424 #230/#231/#239/#234/#232/#238/#236/#241;
- manual review/integration for VertexED #233/#240 and Text-To-Video #16/#9;
- explicit VertexED deployment authorization plus post-deploy exact-SHA/authenticated-journey checks;
- FinanceMeta/Bu1LD GitHub App write restoration and any production migration/credential authorization;
- LAM-JEPA licensing/citation decision;
- canonical Atlas source availability;
- Percy source/database/runtime availability.

Do not put secrets in GitHub comments or chat.
