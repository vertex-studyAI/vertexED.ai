# FinanceMeta Security Handoff — 23 August 2026

## Verified current truth

Canonical repository: `build-the-future-11/finance4all-global-reach`
Canonical main observed at: `fbdd503223edc5b1780509720391083f485a4a85`

The canonical repository currently contains only these Supabase migrations:

- `001_initial_schema.sql`
- `002_google_oauth.sql`
- `003_bookmarks_notifications.sql`

No `004_authorization_hardening.sql` is present on canonical main.

## Security release blocker

The current schema permits an authenticated user to update their own `profiles` row via a table-wide UPDATE policy while authorization helpers derive admin/lead status from `profiles.role`. The application UI currently limits its own update payload, but that does not constrain direct PostgREST/client writes. The current notifications migration also grants authenticated clients an INSERT policy with `WITH CHECK (true)` although the comment says notification creation should be trigger-owned.

Treat this as a release blocker until the prepared hardening migration is applied and tested.

## Prepared remediation already in this control repository

Use:

`portfolio/financemeta/authorization-hardening/apply-authorization-hardening.mjs`

It creates:

- `supabase/migrations/004_authorization_hardening.sql`
- `src/test/authorization-contract.test.ts`

The migration/test package is designed to:

1. remove `role` from authenticated profile INSERT/UPDATE grants;
2. keep self-service profile writes restricted to safe columns;
3. remove direct authenticated notification INSERT;
4. pin SECURITY DEFINER function search paths;
5. narrow helper-function execution grants;
6. make `essay_submissions_with_counts` use caller permissions;
7. verify the current UI update surface remains inside the safe-column grant.

## Execution blocker discovered today

The connected GitHub identity can read the canonical FinanceMeta repository and repository metadata reports user-level admin/push permission, but a real branch-creation attempt through the installed GitHub App returned:

`403 Resource not accessible by integration`

Therefore this hardening is **prepared and verified against the current source shape, but not applied to the canonical repository**. Do not report it as fixed.

## Exact next execution sequence

Once the GitHub App has write access to `build-the-future-11/finance4all-global-reach`:

```bash
# from the control repository
node portfolio/financemeta/authorization-hardening/apply-authorization-hardening.mjs /path/to/finance4all-global-reach

# from the FinanceMeta checkout
git switch -c security/authorization-hardening-20260823
npm ci
npm test -- --run src/test/authorization-contract.test.ts
npm run build
# then run the full canonical release gate once installed
```

Before merge, verify with disposable authenticated accounts that:

- a normal member cannot change `profiles.role` by direct API write;
- a normal member cannot fabricate a notification for another user;
- permitted profile fields remain editable;
- role-dependent admin/lead operations still work for legitimate privileged accounts;
- existing application flows do not rely on direct notification inserts.

## Claim boundary

This document records a verified source-level security gap and an existing remediation package. It does **not** prove the production Supabase database has the vulnerable policies deployed, because production migration state was not independently read here. It does prove that canonical source main still lacks the hardening migration and must not be treated as source-level secure until the change is applied and validated.