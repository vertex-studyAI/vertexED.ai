# VertexED Project Truth

Evidence timestamp: 2026-09-03 16:52 IST

Canonical repository: `https://github.com/vertex-studyAI/vertexED.ai.git`

Canonical release branch: `main`

Current execution branch: `codex/vertexed-publication-readiness`

Verified source revision before this document: `28b590890ad2196d222913efd83e25b8f017dafa`

Adaptive-learning implementation commit: `0928312e8ca83a4ab128df563ee83b529bed2f87`

Observed remote `main`: `06545ab4e43932179c2238a78574b1bf8950f3cb`

## Repository state

- This is the only active worktree returned by `git worktree list`.
- The execution branch contains the verified product-hardening history plus `0928312`, then merges all observed `origin/main` changes in `28b5908`. It is 29 commits ahead and 0 behind the observed remote main.
- `.serena/` was untracked before this execution and is excluded from the release candidate.
- Runtime: Node `>=22.22.0 <23`, declared package manager npm 10.9.8, TypeScript/React 19/Vite 7, Vercel Node functions, Supabase Auth/Postgres, OpenAI and Google Gemini integrations. Verification used the Node 22.22.0 bundled npm 10.9.4 after an exact npm 10.9.8 upgrade attempt stalled on the registry.
- Canonical local gate: `npm run ci`. Browser gates: `npm run test:e2e:local-accessibility` and the production jobs in `.github/workflows/ci.yml`.
- Deployment: Vercel projects historically named `vertex-ed-ai`/`vertex-ai`; canonical host `https://www.vertexed.app`. Neither project is visible in the authenticated Vercel scope `build-the-future-11s-projects`.
- Persistence: migrations in `supabase/migrations/` plus account-scoped browser storage. Live migration/RLS state was not inspected.
- Model identity: Apex defaults to external ID `ft:gpt-4.1-mini-2025-04-14:verteded:apex-chatbot:CSgJ1mRt` with `gpt-4o-mini` fallback. No loadable first-party checkpoint is stored here; fine-tuned-model access was not certified.
- Evaluation data: committed synthetic, no-personal-data fixtures under `evals/`. They are regression evidence, not learner-outcome evidence. No licensed third-party learner dataset was identified for the product evaluation path.
- Secret names are documented in `.env.example`; values were not read or printed.

## Current verification

| Gate | State | Evidence |
|---|---|---|
| Clean install on required runtime | **VERIFIED_LOCAL** | Node 22.22.0; low-concurrency `npm ci` completed after two registry timeouts |
| Focused adaptive/health regressions | **VERIFIED_LOCAL** | 12/12 passed after merging current main |
| Canonical source gate | **VERIFIED_LOCAL** | `npm run ci`: 752 source tests, 25 eval tests, typecheck/lint/topology/audit/build/budgets passed |
| Production dependency audit | **VERIFIED_LOCAL** | 0 vulnerabilities at `high` threshold |
| Build topology | **VERIFIED_LOCAL** | 1 Vercel function, 19 routed endpoints |
| Production build | **VERIFIED_LOCAL** | 2,757 modules transformed |
| Bundle budgets | **VERIFIED_LOCAL** | 177,142 B initial JS gzip; 33,762 B CSS; 232,813 B largest JS; 910,156 B total JS; 0 violations |
| Local accessibility browser matrix | **VERIFIED_LOCAL** | 34 passed, 2 inapplicable skips |
| Latest observed `main` CI | **MIXED** | Source/browser jobs passed; smoke-production failed in run `33718062679` |
| Canonical production health | **NEGATIVE** | Live health omits revision/readiness and HEAD health header |
| Authenticated production lifecycle | **NOT_RUN** | Requires canonical Vercel/Supabase access and disposable identities |
| Learner outcome efficacy | **NOT_RUN** | No controlled learner pilot results |

## Claim ledger

| Claim | Current state | Evidence | Verification level | Blocker | Next action |
|---|---|---|---|---|---|
| Source builds and passes its release gate | Supported for this candidate | `npm run ci`; manifest | VERIFIED_LOCAL | CI not run on this branch head | Push PR and require CI |
| Learning loop uses measured weakness evidence | Supported after `0928312` | Adaptive workflow tests; measured-v1 boundary | VERIFIED_LOCAL | Real usability unmeasured | Add authenticated journey/pilot |
| Timed mock completion represents mastery | Rejected | Completion now records no score | NEGATIVE/REMOVED | None | Preserve regression |
| Free-form AI text is a trustworthy score | Rejected | Reviewer output no longer enters weakness state | NEGATIVE/REMOVED | Verified grading is separate | Use only verified criterion grades |
| Account-scoped storage/API ownership exists | Supported in source | Ownership/RLS-contract/storage tests | VERIFIED_LOCAL | Live cross-account denial pending | Test two production accounts |
| Signup/login/OAuth/recovery work in production | Partially supported | Source/deterministic contracts | PARTIAL | Email/OAuth/Supabase access | Run real-account matrix |
| AI quality is production-ready | Unsupported | Provider/degraded-path contracts only | NOT_RUN | Keys, quota, model access, live set | Run retained provider evaluation |
| Production serves this revision | False | Live health lacks revision/readiness | NEGATIVE | Owning Vercel access | Deploy and rerun smoke |
| VertexED improves learning outcomes | Unsupported | No controlled learner data | NOT_RUN | Consented preregistered pilot | Execute pilot |
| School pilot package exists | Partially supported | Pilot/export/privacy/runbook docs | PARTIAL | Owner, consent review, support drill | Certify package |

## Contradictions and corrections

- `PROJECT_STATUS.md` dated 2026-09-02 is superseded for counts/revisions; its production warning remains correct.
- Site availability and basic authorization checks do not prove release identity or readiness.
- GitHub source jobs can pass while overall CI is red because the production smoke job fails. “CI green” must name the job and revision.
- Synthetic grading fixtures do not validate model superiority, real marking agreement or learning gain.

## External blockers

1. Access to the Vercel project actually serving `vertexed.app`.
2. Canonical Supabase access and approved disposable identities for live RLS/auth certification.
3. Live provider configuration/quota for OpenAI/Gemini quality evaluation.
4. Consented learner cohort and school/privacy owner for outcome claims.
5. GitHub API/Git transport was unreachable during final push attempts, so canonical CI for this branch is not run.

`SOURCE_VERIFIED=true`

`DEPLOYED_VERIFIED=false`

`AUTHENTICATED_PRODUCTION_VERIFIED=false`

`LEARNING_OUTCOME_VERIFIED=false`
