-- Isolated rehearsal only. Relevant production metadata inspected 2026-09-19.
-- No production records. auth.users is an intentionally minimal FK fixture;
-- this is not a full Supabase/Auth/deployment rehearsal.
create role anon;
create role authenticated;
create role service_role bypassrls;
grant usage on schema public to anon, authenticated, service_role;
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public revoke execute on functions from public;
alter default privileges in schema public grant execute on functions to service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
create schema auth;
create table auth.users (id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
$$;
grant usage on schema auth to anon, authenticated, service_role;
grant execute on function auth.uid() to anon, authenticated, service_role;
create table public.user_study_artifacts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('note','review','paper','planner','notebook')),
 title text, payload jsonb not null default '{}',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 idempotency_key text check(idempotency_key is null or idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$'),
 unique(user_id,idempotency_key)
);
create index user_study_artifacts_user_kind_idx on public.user_study_artifacts(user_id,kind,updated_at desc);
alter table public.user_study_artifacts enable row level security;
create policy "Users read own artifacts" on public.user_study_artifacts for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users insert own artifacts" on public.user_study_artifacts for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users update own artifacts" on public.user_study_artifacts for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "Users delete own artifacts" on public.user_study_artifacts for delete to authenticated using ((select auth.uid()) = user_id);
create table public.waitlist_rate_limits(id bigserial primary key, ip_hash text not null, attempted_at timestamptz not null default now());
create index waitlist_rate_limits_ip_time_idx on public.waitlist_rate_limits(ip_hash,attempted_at desc);
alter table public.waitlist_rate_limits enable row level security;
create policy "No direct client access" on public.waitlist_rate_limits for all to anon,authenticated using(false) with check(false);
\i supabase/migrations/20260908165433_exam_session_readiness.sql
insert into auth.users values ('00000000-0000-4000-8000-000000000001'),('00000000-0000-4000-8000-000000000002');
insert into public.user_study_artifacts(user_id,kind,title) values ('00000000-0000-4000-8000-000000000001','planner','Synthetic retained planner');
