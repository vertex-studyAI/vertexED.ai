-- User curriculum preferences on profiles (optional mirror of auth metadata)
alter table public.profiles
  add column if not exists board text,
  add column if not exists grade smallint,
  add column if not exists subjects text[] default '{}',
  add column if not exists exam_date date;

comment on column public.profiles.board is 'Exam board id: IB_MYP, IB_DP, IGCSE, GCSE, A_LEVELS, AP, CBSE, ICSE';
comment on column public.profiles.subjects is 'User-selected subjects for personalization';
