-- Retain only the rolling operational window for server-mediated rate limits.
-- The hosted project applied this exact migration on 2026-10-24.

create index if not exists waitlist_rate_limits_attempted_at_idx
  on public.waitlist_rate_limits (attempted_at);

create or replace function public.prune_waitlist_rate_limits(retain_after timestamptz)
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

  delete from public.waitlist_rate_limits
  where attempted_at < retain_after;

  get diagnostics deleted_count = row_count;
  return deleted_count;
end;
$$;

revoke all on function public.prune_waitlist_rate_limits(timestamptz)
  from public, anon, authenticated;
grant execute on function public.prune_waitlist_rate_limits(timestamptz)
  to service_role;

select public.prune_waitlist_rate_limits(now() - interval '30 days');
