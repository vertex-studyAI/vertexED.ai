alter table public.profiles
  add column if not exists school_name text;

alter table public.profiles
  drop constraint if exists profiles_school_name_length;

alter table public.profiles
  add constraint profiles_school_name_length
  check (school_name is null or length(trim(school_name)) between 1 and 160);

comment on column public.profiles.school_name is
  'Optional learner-supplied school name. Free text is not a verified affiliation and is private to the learner account.';
