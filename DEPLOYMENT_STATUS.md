# DEPLOYMENT STATUS

**As of:** 2026-08-14 22:09 IST  
**Rule:** source SHA, CI status, deployment attempt and verified served revision are separate states.

| System | Intended/canonical source | Deployment state | Evidence | Blocker / next gate |
|---|---|---|---|---|
| VertexED | `vertex-studyAI/vertexED.ai`; current canonical main observed at `4e8a48c79c7a3641927f74841846e01409377bc5` | **BLOCKED — EXACT SERVED REVISION UNKNOWN** | monitor `31817794439` made three bounded attempts; public/API/auth/origin smoke boundaries passed but `/api/health` omitted revision; artifact `9225715176`, SHA-256 `e7870e9561748ef4d4247e3bf4e01d3e8feead3780c4e2016d3742d134f2069a` | both connected Vercel status contexts report build-rate limiting; no paid upgrade authorized. Next: allow authorized build capacity → verify exact served revision → authenticated disposable-account journey + rollback proof |
| FinanceMeta | `build-the-future-11/finance4all-global-reach@fbdd503223edc5b1780509720391083f485a4a85` | **NOT DEPLOYED/CHANGED BY THIS RUN** | retained exact-base integrated overlay exists locally/control-side; fresh target branch creation returns 403 | grant target write, land/reverify isolated branch, staging RLS/auth journey, only then deployment/live migration |
| The Bu1LD | `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` for currently recovered landing target | **NOT DEPLOYED/CHANGED BY THIS RUN** | target is readable; fresh target branch creation returns 403 | grant write + Supabase/Cloudflare/test-role access; establish immutable deployed SHA, seven-role journey and rollback |
| Percy | real Mac host state | **NOT A VERIFIED PUBLIC DEPLOYMENT** | current execution surface cannot inspect actual host process/DB state | recover host and qualify restart/provider/lease/resource behavior before any availability claim |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA@bf8311e1a4d240e2891e51af38eaf7754944e300` | **RESEARCH RELEASE NOT YET CLAIMED** | internal package/provenance is strong; root license/citation metadata incomplete; external review pending | owner metadata + clean immutable release revision + external review; do not call draft/package a publication |
| IRIS | retained control evidence; exact canonical raw source unresolved | **NO RELEASE CLAIM** | mixed/negative package exists but exact source gate remains | source recovery and bounded negative/tradeoff packaging before any release |

## VertexED identity diagnosis

Current source already implements deployment revision generation and health emission, and the Vercel build configuration requires an immutable revision during deploy-relevant builds. Therefore the latest missing production revision is treated as a served-deployment/capacity-skew problem, not evidence that another health-handler feature patch is required.

## No-spend boundary

The observed Vercel failure contexts contain upgrade links, but this convergence run has **no authorization to purchase capacity**. Rate limiting stays a deployment blocker rather than a reason to incur cost or weaken the production identity gate.
