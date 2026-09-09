-- VertexED read-only Supabase security audit
-- Purpose: make production backend verification repeatable without mutating data.
-- Run against the intended Supabase project and review results before any launch claim.

-- 0) Check required capabilities without calling a function that might be missing.
-- This is catalog evidence, not proof of successful writes or correct RLS behavior.
select
  to_regclass('public.learner_state_items') is not null as learner_state_storage,
  to_regclass('public.observability_events') is not null as observability_storage,
  to_regprocedure('public.vertexed_readiness()') is not null as readiness_rpc,
  to_regprocedure('public.sync_learner_state_items(uuid,jsonb)') is not null as batch_sync_rpc,
  to_regprocedure('public.consume_waitlist_rate_limit(text,timestamptz,integer,timestamptz)') is not null as atomic_rate_limit_rpc,
  to_regclass('public.user_study_artifacts_singleton_kind_idx') is not null as singleton_index;

-- Shared Auth triggers must be reviewed before applying a product migration ledger.
select t.tgname as trigger_name, n.nspname as function_schema, p.proname as function_name
from pg_catalog.pg_trigger t
join pg_catalog.pg_proc p on p.oid = t.tgfoid
join pg_catalog.pg_namespace n on n.oid = p.pronamespace
where t.tgrelid = 'auth.users'::regclass and not t.tgisinternal;

-- 1) Every public base table should have RLS enabled.
select
  n.nspname as schema_name,
  c.relname as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as force_rls
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind = 'r'
  and n.nspname = 'public'
order by c.relname;

-- 2) Public views/materialized views require explicit review because ordinary views can bypass RLS semantics.
select
  n.nspname as schema_name,
  c.relname as view_name,
  coalesce(array_to_string(c.reloptions, ','), '') as reloptions
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where c.relkind in ('v', 'm')
  and n.nspname = 'public'
order by c.relname;

-- 3) Enumerate RLS policies and confirm ownership-sensitive UPDATE policies use both USING and WITH CHECK.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual is not null as has_using,
  with_check is not null as has_with_check
from pg_policies
where schemaname = 'public'
order by tablename, policyname;

-- 4) SECURITY DEFINER functions are privileged boundaries. Verify explicit search_path and public-role EXECUTE grants.
select
  n.nspname as schema_name,
  p.proname,
  p.prosecdef as security_definer,
  p.proconfig,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_exec,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_exec
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
order by p.proname;
