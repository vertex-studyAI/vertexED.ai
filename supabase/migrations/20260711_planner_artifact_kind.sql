-- Allow study planner state in user_study_artifacts (one replaceable row per user).

alter table public.user_study_artifacts
  drop constraint if exists user_study_artifacts_kind_check;

alter table public.user_study_artifacts
  add constraint user_study_artifacts_kind_check
  check (kind in ('note', 'review', 'paper', 'planner'));
