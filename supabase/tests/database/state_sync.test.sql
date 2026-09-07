begin;

select plan(8);

insert into auth.users (id, email)
values ('33333333-3333-4333-8333-333333333333', 'state@example.test');

set local role service_role;

select lives_ok(
  $$select * from public.sync_learner_state_item(
    '33333333-3333-4333-8333-333333333333', 'mock_draft', 'active', '{"paperTitle":"First"}'::jsonb,
    'state:1788681600000:aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '2026-09-06T00:00:00Z'
  )$$,
  'service role can write learner state through the invoker RPC'
);
select results_eq(
  $$select applied from public.sync_learner_state_item(
    '33333333-3333-4333-8333-333333333333', 'mock_draft', 'active', '{"paperTitle":"Second"}'::jsonb,
    'state:1788681660000:bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '2026-09-06T00:01:00Z'
  )$$,
  array[true],
  'newer state is applied'
);
select results_eq(
  $$select applied from public.sync_learner_state_item(
    '33333333-3333-4333-8333-333333333333', 'mock_draft', 'active', '{"paperTitle":"Stale"}'::jsonb,
    'state:1788681540000:cccccccc-cccc-4ccc-8ccc-cccccccccccc', '2026-09-05T23:59:00Z'
  )$$,
  array[false],
  'stale state is rejected'
);
select results_eq(
  $$select payload->>'paperTitle' from public.learner_state_items where state_key = 'active'$$,
  array['Second'::text],
  'stale state cannot overwrite the latest payload'
);
select results_eq(
  $$select client_revision from public.learner_state_items where state_key = 'active'$$,
  array['state:1788681660000:bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'::text],
  'latest revision remains authoritative'
);
select results_eq(
  $$select count(*) from public.sync_learner_state_items(
    '33333333-3333-4333-8333-333333333333',
    '[{"stateType":"weakness","stateKey":"biology:cell","payload":{"score":4},"clientRevision":"state:1788681720000:dddddddd-dddd-4ddd-8ddd-dddddddddddd","clientUpdatedAt":"2026-09-06T00:02:00Z"}]'::jsonb
  )$$,
  array[1::bigint],
  'batch sync processes a bounded state batch in one RPC'
);
select throws_ok(
  $$select * from public.sync_learner_state_items(
    '33333333-3333-4333-8333-333333333333',
    '[{"stateType":"retry","stateKey":"same","payload":{},"clientRevision":"state:1788681780000:eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee","clientUpdatedAt":"2026-09-06T00:03:00Z"},{"stateType":"retry","stateKey":"same","payload":{},"clientRevision":"state:1788681840000:ffffffff-ffff-4fff-8fff-ffffffffffff","clientUpdatedAt":"2026-09-06T00:04:00Z"}]'::jsonb
  )$$,
  '22023',
  'Duplicate learner-state key in batch',
  'duplicate logical keys fail the entire batch'
);
select ok(
  (select bool_and(value::boolean) from jsonb_each_text(public.vertexed_readiness())),
  'deep database readiness reports every required object'
);

select * from finish();
rollback;
