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
