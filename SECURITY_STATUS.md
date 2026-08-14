# SECURITY_STATUS

**As of:** 2026-08-14 convergence run  
**Rule:** source controls, database policy state, deployed behavior, and end-to-end production certification are separate evidence classes.

## VertexED — PARTIAL / DATABASE CONTROLS VERIFIED, PRODUCTION CERTIFICATION OPEN

Connected Supabase project `xwlrzgfuhfbckgvcmyoq` is `ACTIVE_HEALTHY` on PostgreSQL `17.4.1.074`.

Read-only production inspection established:

- all 26 observed `public` base tables have RLS enabled;
- sampled learner-owned/readable records use ownership predicates tied to `auth.uid()`;
- `profiles` self-update has both `USING` and `WITH CHECK` ownership predicates;
- `user_study_artifacts` self-update has both `USING` and `WITH CHECK` ownership predicates;
- direct-client-denied tables use fail-closed policies for `anon` / `authenticated`;
- the two observed `public` `SECURITY DEFINER` functions, `auth_email_exists` and `handle_new_user`, have explicit `search_path` settings and are not executable by `anon`, `authenticated`, or `PUBLIC`;
- no public views were observed;
- no Supabase Edge Functions are currently exposed by the connected project.

Current Supabase security-advisor warnings:

1. leaked-password protection is disabled;
2. the hosted PostgreSQL build has security patches available.

These warnings remain owner/platform actions. They are not evidence of exploitation, and they must not be hidden to declare release readiness. The older `security_definer_view` warning is not present in the current advisor output and is therefore not retained as an active finding.

### Remaining VertexED release-security gate

VertexED is **not production-certified**. Exact served deployment revision is still unproved by the public health monitor, and the authenticated disposable-account golden journey—including account isolation, persistence, recovery, logout denial and admin boundaries—has not been completed against a verified immutable deployment. Source/database controls do not substitute for that journey.

## FinanceMeta — SOURCE PARTIAL / PRODUCTION SECURITY BLOCKED_EXTERNAL

The canonical portal repository and existing hardening branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` are recovered. This execution surface can read the branch but cannot open/write the required target PR through the connected GitHub integration; the FinanceMeta production Supabase project is not connected here.

Therefore branch-authored hardening, migrations `018`–`021`, or retained local tests are **source evidence only**. Live RLS, migration state, secrets/environment, deployed revision, cross-user denial/isolation, recovery/logout and cleanup remain unverified. Do not call FinanceMeta secure or production-ready until the actual target passes those gates.

## The Bu1LD — SOURCE RECOVERED / PRODUCTION SECURITY BLOCKED_EXTERNAL

Canonical source is directly verified as `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`. The production Supabase/auth-provider/domain/deployment target remains unavailable through the current execution surface. RLS, role/object authorization, deployment identity and seven-role authenticated journeys therefore remain unverified. Source identity does not certify production security.

## Percy / Project 2424 operational integrity

Percy live SQLite/WAL/process/worktree state and the Project 2424 canonical local source/dirty overlay are outside this execution surface. Their current integrity/security state is `UNKNOWN / BLOCKED_EXTERNAL_MAC_OR_SOURCE`. Required recovery is non-destructive and evidence-preserving; no replacement DB/source tree is authorized.

## Release rule

A security gate advances only on direct evidence from the exact target revision/environment. Passing CI, RLS metadata, a healthy public endpoint, or a prepared migration does not by itself certify production security.
