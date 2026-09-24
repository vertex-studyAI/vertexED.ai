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
-- Production defaults grant sequence access to client roles; override them.
revoke all on sequence public.observability_events_id_seq from public, anon, authenticated;
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


-- Make serverless rate limiting atomic and enforce one planner/notebook row per user.

create or replace function public.consume_waitlist_rate_limit(
  rate_key text,
  window_start timestamptz,
  max_attempts integer,
  attempted_at timestamptz default now()
)
returns table (allowed boolean, retry_after_sec integer)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  attempt_count integer;
  oldest_attempt timestamptz;
begin
  if rate_key is null or length(rate_key) < 16 or max_attempts < 1 then
    raise exception 'Invalid rate-limit input';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(rate_key, 0));

  delete from public.waitlist_rate_limits
  where ip_hash = rate_key and waitlist_rate_limits.attempted_at < window_start;

  select count(*), min(waitlist_rate_limits.attempted_at)
    into attempt_count, oldest_attempt
  from public.waitlist_rate_limits
  where ip_hash = rate_key and waitlist_rate_limits.attempted_at >= window_start;

  if attempt_count >= max_attempts then
    return query select false, greatest(
      1,
      ceil(extract(epoch from (oldest_attempt - window_start)))::integer
    );
    return;
  end if;

  insert into public.waitlist_rate_limits (ip_hash, attempted_at)
  values (rate_key, attempted_at);

  return query select true, 0;
end;
$$;

revoke all on function public.consume_waitlist_rate_limit(text, timestamptz, integer, timestamptz)
  from public, anon, authenticated;
grant execute on function public.consume_waitlist_rate_limit(text, timestamptz, integer, timestamptz)
  to service_role;

-- Never discard learner artifacts automatically. Stop for explicit operator
-- reconciliation if a historical race already created singleton duplicates.
do $$
begin
  if exists (
    select 1
    from public.user_study_artifacts
    where kind in ('planner', 'notebook')
    group by user_id, kind
    having count(*) > 1
  ) then
    raise exception 'Duplicate planner/notebook artifacts require manual reconciliation before this migration.'
      using errcode = '23505';
  end if;
end
$$;

create unique index if not exists user_study_artifacts_singleton_kind_idx
  on public.user_study_artifacts (user_id, kind)
  where kind in ('planner', 'notebook');


-- Collapse learner-state uploads into one database round trip and make the
-- remaining Data API privileges explicit.

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
    or p_state_type is null
    or p_state_type not in ('weakness', 'retry', 'mock_draft')
    or p_state_key is null
    or p_state_key !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'
    or p_payload is null
    or jsonb_typeof(p_payload) <> 'object'
    or octet_length(p_payload::text) > 262144
    or p_client_revision is null
    or p_client_revision !~ '^state:[0-9]{13}:[A-Za-z0-9-]{8,64}$'
    or p_client_updated_at is null
    or p_client_updated_at > now() + interval '1 day'
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

create or replace function public.sync_learner_state_items(
  p_user_id uuid,
  p_items jsonb
)
returns table (
  state_type text,
  state_key text,
  requested_revision text,
  current_revision text,
  applied boolean,
  server_updated_at timestamptz
)
language plpgsql
security invoker
set search_path = ''
as $$
declare
  item jsonb;
begin
  if p_user_id is null
    or p_items is null
    or jsonb_typeof(p_items) <> 'array'
    or jsonb_array_length(p_items) < 1
    or jsonb_array_length(p_items) > 50
  then
    raise exception 'Invalid learner-state batch' using errcode = '22023';
  end if;

  if (
    select count(*) <> count(distinct concat(value->>'stateType', ':', value->>'stateKey'))
    from jsonb_array_elements(p_items)
  ) then
    raise exception 'Duplicate learner-state key in batch' using errcode = '22023';
  end if;

  for item in select value from jsonb_array_elements(p_items)
  loop
    return query
      select item->>'stateType',
             item->>'stateKey',
             item->>'clientRevision',
             result.client_revision,
             result.applied,
             result.server_updated_at
      from public.sync_learner_state_item(
        p_user_id,
        item->>'stateType',
        item->>'stateKey',
        item->'payload',
        item->>'clientRevision',
        (item->>'clientUpdatedAt')::timestamptz
      ) as result;
  end loop;
end;
$$;

revoke all on function public.sync_learner_state_items(uuid, jsonb) from public, anon, authenticated;
grant execute on function public.sync_learner_state_items(uuid, jsonb) to service_role;

revoke all on table public.waitlist_rate_limits from public, anon, authenticated;
grant select, insert, delete on table public.waitlist_rate_limits to service_role;
revoke all on sequence public.waitlist_rate_limits_id_seq from public, anon, authenticated;
grant usage, select on sequence public.waitlist_rate_limits_id_seq to service_role;

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
    'observabilityStorage', to_regclass('public.observability_events') is not null,
    'singletonIntegrity', to_regclass('public.user_study_artifacts_singleton_kind_idx') is not null
  );
$$;

revoke all on function public.vertexed_readiness() from public, anon, authenticated;
grant execute on function public.vertexed_readiness() to service_role;

-- Add session snapshots to the existing account-owned learner-state channel.
-- Apply before deploying the client that writes exam_session records.
alter table public.learner_state_items drop constraint learner_state_items_state_type_check;
alter table public.learner_state_items add constraint learner_state_items_state_type_check
  check (state_type in ('weakness', 'retry', 'mock_draft', 'exam_session'));

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
    or p_state_type is null
    or p_state_type not in ('weakness', 'retry', 'mock_draft', 'exam_session')
    or p_state_key is null
    or p_state_key !~ '^[A-Za-z0-9][A-Za-z0-9._:-]{0,159}$'
    or p_payload is null
    or jsonb_typeof(p_payload) <> 'object'
    or octet_length(p_payload::text) > 262144
    or p_client_revision is null
    or p_client_revision !~ '^state:[0-9]{13}:[A-Za-z0-9-]{8,64}$'
    or p_client_updated_at is null
    or p_client_updated_at > now() + interval '1 day'
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


-- Preserve the service-only API boundary and existing row-level security.
revoke all on function public.sync_learner_state_item(uuid, text, text, jsonb, text, timestamptz) from public, anon, authenticated;
grant execute on function public.sync_learner_state_item(uuid, text, text, jsonb, text, timestamptz) to service_role;

-- Fail release readiness on databases that still reject exam_session records.
-- Catalog inspection only: the public health request never writes learner data.
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
    'singletonIntegrity', to_regclass('public.user_study_artifacts_singleton_kind_idx') is not null
  );
$$;

revoke all on function public.vertexed_readiness() from public, anon, authenticated;
grant execute on function public.vertexed_readiness() to service_role;
