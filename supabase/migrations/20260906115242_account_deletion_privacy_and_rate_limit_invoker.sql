-- The rate-limit RPC is called only with the service-role client. SECURITY
-- INVOKER avoids an exposed public-schema definer function and relies on the
-- explicit service_role table/sequence grants established by the prior migration.
alter function public.consume_waitlist_rate_limit(text, timestamptz, integer, timestamptz)
  security invoker;

revoke all on function public.consume_waitlist_rate_limit(text, timestamptz, integer, timestamptz)
  from public, anon, authenticated;
grant execute on function public.consume_waitlist_rate_limit(text, timestamptz, integer, timestamptz)
  to service_role;

-- A privacy deletion must remove the applicant email as well as learner-owned
-- content. The previous SET NULL action retained that PII after auth deletion.
alter table public.waitlist
  drop constraint if exists waitlist_auth_user_id_fkey;

alter table public.waitlist
  add constraint waitlist_auth_user_id_fkey
  foreign key (auth_user_id) references auth.users(id)
  on delete cascade
  not valid;

alter table public.waitlist validate constraint waitlist_auth_user_id_fkey;

-- Materialize every legitimate historical/invited Auth identity before the
-- application removes its legacy "missing row means approved" fallback. The
-- cutoff matches the original grandfathering migration; later ordinary direct
-- signups without an explicit waitlist row remain unapproved.
insert into public.waitlist (
  email,
  status,
  signup_method,
  auth_user_id,
  legacy_access,
  created_at,
  updated_at
)
select
  lower(trim(auth_user.email)),
  'approved',
  'email',
  auth_user.id,
  true,
  auth_user.created_at,
  now()
from auth.users as auth_user
where auth_user.email is not null
  and (auth_user.created_at < timestamptz '2026-07-25 00:00:00+00' or auth_user.invited_at is not null)
  and not exists (
    select 1
    from public.waitlist as existing
    where existing.auth_user_id = auth_user.id
      or lower(existing.email) = lower(auth_user.email)
  )
on conflict do nothing;

update public.waitlist as existing
set
  auth_user_id = auth_user.id,
  status = 'approved',
  legacy_access = true,
  updated_at = now()
from auth.users as auth_user
where existing.auth_user_id is null
  and lower(existing.email) = lower(auth_user.email)
  and (auth_user.created_at < timestamptz '2026-07-25 00:00:00+00' or auth_user.invited_at is not null);
