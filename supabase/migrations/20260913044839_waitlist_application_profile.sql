-- Legacy applications remain valid. New profiles are collected by the server.
alter table public.waitlist
  add column if not exists application_profile jsonb,
  add column if not exists profile_collected_at timestamptz;

alter table public.waitlist add constraint waitlist_application_profile_shape check (
  application_profile is null or (
    jsonb_typeof(application_profile) = 'object'
    and application_profile ?& array['version', 'school', 'country', 'curriculum', 'grade', 'age', 'consent']
    and application_profile->>'version' = '1'
    and jsonb_typeof(application_profile->'school') = 'string'
    and length(application_profile->>'school') <= 160
    and jsonb_typeof(application_profile->'country') = 'string'
    and length(trim(application_profile->>'country')) between 1 and 80
    and application_profile->>'curriculum' in ('IB MYP', 'IB DP', 'AP', 'IGCSE', 'A levels', 'CBSE', 'ICSE', 'Other')
    and jsonb_typeof(application_profile->'grade') = 'string'
    and length(trim(application_profile->>'grade')) between 1 and 40
    and jsonb_typeof(application_profile->'age') = 'number'
    and (application_profile->>'age')::numeric between 13 and 100
    and mod((application_profile->>'age')::numeric, 1) = 0
    and application_profile->'consent' = 'true'::jsonb
    and profile_collected_at is not null
  ) is true
);

-- Application data is available only through authenticated server handlers.
alter table public.waitlist enable row level security;
revoke all on public.waitlist from anon, authenticated;
comment on column public.waitlist.application_profile is
  'Private beta application profile, not AI context. Retained on the invitation row linked by auth_user_id.';
