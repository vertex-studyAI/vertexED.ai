# SECURITY_STATUS

**As of:** 2026-08-14 convergence run.  
**Rule:** source controls, database policy state, deployed behavior, and end-to-end production certification are separate evidence classes.

## VertexED — PARTIAL / DATABASE CONTROLS VERIFIED, PRODUCTION CERTIFICATION OPEN

Connected Supabase project `xwlrzgfuhfbckgvcmyoq` is `ACTIVE_HEALTHY` on Postgres `17.4.1.074`.

Fresh read-only inspection established:

- all **26** observed `public` base tables have RLS enabled;
- `profiles` self-update has both ownership `USING` and `WITH CHECK` predicates tied to `auth.uid()`;
- `user_study_artifacts` select/insert/update/delete policies are user-owned; update has both `USING` and `WITH CHECK` ownership predicates;
- the two observed public `SECURITY DEFINER` functions, `auth_email_exists` and `handle_new_user`, have explicit `search_path` configuration and are not executable by `PUBLIC`, `anon`, or `authenticated`;
- no public views were observed.

Current Supabase security-advisor warnings:

1. leaked-password protection is disabled;
2. security patches are available for the current hosted Postgres build.

These are open owner/platform actions. They are not evidence of exploitation and must not be hidden to declare release readiness.

### Remaining release-security gate

VertexED is **not production-certified**. Exact served deployment revision remains unproved by the public health monitor, and the authenticated disposable-account golden journey—including account isolation, persistence, recovery, logout denial and admin boundaries—has not been completed against a verified immutable deployment. Source/database controls do not substitute for that journey.

## FinanceMeta — SOURCE PARTIAL / EXACT-HEAD CI FAILED / PRODUCTION SECURITY BLOCKED

Canonical source is directly readable at `build-the-future-11/finance4all-global-reach`. Current `main` is `fbdd503223edc5b1780509720391083f485a4a85`; retained branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is **41 commits ahead / 0 behind**.

Source review confirms material security hardening rather than a naming-only branch:

- member E2E credentials are environment-only (`E2E_EMAIL` / `E2E_PASSWORD`), not hardcoded;
- profile self-service is narrowed through validated server functions while role/email are outside the member-facing write surface;
- direct notification insertion is removed from client policy space;
- later migrations add operational ownership/moderation controls;
- migration `018_security_definer_search_path.sql` applies explicit `search_path = public, pg_temp` to every public `SECURITY DEFINER` function created by the sequence;
- the migration directory extends through `021_analytics_journey_events.sql`.

This is **not** a green integration gate. The exact branch head has GitHub Actions run `29641469740`, which completed **failure** and exposed **zero jobs**. The branch workflow YAML also contains duplicated Vite environment mapping keys in the Playwright step; that is a concrete workflow-definition defect candidate, but the exact GitHub parser/error message is unavailable from the connector and must not be invented. A Vercel deployment for the same SHA completed successfully as environment **Preview**, deployment `5501026657`; it is explicitly `production_environment: false` and therefore is not production proof.

Fresh PR creation and isolated-branch creation attempts against the FinanceMeta repository both return `403 Resource not accessible by integration`. Historical PR #1 merged only the earlier branch head `2386bb4062b4e4b663a07a537866dba443cdf38a`; it does not integrate or verify current head `6dcc037...`.

### FinanceMeta next gate

1. through an owner-authorized writable GitHub path, preserve `6dcc037...` and fix/validate only the CI-definition defect first;
2. require exact-head Actions jobs to actually execute and pass audit/lint/typecheck/unit/build/static-release/Playwright gates;
3. review migration ordering/idempotency, grants/revokes, role escalation denial, notification ownership and admin boundaries;
4. only then merge the retained source branch;
5. separately connect the real FinanceMeta Supabase/deployment target and verify applied migrations/RLS, secrets/environment, immutable served revision, cross-user denial/isolation, recovery/logout/admin behavior and cleanup.

A green Preview deployment or source migration file never substitutes for live target security evidence.

## The Bu1LD — SOURCE/CI VERIFIED / DATABASE+DEPLOYMENT BLOCKED

Canonical source is directly recoverable at `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`. Exact-head CI run `29679123068` completed **success** across the repository's deterministic placeholder-backed source gates. This advances the source/CI state only; it does not certify production.

The retained SQL chain contains substantive authorization hardening through phase 33:

- the early own-profile update policy is later protected by `protect_profile_role()`, which preserves the old role when a non-admin attempts to change it, and the update policy is tightened with both `USING` and `WITH CHECK` ownership predicates;
- phase 31 moves competition decisions, invitation acceptance, deliverable review and membership-status changes behind authenticated `SECURITY DEFINER` functions with explicit authorization checks, while restricting direct table update policies;
- phase 32 explicitly prevents contributors from reviewing or being assigned to review their own submissions;
- phase 33 revokes direct application/answer inserts and replaces them with one atomic `submit_project_application` function that validates project status/capacity/ownership/questions before inserting application plus answers;
- `VERIFY_SETUP.sql` requires the key tables, RLS state, review/submit functions and migration markers through **phase 33**;
- `scripts/apply-schema.mjs` applies `full-setup.sql` plus phases `19` through `33` as the current direct-Postgres chain;
- `.env.example` keeps database/service-role/email secrets server-side and uses placeholders rather than committed live credentials; `wrangler.jsonc` contains no Supabase/service-role secret values.

This still does **not** prove the live database has those controls. The connected Supabase account exposes only VertexED, not The Bu1LD, so current target tables/policies/functions/migration markers cannot be inspected here.

Exact-head Cloudflare deployment run `29679123047` failed in its **verify** job before deployment because `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` were empty in the workflow environment. The deploy job was skipped. A search for successful `Deploy Cloudflare` runs on `main` returned none. These are owner-controlled repository/deployment configuration blockers, not permission to hardcode secrets or weaken `release:prod`.

The older `PRODUCTION_READINESS_REPORT.md` dated 2026-07-18 is historical and stale in its migration references (it names phase31), while the current apply/verify source reaches phase33. `REMAINING_EXTERNAL_ACTIONS.md` likewise must not be treated as proof that the database setup has actually been applied.

### The Bu1LD next gate

1. owner configures production `VITE_SUPABASE_URL` + anon/publishable key and the required Cloudflare credentials through repository/environment secrets; never commit server secrets;
2. connect/authorize the real Bu1LD Supabase target and verify the exact phase33 migration chain, RLS, grants/revokes, role escalation denial and SECURITY DEFINER boundaries from the live catalog;
3. configure Auth Site URL/redirects, email/service-role server secrets and live domain;
4. rerun exact-head `Deploy Cloudflare` to success and capture immutable deployment identity;
5. execute the seven-role authenticated journey (visitor, new member, active member, project lead, reviewer/mentor, administrator, removed member), including cross-role denials, recovery/logout and cleanup.

Until all five are evidenced, production security remains `BLOCKED` even though source/CI is strong.

## Percy / Project 2424 operational integrity

Percy live SQLite/WAL/process/worktree state and Project 2424 canonical local source/dirty overlay are outside this execution surface. Their current integrity/security state is `UNKNOWN / BLOCKED_EXTERNAL_MAC_OR_SOURCE`. Required recovery is non-destructive and evidence-preserving; no replacement DB/source tree is authorized.

## Release rule

A security gate advances only on direct evidence from the exact target revision/environment. Passing CI, RLS source migrations, database metadata, a Preview deployment, or a healthy public endpoint does not by itself certify production security.
