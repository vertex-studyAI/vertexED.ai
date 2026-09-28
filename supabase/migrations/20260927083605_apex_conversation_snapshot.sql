-- Reuse account ownership, export and auth.users deletion cascades.
alter table public.user_study_artifacts
  drop constraint if exists user_study_artifacts_kind_check;
alter table public.user_study_artifacts
  add constraint user_study_artifacts_kind_check
  check (kind in ('note', 'review', 'paper', 'planner', 'notebook', 'conversation'));

-- Separate partial index leaves existing singleton guarantees intact.
create unique index user_study_artifacts_conversation_owner_idx
  on public.user_study_artifacts (user_id, kind) where kind = 'conversation';
