-- Product artifact access must pass the VertexED API membership boundary.
-- Generic Auth identities in the shared project are not VertexED members.
-- The browser already uses /api/user-content; owner export/deletion remain
-- available through auth-only API routes and their service-role operations.
-- No identities, memberships, content rows or historical ledger entries change.

revoke all privileges on table public.user_study_artifacts from public, anon, authenticated;

-- A table-level REVOKE does not remove separately granted column privileges.
-- Close those too, including production-shaped legacy grants, without changing
-- any policy or unrelated shared-project table.
do $$
declare artifact_column record;
begin
  for artifact_column in
    select attname from pg_attribute
    where attrelid = 'public.user_study_artifacts'::regclass
      and attnum > 0 and not attisdropped
  loop
    execute format(
      'revoke all privileges (%I) on table public.user_study_artifacts from public, anon, authenticated',
      artifact_column.attname
    );
  end loop;
end;
$$;

grant select, insert, update, delete on table public.user_study_artifacts to service_role;

-- Retain the existing forced RLS and owner policies as defence in depth and to
-- permit a separately reviewed restoration of the previous ACL if needed.
alter table public.user_study_artifacts enable row level security;
alter table public.user_study_artifacts force row level security;
