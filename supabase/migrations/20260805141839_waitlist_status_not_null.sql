-- Enforce the non-null waitlist status contract after production preflight.
-- Applied to production on 2026-08-05 as migration
-- `20260805141839_waitlist_status_not_null`.

do $$
begin
  if exists (
    select 1
    from public.waitlist
    where status is null
  ) then
    raise exception 'cannot enforce waitlist status NOT NULL while null rows exist';
  end if;
end
$$;

alter table public.waitlist
  alter column status set not null;
