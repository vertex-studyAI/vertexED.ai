# SECURITY_STATUS

**As of:** 2026-08-14 convergence run.  
**Rule:** source controls, database policy state, deployed behavior and end-to-end production certification are separate evidence classes.

## VertexED — PARTIAL / DATABASE CONTROLS VERIFIED, PRODUCTION CERTIFICATION OPEN
Connected Supabase `xwlrzgfuhfbckgvcmyoq` is `ACTIVE_HEALTHY` on PostgreSQL `17.4.1.074`. Fresh read-only inspection found all 26 observed public base tables RLS-enabled; sampled owner policies bind to `auth.uid()`; observed public `SECURITY DEFINER` functions have explicit search paths and are not executable by PUBLIC/anon/authenticated; no public views were observed. Current advisor warnings: leaked-password protection disabled and hosted PostgreSQL security patches available. These are owner/platform actions, not evidence of exploitation.

VertexED remains **not production-certified** until exact served revision is proven and the authenticated disposable-account journey verifies isolation, persistence, recovery/logout and admin boundaries.

## FinanceMeta — SOURCE PARTIAL / EXACT-HEAD ACTIONS RED / PRODUCTION SECURITY BLOCKED_EXTERNAL
Canonical source is recovered at `build-the-future-11/finance4all-global-reach`; retained hardening branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is 41 ahead / 0 behind recovered main.

Source review confirms real security work: member E2E credentials are environment-only; profile self-service is narrowed through validated functions while role/email are outside the member write surface; direct notification insertion is removed from client policy space; later migrations add ownership/moderation controls; migration `018_security_definer_search_path.sql` gives every public `SECURITY DEFINER` function in the sequence an explicit `search_path = public, pg_temp`; migrations continue through `021_analytics_journey_events.sql`.

The exact hardening SHA is **not CI-green**: Actions run `29641469740` concluded failure and exposed zero jobs. The workflow file contains duplicated Vite environment mapping keys in the Playwright step, which is a concrete workflow-definition defect candidate; the connector does not expose the exact GitHub parser error, so no stronger root-cause claim is made. The same SHA has successful Vercel deployment `5501026657`, but it is explicitly environment `Preview` with `production_environment: false`.

Fresh PR creation and isolated-branch creation against this repo both return `403 Resource not accessible by integration`. FinanceMeta production Supabase is not connected. Live RLS/migration/env/revision/isolation/recovery state therefore remains unverified.

**Next gate:** owner-writable path fixes and validates the CI definition on the retained exact head, exact-head jobs execute and pass, migration ordering/grants/role-escalation/admin boundaries are reviewed, then source is merged only on evidence. Separately connect the real production database/deployment and certify live migrations/RLS/revision/cross-user denial/recovery/admin behavior.

## The Bu1LD — SOURCE/CI VERIFIED / DATABASE+DEPLOYMENT SECURITY BLOCKED
Canonical source `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` is directly verified. Exact-head CI run `29679123068` completed success.

Current source contains substantive database authorization controls through phase33:

- the early own-profile update policy is later protected by `protect_profile_role()`: a non-admin attempted role change is reset to the prior role, and the own-update policy is tightened with ownership `USING` plus `WITH CHECK`;
- phase31 routes competition review, invitation acceptance, deliverable review and membership-state changes through authenticated `SECURITY DEFINER` functions with explicit authorization checks while restricting direct table writes;
- phase32 prohibits contributors from reviewing or being assigned to review their own submissions;
- phase33 revokes direct application/answer inserts and uses one atomic validated `submit_project_application` RPC;
- `VERIFY_SETUP.sql` requires key tables, RLS state, functions and migration markers through phase33;
- `scripts/apply-schema.mjs` applies the current full setup plus phases 19–33;
- `.env.example` uses placeholders and keeps database/service-role/email secrets server-side; `wrangler.jsonc` contains no Supabase/service-role secret values.

This is **source evidence, not live database proof**. The connected Supabase account exposes VertexED only, so current Bu1LD tables/policies/functions/grants/migration markers cannot be inspected here.

Exact-head Deploy Cloudflare run `29679123047` failed in its verify job before deploy because `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were empty in the workflow environment; deploy was skipped. No successful Deploy Cloudflare run on `main` was recovered. These are owner-controlled repository/environment configuration blockers. Do not hardcode secrets or weaken `release:prod` to turn the gate green.

Older July readiness prose is historical: it references phase31, while the current apply/verify chain reaches phase33. Current source and exact Aug-14 workflow evidence take precedence.

**Next gate:** owner configures production Supabase public values and Cloudflare credentials via platform secrets; connect and verify the live Bu1LD Supabase phase33/RLS/functions/grants; configure Auth redirects and email/server secrets; rerun exact-head deployment to success with immutable identity; then execute seven-role authenticated denial/recovery/logout/cleanup testing.

## Percy / Project 2424
Live Percy DB/WAL/process/worktree state remains external. Project 2424 has now recovered a checksum-matched historical Wave-001 bundle and fresh clean-clone quality gate, but the later dirty overlay and identity-migration provenance remain external/unresolved. Recovery must stay non-destructive and no historical numeric suffix may be treated as a current canonical identity without a proven mapping edge.

## Release rule
A security gate advances only on direct evidence from the exact target revision/environment. CI, source RLS migrations, database metadata, Preview deployment, a healthy endpoint or prepared migration is not by itself production certification.
