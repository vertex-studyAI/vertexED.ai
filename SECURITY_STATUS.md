# SECURITY_STATUS

**As of:** 2026-08-14 convergence run.  
**Rule:** source controls, CI, database policy state, deployed behavior and end-to-end production certification are separate evidence classes.

## VertexED — PARTIAL / DATABASE CONTROLS VERIFIED, PRODUCTION CERTIFICATION OPEN
Connected Supabase `xwlrzgfuhfbckgvcmyoq` is `ACTIVE_HEALTHY` on PostgreSQL `17.4.1.074`. Read-only inspection found all 26 observed public base tables RLS-enabled; sampled ownership policies bind to `auth.uid()`; observed public `SECURITY DEFINER` functions have explicit search paths and are not executable by PUBLIC/anon/authenticated; no public views were observed. Current advisor warnings remain leaked-password protection disabled and hosted PostgreSQL security patches available.

VertexED is not production-certified until exact served revision is proven and the authenticated disposable-account journey verifies persistence, isolation, recovery/logout and admin boundaries.

## FinanceMeta — SOURCE PARTIAL / EXACT-HEAD ACTIONS RED / PRODUCTION SECURITY BLOCKED
Canonical source is directly readable at `build-the-future-11/finance4all-global-reach`. Retained hardening branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is 41 ahead / 0 behind recovered main `fbdd503223edc5b1780509720391083f485a4a85`.

Source review confirms material security hardening:

- member E2E credentials are environment-only (`E2E_EMAIL` / `E2E_PASSWORD`);
- profile self-service is narrowed through validated functions while role/email are outside the member-facing write surface;
- direct notification insertion is removed from client policy space;
- later migrations add ownership/moderation controls;
- migration `018_security_definer_search_path.sql` applies explicit `search_path = public, pg_temp` to every public `SECURITY DEFINER` function in the sequence;
- retained migration chain extends through `021_analytics_journey_events.sql`.

The exact hardening SHA is **not CI-green**: Actions run `29641469740` concluded failure and exposed zero jobs. The branch workflow contains duplicate Vite environment mappings in the Playwright step, which is a concrete workflow-definition defect candidate; the exact GitHub parser error is not exposed by this connector and is not invented. Vercel deployment `5501026657` for the same SHA succeeded only as `Preview`, explicitly not production.

Fresh PR and isolated-branch creation against FinanceMeta both return `403 Resource not accessible by integration`. Live FinanceMeta Supabase is not connected.

**Next gate:** owner-writable path fixes and validates CI definition on the retained exact head, exact-head jobs execute and pass, migration ordering/grants/role-escalation/admin boundaries are reviewed, then source merges only on evidence. Separately connect the production database/deployment and certify live migrations/RLS/revision/cross-user denial/recovery/admin behavior.

## The Bu1LD — SOURCE/CI VERIFIED / DATABASE + DEPLOYMENT SECURITY BLOCKED
Canonical source `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` is recovered; exact-head CI run `29679123068` succeeded.

Current source contains substantive authorization controls through phase33:

- non-admin profile role changes are blocked by `protect_profile_role()` while own-profile update retains ownership `USING` + `WITH CHECK`;
- phase31 moves competition review, invitation acceptance, deliverable review and membership changes behind authenticated authorization functions and restricts direct writes;
- phase32 prevents contributors from reviewing or being assigned to review their own submissions;
- phase33 revokes direct application/answer inserts and uses atomic validated `submit_project_application`;
- `VERIFY_SETUP.sql` expects key RLS/function/migration markers through phase33;
- `scripts/apply-schema.mjs` applies current full setup plus phases 19–33;
- `.env.example` uses placeholders and keeps database/service-role/email secrets server-side; `wrangler.jsonc` contains no Supabase/service-role secret values.

This is source evidence, not live DB proof. The connected Supabase account exposes VertexED only.

Exact-head Deploy Cloudflare run `29679123047` failed during verify before deployment because `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were empty; deploy was skipped. No successful main `Deploy Cloudflare` run was recovered. Do not hardcode secrets or weaken `release:prod` to make the gate green.

**Next gate:** owner configures public Supabase deployment values and Cloudflare credentials via platform secrets; connect/verify live Bu1LD phase33/RLS/functions/grants; configure Auth redirects/email/server secrets; rerun exact-head deployment to immutable identity; then seven-role denial/recovery/logout/cleanup testing.

## Percy / Project 2424
Percy live DB/WAL/process/worktree state remains external. Project 2424 now has a checksum-recovered historical Wave-001 base and a current source-identity invariant, but the later dirty overlay and cross-generation identity-migration provenance remain blocked. Recovery stays non-destructive; numeric suffix alone is not a canonical cross-generation identity key.

## Release rule
A security gate advances only on direct evidence from the exact target revision/environment. Passing CI, source RLS migrations, database metadata, Preview deployment or a healthy endpoint is not by itself production certification.

## 2026-08-15 08:55 IST security delta

- VertexED source now fails closed if production cannot expose immutable revision identity; merge `d52308aed22ccc3dcefa7d4e3dd90aa731bc5f5a` passed canonical source/browser gates before merge. Both subsequent Vercel deployments failed, so production security/certification remains **BLOCKED** rather than being upgraded from source evidence.
- FinanceMeta's requested CI repair changes no credential value: the only validated correction is removal of the second duplicate occurrences of the three Vite E2E env keys. Integration write access remains 403, so exact-head security/audit/Playwright gates remain unexecuted after the repair and source stays **PARTIAL**.
- The Bu1LD workflow consumes Actions secret names `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`; values were not accessed. Repository-secret metadata is inaccessible to this integration (403), so presence remains **UNKNOWN** and no deployment rerun was attempted.
