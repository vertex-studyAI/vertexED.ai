-- Repair the final artifact constraint after the two historical 20260711
-- migrations apply alphabetically. The planner-only delta otherwise removes
-- notebook even though the API and client both support it.

alter table public.user_study_artifacts
  drop constraint if exists user_study_artifacts_kind_check;

alter table public.user_study_artifacts
  add constraint user_study_artifacts_kind_check
  check (kind in ('note', 'review', 'paper', 'planner', 'notebook'));
