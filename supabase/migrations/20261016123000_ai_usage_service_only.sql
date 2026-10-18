-- VertexED's finite AI admission ledger. One USD is 1,000,000 micro-USD.
-- This migration creates new service-only objects; it changes no existing rows.
-- Hard ceilings: USD 1/account/UTC day; USD 10/project/UTC day; 2/8 active calls.
-- A lower server policy is allowed, never a higher one. Pricing and bounded
-- provider request sizes are checked by the API before calling these RPCs.
-- Daily spend belongs to the database UTC admission day, not a provider invoice
-- timestamp. All unresolved concurrency survives that day's budget reset.

create table public.ai_usage_reservations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  account_hash text not null check (account_hash ~ '^[0-9a-f]{64}$'),
  operation_hash text not null check (operation_hash ~ '^[0-9a-f]{64}$'),
  request_fingerprint text not null check (request_fingerprint ~ '^[0-9a-f]{64}$'),
  capability text not null check (capability ~ '^[a-z][a-z0-9_-]{0,63}$'),
  provider text not null check (provider ~ '^[a-z][a-z0-9_-]{0,31}$'),
  model text not null check (model ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$'),
  policy_version text not null check (policy_version ~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,79}$'),
  usage_day date not null,
  reserved_microusd bigint not null check (reserved_microusd between 1 and 1000000),
  charged_microusd bigint not null default 0 check (charged_microusd between 0 and reserved_microusd),
  state text not null default 'reserved' check (state in ('reserved', 'dispatched', 'succeeded', 'released', 'failed', 'uncertain')),
  reserved_at timestamptz not null default statement_timestamp(),
  expires_at timestamptz not null default (statement_timestamp() + interval '5 minutes'),
  dispatched_at timestamptz,
  settled_at timestamptz,
  constraint ai_usage_operation_owner_unique unique (account_hash, operation_hash),
  constraint ai_usage_day_matches_reservation check (usage_day = (reserved_at at time zone 'UTC')::date),
  constraint ai_usage_dispatch_lease check (expires_at > reserved_at and expires_at <= reserved_at + interval '5 minutes'),
  constraint ai_usage_state_accounting check (
    (state in ('reserved', 'dispatched', 'uncertain') and charged_microusd = 0)
    or state = 'succeeded'
    or (state = 'released' and charged_microusd = 0)
    or (state = 'failed' and charged_microusd = reserved_microusd)
  ),
  constraint ai_usage_state_timestamps check (
    (state = 'reserved' and dispatched_at is null and settled_at is null)
    or (state = 'released' and dispatched_at is null and settled_at is not null)
    or (state = 'dispatched' and dispatched_at is not null and settled_at is null)
    or (state in ('succeeded', 'failed', 'uncertain') and dispatched_at is not null and settled_at is not null)
  )
);

create index ai_usage_project_day_idx on public.ai_usage_reservations (usage_day)
  include (state, reserved_microusd, charged_microusd);
create index ai_usage_account_day_idx on public.ai_usage_reservations (account_hash, usage_day)
  include (state, reserved_microusd, charged_microusd);
create index ai_usage_owner_export_idx on public.ai_usage_reservations (user_id, reserved_at, id) where user_id is not null;
create index ai_usage_active_idx on public.ai_usage_reservations (account_hash)
  where state in ('reserved', 'dispatched', 'uncertain');

comment on table public.ai_usage_reservations is
  'Service-only micro-USD accounting by DB UTC admission day. No prompts or responses. Deletion nulls export ownership but retains a pseudonymous SHA256 high-entropy UUID anti-reset tombstone, request hash and cost metadata. Same-UUID recreation cannot reset quota. No automatic timeout, lease-expiry, deletion or day-rollover release; unresolved exposure requires explicit reviewed reconciliation.';

alter table public.ai_usage_reservations enable row level security;
alter table public.ai_usage_reservations force row level security;
revoke all on table public.ai_usage_reservations from public, anon, authenticated, service_role;
do $$
declare usage_column record;
begin
  for usage_column in select attname from pg_attribute
    where attrelid = 'public.ai_usage_reservations'::regclass and attnum > 0 and not attisdropped
  loop
    execute format('revoke all privileges (%I) on table public.ai_usage_reservations from public, anon, authenticated, service_role', usage_column.attname);
  end loop;
end;
$$;
-- No browser policies, DELETE, TRUNCATE or sequence grants. FK SET NULL performs
-- privacy deletion without erasing the project cost/concurrency obligation.
grant select, insert, update on table public.ai_usage_reservations to service_role;

create or replace function public.read_ai_usage(
  p_user_id uuid,
  p_account_limit_microusd bigint default 1000000,
  p_project_limit_microusd bigint default 10000000,
  p_account_concurrency integer default 2,
  p_project_concurrency integer default 8
) returns jsonb
language plpgsql security invoker set search_path = '' set timezone = 'UTC'
as $$
declare
  v_now timestamptz;
  v_day date;
  v_account_used bigint;
  v_account_reserved bigint;
  v_account_active bigint;
  v_account_hash text;
  v_account_carried bigint;
  v_account_uncertain bigint;
  v_project_used bigint;
  v_project_reserved bigint;
  v_project_active bigint;
begin
  if p_user_id is null
    or p_account_limit_microusd is null or p_account_limit_microusd not between 0 and 1000000
    or p_project_limit_microusd is null or p_project_limit_microusd not between 0 and 10000000
    or p_account_concurrency is null or p_account_concurrency not between 1 and 2
    or p_project_concurrency is null or p_project_concurrency not between 1 and 8 then
    raise exception 'Invalid AI usage policy' using errcode = '22023';
  end if;
  -- Every mutating/read RPC uses this same global -> account order. The global
  -- transaction lock also serializes first-row inserts and cross-day retries.
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:project', 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:account:' || p_user_id::text, 0));
  v_now := pg_catalog.clock_timestamp();
  v_day := (v_now at time zone 'UTC')::date;
  v_account_hash := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_user_id::text, 'UTF8')), 'hex');
  select coalesce(sum(charged_microusd) filter (where usage_day = v_day), 0),
    coalesce(sum(reserved_microusd) filter (where usage_day = v_day and state in ('reserved', 'dispatched', 'uncertain')), 0),
    count(*) filter (where state in ('reserved', 'dispatched', 'uncertain'))
    into v_project_used, v_project_reserved, v_project_active
    from public.ai_usage_reservations
    where usage_day = v_day or state in ('reserved', 'dispatched', 'uncertain');
  select coalesce(sum(charged_microusd) filter (where usage_day = v_day), 0),
    coalesce(sum(reserved_microusd) filter (where usage_day = v_day and state in ('reserved', 'dispatched', 'uncertain')), 0),
    count(*) filter (where state in ('reserved', 'dispatched', 'uncertain')),
    coalesce(sum(reserved_microusd) filter (where usage_day < v_day and state in ('reserved', 'dispatched', 'uncertain')), 0),
    count(*) filter (where state = 'uncertain')
    into v_account_used, v_account_reserved, v_account_active, v_account_carried, v_account_uncertain
    from public.ai_usage_reservations where account_hash = v_account_hash
      and (usage_day = v_day or state in ('reserved', 'dispatched', 'uncertain'));
  return pg_catalog.jsonb_build_object(
    'observed_at', v_now,
    'period_start', v_day::timestamp at time zone 'UTC',
    'resets_at', (v_day + 1)::timestamp at time zone 'UTC',
    'account_limit_microusd', p_account_limit_microusd,
    'account_used_microusd', v_account_used, 'account_reserved_microusd', v_account_reserved,
    'account_remaining_microusd', greatest(0, p_account_limit_microusd - v_account_used - v_account_reserved),
    'account_active_count', v_account_active,
    'account_carried_reserved_microusd', v_account_carried,
    'account_uncertain_count', v_account_uncertain,
    'account_capacity_blocked', v_account_active >= p_account_concurrency,
    'project_available', v_project_used + v_project_reserved < p_project_limit_microusd and v_project_active < p_project_concurrency
  );
end;
$$;

create or replace function public.reserve_ai_usage(
  p_user_id uuid, p_operation_id text, p_request_fingerprint text,
  p_capability text, p_provider text, p_model text, p_policy_version text,
  p_reserved_microusd bigint,
  p_account_limit_microusd bigint default 1000000,
  p_project_limit_microusd bigint default 10000000,
  p_account_concurrency integer default 2,
  p_project_concurrency integer default 8
) returns jsonb
language plpgsql security invoker set search_path = '' set timezone = 'UTC'
as $$
declare
  v_now timestamptz;
  v_day date;
  v_hash text;
  v_account_hash text;
  v_existing public.ai_usage_reservations%rowtype;
  v_usage jsonb;
  v_project_used bigint;
  v_project_reserved bigint;
  v_project_active bigint;
  v_reason text;
  v_id uuid;
begin
  if p_operation_id is null or length(p_operation_id) not between 1 and 200 or p_operation_id ~ '[[:cntrl:]]'
    or p_request_fingerprint is null or p_request_fingerprint !~ '^[0-9a-f]{64}$'
    or p_capability is null or p_capability !~ '^[a-z][a-z0-9_-]{0,63}$'
    or p_provider is null or p_provider !~ '^[a-z][a-z0-9_-]{0,31}$'
    or p_model is null or p_model !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,159}$'
    or p_policy_version is null or p_policy_version !~ '^[A-Za-z0-9][A-Za-z0-9._:/-]{0,79}$'
    or p_reserved_microusd is null or p_reserved_microusd not between 1 and 1000000 then
    raise exception 'Invalid AI reservation input' using errcode = '22023';
  end if;
  -- read_ai_usage validates ceilings and takes global -> account transaction locks.
  v_usage := public.read_ai_usage(p_user_id, p_account_limit_microusd, p_project_limit_microusd, p_account_concurrency, p_project_concurrency);
  -- Use the very same DB instant as the locked snapshot, even at UTC midnight.
  v_now := (v_usage->>'observed_at')::timestamptz;
  v_day := (v_now at time zone 'UTC')::date;
  v_hash := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_operation_id, 'UTF8')), 'hex');
  v_account_hash := pg_catalog.encode(pg_catalog.sha256(pg_catalog.convert_to(p_user_id::text, 'UTF8')), 'hex');
  select * into v_existing from public.ai_usage_reservations
    where account_hash = v_account_hash and operation_hash = v_hash for update;
  if found then
    v_reason := case when v_existing.request_fingerprint = p_request_fingerprint
      and v_existing.capability = p_capability and v_existing.provider = p_provider
      and v_existing.model = p_model and v_existing.policy_version = p_policy_version
      and v_existing.reserved_microusd = p_reserved_microusd then 'duplicate' else 'idempotency_conflict' end;
    return pg_catalog.jsonb_build_object('allowed', false, 'reason', v_reason,
      'reservation_id', v_existing.id, 'state', v_existing.state,
      'reserved_microusd', v_existing.reserved_microusd, 'used_microusd', v_usage->'account_used_microusd',
      'remaining_microusd', v_usage->'account_remaining_microusd', 'resets_at', v_usage->'resets_at');
  end if;
  select coalesce(sum(charged_microusd) filter (where usage_day = v_day), 0),
    coalesce(sum(reserved_microusd) filter (where usage_day = v_day and state in ('reserved', 'dispatched', 'uncertain')), 0),
    count(*) filter (where state in ('reserved', 'dispatched', 'uncertain'))
    into v_project_used, v_project_reserved, v_project_active
    from public.ai_usage_reservations where usage_day = v_day or state in ('reserved', 'dispatched', 'uncertain');
  v_reason := case
    when (v_usage->>'account_used_microusd')::bigint + (v_usage->>'account_reserved_microusd')::bigint + p_reserved_microusd > p_account_limit_microusd then 'account_limit'
    when v_project_used + v_project_reserved + p_reserved_microusd > p_project_limit_microusd then 'project_limit'
    when (v_usage->>'account_active_count')::bigint >= p_account_concurrency then 'account_concurrency'
    when v_project_active >= p_project_concurrency then 'project_concurrency'
    else 'reserved' end;
  if v_reason <> 'reserved' then
    return pg_catalog.jsonb_build_object('allowed', false, 'reason', v_reason, 'reservation_id', null, 'state', null,
      'reserved_microusd', 0, 'used_microusd', v_usage->'account_used_microusd',
      'remaining_microusd', v_usage->'account_remaining_microusd', 'resets_at', v_usage->'resets_at');
  end if;
  insert into public.ai_usage_reservations (user_id, account_hash, operation_hash, request_fingerprint, capability, provider, model, policy_version, usage_day, reserved_microusd, reserved_at, expires_at)
    values (p_user_id, v_account_hash, v_hash, p_request_fingerprint, p_capability, p_provider, p_model, p_policy_version, v_day, p_reserved_microusd, v_now, v_now + interval '5 minutes')
    returning id into v_id;
  return pg_catalog.jsonb_build_object('allowed', true, 'reason', 'reserved', 'reservation_id', v_id, 'state', 'reserved',
    'reserved_microusd', p_reserved_microusd, 'used_microusd', v_usage->'account_used_microusd',
    'remaining_microusd', (v_usage->>'account_remaining_microusd')::bigint - p_reserved_microusd, 'resets_at', v_usage->'resets_at');
end;
$$;

create or replace function public.mark_ai_usage_dispatched(p_user_id uuid, p_reservation_id uuid)
returns jsonb language plpgsql security invoker set search_path = '' set timezone = 'UTC'
as $$
declare v_row public.ai_usage_reservations%rowtype;
begin
  if p_user_id is null or p_reservation_id is null then raise exception 'Invalid AI dispatch input' using errcode = '22023'; end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:project', 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:account:' || p_user_id::text, 0));
  select * into v_row from public.ai_usage_reservations where id = p_reservation_id and user_id = p_user_id for update;
  if not found then return pg_catalog.jsonb_build_object('allowed', false, 'reason', 'not_found', 'state', null); end if;
  if v_row.state <> 'reserved' then
    return pg_catalog.jsonb_build_object('allowed', false, 'reason', case when v_row.state = 'dispatched' then 'duplicate' else 'invalid_state' end, 'state', v_row.state);
  end if;
  if v_row.expires_at <= pg_catalog.clock_timestamp() or v_row.usage_day <> (pg_catalog.clock_timestamp() at time zone 'UTC')::date then
    return pg_catalog.jsonb_build_object('allowed', false, 'reason', 'reservation_expired', 'state', v_row.state);
  end if;
  update public.ai_usage_reservations set state = 'dispatched', dispatched_at = pg_catalog.clock_timestamp() where id = v_row.id;
  return pg_catalog.jsonb_build_object('allowed', true, 'reason', 'dispatched', 'state', 'dispatched');
end;
$$;

create or replace function public.settle_ai_usage(p_user_id uuid, p_reservation_id uuid, p_outcome text, p_actual_microusd bigint default null)
returns jsonb language plpgsql security invoker set search_path = '' set timezone = 'UTC'
as $$
declare
  v_row public.ai_usage_reservations%rowtype;
  v_charge bigint;
  v_reason text;
begin
  if p_user_id is null or p_reservation_id is null or p_outcome is null or p_outcome not in ('succeeded', 'released', 'failed', 'uncertain')
    or (p_outcome = 'succeeded' and (p_actual_microusd is null or p_actual_microusd < 0))
    or (p_outcome <> 'succeeded' and p_actual_microusd is not null) then
    raise exception 'Invalid AI settlement input' using errcode = '22023';
  end if;
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:project', 0));
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('vertexed-ai-usage-v1:account:' || p_user_id::text, 0));
  select * into v_row from public.ai_usage_reservations where id = p_reservation_id and user_id = p_user_id for update;
  if not found then return pg_catalog.jsonb_build_object('ok', false, 'reason', 'not_found', 'state', null, 'charged_microusd', 0, 'reserved_microusd', 0); end if;
  if v_row.state in ('succeeded', 'released', 'failed', 'uncertain') then
    v_reason := case when v_row.state = p_outcome and (p_outcome <> 'succeeded' or p_actual_microusd = v_row.charged_microusd) then 'duplicate' else 'settlement_conflict' end;
    return pg_catalog.jsonb_build_object('ok', v_reason = 'duplicate', 'reason', v_reason, 'state', v_row.state,
      'charged_microusd', v_row.charged_microusd, 'reserved_microusd', case when v_row.state = 'uncertain' then v_row.reserved_microusd else 0 end);
  end if;
  if (p_outcome = 'released' and v_row.state <> 'reserved') or (p_outcome <> 'released' and v_row.state <> 'dispatched') then
    return pg_catalog.jsonb_build_object('ok', false, 'reason', 'invalid_state', 'state', v_row.state,
      'charged_microusd', v_row.charged_microusd, 'reserved_microusd', v_row.reserved_microusd);
  end if;
  if p_outcome = 'succeeded' and p_actual_microusd > v_row.reserved_microusd then
    return pg_catalog.jsonb_build_object('ok', false, 'reason', 'actual_exceeds_reservation', 'state', v_row.state,
      'charged_microusd', v_row.charged_microusd, 'reserved_microusd', v_row.reserved_microusd);
  end if;
  v_charge := case when p_outcome = 'succeeded' then p_actual_microusd when p_outcome = 'failed' then v_row.reserved_microusd else 0 end;
  update public.ai_usage_reservations set state = p_outcome, charged_microusd = v_charge, settled_at = pg_catalog.clock_timestamp() where id = v_row.id;
  return pg_catalog.jsonb_build_object('ok', true, 'reason', 'settled', 'state', p_outcome,
    'charged_microusd', v_charge, 'reserved_microusd', case when p_outcome = 'uncertain' then v_row.reserved_microusd else 0 end);
end;
$$;

revoke all on function public.read_ai_usage(uuid,bigint,bigint,integer,integer) from public, anon, authenticated;
revoke all on function public.reserve_ai_usage(uuid,text,text,text,text,text,text,bigint,bigint,bigint,integer,integer) from public, anon, authenticated;
revoke all on function public.mark_ai_usage_dispatched(uuid,uuid) from public, anon, authenticated;
revoke all on function public.settle_ai_usage(uuid,uuid,text,bigint) from public, anon, authenticated;
grant execute on function public.read_ai_usage(uuid,bigint,bigint,integer,integer) to service_role;
grant execute on function public.reserve_ai_usage(uuid,text,text,text,text,text,text,bigint,bigint,bigint,integer,integer) to service_role;
grant execute on function public.mark_ai_usage_dispatched(uuid,uuid) to service_role;
grant execute on function public.settle_ai_usage(uuid,uuid,text,bigint) to service_role;
