-- Store new waitlist approval credentials as expiring SHA-256 digests. The
-- plaintext column remains temporarily readable so links issued before this
-- migration continue to work until they are consumed or replaced.
alter table public.waitlist
  add column if not exists invite_token_hash text,
  add column if not exists invite_issued_at timestamptz,
  add column if not exists invite_expires_at timestamptz;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'waitlist_invite_token_hash_format'
      and conrelid = 'public.waitlist'::regclass
  ) then
    alter table public.waitlist
      add constraint waitlist_invite_token_hash_format
      check (invite_token_hash is null or invite_token_hash ~ '^[0-9a-f]{64}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'waitlist_invite_window_integrity'
      and conrelid = 'public.waitlist'::regclass
  ) then
    alter table public.waitlist
      add constraint waitlist_invite_window_integrity
      check (
        (invite_token_hash is null and invite_issued_at is null and invite_expires_at is null)
        or (
          invite_token_hash is not null
          and invite_token is null
          and invite_issued_at is not null
          and invite_expires_at > invite_issued_at
        )
      );
  end if;
end
$$;

create unique index if not exists waitlist_invite_token_hash_idx
  on public.waitlist (invite_token_hash)
  where invite_token_hash is not null;

-- Admin pagination filters by status and then orders newest-first.
create index if not exists waitlist_status_created_at_idx
  on public.waitlist (status, created_at desc);

-- Mutable rows should not depend on every application caller remembering to
-- advance updated_at. This trigger is intentionally invoker-rights and has no
-- direct API execution grant.
create or replace function public.set_vertexed_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke all on function public.set_vertexed_updated_at() from public, anon, authenticated;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_vertexed_updated_at();

drop trigger if exists waitlist_set_updated_at on public.waitlist;
create trigger waitlist_set_updated_at
  before update on public.waitlist
  for each row execute function public.set_vertexed_updated_at();

drop trigger if exists user_study_artifacts_set_updated_at on public.user_study_artifacts;
create trigger user_study_artifacts_set_updated_at
  before update on public.user_study_artifacts
  for each row execute function public.set_vertexed_updated_at();

drop trigger if exists learner_state_items_set_updated_at on public.learner_state_items;
create trigger learner_state_items_set_updated_at
  before update on public.learner_state_items
  for each row execute function public.set_vertexed_updated_at();

create or replace function public.vertexed_readiness()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'atomicRateLimitRpc', to_regprocedure('public.consume_waitlist_rate_limit(text,timestamptz,integer,timestamptz)') is not null,
    'learnerStateStorage', to_regclass('public.learner_state_items') is not null
      and to_regprocedure('public.sync_learner_state_item(uuid,text,text,jsonb,text,timestamptz)') is not null,
    'batchLearnerStateSync', to_regprocedure('public.sync_learner_state_items(uuid,jsonb)') is not null,
    'examSessionStorage', exists (
      select 1 from pg_catalog.pg_constraint
      where conrelid = to_regclass('public.learner_state_items')
        and conname = 'learner_state_items_state_type_check'
        and convalidated
        and position('''exam_session''' in pg_catalog.pg_get_constraintdef(oid)) > 0
    ) and exists (
      select 1 from pg_catalog.pg_proc
      where oid = to_regprocedure('public.sync_learner_state_item(uuid,text,text,jsonb,text,timestamptz)')
        and position('''exam_session''' in pg_catalog.pg_get_functiondef(oid)) > 0
    ),
    'observabilityStorage', to_regclass('public.observability_events') is not null,
    'singletonIntegrity', to_regclass('public.user_study_artifacts_singleton_kind_idx') is not null,
    'expiringHashedInvites', to_regclass('public.waitlist_invite_token_hash_idx') is not null
      and to_regclass('public.waitlist_status_created_at_idx') is not null,
    'automaticTimestamps', to_regprocedure('public.set_vertexed_updated_at()') is not null
  );
$$;

revoke all on function public.vertexed_readiness() from public, anon, authenticated;
grant execute on function public.vertexed_readiness() to service_role;
