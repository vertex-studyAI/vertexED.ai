# SECURITY_STATUS

**As of:** 2026-08-14 convergence run.  
**Rule:** source controls, database policy state, deployed behavior and end-to-end production certification are separate evidence classes.

## VertexED — PARTIAL / DATABASE CONTROLS VERIFIED, PRODUCTION CERTIFICATION OPEN
Connected Supabase `xwlrzgfuhfbckgvcmyoq` is `ACTIVE_HEALTHY` on PostgreSQL `17.4.1.074`. Fresh read-only inspection found all 26 observed public base tables RLS-enabled; sampled owner policies bind to `auth.uid()`; observed public `SECURITY DEFINER` functions have explicit search paths and are not executable by PUBLIC/anon/authenticated; no public views were observed. Current advisor warnings: leaked-password protection disabled and hosted PostgreSQL security patches available. These are owner/platform actions, not evidence of exploitation.

VertexED remains **not production-certified** until exact served revision is proven and the authenticated disposable-account journey verifies isolation, persistence, recovery/logout and admin boundaries.

## FinanceMeta — SOURCE PARTIAL / PRODUCTION SECURITY BLOCKED_EXTERNAL
Canonical source is recovered at `build-the-future-11/finance4all-global-reach`; retained hardening branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is 41 ahead / 0 behind recovered main. Fresh PR creation here returns 403 and FinanceMeta production Supabase is not connected. Live RLS/migration/env/revision/isolation/recovery state therefore remains unverified.

## The Bu1LD — SOURCE RECOVERED / PRODUCTION SECURITY BLOCKED_EXTERNAL
Canonical source `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe` is directly verified. Production Supabase/auth/domain/deployment and role-separated journeys remain unavailable; source identity does not certify production security.

## Percy / Project 2424
Live Percy DB/WAL/process/worktree state and Project 2424 local canonical source/dirty overlay are external. Current integrity/security state is `UNKNOWN / BLOCKED_EXTERNAL_MAC_OR_SOURCE`. Recovery must be non-destructive; no replacement state is authorized.

## Release rule
A security gate advances only on direct evidence from the exact target revision/environment. CI, RLS metadata, a healthy endpoint or prepared migration is not by itself production certification.
