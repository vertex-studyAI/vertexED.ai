begin;
select plan(10);
insert into auth.users(id, email) values
('33333333-3333-4333-8333-333333333333', 'conversation-one@example.test'),
('44444444-4444-4444-8444-444444444444', 'conversation-two@example.test');
set local role authenticated;
set local request.jwt.claim.sub = '33333333-3333-4333-8333-333333333333';
select lives_ok($$insert into public.user_study_artifacts(user_id, kind, payload)
  values ('33333333-3333-4333-8333-333333333333', 'conversation', '{"version":1,"threads":[]}')$$, 'owner can save conversation');
select throws_ok($$insert into public.user_study_artifacts(user_id, kind)
  values ('33333333-3333-4333-8333-333333333333', 'conversation')$$, '23505', null, 'concurrent creation cannot duplicate history');
select throws_ok($$insert into public.user_study_artifacts(user_id, kind)
  values ('44444444-4444-4444-8444-444444444444', 'conversation')$$, '42501', null, 'cannot insert history for another account');
select throws_ok($$update public.user_study_artifacts set user_id = '44444444-4444-4444-8444-444444444444' where kind = 'conversation'$$, '42501', null, 'cannot transfer conversation ownership');
set local request.jwt.claim.sub = '44444444-4444-4444-8444-444444444444';
select is_empty($$select id from public.user_study_artifacts where kind = 'conversation'$$, 'other account cannot read history');
select is_empty($$update public.user_study_artifacts set title = 'Stolen' where kind = 'conversation' returning id$$, 'other account cannot change history');
select is_empty($$delete from public.user_study_artifacts where kind = 'conversation' returning id$$, 'other account cannot delete history');
reset role;
select ok(not has_table_privilege('anon', 'public.user_study_artifacts', 'select'), 'anonymous access has no table grant');
select results_eq($$select count(*) from public.user_study_artifacts where kind = 'conversation'$$, array[1::bigint], 'original history remains');
delete from auth.users where id = '33333333-3333-4333-8333-333333333333';
select is_empty($$select id from public.user_study_artifacts where kind = 'conversation'$$, 'account deletion cascades to history');
select * from finish();
rollback;
