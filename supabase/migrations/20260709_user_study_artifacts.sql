-- User study artifacts (notes, reviews, papers) — run in Supabase SQL editor

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
