-- FinanceMeta authorization audit — READ ONLY
--
-- Run against a rehearsal or authorized production read-only connection.
-- This query returns policy/grant metadata only; it does not select application rows.
--
-- Use the output to classify each surface before any RLS rewrite:
--   public        = intentionally available without FinanceMeta membership
--   member        = requires explicit active financemeta_is_member()
--   owner         = requires explicit membership AND row ownership
--   lead/admin    = requires explicit membership AND existing stronger role predicate
--   server_only   = no browser privilege
--
-- This file performs no mutation.

with fm_tables(table_name) as (
  values
    ('chapters'), ('cohorts'), ('connection_requests'), ('digest_preferences'),
    ('essay_submissions'), ('essay_upvotes'), ('event_registrations'), ('events'),
    ('explainer_cards'), ('financemeta_member_directory'),
    ('financemeta_member_onboarding'), ('financemeta_member_profiles'),
    ('introduction_posts'), ('lab_applications'), ('news_articles'),
    ('notifications'), ('opportunities'), ('opportunity_interests'),
    ('research_projects'), ('studio_submissions'), ('programs'),
    ('program_participations'), ('research_protocols'), ('evidence_records'),
    ('notification_preferences'), ('notification_deliveries')
),
policy_rows as (
  select
    p.tablename,
    p.policyname,
    p.cmd,
    p.roles::text as roles,
    coalesce(p.qual, '') as using_expression,
    coalesce(p.with_check, '') as check_expression,
    case
      when coalesce(p.qual, '') = 'true' or coalesce(p.with_check, '') = 'true'
        then 'authenticated_wide'
      when coalesce(p.qual, '') ~ 'auth\.uid' or coalesce(p.with_check, '') ~ 'auth\.uid'
        then 'identity_scoped_without_explicit_membership'
      when coalesce(p.qual, '') ~ 'financemeta_is_admin|financemeta_is_lead_or_admin'
        or coalesce(p.with_check, '') ~ 'financemeta_is_admin|financemeta_is_lead_or_admin'
        then 'privileged_role_scoped'
      else 'manual_review'
    end as current_scope_class
  from pg_policies p
  join fm_tables f on f.table_name = p.tablename
  where p.schemaname = 'public'
),
grants as (
  select
    g.table_name,
    g.grantee,
    string_agg(g.privilege_type, ',' order by g.privilege_type) as privileges
  from information_schema.role_table_grants g
  join fm_tables f on f.table_name = g.table_name
  where g.table_schema = 'public'
    and g.grantee in ('anon', 'authenticated', 'service_role')
  group by g.table_name, g.grantee
)
select
  p.tablename,
  p.policyname,
  p.cmd,
  p.roles,
  p.current_scope_class,
  p.using_expression,
  p.check_expression,
  coalesce((
    select jsonb_object_agg(grantee, privileges)
    from grants g
    where g.table_name = p.tablename
  ), '{}'::jsonb) as role_grants
from policy_rows p
order by p.tablename, p.policyname;

-- Membership-enforcement readiness summary.
with policy_inventory as (
  select
    p.tablename,
    count(*) filter (
      where p.roles::text like '%authenticated%'
        and (coalesce(p.qual, '') = 'true' or coalesce(p.with_check, '') = 'true')
    ) as authenticated_wide_policy_count,
    count(*) filter (
      where p.roles::text like '%authenticated%'
        and (
          coalesce(p.qual, '') ~ 'auth\.uid'
          or coalesce(p.with_check, '') ~ 'auth\.uid'
        )
        and (
          coalesce(p.qual, '') !~ 'financemeta_is_member'
          and coalesce(p.with_check, '') !~ 'financemeta_is_member'
        )
    ) as identity_scoped_without_member_count
  from pg_policies p
  where p.schemaname = 'public'
  group by p.tablename
)
select *
from policy_inventory
where authenticated_wide_policy_count > 0
   or identity_scoped_without_member_count > 0
order by authenticated_wide_policy_count desc,
         identity_scoped_without_member_count desc,
         tablename;
