begin;

select plan(4);

set local role service_role;

select lives_ok(
  $$insert into public.waitlist (
    email, status, signup_method, invite_token_hash, invite_issued_at, invite_expires_at
  ) values (
    'digest@example.test', 'approved', 'email', repeat('a', 64),
    '2026-09-09T00:00:00Z', '2026-09-16T00:00:00Z'
  )$$,
  'an approved expiring invite can store a digest'
);

select throws_ok(
  $$insert into public.waitlist (
    email, status, signup_method, invite_token, invite_token_hash, invite_issued_at, invite_expires_at
  ) values (
    'plaintext@example.test', 'approved', 'email', 'plaintext-token', repeat('b', 64),
    '2026-09-09T00:00:00Z', '2026-09-16T00:00:00Z'
  )$$,
  '23514',
  null,
  'a new digest cannot coexist with a plaintext token'
);

select throws_ok(
  $$insert into public.waitlist (
    email, status, signup_method, invite_token_hash, invite_issued_at, invite_expires_at
  ) values (
    'expired-window@example.test', 'approved', 'email', repeat('c', 64),
    '2026-09-16T00:00:00Z', '2026-09-09T00:00:00Z'
  )$$,
  '23514',
  null,
  'invite expiry must follow issue time'
);

select results_eq(
  $$update public.waitlist
      set updated_at = '2000-01-01T00:00:00Z'
    where email = 'digest@example.test'
    returning updated_at > '2026-09-09T00:00:00Z'$$,
  array[true],
  'database trigger owns updated_at'
);

select * from finish();
rollback;
