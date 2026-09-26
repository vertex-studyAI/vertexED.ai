# FinanceMeta explicit membership boundary — 25 September 2026

## Why this exists

Read-only inspection of the shared production Supabase project confirms that VertexED and FinanceMeta use the same Auth population. FinanceMeta currently materializes `financemeta_member_profiles` and onboarding state for every new Auth identity through `financemeta_on_auth_user_created` → `public.financemeta_handle_new_user()`.

That means **Auth identity**, **profile existence**, and **FinanceMeta membership** are not equivalent. The current profile row cannot safely serve as a membership predicate.

The live catalog also contains FinanceMeta surfaces whose browser authorization is broader than explicit product membership, including authenticated-wide reads and owner-only writes. Those policies are intentionally **not changed** by this preparation branch.

## Prepared primitive

`docs/FINANCEMETA_MEMBERSHIP_PRIMITIVE.sql` defines, but does not apply:

- `public.financemeta_memberships`, keyed by Auth UID;
- explicit states: `active`, `suspended`, `revoked`;
- no default membership status;
- RLS enabled;
- all table privileges revoked from `anon` and `authenticated`;
- explicit server-side `service_role` data privileges;
- `financemeta_private.financemeta_is_member()`, a stable `SECURITY DEFINER` helper with `search_path = ''` and fully-qualified relations;
- execute permission only for `authenticated`, so future RLS can call the predicate without exposing the membership table itself.

This follows current Supabase guidance: table grants and RLS are separate controls, and privileged membership helpers should live in a non-exposed schema with a pinned search path.

## Deliberately absent

This stage performs **no backfill** from:

- `auth.users`;
- `public.financemeta_member_profiles`;
- VertexED waitlist records;
- user-editable metadata.

It also does not:

- modify or drop `financemeta_on_auth_user_created`;
- change `financemeta_handle_new_user()`;
- rewrite any existing FinanceMeta RLS policy;
- change admin/lead predicates;
- apply DDL to production.

This makes the primitive inert even if reviewed: the future membership table starts empty, and no current policy references it.

## Required next stage before enforcement

1. Define the authoritative enrollment workflow: admin/invite/program/server workflow only.
2. Reconcile historical FinanceMeta members from evidence independent of auto-created profile rows.
3. Rehearse the primitive and policy rewrite in a production-equivalent isolated database.
4. Test at least:
   - VertexED-only authenticated identity → denied FinanceMeta member-only surfaces;
   - explicit FinanceMeta member → intended member behavior succeeds;
   - lead/admin behavior remains role-scoped;
   - truly public discovery remains public only where documented.
5. Replace member-only `USING (true)` and owner-write policies with `financemeta_is_member()` plus their existing row-level predicates.
6. Remove self-enrollment from the profile/onboarding path only after a replacement FinanceMeta enrollment flow is verified.
7. Run Supabase security and performance advisors after the rehearsal and again after any eventual production apply.

## Production boundary

Do not apply this SQL directly from this repository branch. It is a reviewable specification for issue #1040, not production authorization.
