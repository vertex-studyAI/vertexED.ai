# SECURITY_STATUS

**As of:** 2026-08-14 convergence run.  
**Rule:** source controls, database policy state, deployed behavior, and end-to-end production certification are separate evidence classes.

## VertexED — PARTIAL / DATABASE CONTROLS VERIFIED, PRODUCTION CERTIFICATION OPEN

Connected Supabase project `xwlrzgfuhfbckgvcmyoq` is `ACTIVE_HEALTHY` on Postgres `17.4.1.074`.

Fresh read-only inspection in this convergence run established:

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

## FinanceMeta — SOURCE PARTIAL / PRODUCTION SECURITY BLOCKED_EXTERNAL

Canonical source is reachable at `build-the-future-11/finance4all-global-reach`. Current `main` is `fbdd503223edc5b1780509720391083f485a4a85`; retained branch `cursor/membership-security-supabase-fix` is 41 commits ahead and 0 behind. A fresh PR creation attempt from this integration returned `403 Resource not accessible by integration`.

An older PR #1 was merged in July at an earlier branch head; it does not prove the current 41-commit branch is integrated into current `main`. The FinanceMeta production Supabase project is not connected here. Therefore live RLS, migration state, secrets/environment, deployed revision, cross-user denial/isolation, recovery/logout and cleanup remain unverified.

## The Bu1LD — BLOCKED_EXTERNAL

The canonical production Supabase/deployment target is unavailable through the current execution surface. RLS, role boundaries, deployment identity and seven-role authenticated journeys remain unverified. No security state is promoted from historical/control artifacts.

## Percy / Project 2424 operational integrity

Percy live SQLite/WAL/process/worktree state and Project 2424 canonical local source/dirty overlay are outside this execution surface. Their current integrity/security state is `UNKNOWN / BLOCKED_EXTERNAL_MAC_OR_SOURCE`. Required recovery is non-destructive and evidence-preserving; no replacement DB/source tree is authorized.

## Release rule

A security gate advances only on direct evidence from the exact target revision/environment. Passing CI, RLS metadata, a healthy public endpoint, or a prepared migration does not by itself certify production security.
