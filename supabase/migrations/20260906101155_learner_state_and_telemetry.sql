-- Durable learner-state sync, privacy-safe observability, and explicit Data API boundaries.

create table public.learner_state_items (
  user_id uuid not null references auth.users(id) on delete cascade,
  state_type text not null check (state_type in ('weakness', 'retry', 'mock_draft')),
  state_key text not null check (state_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'),
  payload jsonb not null check (jsonb_typeof(payload) = 'object' and octet_length(payload::text) <= 262144),
  client_revision text not null check (client_revision ~ '^state:[0-9]{13}:[A-Za-z0-9-]{8,64}$'),
  client_updated_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, state_type, state_key),
  unique (user_id, client_revision)
);

create index learner_state_items_user_updated_idx
  on public.learner_state_items (user_id, updated_at desc);

create index learner_state_items_active_retry_idx
  on public.learner_state_items (user_id, (payload->>'dueAt'))
  where state_type = 'retry' and payload->>'status' = 'scheduled';

alter table public.learner_state_items enable row level security;

-- The browser reaches learner state through the authenticated application API,
-- not by writing this table directly. RLS remains enabled as defense in depth.
revoke all on table public.learner_state_items from public, anon, authenticated;
grant select, insert, update, delete on table public.learner_state_items to service_role;

create or replace function public.sync_learner_state_item(
  p_user_id uuid,
  p_state_type text,
  p_state_key text,
  p_payload jsonb,
  p_client_revision text,
  p_client_updated_at timestamptz
)
returns table (applied boolean, client_revision text, server_updated_at timestamptz)
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if p_user_id is null
    or p_state_type not in ('weakness', 'retry', 'mock_draft')
    or p_state_key !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'
    or jsonb_typeof(p_payload) <> 'object'
    or octet_length(p_payload::text) > 262144
    or p_client_revision !~ '^state:[0-9]{13}:[A-Za-z0-9-]{8,64}$'
  then
    raise exception 'Invalid learner-state item' using errcode = '22023';
  end if;

  insert into public.learner_state_items (
    user_id, state_type, state_key, payload, client_revision, client_updated_at
  ) values (
    p_user_id, p_state_type, p_state_key, p_payload, p_client_revision, p_client_updated_at
  )
  on conflict (user_id, state_type, state_key) do update
    set payload = excluded.payload,
        client_revision = excluded.client_revision,
        client_updated_at = excluded.client_updated_at,
        updated_at = now()
    where (excluded.client_updated_at, excluded.client_revision)
      > (learner_state_items.client_updated_at, learner_state_items.client_revision);

  return query
    select item.client_revision = p_client_revision,
           item.client_revision,
           item.updated_at
    from public.learner_state_items as item
    where item.user_id = p_user_id
      and item.state_type = p_state_type
      and item.state_key = p_state_key;
end;
$$;

revoke all on function public.sync_learner_state_item(uuid, text, text, jsonb, text, timestamptz)
  from public, anon, authenticated;
grant execute on function public.sync_learner_state_item(uuid, text, text, jsonb, text, timestamptz)
  to service_role;

create table public.observability_events (
  id bigint generated always as identity primary key,
  schema_version text not null check (schema_version in ('vertexed.telemetry.v1', 'vertexed.ai_provider.v1')),
  event_type text not null check (event_type in ('client_error', 'unhandled_rejection', 'ai_run', 'ai_feedback', 'performance', 'provider_run')),
  route text not null default 'unknown',
  capability text not null default 'unknown',
  provider text,
  model text,
  error_class text not null default 'none',
  outcome text not null check (outcome in ('success', 'degraded', 'blocked', 'failed')),
  status integer check (status is null or status between 100 and 599),
  duration_ms integer check (duration_ms is null or duration_ms between 0 and 300000),
  feedback text check (feedback is null or feedback in ('helpful', 'not_helpful', 'incorrect')),
  reason text check (reason is null or reason in ('incorrect', 'unclear', 'irrelevant', 'unsafe', 'other')),
  recorded_at timestamptz not null,
  received_at timestamptz not null default now()
);

create index observability_events_received_idx
  on public.observability_events (received_at desc);
create index observability_events_failures_idx
  on public.observability_events (capability, received_at desc)
  where outcome = 'failed';
create index observability_events_feedback_idx
  on public.observability_events (capability, feedback, received_at desc)
  where event_type = 'ai_feedback';

alter table public.observability_events enable row level security;
revoke all on table public.observability_events from public, anon, authenticated;
grant select, insert, delete on table public.observability_events to service_role;
grant usage, select on sequence public.observability_events_id_seq to service_role;

create or replace function public.prune_observability_events(retain_after timestamptz)
returns bigint
language plpgsql
security invoker
set search_path = ''
as $$
declare
  deleted_count bigint;
begin
  if retain_after is null or retain_after > now() - interval '7 days' then
    raise exception 'Retention cutoff must preserve at least seven days' using errcode = '22023';
  end if;
  delete from public.observability_events where received_at < retain_after;
  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.prune_observability_events(timestamptz)
  from public, anon, authenticated;
grant execute on function public.prune_observability_events(timestamptz) to service_role;

-- Harden historical privileged functions and make every referenced object explicit.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

create or replace function public.auth_email_exists(check_email text)
returns boolean
language sql
security definer
set search_path = ''
as $$
  select exists(
    select 1
    from auth.users
    where lower(auth.users.email) = lower(trim(check_email))
  );
$$;

revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke all on function public.auth_email_exists(text) from public, anon, authenticated;
grant execute on function public.auth_email_exists(text) to service_role;

-- Explicit grants and role-scoped policies for browser-accessed tables.
revoke all on table public.profiles, public.user_study_artifacts from anon;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.user_study_artifacts to authenticated;
grant select, insert, update, delete on table public.profiles, public.user_study_artifacts to service_role;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users read own artifacts" on public.user_study_artifacts;
create policy "Users read own artifacts" on public.user_study_artifacts
  for select to authenticated using ((select auth.uid()) = user_id);
drop policy if exists "Users insert own artifacts" on public.user_study_artifacts;
create policy "Users insert own artifacts" on public.user_study_artifacts
  for insert to authenticated with check ((select auth.uid()) = user_id);
drop policy if exists "Users update own artifacts" on public.user_study_artifacts;
create policy "Users update own artifacts" on public.user_study_artifacts
  for update to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
drop policy if exists "Users delete own artifacts" on public.user_study_artifacts;
create policy "Users delete own artifacts" on public.user_study_artifacts
  for delete to authenticated using ((select auth.uid()) = user_id);

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
    'observabilityStorage', to_regclass('public.observability_events') is not null,
    'singletonIntegrity', to_regclass('public.user_study_artifacts_singleton_kind_idx') is not null
  );
$$;

revoke all on function public.vertexed_readiness() from public, anon, authenticated;
grant execute on function public.vertexed_readiness() to service_role;
