begin;
select plan(15);
select has_table('public', 'revision_events', 'revision history exists');
select ok((select relrowsecurity and relforcerowsecurity from pg_class where oid = 'public.revision_events'::regclass), 'revision history forces RLS');
select ok(not has_table_privilege('anon', 'public.revision_events', 'select,insert,update,delete'), 'anonymous role cannot access revisions');
select ok(not has_table_privilege('authenticated', 'public.revision_events', 'select,insert,update,delete'), 'browser role cannot bypass revision API');
select ok(has_table_privilege('service_role', 'public.revision_events', 'select') and has_table_privilege('service_role', 'public.revision_events', 'insert'), 'service role can append and read');
select ok(not has_table_privilege('service_role', 'public.revision_events', 'update,delete'), 'service role cannot rewrite history');
insert into auth.users(id, email) values ('55555555-5555-4555-8555-555555555555', 'revision@example.test');
set local role service_role;
select lives_ok($$insert into public.revision_events(id,user_id,event_type,occurred_at,evidence_status,source_type,source_key,source_revision,payload_sha256)
  values ('66666666-6666-4666-8666-666666666666','55555555-5555-4555-8555-555555555555','attempt',now(),'learner-attested','practice','fixture','v1',repeat('a',64))$$, 'service can append metadata');
select throws_ok($$update public.revision_events set source_revision='v2'$$, '42501', null, 'history is immutable through service API');
select throws_ok($$insert into public.revision_events(id,user_id,event_type,occurred_at,evidence_status,source_type,source_key,source_revision,payload_sha256)
  values ('77777777-7777-4777-8777-777777777777','55555555-5555-4555-8555-555555555555','attempt',now(),'learner-attested','practice','fixture','v1',repeat('a',64))$$, '23505', null, 'logical revisions cannot be duplicated');
select ok((public.vertexed_readiness()->>'revisionHistoryStorage')::boolean, 'readiness checks revision storage');
select ok((public.vertexed_readiness()->>'aiUsageStorage')::boolean, 'readiness checks AI ledger and RPCs');
select ok((public.vertexed_readiness()->>'conversationStorage')::boolean, 'readiness checks conversation support');
select ok((public.vertexed_readiness()->>'practiceStateStorage')::boolean, 'readiness checks practice attempts and mistakes');
reset role;
delete from auth.users where id='55555555-5555-4555-8555-555555555555';
select is_empty($$select id from public.revision_events where user_id='55555555-5555-4555-8555-555555555555'$$, 'account erasure cascades to revision history');
alter table public.revision_events rename to revision_events_test_hidden;
select ok(not coalesce((public.vertexed_readiness()->>'revisionHistoryStorage')::boolean,false), 'missing revision table cannot pass readiness');
select * from finish();
rollback;
