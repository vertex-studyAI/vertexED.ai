-- Optional learner context collected during onboarding v2
alter table public.profiles
  add column if not exists age smallint,
  add column if not exists school text,
  add column if not exists onboarding_notes text;
