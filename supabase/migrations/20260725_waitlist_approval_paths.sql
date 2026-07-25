-- Waitlist approval paths: email invite or Google OAuth access
alter table public.waitlist
  add column if not exists signup_method text not null default 'email'
  check (signup_method in ('email', 'google'));

alter table public.waitlist
  add column if not exists auth_user_id uuid references auth.users(id) on delete set null;

create unique index if not exists waitlist_auth_user_id_idx
  on public.waitlist (auth_user_id)
  where auth_user_id is not null;

create index if not exists waitlist_signup_method_idx
  on public.waitlist (signup_method);

-- Link legacy waitlist rows to existing Supabase Auth users by email. This
-- preserves their approved/pending status while making status checks reliable
-- after the Google waitlist flow is introduced.
update public.waitlist as waitlist
set auth_user_id = auth_user.id
from auth.users as auth_user
where waitlist.auth_user_id is null
  and lower(waitlist.email) = lower(auth_user.email);
