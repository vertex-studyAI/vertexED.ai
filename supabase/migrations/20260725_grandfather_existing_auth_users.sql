-- One-time legacy-access migration.
-- Every user who already exists in Supabase Auth at the moment this migration
-- is run keeps access. Future waitlist applications default to pending.

alter table public.waitlist
  add column if not exists legacy_access boolean not null default false;

-- Match historical waitlist entries to the Auth account with the same email.
-- These are the previously approved users the new waitlist must not lock out.
update public.waitlist as waitlist
set
  auth_user_id = auth_user.id,
  status = 'approved',
  legacy_access = true,
  updated_at = now()
from auth.users as auth_user
where lower(waitlist.email) = lower(auth_user.email)
  and auth_user.email is not null;
