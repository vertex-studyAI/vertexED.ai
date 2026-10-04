# Saved-work timestamp boundary — 2026-10-04

## Scope

This draft tightens the shared saved-work normalizer used by both cloud list responses and local/durable recovery. It does not change Supabase schema, RLS, authentication, provider configuration, or production deployment.

## Source

- Integrated source commit: `7991cbf13cb4df865c25dd0d06ceb97cdb47712a` (draft PR #1108 head observed 2026-10-04)
- Existing `src/lib/userContent.ts` blob: `c1d2145f577d6e8017f8d3141bc2a0cd26c6ddbf`
- Supabase documentation review: Data API is auto-generated through PostgREST; `timestamptz` is the preferred timestamp type for instants and is represented as an ISO 8601 string.

## Reproduction

The existing guard accepted any string for which `Date.parse` returned a number. Node accepted `2026-02-30T00:00:00Z` and normalized it to `2026-03-02T00:00:00.000Z`, so an impossible saved-work timestamp could cross the recovery boundary.

## Change

- Added an RFC 3339-shaped, field-validating timestamp helper.
- Accepted browser ISO timestamps and Postgres-style `timestamptz` JSON values with UTC offsets and up to microsecond precision.
- Rejected impossible calendar dates, parser-dependent text, whitespace, invalid times, excess precision, and offsets beyond `14:00`.
- Routed both `created_at` and `updated_at` in the existing shared artifact normalizer through the helper.

## Verification boundary

Local regression tests exercise pure parsing behavior and source wiring. They do not certify production data, Supabase configuration, preview serving, cross-browser behavior, or production health.

## Owner action

Review and merge through the protected PR stack. After the serving/provider owner resolves incident #652/#44, run an authenticated preview or production-safe save/list/restore check using non-sensitive fixture data before certifying cross-session recovery.
