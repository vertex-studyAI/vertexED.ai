-- Restore production waitlist status integrity and the expected lookup index.
-- Applied to production on 2026-08-05 via Supabase migration
-- `20260805141302_waitlist_status_integrity_index`.
-- Safe to run repeatedly.

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.waitlist'::regclass
      and conname = 'waitlist_status_check'
  ) then
    alter table public.waitlist
      add constraint waitlist_status_check
      check (status in ('pending', 'approved', 'rejected')) not valid;
  end if;
end
$$;

alter table public.waitlist
  validate constraint waitlist_status_check;

create index if not exists waitlist_status_idx
  on public.waitlist (status);
