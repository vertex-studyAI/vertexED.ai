-- VertexED durable product funnel
--
-- Aggregate only. No emails, prompts, answers, titles, payloads, or tokens.
--
-- Important: "configured profile" is a database proxy for onboarding state,
-- not a replacement for the browser-side Onboarding Completed event.
-- "durable core artifact activation" excludes planner because onboarding creates
-- the starter planner automatically.

with approved as (
  select distinct auth_user_id
  from public.waitlist
  where status = 'approved'
),
stages as (
  select
    a.auth_user_id,
    (a.auth_user_id is not null) as linked_account,
    exists (
      select 1
      from public.profiles p
      where p.id = a.auth_user_id
        and p.board is not null
        and coalesce(cardinality(p.subjects), 0) > 0
    ) as configured_profile,
    exists (
      select 1
      from public.user_study_artifacts usa
      where usa.user_id = a.auth_user_id
        and usa.kind = 'planner'
    ) as starter_planner_saved,
    exists (
      select 1
      from public.user_study_artifacts usa
      where usa.user_id = a.auth_user_id
        and usa.kind <> 'planner'
    ) as durable_core_artifact_activated
  from approved a
)
select
  count(*)::int as approved_waitlist_records,
  count(*) filter (where linked_account)::int as approved_linked_accounts,
  count(*) filter (where linked_account and configured_profile)::int as configured_profile_accounts,
  count(*) filter (where linked_account and starter_planner_saved)::int as starter_planner_saved_accounts,
  count(*) filter (where linked_account and durable_core_artifact_activated)::int as durable_core_artifact_activated_accounts,
  round(
    100.0 * count(*) filter (where linked_account and configured_profile)
    / nullif(count(*) filter (where linked_account), 0),
    1
  ) as linked_to_configured_profile_pct,
  round(
    100.0 * count(*) filter (where linked_account and starter_planner_saved)
    / nullif(count(*) filter (where linked_account and configured_profile), 0),
    1
  ) as configured_profile_to_starter_planner_pct,
  round(
    100.0 * count(*) filter (where linked_account and durable_core_artifact_activated)
    / nullif(count(*) filter (where linked_account and starter_planner_saved), 0),
    1
  ) as starter_planner_to_durable_core_artifact_pct
from stages;
