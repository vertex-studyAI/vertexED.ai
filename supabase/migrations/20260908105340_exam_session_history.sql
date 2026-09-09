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
