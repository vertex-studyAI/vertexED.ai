-- Direct UPI payments without a payment gateway.
--
-- Each checkout reserves a unique amount (base price plus 1-499 paise) so the
-- bank's credit alert identifies the order. A forwarder posts the alert to the
-- API; record_payment_alert() matches it and extends the buyer's subscription
-- in one transaction. Every UTR (UPI reference) can be used once only.
--
-- The table is upi_subscriptions, not subscriptions: the Razorpay paywall
-- branch defines a differently shaped public.subscriptions, and an
-- `if not exists` collision would silently skip this schema.

create table if not exists public.payment_orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  amount_paise integer not null check (amount_paise > 0),
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'expired', 'needs_review', 'rejected')),
  utr text unique check (utr ~ '^[0-9]{12}$'),
  claimed_utr text check (claimed_utr ~ '^[0-9]{12}$'),
  alert_id uuid,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null,
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Backstop for the reservation lock: two open checkouts never share an amount.
create unique index if not exists payment_orders_pending_amount_idx
  on public.payment_orders (amount_paise) where status = 'pending';
create index if not exists payment_orders_amount_created_idx
  on public.payment_orders (amount_paise, created_at desc);
create index if not exists payment_orders_user_created_idx
  on public.payment_orders (user_id, created_at desc);
create index if not exists payment_orders_review_idx
  on public.payment_orders (status, updated_at desc) where status = 'needs_review';

create table if not exists public.payment_alerts (
  id uuid primary key default gen_random_uuid(),
  source text not null check (source in ('email', 'sms')),
  amount_paise integer not null check (amount_paise > 0),
  utr text not null unique check (utr ~ '^[0-9]{12}$'),
  received_at timestamptz not null,
  sender text check (length(sender) <= 200),
  excerpt text check (length(excerpt) <= 600),
  order_id uuid references public.payment_orders(id) on delete set null,
  status text not null default 'unmatched' check (status in ('matched', 'unmatched')),
  created_at timestamptz not null default now()
);

create index if not exists payment_alerts_unmatched_idx
  on public.payment_alerts (received_at desc) where status = 'unmatched';

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'payment_orders_alert_id_fkey') then
    alter table public.payment_orders
      add constraint payment_orders_alert_id_fkey
      foreign key (alert_id) references public.payment_alerts(id) on delete set null;
  end if;
end
$$;

create table if not exists public.upi_subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  plan text not null check (plan in ('monthly', 'yearly')),
  paid_until timestamptz not null,
  updated_at timestamptz not null default now()
);

alter table public.payment_orders enable row level security;
alter table public.payment_alerts enable row level security;
alter table public.upi_subscriptions enable row level security;
alter table public.payment_orders force row level security;
alter table public.payment_alerts force row level security;
alter table public.upi_subscriptions force row level security;

revoke all on table public.payment_orders from public, anon, authenticated;
revoke all on table public.payment_alerts from public, anon, authenticated;
revoke all on table public.upi_subscriptions from public, anon, authenticated;
grant select on table public.payment_orders to service_role;
grant select on table public.payment_alerts to service_role;
grant select on table public.upi_subscriptions to service_role;

create or replace function public.payment_plan_interval(p_plan text)
returns interval
language sql
immutable
set search_path = ''
as $$
  select case p_plan when 'monthly' then interval '30 days' when 'yearly' then interval '365 days' end;
$$;

-- Internal: marks one locked order paid and extends the subscription from
-- whichever is later, now or the current end date.
create or replace function public.apply_payment_grant(p_order_id uuid, p_utr text, p_alert_id uuid)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  paid_order public.payment_orders;
  new_paid_until timestamptz;
begin
  update public.payment_orders
  set status = 'paid', utr = p_utr, alert_id = p_alert_id, paid_at = now(), updated_at = now()
  where id = p_order_id and status <> 'paid'
  returning * into paid_order;
  if not found then
    raise exception 'Payment order is not payable';
  end if;

  insert into public.upi_subscriptions as current_subscription (user_id, plan, paid_until)
  values (paid_order.user_id, paid_order.plan, now() + public.payment_plan_interval(paid_order.plan))
  on conflict (user_id) do update
  set plan = excluded.plan,
      paid_until = greatest(current_subscription.paid_until, now()) + public.payment_plan_interval(excluded.plan),
      updated_at = now()
  returning paid_until into new_paid_until;

  if p_alert_id is not null then
    update public.payment_alerts set status = 'matched', order_id = p_order_id where id = p_alert_id;
  end if;
  return new_paid_until;
end;
$$;

create or replace function public.reserve_payment_order(
  p_user_id uuid,
  p_plan text,
  p_base_paise integer,
  p_ttl_minutes integer default 15
)
returns setof public.payment_orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  existing public.payment_orders;
  chosen_offset integer;
begin
  if p_user_id is null or p_plan not in ('monthly', 'yearly') or p_base_paise < 100
    or p_ttl_minutes not between 5 and 60 then
    raise exception 'Invalid payment order input';
  end if;

  -- One lock serialises reservations and alert matching.
  perform pg_advisory_xact_lock(hashtextextended('vertex-upi-payments', 0));

  update public.payment_orders set status = 'expired', updated_at = now()
  where status = 'pending' and expires_at <= now();

  select * into existing from public.payment_orders
  where user_id = p_user_id and plan = p_plan and status = 'pending'
    and amount_paise between p_base_paise + 1 and p_base_paise + 499
    and expires_at > now() + interval '3 minutes'
  order by created_at desc
  limit 1;
  if found then
    return next existing;
    return;
  end if;

  update public.payment_orders set status = 'expired', updated_at = now()
  where user_id = p_user_id and status = 'pending';

  -- An amount stays out of circulation for three hours, longer than the
  -- two-hour matching window, so a late alert can only match one order.
  select candidate.offset_paise into chosen_offset
  from generate_series(1, 499) as candidate(offset_paise)
  where not exists (
    select 1 from public.payment_orders used
    where used.amount_paise = p_base_paise + candidate.offset_paise
      and (used.status in ('pending', 'needs_review') or used.created_at > now() - interval '3 hours')
  )
  order by (candidate.offset_paise > 99), random()
  limit 1;

  if chosen_offset is null then
    raise exception 'No payment amount is available' using errcode = 'P0001', hint = 'PAYMENT_AMOUNTS_EXHAUSTED';
  end if;

  insert into public.payment_orders (user_id, plan, amount_paise, expires_at)
  values (p_user_id, p_plan, p_base_paise + chosen_offset, now() + make_interval(mins => p_ttl_minutes))
  returning * into existing;
  return next existing;
end;
$$;

create or replace function public.record_payment_alert(
  p_source text,
  p_amount_paise integer,
  p_utr text,
  p_received_at timestamptz,
  p_sender text default null,
  p_excerpt text default null
)
returns table (outcome text, order_id uuid)
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_alert_id uuid;
  candidate_count integer;
  candidate_id uuid;
begin
  if p_source not in ('email', 'sms') or p_amount_paise is null or p_amount_paise < 1
    or p_utr !~ '^[0-9]{12}$' or p_received_at is null
    or p_received_at > now() + interval '5 minutes' or p_received_at < now() - interval '7 days' then
    raise exception 'Invalid payment alert input';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('vertex-upi-payments', 0));

  if exists (select 1 from public.payment_alerts where utr = p_utr)
    or exists (select 1 from public.payment_orders where utr = p_utr) then
    return query
      select 'duplicate'::text, coalesce(
        (select alert.order_id from public.payment_alerts alert where alert.utr = p_utr),
        (select paid.id from public.payment_orders paid where paid.utr = p_utr));
    return;
  end if;

  insert into public.payment_alerts (source, amount_paise, utr, received_at, sender, excerpt)
  values (p_source, p_amount_paise, p_utr, p_received_at, left(p_sender, 200), left(p_excerpt, 600))
  returning id into new_alert_id;

  select count(*), min(candidate.id::text)::uuid into candidate_count, candidate_id
  from public.payment_orders candidate
  where candidate.amount_paise = p_amount_paise
    and candidate.status in ('pending', 'expired', 'needs_review')
    and candidate.created_at between p_received_at - interval '2 hours' and p_received_at + interval '2 minutes';

  if candidate_count <> 1 then
    return query select 'unmatched'::text, null::uuid;
    return;
  end if;

  perform 1 from public.payment_orders where id = candidate_id for update;
  perform public.apply_payment_grant(candidate_id, p_utr, new_alert_id);
  return query select 'matched'::text, candidate_id;
end;
$$;

-- A buyer whose alert did not match automatically supplies the UTR from their
-- UPI app. A stored alert with that UTR and the same amount settles it at once;
-- otherwise the order waits for an administrator.
create or replace function public.claim_payment_order(p_user_id uuid, p_order_id uuid, p_utr text)
returns table (outcome text, paid_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  claimed public.payment_orders;
  alert public.payment_alerts;
begin
  if p_user_id is null or p_order_id is null or p_utr !~ '^[0-9]{12}$' then
    raise exception 'Invalid payment claim input';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('vertex-upi-payments', 0));

  select * into claimed from public.payment_orders
  where id = p_order_id and user_id = p_user_id
  for update;
  if not found then
    return query select 'not_found'::text, null::timestamptz;
    return;
  end if;
  if claimed.status = 'paid' then
    return query select 'paid'::text, (select s.paid_until from public.upi_subscriptions s where s.user_id = p_user_id);
    return;
  end if;
  if claimed.status = 'rejected' then
    return query select 'rejected'::text, null::timestamptz;
    return;
  end if;
  if exists (select 1 from public.payment_orders used where used.utr = p_utr) then
    return query select 'utr_used'::text, null::timestamptz;
    return;
  end if;

  select * into alert from public.payment_alerts where utr = p_utr;
  if found and alert.status = 'unmatched' and alert.amount_paise = claimed.amount_paise
    and alert.received_at >= claimed.created_at - interval '2 minutes' then
    return query select 'paid'::text, public.apply_payment_grant(claimed.id, p_utr, alert.id);
    return;
  end if;

  update public.payment_orders
  set status = 'needs_review', claimed_utr = p_utr, updated_at = now()
  where id = claimed.id;
  return query select 'needs_review'::text, null::timestamptz;
end;
$$;

create or replace function public.resolve_payment_order(p_order_id uuid, p_approve boolean, p_utr text default null)
returns table (outcome text, paid_until timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  target public.payment_orders;
  matching_alert_id uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('vertex-upi-payments', 0));

  select * into target from public.payment_orders where id = p_order_id for update;
  if not found then
    return query select 'not_found'::text, null::timestamptz;
    return;
  end if;
  if target.status = 'paid' then
    return query select 'paid'::text, (select s.paid_until from public.upi_subscriptions s where s.user_id = target.user_id);
    return;
  end if;

  if not p_approve then
    update public.payment_orders set status = 'rejected', updated_at = now() where id = target.id;
    return query select 'rejected'::text, null::timestamptz;
    return;
  end if;

  if p_utr is null or p_utr !~ '^[0-9]{12}$' then
    raise exception 'A 12-digit UTR is required to approve a payment';
  end if;
  if exists (select 1 from public.payment_orders used where used.utr = p_utr) then
    return query select 'utr_used'::text, null::timestamptz;
    return;
  end if;

  select id into matching_alert_id from public.payment_alerts
  where utr = p_utr and status = 'unmatched';
  return query select 'paid'::text, public.apply_payment_grant(target.id, p_utr, matching_alert_id);
end;
$$;

revoke all on function public.payment_plan_interval(text) from public, anon, authenticated;
revoke all on function public.apply_payment_grant(uuid, text, uuid) from public, anon, authenticated, service_role;
revoke all on function public.reserve_payment_order(uuid, text, integer, integer) from public, anon, authenticated;
revoke all on function public.record_payment_alert(text, integer, text, timestamptz, text, text) from public, anon, authenticated;
revoke all on function public.claim_payment_order(uuid, uuid, text) from public, anon, authenticated;
revoke all on function public.resolve_payment_order(uuid, boolean, text) from public, anon, authenticated;
grant execute on function public.reserve_payment_order(uuid, text, integer, integer) to service_role;
grant execute on function public.record_payment_alert(text, integer, text, timestamptz, text, text) to service_role;
grant execute on function public.claim_payment_order(uuid, uuid, text) to service_role;
grant execute on function public.resolve_payment_order(uuid, boolean, text) to service_role;
