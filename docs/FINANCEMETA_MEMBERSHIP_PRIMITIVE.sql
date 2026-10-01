-- FinanceMeta explicit membership authorization primitive — PREPARATION ONLY
--
-- This file is intentionally staged under docs/, not supabase/migrations/.
-- It has NOT been applied to production.
--
-- Purpose:
-- - separate FinanceMeta product authorization from generic Supabase Auth;
-- - make membership server-owned and non-self-service;
-- - provide one fail-closed predicate for future RLS rewrites.
--
-- Non-goals in this stage:
-- - no historical backfill;
-- - no policy rewrite on existing FinanceMeta tables;
-- - no trigger change to financemeta_on_auth_user_created;
-- - no automatic promotion from financemeta_member_profiles;
-- - no production apply.
--
-- Before converting this into a migration:
-- 1. reconcile historical identities from independent membership evidence;
-- 2. rehearse in an isolated production-equivalent database;
-- 3. add two-identity member/non-member policy tests;
-- 4. run Supabase security/performance advisors.

create table if not exists public.financemeta_memberships (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status text not null check (status in ('active', 'suspended', 'revoked')),
  granted_at timestamptz not null,
  granted_by uuid references auth.users(id) on delete set null,
  source text not null check (char_length(btrim(source)) between 1 and 120),
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    (status = 'revoked' and revoked_at is not null)
    or (status <> 'revoked' and revoked_at is null)
  )
);

alter table public.financemeta_memberships enable row level security;

-- Browser roles cannot enumerate, create, promote, update, or revoke membership
-- directly. The service role is server-only and bypasses RLS, but explicit
-- grants keep the privilege boundary reviewable.
revoke all on table public.financemeta_memberships from anon, authenticated;
grant select, insert, update, delete on table public.financemeta_memberships to service_role;

create index if not exists financemeta_memberships_status_idx
  on public.financemeta_memberships (status, granted_at desc);

create or replace function financemeta_private.financemeta_is_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select
    (select auth.uid()) is not null
    and exists (
      select 1
      from public.financemeta_memberships fm
      where fm.user_id = (select auth.uid())
        and fm.status = 'active'
    );
$function$;

revoke execute on function financemeta_private.financemeta_is_member()
  from public, anon, authenticated;
grant usage on schema financemeta_private to authenticated;
grant execute on function financemeta_private.financemeta_is_member()
  to authenticated;

comment on table public.financemeta_memberships is
  'Server-owned FinanceMeta product authorization. Presence of an Auth identity or member profile is not membership.';

comment on function financemeta_private.financemeta_is_member() is
  'Fail-closed FinanceMeta membership predicate for future RLS policies; reads only explicit active server-owned membership.';
