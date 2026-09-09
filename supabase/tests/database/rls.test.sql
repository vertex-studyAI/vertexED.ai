begin;

select plan(7);

insert into auth.users (id, email)
values
  ('11111111-1111-4111-8111-111111111111', 'one@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'two@example.test');

set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-4111-8111-111111111111';

select results_eq('select count(*) from public.profiles', array[1::bigint], 'user sees only own profile');
select results_eq(
  $$update public.profiles set full_name = 'Learner One' where id = '11111111-1111-4111-8111-111111111111' returning 1$$,
  $$values (1)$$,
  'user can update own profile'
);
select is_empty(
  $$update public.profiles set full_name = 'Taken over' where id = '22222222-2222-4222-8222-222222222222' returning 1$$,
  'user cannot update another profile'
);
select lives_ok(
  $$insert into public.user_study_artifacts (user_id, kind, title) values ('11111111-1111-4111-8111-111111111111', 'note', 'Own note')$$,
  'user can create own artifact'
);
select throws_ok(
  $$insert into public.user_study_artifacts (user_id, kind, title) values ('22222222-2222-4222-8222-222222222222', 'note', 'Other note')$$,
  '42501',
  'new row violates row-level security policy for table "user_study_artifacts"',
  'user cannot create an artifact for another account'
);
select results_eq('select count(*) from public.user_study_artifacts', array[1::bigint], 'user sees only own artifacts');
select ok(not has_table_privilege('authenticated', 'public.learner_state_items', 'select'), 'learner state is reachable only through the application API');

select * from finish();
rollback;
