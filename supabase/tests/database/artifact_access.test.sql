begin;
select plan(31);

insert into auth.users (id, email, email_confirmed_at) values
  ('a1111111-1111-4111-8111-111111111111', 'approved-a@example.test', now()),
  ('b2222222-2222-4222-8222-222222222222', 'approved-b@example.test', now()),
  ('c3333333-3333-4333-8333-333333333333', 'pending@example.test', now()),
  ('d4444444-4444-4444-8444-444444444444', 'revoked@example.test', now()),
  ('e5555555-5555-4555-8555-555555555555', 'shared-auth-only@example.test', now());

-- The existing schema represents revoked approval with status rejected.
insert into public.waitlist (email, auth_user_id, status) values
  ('approved-a@example.test', 'a1111111-1111-4111-8111-111111111111', 'approved'),
  ('approved-b@example.test', 'b2222222-2222-4222-8222-222222222222', 'approved'),
  ('pending@example.test', 'c3333333-3333-4333-8333-333333333333', 'pending'),
  ('revoked@example.test', 'd4444444-4444-4444-8444-444444444444', 'rejected');

select ok(not has_table_privilege('authenticated', 'public.user_study_artifacts', 'select,insert,update,delete'), 'no direct authenticated artifact table privileges');
select ok(not has_any_column_privilege('authenticated', 'public.user_study_artifacts', 'select,insert,update'), 'no residual authenticated column privileges');
select ok(not has_table_privilege('anon', 'public.user_study_artifacts', 'select,insert,update,delete'), 'no direct anonymous artifact table privileges');
select ok(not has_any_column_privilege('anon', 'public.user_study_artifacts', 'select,insert,update'), 'no residual anonymous column privileges');

set local role service_role;
select lives_ok($$insert into public.user_study_artifacts (user_id, kind, title)
  values ('a1111111-1111-4111-8111-111111111111', 'note', 'Original')$$, 'approved API service can save artifacts');
select results_eq($$select title from public.user_study_artifacts where user_id = 'a1111111-1111-4111-8111-111111111111'$$,
  array['Original'::text], 'API service can export owned artifacts');
select lives_ok($$update public.user_study_artifacts set title = 'Updated' where user_id = 'a1111111-1111-4111-8111-111111111111'$$,
  'API service can update artifacts');
select lives_ok($$delete from public.user_study_artifacts where user_id = 'b2222222-2222-4222-8222-222222222222'$$,
  'API service can delete owned artifacts');
reset role;

set local role anon;
select throws_ok($$select title from public.user_study_artifacts$$, '42501', null, 'anonymous cannot read artifact columns');
select throws_ok($$insert into public.user_study_artifacts (user_id, kind) values ('a1111111-1111-4111-8111-111111111111', 'note')$$,
  '42501', null, 'anonymous cannot create artifacts');
reset role;

set local role authenticated;
-- Check direct read/list/write/delete under approved A, approved B, pending,
-- revoked and unrelated shared-auth identities. Product approval grants API
-- access, never a direct browser database grant.
set local request.jwt.claim.sub = 'a1111111-1111-4111-8111-111111111111';
select throws_ok($$select title from public.user_study_artifacts$$,
  '42501', null, 'approved A cannot read artifacts directly');
select throws_ok($$insert into public.user_study_artifacts (user_id, kind) values ('a1111111-1111-4111-8111-111111111111', 'note')$$,
  '42501', null, 'approved A cannot create artifacts directly');
select throws_ok($$update public.user_study_artifacts set title = 'Denied' where user_id = 'a1111111-1111-4111-8111-111111111111'$$,
  '42501', null, 'approved A cannot update artifacts directly');
select throws_ok($$delete from public.user_study_artifacts where user_id = 'a1111111-1111-4111-8111-111111111111'$$,
  '42501', null, 'approved A cannot delete artifacts directly');

set local request.jwt.claim.sub = 'b2222222-2222-4222-8222-222222222222';
select throws_ok($$select title from public.user_study_artifacts$$,
  '42501', null, 'approved B cannot read artifacts directly');
select throws_ok($$insert into public.user_study_artifacts (user_id, kind) values ('b2222222-2222-4222-8222-222222222222', 'note')$$,
  '42501', null, 'approved B cannot create artifacts directly');
select throws_ok($$update public.user_study_artifacts set title = 'Denied' where user_id = 'b2222222-2222-4222-8222-222222222222'$$,
  '42501', null, 'approved B cannot update artifacts directly');
select throws_ok($$delete from public.user_study_artifacts where user_id = 'b2222222-2222-4222-8222-222222222222'$$,
  '42501', null, 'approved B cannot delete artifacts directly');

set local request.jwt.claim.sub = 'c3333333-3333-4333-8333-333333333333';
select throws_ok($$select title from public.user_study_artifacts$$,
  '42501', null, 'pending cannot read artifacts directly');
select throws_ok($$insert into public.user_study_artifacts (user_id, kind) values ('c3333333-3333-4333-8333-333333333333', 'note')$$,
  '42501', null, 'pending cannot create artifacts directly');
select throws_ok($$update public.user_study_artifacts set title = 'Denied' where user_id = 'c3333333-3333-4333-8333-333333333333'$$,
  '42501', null, 'pending cannot update artifacts directly');
select throws_ok($$delete from public.user_study_artifacts where user_id = 'c3333333-3333-4333-8333-333333333333'$$,
  '42501', null, 'pending cannot delete artifacts directly');

set local request.jwt.claim.sub = 'd4444444-4444-4444-8444-444444444444';
select throws_ok($$select title from public.user_study_artifacts$$,
  '42501', null, 'revoked cannot read artifacts directly');
select throws_ok($$insert into public.user_study_artifacts (user_id, kind) values ('d4444444-4444-4444-8444-444444444444', 'note')$$,
  '42501', null, 'revoked cannot create artifacts directly');
select throws_ok($$update public.user_study_artifacts set title = 'Denied' where user_id = 'd4444444-4444-4444-8444-444444444444'$$,
  '42501', null, 'revoked cannot update artifacts directly');
select throws_ok($$delete from public.user_study_artifacts where user_id = 'd4444444-4444-4444-8444-444444444444'$$,
  '42501', null, 'revoked cannot delete artifacts directly');

set local request.jwt.claim.sub = 'e5555555-5555-4555-8555-555555555555';
select throws_ok($$select title from public.user_study_artifacts$$,
  '42501', null, 'shared Auth only cannot read artifacts directly');
select throws_ok($$insert into public.user_study_artifacts (user_id, kind) values ('e5555555-5555-4555-8555-555555555555', 'note')$$,
  '42501', null, 'shared Auth only cannot create artifacts directly');
select throws_ok($$update public.user_study_artifacts set title = 'Denied' where user_id = 'e5555555-5555-4555-8555-555555555555'$$,
  '42501', null, 'shared Auth only cannot update artifacts directly');
select throws_ok($$delete from public.user_study_artifacts where user_id = 'e5555555-5555-4555-8555-555555555555'$$,
  '42501', null, 'shared Auth only cannot delete artifacts directly');
reset role;

delete from auth.users where id = 'a1111111-1111-4111-8111-111111111111';
select is_empty($$select id from public.user_study_artifacts where user_id = 'a1111111-1111-4111-8111-111111111111'$$,
  'account deletion still cascades through the service-owned artifact boundary');
select * from finish();
rollback;
