-- Backfill historical auth.users rows that predate the profile-creation trigger.
--
-- Production evidence on 2026-08-21 found 31 auth users but only 2 profile rows.
-- This repair is intentionally idempotent: existing learner profiles are preserved.

insert into public.profiles (
  id,
  email,
  full_name,
  avatar_url,
  created_at,
  updated_at
)
select
  u.id,
  u.email,
  coalesce(
    nullif(btrim(u.raw_user_meta_data->>'full_name'), ''),
    nullif(btrim(u.raw_user_meta_data->>'name'), ''),
    'Learner'
  ),
  nullif(btrim(u.raw_user_meta_data->>'avatar_url'), ''),
  coalesce(u.created_at, now()),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;
