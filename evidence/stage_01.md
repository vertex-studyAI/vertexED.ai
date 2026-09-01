# VertexED Stage 01 — truth recovery and release blocker audit

**Checked:** 2026-09-01T16:57:06Z
**Gate:** PASS — current truth and exact external release blocker are reproduced; no source-side P0 defect was found.

## Revision and workspace identity

- Canonical repository: `vertex-studyAI/vertexED.ai`.
- Canonical branch/head: `main@eb72c18897773edd42cb81188a0d7938b554c99f` (`test(vertex): reconcile production readiness smoke on current main`).
- This workspace export has no `.git` directory. A checksum comparison against a fresh clone of exact `main` found no tracked-content differences. The export additionally contains pre-existing `artifacts/neurocad-alpha/*`; those files were preserved.
- The host has 16 GiB RAM. The system Node/npm path was unsuitable for certification (Node `v26.8.1`; broken global npm). Verification therefore used an isolated Node `v22.22.0` runtime, satisfying the repository's `>=22.22.0 <23` contract.

## Commands and observed results

| Command / evidence source | Result |
| --- | --- |
| `gh api repos/vertex-studyAI/vertexED.ai/commits/main` | `main` resolved to `eb72c18897773edd42cb81188a0d7938b554c99f`. |
| Fresh clone plus `rsync -anic --delete --exclude=.git --exclude=node_modules --exclude=dist <clone>/ <workspace>/` | No tracked-content checksum differences; only the preserved extra `artifacts/neurocad-alpha/*` tree. |
| Node 22 `npm ci` | 676 packages installed; npm reported one low-severity development-tree advisory. |
| `GITHUB_SHA=eb72c18897773edd42cb81188a0d7938b554c99f npm run ci` | PASS: lint scope, typecheck, Vercel function validation, production dependency audit threshold, 661/661 unit/integration tests, 20/20 frozen eval tests, and production build. Build stamped the exact SHA. |
| `PLAYWRIGHT_BASE_URL=https://www.vertexed.app PLAYWRIGHT_API_URL=https://www.vertexed.app npm run test:e2e` after `npx playwright install chromium` | PASS: 52/52 production browser/API checks across desktop, tablet, and two mobile viewports. |
| GitHub CI run `33517831023` | Source/build and both browser jobs passed; only `smoke-production` failed. |
| GitHub production monitor `33522521960`, artifact `9806296610` | FAIL after three bounded attempts. Artifact archive SHA-256: `b45ad4292d5731ee5b8acb67e4807f651672abcea28200fca3d92e7bb8437f5e`. |
| Direct `GET /api/health` at 2026-09-01T16:56Z | HTTP 200, but body had no `revision`, `status`, or readiness identity and headers had no `X-VertexED-Revision` / `X-VertexED-Health`. |
| Direct `GET` and `HEAD /api/health?readiness=1` | HTTP 200 with the same legacy body/header contract; readiness was not attested. |
| `vercel inspect` for both failed exact-main deployments | Current Vercel identity `build-the-future-11` cannot access either owning scope; both inspections failed before logs with scope/deployment-not-found errors. |

The first local Playwright run was invalid for UI conclusions because the pinned Chromium binary was absent: 20 request-context API tests passed and 32 browser tests could not launch. After installing the pinned Chromium runtime, the full rerun passed 52/52 in 1.4 minutes.

## Production dependency map

| Dependency | Current evidence | State |
| --- | --- | --- |
| Canonical domain | `https://www.vertexed.app`; DNS CNAME `eaa9b2faa63a4bdc.vercel-dns-017.com` | Reachable, owner project not proven |
| Vercel project context A | `ryan-gomezs-projects-5a5ab995/vertex-ed-ai`, deployment `dpl_2gq9Lu5StKBpfvsQgSJiDNv4r2U9` | Failed; inaccessible to current Vercel identity |
| Vercel project context B | `pratyush-vel-shankars-projects/vertex-ai`, deployment `dpl_5ezcsyZ3XcDWPi9m229L6m5bwvjd` | Failed; inaccessible to current Vercel identity |
| Supabase | Project `xwlrzgfuhfbckgvcmyoq`, region `ap-south-1`; last read-only audit reported `ACTIVE_HEALTHY`, 26/26 public base tables with RLS | Previously verified, not freshly dashboard-certified in this stage |
| OAuth | Production callback contract `https://www.vertexed.app/auth/callback`; prior audit saw successful Google OAuth/session activity | Narrow prior evidence only; full golden journey remains open |
| Health/revision | Source resolves `VERCEL_GIT_COMMIT_SHA` → `GITHUB_SHA` → generated revision and supports readiness | Implemented and tested in source; live deployment serves an older contract |

## Red / yellow / green truth matrix

| Surface | State | Claim boundary |
| --- | --- | --- |
| CI/source | GREEN | Exact-main canonical source gate passes locally and GitHub source/browser jobs passed. |
| Auth | YELLOW | Logged-out API denial is live and prior OAuth logs exist; signup/login/Google/recovery/logout golden journey is not currently certified. |
| Data/security | YELLOW | Prior RLS audit is strong; leaked-password protection, Postgres patch upgrade, fresh two-account isolation, and cleanup remain unverified. |
| AI | YELLOW | Frozen fixture evaluation passes; live provider behavior/calibration is not outcome-verified. |
| Public UI | GREEN | GitHub browser-production job passed on exact main; direct public/API probes are reachable. |
| Deployment identity/readiness | RED | The live service omits immutable revision/readiness identity and both exact-main Vercel deployments failed. |

## Highest-impact failure and disposition

The P0 is not a source contract defect: `api/_handlers/health.js`, build stamping, packaging tests, exact-main local CI, and GitHub source/browser jobs are green. The live alias is serving a pre-readiness/pre-revision health implementation while both exact-main deployments are failed. The first causal deployment log cannot be retrieved because the current Vercel identity has access only to `build-the-future-11s-projects`, not either owning scope.

No no-op source change, weakened smoke assertion, paid capacity change, or deployment was attempted. Those actions would not address the demonstrated permission/ownership blocker and were not separately authorized.

## Acceptance gate

PASS. Current truth is mapped, the exact failing command/evidence is retained, and the smallest external unblock is precise: grant the operator read/deploy access to the one Vercel project that owns `www.vertexed.app` (or have that owner inspect the listed deployment), retain its first causal build error, then make one intentional exact-main deployment and require health JSON plus `X-VertexED-Revision` to equal the deployed SHA before the authenticated journey.

## Claim boundary

`IMPLEMENTED` and exact-main `SMOKE_TESTED` source evidence are green. `DEPLOYED_VERIFIED` and `OUTCOME_VERIFIED` are not proven. Production must remain RED.
