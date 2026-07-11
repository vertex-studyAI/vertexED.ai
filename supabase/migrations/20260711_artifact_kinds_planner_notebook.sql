-- Extend user_study_artifacts kinds for planner cloud sync and notebook snapshots.

alter table public.user_study_artifacts
  drop constraint if exists user_study_artifacts_kind_check;

alter table public.user_study_artifacts
  add constraint user_study_artifacts_kind_check
  check (kind in ('note', 'review', 'paper', 'planner', 'notebook'));
