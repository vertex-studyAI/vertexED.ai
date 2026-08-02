-- VertexED production verification queries
-- Read-only: run in the Supabase SQL editor against the production project.
-- These queries reveal schema metadata, not secret values or user records.

-- 1. Required public tables and RLS state.
select
  schemaname,
  tablename,
  rowsecurity as rls_enabled
from pg_tables
where schemaname = 'public'
  and tablename in (
    'profiles',
    'waitlist',
    'waitlist_rate_limits',
    'user_study_artifacts'
  )
order by tablename;
-- Expected: four rows and rls_enabled = true for every row.

-- 2. Required columns.
select
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
from information_schema.columns
where table_schema = 'public'
  and (
    (table_name = 'profiles' and column_name in ('id', 'email', 'full_name', 'avatar_url', 'created_at', 'updated_at'))
    or (table_name = 'waitlist' and column_name in ('id', 'email', 'status', 'invite_token', 'signup_method', 'auth_user_id', 'created_at', 'updated_at'))
    or (table_name = 'waitlist_rate_limits' and column_name in ('id', 'ip_hash', 'attempted_at'))
    or (table_name = 'user_study_artifacts' and column_name in ('id', 'user_id', 'kind', 'title', 'payload', 'created_at', 'updated_at'))
  )
order by table_name, ordinal_position;

-- 3. RLS policies. Waitlist and rate-limit tables intentionally have no public
-- policies because only the service-role server client should access them.
select
  schemaname,
  tablename,
  policyname,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('profiles', 'waitlist', 'waitlist_rate_limits', 'user_study_artifacts')
order by tablename, policyname;
-- Expected profile policies: own select/insert/update.
-- Expected artifact policies: own select/insert/update/delete.
-- Expected waitlist and rate-limit public policies: none.

-- 4. Required indexes, including uniqueness protections.
select
  tablename,
  indexname,
  indexdef
from pg_indexes
where schemaname = 'public'
  and tablename in ('waitlist', 'waitlist_rate_limits', 'user_study_artifacts')
order by tablename, indexname;
-- Confirm at minimum:
-- waitlist_email_lower_idx (unique, lower(email))
-- waitlist_invite_token_idx (unique where invite_token is not null)
-- waitlist_auth_user_id_idx (unique where auth_user_id is not null)
-- waitlist_status_idx
-- waitlist_rate_limits_ip_time_idx
-- user_study_artifacts_user_kind_idx

-- 5. Check constraints and foreign keys.
select
  conrelid::regclass as table_name,
  conname as constraint_name,
  pg_get_constraintdef(oid) as definition
from pg_constraint
where connamespace = 'public'::regnamespace
  and conrelid in (
    'public.waitlist'::regclass,
    'public.user_study_artifacts'::regclass,
    'public.profiles'::regclass
  )
order by table_name::text, constraint_name;
-- Confirm waitlist status is limited to pending/approved/rejected.
-- Confirm artifact kind includes note/review/paper/planner/notebook.
-- Confirm user-owned rows reference auth.users with the intended delete behavior.

-- 6. New-user profile trigger.
select
  event_object_schema,
  event_object_table,
  trigger_name,
  action_timing,
  event_manipulation,
  action_statement
from information_schema.triggers
where event_object_schema = 'auth'
  and event_object_table = 'users'
  and trigger_name = 'on_auth_user_created';
-- Expected: one AFTER INSERT trigger calling public.handle_new_user().

-- 7. Security-definer helper and privileges.
select
  n.nspname as schema_name,
  p.proname as function_name,
  p.prosecdef as security_definer,
  pg_get_function_identity_arguments(p.oid) as arguments,
  has_function_privilege('anon', p.oid, 'EXECUTE') as anon_can_execute,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') as authenticated_can_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') as service_role_can_execute
from pg_proc p
join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public'
  and p.proname in ('auth_email_exists', 'handle_new_user')
order by p.proname;
-- Expected auth_email_exists: security_definer = true, anon/authenticated false,
-- service_role true.

-- 8. Detect duplicate waitlist emails before relying on the lower(email) index.
select lower(email) as normalized_email, count(*) as duplicate_count
from public.waitlist
group by lower(email)
having count(*) > 1;
-- Expected: zero rows.

-- 9. Detect approved entries that cannot complete an approval-link signup.
select count(*) as approved_without_invite_token
from public.waitlist
where status = 'approved'
  and auth_user_id is null
  and invite_token is null;
-- Expected: zero, unless those users are intentionally using a team invite code.

-- 10. Detect consumed invite tokens that were not cleared.
select count(*) as linked_users_with_live_token
from public.waitlist
where auth_user_id is not null
  and invite_token is not null;
-- Expected: zero.

-- Dashboard-only checks that SQL cannot certify:
-- * Email/password authentication enabled.
-- * Google provider enabled with the intended client credentials.
-- * Site URL is https://www.vertexed.app.
-- * Redirect allow list includes https://www.vertexed.app/auth/callback and the
--   intentionally supported preview/local callback URLs only.
-- * Production backups/PITR match the current Supabase plan.
-- * No service-role key appears in browser-accessible configuration.