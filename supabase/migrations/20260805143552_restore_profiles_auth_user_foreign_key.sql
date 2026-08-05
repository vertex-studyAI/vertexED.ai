-- Restore the repository-declared profiles -> auth.users ownership contract.
-- Applied to production on 2026-08-05 as migration
-- `20260805143552_restore_profiles_auth_user_foreign_key`.
--
-- Safety:
-- - aborts if any orphan profile exists at execution time;
-- - creates the foreign key only when it is absent;
-- - validates the constraint after creation;
-- - does not delete, rewrite, or expose user data.

do $$
begin
  if exists (
    select 1
    from public.profiles p
    left join auth.users u on u.id = p.id
    where u.id is null
  ) then
    raise exception 'cannot restore profiles_id_fkey while orphan profiles exist';
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_id_fkey
      foreign key (id)
      references auth.users(id)
      on delete cascade
      not valid;
  end if;
end
$$;

alter table public.profiles
  validate constraint profiles_id_fkey;
