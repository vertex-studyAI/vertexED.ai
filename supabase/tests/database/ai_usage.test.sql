begin;
select no_plan();

-- Run only against the isolated local migration test database. These assertions
-- roll back all fixtures. Multi-connection contention still requires a separate
-- database-backed race test; this file does not claim to have executed one.
insert into auth.users (id, email, email_confirmed_at)
select ('f0000000-0000-4000-8000-' || lpad(n::text, 12, '0'))::uuid,
  'ai-usage-' || n || '@example.test', now() from generate_series(1, 20) n;
create temporary table ai_usage_test_receipts (name text primary key, result jsonb not null);
grant select, insert, update on ai_usage_test_receipts to service_role;

select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.ai_usage_reservations'::regclass), 'usage ledger enables and forces RLS');
select ok(not has_table_privilege('anon', 'public.ai_usage_reservations', 'select,insert,update,delete'), 'anonymous has no table access');
select ok(not has_any_column_privilege('anon', 'public.ai_usage_reservations', 'select,insert,update'), 'anonymous has no residual column access');
select ok(not has_table_privilege('authenticated', 'public.ai_usage_reservations', 'select,insert,update,delete'), 'authenticated has no table access');
select ok(not has_any_column_privilege('authenticated', 'public.ai_usage_reservations', 'select,insert,update'), 'authenticated has no residual column access');
select ok(has_table_privilege('service_role', 'public.ai_usage_reservations', 'select,insert,update'), 'service can account and export');
select ok(not has_table_privilege('service_role', 'public.ai_usage_reservations', 'delete,truncate'), 'service cannot erase accounting rows directly');
select is((select count(*) from pg_policies where schemaname = 'public' and tablename = 'ai_usage_reservations'), 0::bigint, 'no browser usage policies');
select ok(not has_function_privilege('authenticated', 'public.reserve_ai_usage(uuid,text,text,text,text,text,text,bigint,bigint,bigint,integer,integer)', 'execute'), 'authenticated cannot reserve');
select ok(not has_function_privilege('anon', 'public.read_ai_usage(uuid,bigint,bigint,integer,integer)', 'execute'), 'anonymous cannot read usage');
select ok(not has_function_privilege('authenticated', 'public.mark_ai_usage_dispatched(uuid,uuid)', 'execute'), 'authenticated cannot dispatch');
select ok(not has_function_privilege('authenticated', 'public.settle_ai_usage(uuid,uuid,text,bigint)', 'execute'), 'authenticated cannot settle');
select ok((select bool_and(not prosecdef and 'search_path=""' = any(proconfig)) from pg_proc
  where oid in ('public.read_ai_usage(uuid,bigint,bigint,integer,integer)'::regprocedure,
    'public.reserve_ai_usage(uuid,text,text,text,text,text,text,bigint,bigint,bigint,integer,integer)'::regprocedure,
    'public.mark_ai_usage_dispatched(uuid,uuid)'::regprocedure, 'public.settle_ai_usage(uuid,uuid,text,bigint)'::regprocedure)), 'all usage functions are invoker-rights with empty search paths');

set local role anon;
select throws_ok($$select * from public.ai_usage_reservations$$, '42501', null, 'anonymous direct read is denied');
select throws_ok($$select public.read_ai_usage('f0000000-0000-4000-8000-000000000001')$$, '42501', null, 'anonymous RPC read is denied');
reset role;
set local role authenticated;
set local request.jwt.claim.sub = 'f0000000-0000-4000-8000-000000000001';
select throws_ok($$update public.ai_usage_reservations set charged_microusd = 0$$, '42501', null, 'account cannot reset cost directly');
select throws_ok($$select public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','browser',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',100)$$, '42501', null, 'account cannot reserve directly');
reset role;

set local role service_role;
set local timezone = 'Pacific/Honolulu';
insert into ai_usage_test_receipts values ('first', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','first',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',100));
select is((select result->>'reason' from ai_usage_test_receipts where name = 'first'), 'reserved', 'first request reserves');
select ok((select (result->>'allowed')::boolean from ai_usage_test_receipts where name = 'first'), 'one caller gets dispatch eligibility');
select is((select usage_day from public.ai_usage_reservations where id = (select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name = 'first')), (clock_timestamp() at time zone 'UTC')::date, 'DB UTC day wins over session timezone');
select is((public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','first',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',100)->>'allowed')::boolean, false, 'identical reservation retry never dispatches');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','first',repeat('b',64),'chat','openai','gpt-4.1-mini','test-1',100)->>'reason', 'idempotency_conflict', 'changed fingerprint is rejected');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','first',repeat('a',64),'chat','openai','different-model','test-1',100)->>'reason', 'idempotency_conflict', 'changed model is rejected');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','first',repeat('a',64),'chat','openai','gpt-4.1-mini','test-2',100)->>'reason', 'idempotency_conflict', 'changed policy is rejected');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','first',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',101)->>'reason', 'idempotency_conflict', 'changed maximum reservation is rejected');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000001')->>'account_reserved_microusd')::bigint, 100::bigint, 'duplicate/conflict attempts do not double-count');
select is(public.mark_ai_usage_dispatched('f0000000-0000-4000-8000-000000000002',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='first'))->>'reason', 'not_found', 'another owner cannot mark a reservation');
select is((public.mark_ai_usage_dispatched('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='first'))->>'allowed')::boolean, true, 'first dispatch transition succeeds');
select is((public.mark_ai_usage_dispatched('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='first'))->>'allowed')::boolean, false, 'second dispatch transition is denied');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='first'),'released')->>'reason', 'invalid_state', 'dispatch can never be released as unsent');
select is((public.settle_ai_usage('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='first'),'succeeded',30)->>'charged_microusd')::bigint, 30::bigint, 'known successful cost settles integer micro-USD');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='first'),'succeeded',30)->>'reason', 'duplicate', 'identical settlement is idempotent');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='first'),'succeeded',20)->>'reason', 'settlement_conflict', 'settlement cannot be rewritten to a cheaper value');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000001')->>'account_used_microusd')::bigint, 30::bigint, 'only the settled amount is spent');

insert into ai_usage_test_receipts values ('boundary', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','boundary',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',970,p_account_limit_microusd=>1000));
select is((select (result->>'allowed')::boolean from ai_usage_test_receipts where name='boundary'), true, 'exact account ceiling is allowed');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','over-boundary',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',1,p_account_limit_microusd=>1000)->>'reason', 'account_limit', 'spent plus reserved blocks a one-unit overrun');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='boundary'),'released')->>'state', 'released', 'confirmed pre-dispatch cancellation releases exposure');
insert into ai_usage_test_receipts values
 ('concurrent-a', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','concurrent-a',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',10)),
 ('concurrent-b', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','concurrent-b',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',20));
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','concurrent-c',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',1)->>'reason', 'account_concurrency', 'two live reservations exhaust account capacity');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000002','project-concurrency',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',1,p_project_concurrency=>2)->>'reason', 'project_concurrency', 'active capacity is shared across accounts');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000001',(result->>'reservation_id')::uuid,'released')->>'state', 'released', 'release pre-dispatch fixture') from ai_usage_test_receipts where name in ('concurrent-a','concurrent-b');

insert into ai_usage_test_receipts values ('expired', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','expired',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',10));
reset role;
update public.ai_usage_reservations set reserved_at=statement_timestamp()-interval '10 minutes', expires_at=statement_timestamp()-interval '5 minutes', usage_day=((statement_timestamp()-interval '10 minutes') at time zone 'UTC')::date
  where id=(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='expired');
set local role service_role;
select is(public.mark_ai_usage_dispatched('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='expired'))->>'reason', 'reservation_expired', 'expired lease cannot dispatch');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000001')->>'account_active_count')::bigint, 1::bigint, 'lease expiry never silently refunds capacity');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000001',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='expired'),'released')->>'state', 'released', 'known-unsent expired reservation may explicitly release');

insert into ai_usage_test_receipts values ('uncertain', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000002','uncertain',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',100));
select is(public.mark_ai_usage_dispatched('f0000000-0000-4000-8000-000000000002',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='uncertain'))->>'state', 'dispatched', 'uncertain fixture dispatches');
select is((public.settle_ai_usage('f0000000-0000-4000-8000-000000000002',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='uncertain'),'uncertain')->>'reserved_microusd')::bigint, 100::bigint, 'uncertain outcome retains the full bound');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000002',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='uncertain'),'released')->>'reason', 'settlement_conflict', 'uncertain outcome cannot be relabelled unsent');
reset role;
update public.ai_usage_reservations set reserved_at=statement_timestamp()-interval '2 days', expires_at=statement_timestamp()-interval '2 days'+interval '5 minutes', usage_day=((statement_timestamp()-interval '2 days') at time zone 'UTC')::date
  where id=(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='uncertain');
set local role service_role;
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000002')->>'account_carried_reserved_microusd')::bigint, 100::bigint, 'cross-day unresolved exposure is reported separately');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000002')->>'account_active_count')::bigint, 1::bigint, 'cross-day unresolved work still occupies capacity');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000002')->>'account_remaining_microusd')::bigint, 1000000::bigint, 'new UTC admission budget is distinct from unresolved capacity');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000003','old-project-capacity',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',1,p_project_concurrency=>1)->>'reason', 'project_concurrency', 'old unresolved dispatch still blocks global capacity');
reset role;
delete from auth.users where id='f0000000-0000-4000-8000-000000000002';
select is((select user_id from public.ai_usage_reservations where id=(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='uncertain')), null::uuid, 'privacy deletion removes export ownership');
select is((select reserved_microusd from public.ai_usage_reservations where id=(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='uncertain')), 100::bigint, 'deletion does not refund project exposure');
insert into auth.users(id,email,email_confirmed_at) values ('f0000000-0000-4000-8000-000000000002','ai-usage-recreated@example.test',now());
set local role service_role;
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000002')->>'account_active_count')::bigint, 1::bigint, 'same UUID recreation cannot reset account capacity');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000002','uncertain',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',100)->>'reason', 'duplicate', 'same UUID recreation cannot replay an old operation');
select is_empty($$select id from public.ai_usage_reservations where user_id='f0000000-0000-4000-8000-000000000002'$$, 'old pseudonymous rows are excluded from live-owner export');

insert into ai_usage_test_receipts values ('failed', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000003','failed',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',200));
select is(public.mark_ai_usage_dispatched('f0000000-0000-4000-8000-000000000003',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='failed'))->>'state', 'dispatched', 'failed fixture dispatches');
select is((public.settle_ai_usage('f0000000-0000-4000-8000-000000000003',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='failed'),'failed')->>'charged_microusd')::bigint, 200::bigint, 'observed terminal failure conservatively charges the full bound');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000003')->>'account_active_count')::bigint, 0::bigint, 'observed terminal failure frees only concurrency');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000003')->>'account_used_microusd')::bigint, 200::bigint, 'terminal failure cost remains spent');
insert into ai_usage_test_receipts values ('over-actual', public.reserve_ai_usage('f0000000-0000-4000-8000-000000000003','over-actual',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',100));
select is(public.mark_ai_usage_dispatched('f0000000-0000-4000-8000-000000000003',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='over-actual'))->>'state', 'dispatched', 'over-actual fixture dispatches');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000003',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='over-actual'),'succeeded',101)->>'reason', 'actual_exceeds_reservation', 'unbounded actual cost is rejected without refund');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000003')->>'account_reserved_microusd')::bigint, 100::bigint, 'rejected overrun retains reserved cost');
select is(public.settle_ai_usage('f0000000-0000-4000-8000-000000000003',(select (result->>'reservation_id')::uuid from ai_usage_test_receipts where name='over-actual'),'uncertain')->>'state', 'uncertain', 'unresolved overrun can be conservatively held');
reset role;
delete from auth.users where id='f0000000-0000-4000-8000-000000000003';
insert into auth.users(id,email,email_confirmed_at) values ('f0000000-0000-4000-8000-000000000003','ai-usage-cost-recreated@example.test',now());
set local role service_role;
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000003')->>'account_used_microusd')::bigint, 200::bigint, 'same UUID recreation retains current-day spent quota');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000003')->>'account_reserved_microusd')::bigint, 100::bigint, 'same UUID recreation retains current-day uncertain quota');
select is_empty($$select id from public.ai_usage_reservations where user_id='f0000000-0000-4000-8000-000000000003'$$, 'pseudonymous cost tombstones are not live-owner export rows');

select throws_ok($$select public.read_ai_usage('f0000000-0000-4000-8000-000000000001',1000001)$$, '22023', null, 'account hard ceiling cannot be raised');
select throws_ok($$select public.read_ai_usage('f0000000-0000-4000-8000-000000000001',1000000,10000001)$$, '22023', null, 'project hard ceiling cannot be raised');
select throws_ok($$select public.read_ai_usage('f0000000-0000-4000-8000-000000000001',1000000,10000000,3)$$, '22023', null, 'account capacity cannot be raised');
select throws_ok($$select public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','invalid','bad','chat','openai','gpt-4.1-mini','test-1',100)$$, '22023', null, 'invalid fingerprint is rejected');
select throws_ok($$select public.reserve_ai_usage('f0000000-0000-4000-8000-000000000001','negative',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',-1)$$, '22023', null, 'negative monetary units are rejected');
select ok(not (public.read_ai_usage('f0000000-0000-4000-8000-000000000001') ? 'project_used_microusd'), 'account read does not disclose other-account project amounts');

-- Fill the actual USD 10 project ceiling across separate owners. This exercises
-- serial admission semantics; advisory-lock concurrency needs live DB testing.
select lives_ok($body$
do $setup$
declare n integer; uid uuid; amount bigint; receipt jsonb; remaining bigint;
begin
  for n in 5..15 loop
    select 10000000 - coalesce(sum(charged_microusd + case when state in ('reserved','dispatched','uncertain') then reserved_microusd else 0 end),0)
      into remaining from public.ai_usage_reservations where usage_day=(clock_timestamp() at time zone 'UTC')::date;
    exit when remaining = 0;
    uid := ('f0000000-0000-4000-8000-' || lpad(n::text,12,'0'))::uuid;
    amount := least(1000000,remaining);
    receipt := public.reserve_ai_usage(uid,'fill-project',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',amount);
    if receipt->>'allowed' <> 'true' then raise exception 'Fixture admission failed: %', receipt; end if;
    perform public.mark_ai_usage_dispatched(uid,(receipt->>'reservation_id')::uuid);
    perform public.settle_ai_usage(uid,(receipt->>'reservation_id')::uuid,'failed');
  end loop;
end;
$setup$;
$body$, 'project ceiling fixture fills through finite reservations');
select is(public.reserve_ai_usage('f0000000-0000-4000-8000-000000000020','over-project',repeat('a',64),'chat','openai','gpt-4.1-mini','test-1',1)->>'reason', 'project_limit', 'one unit beyond the actual USD 10 project ceiling is denied');
select is((public.read_ai_usage('f0000000-0000-4000-8000-000000000020')->>'project_available')::boolean, false, 'account summary reports project admission unavailable without exposing totals');
reset role;

select * from finish();
rollback;
