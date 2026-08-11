# Master Portfolio Status

Updated: 11 August 2026

This status is evidence-limited. It records only repository, CI, connected-service metadata, and retained-evidence facts actually verified during this execution window. A green test, recovered manuscript, queue assignment, or deployment status is never promoted into a stronger claim than its evidence supports.

| Project | Canonical repo/source | State | Verified evidence | Main blocker | Best next artifact | Priority |
|---|---|---|---|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | ACTIVE / RELEASE-CANDIDATE SOURCE | Canonical CI is green on the Project 2424 recovery heads merged in this run. Read-only live Supabase metadata shows RLS enabled on every public table, no public-schema views, and the two public `SECURITY DEFINER` functions have explicit `search_path` plus no PUBLIC execute grant. | Immutable SHA actually serving the public production domain and authenticated production journeys remain unproven. Supabase advisor also reports leaked-password protection disabled and an available Postgres security-patch upgrade. | Prove live revision + disposable-account auth journey; harden password protection and plan controlled Postgres upgrade | P0/P1 |
| Project 2424 | frozen First-100 queue + packages under `portfolio/project2424/` in this repo | ACTIVE / RECOVERED TOOLING | **12 queue-consistent runnable/tested First-100 packages are merged and verified on `main`; 0 / 100 are Certified complete.** PST (`T2424-0016`) and NPMS (`T2424-0019`) now have canonical, CI-verified evidence-boundary packages, but their original isolated scientific source trees remain unmigrated and they are not included in the 12 implementation count. | `T2424-0050` still has a registry collision on current `main`: Benchmark Augmentation Theory occupies the canonical folder although the frozen queue assigns that ID to Darcy Latent Operator. PR #210 is a lossless repair but is stale against current `main` and explicitly says do not auto-merge/deploy. Most of the First 100 still lack the nine-gate certification package. | Rebase/recover the lossless Darcy repair under its manual gate, then deepen the strongest packages with raw artifacts, ablation/negative analysis, and independent QA | P0 |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | RESEARCH-ONLY / ACTIVE | Current research status preserves a reproducible external ARC pipeline and a negative/inconclusive scientific verdict; the locked confirmatory test remains unavailable for hypothesis rescue. | Current evidence does not support superiority/mechanism claims; publication provenance/licensing remains open. | Package the negative result and start any new hypothesis under a separately frozen protocol | P0 research |
| Notes-to-Video | `vertex-studyAI/Text-To-Video` | SHIPPABLE LOCAL PROTOTYPE | Existing repository evidence records local render/smoke verification. | Production rendering/hosting, durable queue/storage lifecycle and real narration remain outside validated scope. | Production-grade render queue/storage boundary or retain as polished local demo | P1 |
| FinanceMeta | `build-the-future-11/finance4all-global-reach` | ACTIVE / RECOVERABLE | Repository is connector-readable. Current `main` exposes an own-profile UPDATE policy without an explicit role/email write boundary and an authenticated notification INSERT policy with `WITH CHECK (true)`. Branch `cursor/membership-security-supabase-fix` is **41 commits ahead / 0 behind** `main` and contains later hardening, CI, E2E and release work. | GitHub integration can read but cannot create branches/PRs there: both write attempts returned `403 Resource not accessible by integration`. FinanceMeta Supabase is not connected here. | Restore GitHub write permission/open the existing hardening branch as a PR; require exact-head CI and real Supabase RLS verification before applying migrations | P0/P1 |
| The Bu1LD | `ryangomez010/bu1ld-landing` | ACTIVE / RELEASE-CANDIDATE SOURCE | Repository is connector-readable. Two obvious Cursor branches are 0 commits ahead of `main`. `main` has typecheck/lint/tests/build/release checks; strict production mode adds Supabase schema/RLS verification. | Repository's own remaining-actions file identifies credentialed/external gates: DB apply/verify, auth URLs, deployment variables, email configuration and seven-role smoke tests. Bu1LD Supabase is not connected here. | Execute strict release verification in the real environment and complete seven-role smoke certification | P0/P1 |
| Atlas | prior canonical reference `build-the-future-11/Atlas` | BLOCKED | No current canonical source/runtime is exposed through this GitHub installation. | Repository/runtime unavailable here. | Expose canonical Atlas repo, then inspect orchestration/runtime state | P1 |
| Percy | local control-plane source tracked separately | BLOCKED / RECOVERABLE | Prior failure evidence exists, but no current local SQLite/runtime is exercisable through this connector. | Local source/runtime unavailable here. | Repair from local source and prove worker liveness/state recovery | P0 |

## What changed in this execution continuation

### Project 2424 merged implementation/tool work

- PR #192 — `T2424-0046` Auto-Research Foundry; tested head `88dad71acca583a80ae2496b1278f88a825b4766`, CI `31414879015`, merge `d15703b0fdd63dc5d6d2ff7fca12d5d27a432502`.
- PR #199 — Benchmark Augmentation Theory; tested head `b1342b274157786c2885b54cfa10f9b63b4b6200`, CI `31449794955`, merge `615fb12f26963a355553f10379df85d26323c4ea`. Subsequent frozen-queue reconciliation proved this is useful **auxiliary** work, not canonical `T2424-0050`, so it is excluded from the 12-project queue-consistent count.
- PR #203 — `T2424-0053` Scientific Motif Dictionary; tested head `d01a1d2c12c7e2e2157e11c6bc92726edcbb1c29`, CI `31450035136`, merge `c587f4e0fa91c59e82099d2fb9c68dea3abe8a16`.
- PR #201 — repaired canonical `T2424-0049` to Multiphase Porous JEPA without deleting Project24 Render; tested head `3023574cfdd6b94e8ec6fccb72deb0b726285ddf`, CI `31449904593`, merge `a1b17cd6131ab6b18eacf1fed0657aea6f2cb7c7`.
- PR #205 — canonical `T2424-0051` ADR Predictive Surrogate; tested head `7fe27ff01a8a8cc4701deecd2239aab80b7c1ee3`, CI `31450093762`, merge `1ba9ecc09f7e84f43d8251c222e3d07351e7ed8a`.
- PR #212 — reconciled competing `T2424-0023` Multilingual Epistemic Blind Spots implementations into one canonical package; tested head `58449933c38afb9a9017dbd067a43874dec88354`, CI `31450669750`, merge `3ce1260a3d3e80788b3c5d12cfe0df617b13665a`.

### Project 2424 evidence-boundary recovery

- PR #214 — canonical PST (`T2424-0016`) evidence package; exact head `625d7261aeac319461418fdd4bb5ef9094fe6025`, CI `31451145817` fully green, merge `205dcaeb5dc5a0b5d3e9d4e59169b829829d5acc`. Original isolated neural source/checkpoints/raw evidence are still unmigrated; external biological validation remains blocked. Negative findings remain explicit.
- PR #213 — canonical NPMS (`T2424-0019`) evidence package; exact head `fb684fc3e16cf8e202b9069b0e7b37e6fa607006`, CI `31451120590` fully green, merge `c298d4cbe81e85e678c97261fbd4fbb6ca82c77c`. Original isolated implementation/evidence tree remains unmigrated; known spectral/mode-truncation weaknesses remain enforced by the validator.

### Cleanup / integrity

- Closed superseded or duplicate PRs instead of force-pushing shared history, including #189, #191, #193, #179, #211, #209 and stale status PR #208.
- `T2424-0050` Darcy repair PR #210 was **not** auto-merged because its own boundary forbids auto-merge/deploy; it is now stale against current `main` and must be recovered under the same manual gate.
- No production deployment, production database mutation, credential rotation, force-push, or scientific-threshold weakening occurred.

## Claim boundary

- **Project 2424 implementation/tool count: 12 merged + verified.**
- **Project 2424 Certified complete count: 0 / 100.**
- PST and NPMS evidence recovery does not count as recovered scientific implementation or external validation.
- Auxiliary tools with registry-ID collisions are not double-counted.
- Negative/inconclusive research evidence remains negative/inconclusive.
- Green CI/browser evidence is not proof of the immutable revision serving production.
