-- Phase 3 migration — run AFTER the base schema if tables already exist.
-- Safe to run multiple times.

-- Case-insensitive waitlist emails
alter table public.waitlist drop constraint if exists waitlist_email_unique;
create unique index if not exists waitlist_email_lower_idx on public.waitlist (lower(email));

-- Rate limit table
create table if not exists public.waitlist_rate_limits (
  id bigserial primary key,
  ip_hash text not null,
  attempted_at timestamp with time zone default now() not null
);

create index if not exists waitlist_rate_limits_ip_time_idx
  on public.waitlist_rate_limits (ip_hash, attempted_at desc);

alter table public.waitlist_rate_limits enable row level security;

-- Auth email lookup for waitlist API
create or replace function public.auth_email_exists(check_email text)
returns boolean
language sql
security definer
set search_path = public, auth
as $$
  select exists(
    select 1
    from auth.users
    where lower(email) = lower(trim(check_email))
  );
$$;

revoke all on function public.auth_email_exists(text) from public;
grant execute on function public.auth_email_exists(text) to service_role;

-- Profile auto-create on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do update
    set email = excluded.email,
        updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
