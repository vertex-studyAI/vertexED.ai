# Master Portfolio Status

**Updated:** 10 August 2026  
**Evidence rule:** only connector-visible source, merged commits, exact-head CI, and retained versioned evidence count as verified.

| Project | Canonical visible source | State | Current evidence | Main blocker | Best next artifact | Priority |
|---|---|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / VERIFIED RELEASE CANDIDATE, PRODUCTION-UNVERIFIED | prior P0/P1 source fixes plus five merged Project 2424 packages; PR #184 exact head `256c15de93e064b5a931ecf6a9f2f29159750046` passed CI + Production Health Monitor and is review-ready | deployment-relevant PR #184 intentionally unmerged; public production still has not proved body/header SHA from the stamped build | owner-authorized merge/deploy of #184, then exact live SHA + authenticated disposable-account certification | P0 |
| Project 2424 First-100 | portfolio tree in `vertex-studyAI/vertexED.ai`; wider local/archive source not exposed | ACTIVE / 13 VERIFIED IMPLEMENTATIONS | queue 100/100; 5 merged/tested packages; 8 additional distinct exact-head-green review-ready packages; strict certified 0/100 | project-specific real/external evidence, baselines, raw results, negative/ablation analysis, independent QA | promote strongest existing package through nine-part gate | P0 |
| Text-To-Video | `vertex-studyAI/Text-To-Video` | MERGED LOCAL RELIABILITY FIX | canonical PR #7 merged as `1d1ad2d027ca38e6fb0581ccf280333da454b672`; head `4791f21a55217520955db603d917d8a5f2d7f06a` passed CI `31409630201`; stale/partial final-output behavior fail-closed | hosted rendering/queue/storage/narration lifecycle remains out of scope | retain local integrity contract or explicitly authorize hosted product scope | P1 |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / NEGATIVE-OR-INCONCLUSIVE, PROVENANCE DOCUMENTED | PR #53 merged `RESEARCH_STATUS.md`; PR #54 merged `RELEASE_PROVENANCE.md`; ARC negative/inconclusive boundary and locked-test stop rule preserved | owner license/citation decisions for publication package; any new scientific run needs a predeclared external confirmatory protocol | license/citation approval or frozen new confirmatory benchmark—not test rescue | P0 research |
| FinanceMeta | not exposed by current installation | BLOCKED FOR DIRECT EXECUTION | no fresh target mutation/runtime certification claimed | canonical GitHub/Supabase access | connect source/runtime and execute release gate | P0/P1 |
| The Bu1LD | not exposed by current installation | BLOCKED FOR DIRECT EXECUTION | no fresh target mutation/runtime certification claimed | canonical GitHub/Supabase/Cloudflare access | connect source/runtime and execute role journeys | P0/P1 |
| Atlas | not exposed by current installation | BLOCKED | no fresh source/runtime evidence | canonical repository/runtime access | inspect orchestration, recovery, queue, evidence collection | P1 |
| Percy | not exposed by current installation | BLOCKED / RECOVERABLE | no fresh SQLite/worker-liveness proof | local source/database/runtime access | verify schema compatibility/integrity + real worker liveness | P0 |

## VertexED P0 release candidate

PR #184 makes the production identity contract fail closed at build/runtime source level:

- generates a normalized immutable `BUILD_REVISION` from `VERCEL_GIT_COMMIT_SHA`, `GITHUB_SHA`, or Git fallback;
- makes `/api/health` prefer runtime revision variables and fall back to the stamped build revision;
- requires a revision during Vercel deploy builds instead of emitting an unverifiable build;
- adds regression coverage for normalization, precedence, Git fallback, generated-module contents, required-mode failure, and health fallback.

Exact head `256c15de93e064b5a931ecf6a9f2f29159750046` passed CI run `31412824339` and Production Health Monitor run `31412824223`. PR #184 is review-ready but explicitly **must not be auto-merged or deployed** because `vercel.json`, build lifecycle, and health runtime are deployment-relevant. Source verification does not prove the public domain is serving this revision.

## Project 2424 — merged verified packages

- `T2424-0034` Quant ML Visualizer — PR #166; CI `31409366246`; descriptive analytics/demo only.
- `T2424-0036` Rubik's A* Intelligence — PR #169; CI `31409707818`; bounded orientation-free 2×2 corner-permutation search only.
- `T2424-0038` Obscured Records editorial triage — PR #178; CI `31411209123`; evidence-gated triage, not factual/legal verification or autonomous publication.
- `T2424-1767` Resource-Bounded MoE Operator — PR #162; CI `31409012137`; synthetic resource/error screen, no superiority claim.
- `T2424-1863` Resource-Bounded Local Operator — PR #177; retained 20-seed result failed the predeclared >75% gate at **67.777%**; negative/inconclusive verdict preserved.

## Project 2424 — exact-head-green review-ready distinct packages

`T2424-0024` #172, `T2424-0026` #174, `T2424-0028` #163, `T2424-0029` #176, `T2424-0035` #167, `T2424-0037` #165, `T2424-0053` #179, and `T2424-0054` #170.

PR #160 is a noncanonical `T2424-0034` walk-forward/no-lookahead/transaction-cost follow-up created before canonical #166 merged. It is not double-counted and should be reconciled into the canonical package rather than merged as a duplicate tree.

## Reconciled metrics

- Connected repositories inspected: **3**
- First-100 queue entries: **100**
- Distinct First-100 verified implementation entries: **13**
- Merged verified First-100 packages: **5**
- Exact-head-green review-ready distinct packages: **8**
- Strict First-100 certified complete: **0**
- VertexED immutable-build-revision source fix: **exact-head verified / review-ready / not deployed**
- Text-To-Video canonical integrity fix: **merged**
- LAM-JEPA status/provenance surfaces: **merged**
- Production deployments intentionally performed by this follow-on lane: **0**

## Claim boundary

Green source CI is not immutable production proof. Controlled/synthetic experiments are not external scientific validation. A merged Project 2424 package is not automatically certified complete. LAM-JEPA provenance documentation does not upgrade its negative/inconclusive scientific result. No inaccessible repository is represented as freshly inspected or repaired.
