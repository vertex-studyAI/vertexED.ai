# Execution Evidence

Updated: 11 August 2026

Only achievements with concrete GitHub/CI, retained-file, or read-only connected-service evidence are recorded as completed. Scientific evidence, frozen First-100 identity, repository CI, preview/deployment state and production proof remain separate evidence tiers.

## Project 2424 accounting

- Queue-consistent runnable/tested implementation packages merged + verified: **12**
- Merged evidence-boundary recoveries excluded from implementation count: **2** (`T2424-0016` PST, `T2424-0019` NPMS)
- Exact-head-green manual First-100 review packages not merged: **9**
- Certified complete: **0 / 100**
- Research-complete: **0**
- Known current-main registry collision: **1** (`T2424-0050`)

The 12 counted queue identities are:

`T2424-0023`, `T2424-0025`, `T2424-0030`, `T2424-0034`, `T2424-0036`, `T2424-0038`, `T2424-0046`, `T2424-0049`, `T2424-0051`, `T2424-0053`, `T2424-1767`, `T2424-1863`.

No auxiliary tool, duplicate PR, evidence-only recovery, unmerged manual package, or mismatched folder title increases this count.

## Exact-head-green manual First-100 evidence

Each current head below was independently checked with `fetch_commit_workflow_runs` and returned canonical CI `completed / success`. Every associated PR explicitly requires manual review and therefore remains outside merged counts.

| PR | ID | Project | Current head | Exact-head CI |
|---:|---|---|---|---:|
| #230 | `T2424-0050` | Darcy Latent Operator identity repair | `0131c7d33e967f55e8b07ff5bfc1f03feb164f01` | `31458049157` |
| #231 | `T2424-0024` | Trust Under Uncertainty | `a15f31fbcbef6ab5868cb4f8a30e806f4d8721ca` | `31458059377` |
| #239 | `T2424-0026` | Counterfactual Defect Worlds | `596cb91d0a36a163cb9fab8745f65cbfb1ec47b6` | `31458068712` |
| #234 | `T2424-0028` | Residual Event Tokenization | `bbb173fc2cd93e588883b3798de9712cb29094eb` | `31458080289` |
| #232 | `T2424-0029` | Representation Phase Transitions for PDEs | `f22ab98f2bf93a3437153cba2f2ada6f9593570d` | `31458091370` |
| #238 | `T2424-0035` | Grokking Agent | `bf229ed56b05bfeab3017616f65454aa53cf045a` | `31458102895` |
| #236 | `T2424-0037` | NLP-to-CAD | `83bdeb2c62be88f4b8d84c1a924dd6ec8fd48fa8` | `31458112736` |
| #241 | `T2424-0054` | Theory-Manifold Experiment Planner | `18c41b914a331e3f617026492900b0f7890eef11` | `31458120484` |
| #242 | `T2424-0027` | Sapir–Whorf Latent Tongue | `6e71f109db7bba64e222029f298072ed64cc42de` | `31457981699` |

**Green/manual is not merged.** None of these changes the 12 count until an explicit allowed integration occurs on a current base.

## T2424-0050 registry identity evidence

Frozen rank 43 assigns `T2424-0050` to **Darcy Latent Operator**. Current `main` still contains Benchmark Augmentation Theory under the canonical folder, so that folder is excluded from queue-consistent counts.

Canonical manual repair #230 restores Darcy, preserves Benchmark Augmentation Theory under auxiliary identity, restores Darcy retained evidence/tests and adds a frozen queue↔package title identity regression.

Retained bounded Darcy evidence:

- 20 seeds;
- 24 cells → 6 latent blocks;
- mean baseline pressure MAE `0.06589139155637647`;
- mean latent pressure MAE `0.0011366559231966065`;
- relative improvement `0.9787663202281432`;
- mean flux relative error `1.3693877541812723e-16`;
- uniform latent MAE `0`.

Claim boundary: controlled deterministic 1D reduced-resistance mechanism only. PR #230 remains manual/no-deploy and Darcy remains uncounted on `main`.

## T2424-0027 retained evidence and repair trail

Frozen rank 20: **Sapir–Whorf Latent Tongue**.

PR #242 exact head `6e71f109db7bba64e222029f298072ed64cc42de` passed canonical GitHub Actions `31457981699`, including release, production-browser and local accessibility jobs.

Package evidence includes claim/protocol, deterministic generator, raw baseline, language-centering transform, global-centering negative control, retained raw JSON, SHA-256 manifest, analysis/verdict, implementation-independent verifier and tests.

Retained metrics:

- raw concept `1.0`
- raw language `1.0`
- centered concept `1.0`
- centered language `0.3611111111111111`
- chance `0.3333333333333333`
- normalized excess language-leakage reduction `0.9583333333333334`
- global-centering language `1.0`
- raw SHA-256 `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`

The first CI attempts caught derived evidence/integration defects: stale rounded expectations/hash metadata, then an undefined verifier output variable. Repairs changed derived metadata/assertions/docs/verifier plumbing only. **The generator, frozen protocol, thresholds, retained raw result and scientific verdict were not retuned.**

Scientific boundary: synthetic diagnostic mechanics only; no Sapir–Whorf, linguistic-relativity, real-model, cultural, translation, external-validation, publication or research-complete claim. PR #242 is draft/manual; preview capacity is externally rate-limited.

## Notes-to-Video shipped evidence

Repository: `vertex-studyAI/Text-To-Video`.

### Durable local queue

PR #13 head `38c4344ec77aa1d6a76c478b17452cfbc3dd8d9c` passed full CI `31456314983` and merged.

Shipped: file-backed validated queue state, deterministic SHA-256/idempotency, queued/claimed/cancelled/completed/failed states, attempts/progress, leases/heartbeat, stale-lease recovery, retry/terminal failures, durable cancellation, owner-gated completion, output URL, atomic persistence, local lock and fail-closed corrupt-state validation.

### Bounded attempts

Merged subsequently through PR #15, adding bounded retries, cancellation-safe completion and stale lease handling.

### Queue → verified encoder

Canonical current-main lineage shipped through PR #19 / merge `7a077016174477f7aa169910f473d19a83766ae3`, with exact-head CI #50 recorded before merge.

Shipped: one-job worker, deterministic safe MP4 filename, atomic staged output, heartbeat around encode/verification, use of existing verified FFmpeg encoder, local file URL, bounded retry/lease semantics and preservation of prior verified final media on failed attempts.

Stale/duplicate #17 and #20 are closed unmerged. Draft PR #16 (API lifecycle) and draft PR #21 (content-addressed local store) remain separate manual product decisions.

Boundary: local/single-host only; no distributed exactly-once, remote durable storage, transactional queue/media completion, hosted downloads, production narration or deployment claim.

## VertexED production identity evidence

Canonical source-side recovery is draft PR #233. It restores build revision stamping, health fallback and fail-closed build identity requirements on current source. Exact-head source CI is green. It remains manual/no-deploy.

Production-health monitoring is behaviorally green, but no retained evidence proves the public domain serves PR #233's exact SHA. **No immutable production revision is claimed.**

## VertexED live Supabase read-only evidence

Connected project: `xwlrzgfuhfbckgvcmyoq`.

Observed without user-row access or mutation:

- all listed public tables had RLS enabled;
- observed `SECURITY DEFINER` functions had explicit `search_path`;
- observed privileged functions did not grant PUBLIC execute;
- no public-schema views were observed;
- security advisor warns leaked-password protection disabled;
- security advisor reports Postgres security patches available.

No database mutation, credential change or release occurred.

## FinanceMeta evidence

Repository: `build-the-future-11/finance4all-global-reach`.

Observed current-main risks remain broad own-profile update and authenticated notification insertion. Existing `cursor/membership-security-supabase-fix` remains roughly 41 commits ahead / 0 behind inspected main and contains later hardening/CI/E2E work.

Target GitHub writes return `403 Resource not accessible by integration`; FinanceMeta Supabase is not connected.

Draft/manual VertexED control-plane PR #245 generates and validates a deterministic authorization-hardening overlay against an immutable FinanceMeta target and has canonical + specialized validation workflows recorded green. It does not write the target repo or live Supabase and is not a production fix claim.

## The Bu1LD evidence

Repository: `ryangomez010/bu1ld-landing`.

Current `main` has typecheck/lint/tests/build/release checks and strict production Supabase schema/RLS verification. Existing Cursor branches inspected are already subsumed by main. Remaining DB/Auth/env/email/seven-role smoke gates require the authorized real environment.

## LAM-JEPA evidence

PR #55 merged fail-closed negative-result slicing on unlocked repaired ARC-v5 validation evidence. Exact head passed CI, Quick Checks and Research QA. Locked confirmatory/test access remains refused; no failed hypothesis was rescued by threshold/seed/evaluation changes.

## Atlas / Percy evidence boundary

- Atlas: no canonical repo/source/runtime exposed → `BLOCKED_SOURCE`.
- Percy: no local source/runtime/SQLite/task/heartbeat state exposed → `BLOCKED_SOURCE / BLOCKED_RUNTIME`.

No fake runtime or worker-liveness claim is recorded.

## Safety ledger

- Production releases performed: **0**
- Production DB mutations: **0**
- Secrets exposed/rotated/committed: **0**
- Force pushes/destructive history rewrites: **0**
- Scientific thresholds weakened after observation: **0**
- Negative/inconclusive research relabelled positive: **0**
- Green/manual packages counted as merged: **0**
- Auxiliary/evidence-only packages double-counted as queue implementations: **0**
