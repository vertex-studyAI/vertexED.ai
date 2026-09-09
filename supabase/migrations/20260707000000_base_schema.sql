-- Baseline required to rebuild a blank database before historical deltas.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
create policy "Users can insert own profile" on public.profiles
  for insert to authenticated with check ((select auth.uid()) = id);
create policy "Users can update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.profiles to service_role;
revoke all on table public.profiles from anon;

create table public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  invite_token text,
  signup_method text not null default 'email' check (signup_method in ('email', 'google')),
  auth_user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index waitlist_email_lower_idx on public.waitlist (lower(email));
create index waitlist_status_idx on public.waitlist (status);
create unique index waitlist_auth_user_id_idx on public.waitlist (auth_user_id) where auth_user_id is not null;
create index waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;
revoke all on table public.waitlist from public, anon, authenticated;
grant select, insert, update, delete on table public.waitlist to service_role;
