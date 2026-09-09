begin;

select plan(26);

select has_table('public', 'learner_state_items', 'learner state table exists');
select has_table('public', 'observability_events', 'observability table exists');
select has_index('public', 'learner_state_items', 'learner_state_items_user_updated_idx', 'learner state lookup is indexed');
select has_index('public', 'learner_state_items', 'learner_state_items_active_retry_idx', 'active retry lookup is indexed');
select has_index('public', 'observability_events', 'observability_events_received_idx', 'observability retention lookup is indexed');
select has_column('public', 'waitlist', 'invite_token_hash', 'waitlist stores invite digests');
select has_column('public', 'waitlist', 'invite_issued_at', 'waitlist records invite issue time');
select has_column('public', 'waitlist', 'invite_expires_at', 'waitlist records invite expiry');
select has_index('public', 'waitlist', 'waitlist_invite_token_hash_idx', 'invite digest lookup is indexed');
select has_index('public', 'waitlist', 'waitlist_status_created_at_idx', 'admin status pagination is indexed');

select ok((select relrowsecurity from pg_class where oid = 'public.learner_state_items'::regclass), 'learner state has RLS enabled');
select ok((select relrowsecurity from pg_class where oid = 'public.observability_events'::regclass), 'observability has RLS enabled');
select ok(not has_table_privilege('anon', 'public.learner_state_items', 'select'), 'anon cannot read learner state');
select ok(not has_table_privilege('authenticated', 'public.learner_state_items', 'select'), 'browser role cannot bypass learner-state API');
select ok(has_table_privilege('service_role', 'public.learner_state_items', 'select,insert,update,delete'), 'service role has explicit learner-state privileges');
select ok(not has_table_privilege('anon', 'public.observability_events', 'select'), 'anon cannot read telemetry');
select ok(not has_table_privilege('authenticated', 'public.observability_events', 'select'), 'authenticated users cannot read telemetry');
select ok(to_regprocedure('public.sync_learner_state_item(uuid,text,text,jsonb,text,timestamptz)') is not null, 'state sync RPC exists');
select ok(to_regprocedure('public.sync_learner_state_items(uuid,jsonb)') is not null, 'batched state sync RPC exists');
select ok(to_regprocedure('public.vertexed_readiness()') is not null, 'readiness RPC exists');
select is(
  (select count(*)::bigint from pg_proc where prosecdef and pronamespace = 'public'::regnamespace and not ('search_path=""' = any(coalesce(proconfig, array[]::text[])))),
  0::bigint,
  'every public SECURITY DEFINER function pins an empty search path'
);
select ok(
  not (select prosecdef from pg_proc where oid = 'public.consume_waitlist_rate_limit(text,timestamptz,integer,timestamptz)'::regprocedure),
  'rate limiter executes with the explicitly privileged service role'
);
select ok(
  not (select prosecdef from pg_proc where oid = 'public.set_vertexed_updated_at()'::regprocedure),
  'timestamp trigger uses invoker rights'
);
select is(
  (
    select count(*)::bigint
    from pg_trigger
    where not tgisinternal
      and tgname in (
        'profiles_set_updated_at',
        'waitlist_set_updated_at',
        'user_study_artifacts_set_updated_at',
        'learner_state_items_set_updated_at'
      )
  ),
  4::bigint,
  'every mutable account table owns its updated_at timestamp'
);
select ok(
  exists (
    select 1 from pg_constraint
    where conrelid = 'public.waitlist'::regclass
      and conname = 'waitlist_invite_window_integrity'
      and convalidated
  ),
  'invite issue and expiry fields have a validated integrity constraint'
);
select is(
  (select confdeltype::text from pg_constraint where conname = 'waitlist_auth_user_id_fkey' and conrelid = 'public.waitlist'::regclass),
  'c',
  'account deletion cascades to the waitlist email'
);

select * from finish();
rollback;
