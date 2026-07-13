-- Align legacy production projects with the current application before feature migrations.
-- Safe to run on a project that already has profiles/waitlist tables.

alter table public.profiles
  add column if not exists email text,
  add column if not exists avatar_url text,
  add column if not exists board text,
  add column if not exists grade smallint,
  add column if not exists subjects text[] not null default '{}',
  add column if not exists exam_date date,
  add column if not exists age smallint,
  add column if not exists school text,
  add column if not exists onboarding_notes text;

alter table public.profiles enable row level security;
drop policy if exists "Username Policy" on public.profiles;
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select using ((select auth.uid()) = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check ((select auth.uid()) = id);
create policy "Users can update own profile" on public.profiles
  for update using ((select auth.uid()) = id) with check ((select auth.uid()) = id);

create table if not exists public.user_study_artifacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('note', 'review', 'paper', 'planner', 'notebook')),
  title text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists user_study_artifacts_user_kind_idx
  on public.user_study_artifacts (user_id, kind, updated_at desc);
alter table public.user_study_artifacts enable row level security;
drop policy if exists "Users read own artifacts" on public.user_study_artifacts;
drop policy if exists "Users insert own artifacts" on public.user_study_artifacts;
drop policy if exists "Users update own artifacts" on public.user_study_artifacts;
drop policy if exists "Users delete own artifacts" on public.user_study_artifacts;
create policy "Users read own artifacts" on public.user_study_artifacts for select using ((select auth.uid()) = user_id);
create policy "Users insert own artifacts" on public.user_study_artifacts for insert with check ((select auth.uid()) = user_id);
create policy "Users update own artifacts" on public.user_study_artifacts for update using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own artifacts" on public.user_study_artifacts for delete using ((select auth.uid()) = user_id);

create table if not exists public.waitlist_rate_limits (
  id bigserial primary key,
  ip_hash text not null,
  attempted_at timestamptz not null default now()
);
create index if not exists waitlist_rate_limits_ip_time_idx on public.waitlist_rate_limits (ip_hash, attempted_at desc);
alter table public.waitlist_rate_limits enable row level security;

alter table public.waitlist add column if not exists invite_token text;
create unique index if not exists waitlist_invite_token_idx on public.waitlist (invite_token) where invite_token is not null;
create unique index if not exists waitlist_email_lower_idx on public.waitlist (lower(email));

create or replace function public.auth_email_exists(check_email text)
returns boolean language sql security definer set search_path = public, auth as $$
  select exists(select 1 from auth.users where lower(email) = lower(trim(check_email)));
$$;
revoke all on function public.auth_email_exists(text) from public;
grant execute on function public.auth_email_exists(text) to service_role;

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'), new.raw_user_meta_data->>'avatar_url')
  on conflict (id) do update set email = excluded.email, updated_at = now();
  return new;
end;
$$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

alter table public.education_lesson_progress enable row level security;
drop policy if exists "Users manage own education progress" on public.education_lesson_progress;
create policy "Users manage own education progress" on public.education_lesson_progress
  for all using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
