create table public.schools (
  id uuid primary key default gen_random_uuid(),
  identity_key text not null unique check (identity_key ~ '^[a-f0-9]{64}$'),
  name text not null check (length(trim(name)) between 1 and 160),
  country text not null check (length(trim(country)) between 1 and 80),
  created_at timestamptz not null default now()
);
alter table public.schools enable row level security;
revoke all on public.schools from anon, authenticated;
grant select, insert on public.schools to service_role;
comment on table public.schools is 'Private, self-reported directory. Exact normalized school and country matching is not institution verification or permission to share learner data.';
alter table public.waitlist add column school_id uuid references public.schools(id) on delete set null;
create index waitlist_school_id_idx on public.waitlist(school_id) where school_id is not null;

-- Retain all original profile checks and expand the accepted curriculum set.
alter table public.waitlist drop constraint waitlist_application_profile_shape;
alter table public.waitlist add constraint waitlist_application_profile_shape check (
  application_profile is null or (
    jsonb_typeof(application_profile) = 'object'
    and application_profile ?& array['version', 'school', 'country', 'curriculum', 'grade', 'age', 'consent']
    and application_profile->>'version' = '1'
    and jsonb_typeof(application_profile->'school') = 'string'
    and length(application_profile->>'school') <= 160
    and jsonb_typeof(application_profile->'country') = 'string'
    and length(trim(application_profile->>'country')) between 1 and 80
    and application_profile->>'curriculum' in ('IB MYP', 'IB DP', 'AP', 'IGCSE', 'GCSE', 'A levels', 'CBSE', 'ICSE', 'Other')
    and jsonb_typeof(application_profile->'grade') = 'string'
    and length(trim(application_profile->>'grade')) between 1 and 40
    and jsonb_typeof(application_profile->'age') = 'number'
    and (application_profile->>'age')::numeric between 13 and 100
    and mod((application_profile->>'age')::numeric, 1) = 0
    and application_profile->'consent' = 'true'::jsonb
    and profile_collected_at is not null
    and (not (application_profile ? 'curriculumOther') or (
      jsonb_typeof(application_profile->'curriculumOther') = 'string'
      and length(trim(application_profile->>'curriculumOther')) between 1 and 100
    ))
  ) is true
);
