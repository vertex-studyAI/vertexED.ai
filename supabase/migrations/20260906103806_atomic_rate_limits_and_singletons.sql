-- Make serverless rate limiting atomic and enforce one planner/notebook row per user.

create or replace function public.consume_waitlist_rate_limit(
  rate_key text,
  window_start timestamptz,
  max_attempts integer,
  attempted_at timestamptz default now()
)
returns table (allowed boolean, retry_after_sec integer)
language plpgsql
security definer
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

-- Cache auth.uid() once per query and keep policies role-scoped.
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
