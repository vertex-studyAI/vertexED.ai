-- Add invite_token to waitlist for admin-generated signup links
alter table public.waitlist
  add column if not exists invite_token text;

create unique index if not exists waitlist_invite_token_idx
  on public.waitlist (invite_token)
  where invite_token is not null;

-- Extend user_study_artifacts kinds to include notebook snapshots
alter table public.user_study_artifacts
  drop constraint if exists user_study_artifacts_kind_check;

alter table public.user_study_artifacts
  add constraint user_study_artifacts_kind_check
  check (kind in ('note', 'review', 'paper', 'planner', 'notebook'));
