begin;
select plan(7);
select ok(not has_function_privilege('anon', 'public.prune_waitlist_rate_limits(timestamptz)', 'execute'), 'anonymous role cannot prune');
select ok(not has_function_privilege('authenticated', 'public.prune_waitlist_rate_limits(timestamptz)', 'execute'), 'browser role cannot prune');
select throws_ok($$select public.prune_waitlist_rate_limits(now())$$, '22023', null, 'recent data cannot be pruned');
insert into public.waitlist_rate_limits(ip_hash,attempted_at) values
  (repeat('a',64),now()-interval '31 days'), (repeat('b',64),now()-interval '29 days');
select is(public.prune_waitlist_rate_limits(now()-interval '30 days'),1::bigint,'only expired operational rows are removed');
select results_eq($$select ip_hash from public.waitlist_rate_limits where ip_hash=repeat('b',64)$$,array[repeat('b',64)],'recent rate-limit evidence survives');
select results_eq($$select schedule from cron.job where jobname='vertexed-rate-limit-retention-v1' and active$$,array['17 3 * * *'::text],'one daily retention job is enabled');
select matches(command,'prune_waitlist_rate_limits.*30 days', 'scheduled job uses the bounded pruning function') from cron.job where jobname='vertexed-rate-limit-retention-v1';
select * from finish();
rollback;
