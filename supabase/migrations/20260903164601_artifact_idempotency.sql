-- Make artifact POST retries safe when a committed response is lost in transit.

alter table public.user_study_artifacts
  add column if not exists idempotency_key text;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'user_study_artifacts_idempotency_key_format'
      and conrelid = 'public.user_study_artifacts'::regclass
  ) then
    alter table public.user_study_artifacts
      add constraint user_study_artifacts_idempotency_key_format
      check (idempotency_key is null or idempotency_key ~ '^[A-Za-z0-9][A-Za-z0-9._:-]{7,127}$');
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'user_study_artifacts_user_idempotency_key_key'
      and conrelid = 'public.user_study_artifacts'::regclass
  ) then
    alter table public.user_study_artifacts
      add constraint user_study_artifacts_user_idempotency_key_key
      unique (user_id, idempotency_key);
  end if;
end
$$;
