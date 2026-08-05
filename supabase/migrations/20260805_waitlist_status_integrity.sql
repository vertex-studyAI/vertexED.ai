-- Restore the production waitlist integrity guarantees declared in
-- supabase/schema.sql and docs/PRODUCTION_SQL_CHECKS.sql.
--
-- This migration is intentionally data-preserving. It refuses to continue if
-- any existing row would violate the documented status contract.

do $$
begin
  if exists (
    select 1
    from public.waitlist
    where status is null
       or status not in ('pending', 'approved', 'rejected')
  ) then
    raise exception 'waitlist contains null or unsupported status values';
  end if;
end
$$;

alter table public.waitlist
  alter column status set not null;

alter table public.waitlist
  drop constraint if exists waitlist_status_check;

alter table public.waitlist
  add constraint waitlist_status_check
  check (status in ('pending', 'approved', 'rejected'))
  not valid;

alter table public.waitlist
  validate constraint waitlist_status_check;

create index if not exists waitlist_status_idx
  on public.waitlist (status);
