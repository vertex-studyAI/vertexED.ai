-- Subscription billing (Razorpay).
--
-- Writes to this table happen ONLY from the Razorpay webhook using the
-- service-role key, which bypasses RLS. The client is granted read access to
-- its own row and nothing else -- a user must never be able to grant
-- themselves a subscription.
--
-- Columns are provider-neutral so a second gateway (for international payers)
-- can be added later without a schema migration.

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_customer_id text,
  provider_subscription_id text,
  -- Razorpay subscription states: created, authenticated, active, pending,
  -- halted, cancelled, completed, expired, paused.
  -- Plus 'inactive' (never subscribed) and 'comped' (manually granted).
  status text not null default 'inactive',
  plan text,
  plan_id text,
  currency text not null default 'INR',
  current_period_end timestamptz,
  trial_end timestamptz,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- One subscription row per user; the webhook upserts on this constraint.
create unique index if not exists subscriptions_user_id_key
  on public.subscriptions (user_id);

create unique index if not exists subscriptions_provider_subscription_id_key
  on public.subscriptions (provider_subscription_id)
  where provider_subscription_id is not null;

create index if not exists subscriptions_provider_customer_id_idx
  on public.subscriptions (provider_customer_id)
  where provider_customer_id is not null;

alter table public.subscriptions enable row level security;

-- Read-only, own-row-only. No insert/update/delete policy exists on purpose:
-- without one, RLS denies those operations to every non-service-role client.
drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription"
  on public.subscriptions
  for select
  using (auth.uid() = user_id);

create or replace function public.set_subscriptions_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;
create trigger subscriptions_set_updated_at
  before update on public.subscriptions
  for each row
  execute function public.set_subscriptions_updated_at();

-- Grandfathering early waitlist users:
--   update public.subscriptions set status = 'comped' where user_id = '<uuid>';
-- or insert a row for a user who has never subscribed:
--   insert into public.subscriptions (user_id, status) values ('<uuid>', 'comped');
