-- VertexED product activation / saved-artifact return cohorts
--
-- READ-ONLY. This report never selects artifact title/payload, email, prompt,
-- answer, token, or other learner content.
--
-- Product definitions used here:
--   activation = the account's first persisted study artifact
--   D1 saved-artifact return = another persisted artifact 24-48h after activation
--   D7 saved-artifact return = another persisted artifact 7-8d after activation
--
-- These are deliberately conservative product metrics. They do not claim that
-- a learner who returned without saving an artifact was absent.
--
-- Run only from an authorized server/admin analytics context. Do not expose the
-- per-account CTEs below as an API response; the final output is aggregate only.

with artifact_events as (
  select
    user_id,
    created_at
  from public.user_study_artifacts
  where created_at is not null
),
activation as (
  select
    user_id,
    min(created_at) as activated_at
  from artifact_events
  group by user_id
),
cohort_flags as (
  select
    a.user_id,
    a.activated_at,
    date_trunc('week', a.activated_at at time zone 'UTC')::date as cohort_week_utc,
    (a.activated_at <= now() - interval '48 hours') as d1_eligible,
    (a.activated_at <= now() - interval '8 days') as d7_eligible,
    exists (
      select 1
      from artifact_events e
      where e.user_id = a.user_id
        and e.created_at >= a.activated_at + interval '24 hours'
        and e.created_at <  a.activated_at + interval '48 hours'
    ) as d1_returned_and_saved,
    exists (
      select 1
      from artifact_events e
      where e.user_id = a.user_id
        and e.created_at >= a.activated_at + interval '7 days'
        and e.created_at <  a.activated_at + interval '8 days'
    ) as d7_returned_and_saved
  from activation a
)
select
  cohort_week_utc,
  count(*)::int as activated_users,
  count(*) filter (where d1_eligible)::int as d1_eligible_users,
  count(*) filter (where d1_eligible and d1_returned_and_saved)::int as d1_returned_and_saved_users,
  round(
    100.0 * count(*) filter (where d1_eligible and d1_returned_and_saved)
    / nullif(count(*) filter (where d1_eligible), 0),
    1
  ) as d1_saved_artifact_return_pct,
  count(*) filter (where d7_eligible)::int as d7_eligible_users,
  count(*) filter (where d7_eligible and d7_returned_and_saved)::int as d7_returned_and_saved_users,
  round(
    100.0 * count(*) filter (where d7_eligible and d7_returned_and_saved)
    / nullif(count(*) filter (where d7_eligible), 0),
    1
  ) as d7_saved_artifact_return_pct
from cohort_flags
group by cohort_week_utc
order by cohort_week_utc desc;

-- Aggregate product activity from the same trustworthy-save boundary.
-- This is "artifact-active", not generic WAU.
select
  count(distinct user_id)::int as artifact_active_users_7d,
  count(*)::int as artifacts_saved_7d,
  round(
    count(*)::numeric / nullif(count(distinct user_id), 0),
    2
  ) as artifacts_per_artifact_active_user_7d
from public.user_study_artifacts
where created_at >= now() - interval '7 days';
