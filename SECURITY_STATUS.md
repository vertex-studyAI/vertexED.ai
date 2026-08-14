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

## The Bu1LD — BLOCKED_EXTERNAL

The canonical production Supabase/deployment target is unavailable through the current execution surface. RLS, role boundaries, deployment identity and seven-role authenticated journeys remain unverified. No security state is promoted from historical/control artifacts.

## Percy / Project 2424 operational integrity

Percy live SQLite/WAL/process/worktree state and Project 2424 canonical local source/dirty overlay are outside this execution surface. Their current integrity/security state is `UNKNOWN / BLOCKED_EXTERNAL_MAC_OR_SOURCE`. Required recovery is non-destructive and evidence-preserving; no replacement DB/source tree is authorized.

## Release rule

A security gate advances only on direct evidence from the exact target revision/environment. Passing CI, RLS metadata, a healthy public endpoint, or a prepared migration does not by itself certify production security.
