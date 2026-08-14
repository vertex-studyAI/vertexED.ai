# SECURITY_STATUS

**As of:** 2026-08-14 convergence re-verification. This is a thin evidence view; it does not replace product/runtime truth.

## VertexED — PARTIAL / BOUNDED CONTROLS VERIFIED
- connected Supabase project reported active/healthy;
- every inspected `public` table has RLS enabled;
- visible policies are ownership-scoped, intentionally fail-closed or public-read-only;
- inspected public `SECURITY DEFINER` functions `auth_email_exists` and `handle_new_user` have EXECUTE only for `postgres`/`service_role`, not `anon`/`authenticated`;
- no public views found in the bounded inspection;
- Security Advisor warns leaked-password protection is disabled and Postgres security patches are available.

**Next:** owner/admin review of platform configuration and maintenance, then rerun Security Advisor. Do not treat this as authenticated golden-journey or served-revision proof.

## FinanceMeta — PARTIAL / PRESERVED RECOVERY
Historical security merge is genuine; preserved branch is 41 commits ahead of current pre-merge main. Exact-head lint fails and connected write attempts return 403. Production Supabase is not visible. Preserve branch; repair through an owner-authorized reviewable path; never force-move main.

## The Bu1LD — SOURCE CI GREEN / PRODUCTION SECURITY UNKNOWN
Exact current-main source CI passed, but deployment verification failed before deploy. Production role/RLS/security certification remains UNKNOWN/BLOCKED.

## Percy — LIVE SECURITY/INTEGRITY UNKNOWN
Live SQLite/WAL/process state is inaccessible. Historical snapshots are provenance only. No reset, cleanup, replacement DB or destructive recovery is authorized.
