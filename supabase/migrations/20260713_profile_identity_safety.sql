-- Account creation must not fail merely because an OAuth or invite signup did not
-- supply a display name. The product can collect a preferred name later.
update public.profiles
set full_name = 'Learner'
where full_name is null or btrim(full_name) = '';

alter table public.profiles
  alter column full_name set default 'Learner';

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(
      nullif(btrim(new.raw_user_meta_data->>'full_name'), ''),
      nullif(btrim(new.raw_user_meta_data->>'name'), ''),
      'Learner'
    ),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;

revoke all on function public.handle_new_user() from public, anon, authenticated;
