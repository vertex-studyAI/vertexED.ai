-- VertexED.ai Supabase schema
-- Run this in the Supabase SQL editor (Dashboard → SQL → New query).

-- -----------------------------------------------------------------------------
-- Profiles (linked to auth.users)
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

alter table public.profiles enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile" on public.profiles;
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Auto-create profile row when a new auth user is created
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

-- -----------------------------------------------------------------------------
-- Waitlist (public signup via /api/waitlist using service role)
-- -----------------------------------------------------------------------------
create table if not exists public.waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- Case-insensitive unique emails (safe to run if constraint already exists)
alter table public.waitlist drop constraint if exists waitlist_email_unique;
create unique index if not exists waitlist_email_lower_idx on public.waitlist (lower(email));

create index if not exists waitlist_status_idx on public.waitlist (status);
create index if not exists waitlist_created_at_idx on public.waitlist (created_at desc);

alter table public.waitlist enable row level security;

-- -----------------------------------------------------------------------------
-- Waitlist rate limiting (service role only — used by /api/waitlist)
-- -----------------------------------------------------------------------------
create table if not exists public.waitlist_rate_limits (
  id bigserial primary key,
  ip_hash text not null,
  attempted_at timestamp with time zone default now() not null
);

create index if not exists waitlist_rate_limits_ip_time_idx
  on public.waitlist_rate_limits (ip_hash, attempted_at desc);

alter table public.waitlist_rate_limits enable row level security;

-- -----------------------------------------------------------------------------
-- Helper: check if an auth account already exists for an email (service role RPC)
-- -----------------------------------------------------------------------------
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

-- -----------------------------------------------------------------------------
-- User study artifacts (notes, reviews, papers)
-- See also: supabase/migrations/20260709_user_study_artifacts.sql
-- -----------------------------------------------------------------------------
create table if not exists public.user_study_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('note', 'review', 'paper')),
  title text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists user_study_artifacts_user_kind_idx
  on public.user_study_artifacts (user_id, kind, updated_at desc);

alter table public.user_study_artifacts enable row level security;

drop policy if exists "Users read own artifacts" on public.user_study_artifacts;
create policy "Users read own artifacts" on public.user_study_artifacts
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own artifacts" on public.user_study_artifacts;
create policy "Users insert own artifacts" on public.user_study_artifacts
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own artifacts" on public.user_study_artifacts;
create policy "Users update own artifacts" on public.user_study_artifacts
  for update using (auth.uid() = user_id);

drop policy if exists "Users delete own artifacts" on public.user_study_artifacts;
create policy "Users delete own artifacts" on public.user_study_artifacts
  for delete using (auth.uid() = user_id);
