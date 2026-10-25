-- Default Supabase grants must not permit rewriting append-only history.
revoke all on table public.revision_events from service_role;
grant select, insert on table public.revision_events to service_role;

-- Include every persistent product dependency in release readiness.
-- Catalog inspection only: the public health request never writes learner data.
create or replace function public.vertexed_readiness()
returns jsonb
language sql
security invoker
set search_path = ''
as $$
  select jsonb_build_object(
    'atomicRateLimitRpc', to_regprocedure('public.consume_waitlist_rate_limit(text,timestamptz,integer,timestamptz)') is not null,
    'learnerStateStorage', to_regclass('public.learner_state_items') is not null
      and to_regprocedure('public.sync_learner_state_item(uuid,text,text,jsonb,text,timestamptz)') is not null,
    'batchLearnerStateSync', to_regprocedure('public.sync_learner_state_items(uuid,jsonb)') is not null,
    'examSessionStorage', exists (
      select 1 from pg_catalog.pg_constraint
      where conrelid = to_regclass('public.learner_state_items')
        and conname = 'learner_state_items_state_type_check'
        and convalidated
        and position('''exam_session''' in pg_catalog.pg_get_constraintdef(oid)) > 0
    ) and exists (
      select 1 from pg_catalog.pg_proc
      where oid = to_regprocedure('public.sync_learner_state_item(uuid,text,text,jsonb,text,timestamptz)')
        and position('''exam_session''' in pg_catalog.pg_get_functiondef(oid)) > 0
    ),
    'observabilityStorage', to_regclass('public.observability_events') is not null,
    'singletonIntegrity', to_regclass('public.user_study_artifacts_singleton_kind_idx') is not null,
    'revisionHistoryStorage', exists (
      select 1 from pg_catalog.pg_class where oid = to_regclass('public.revision_events')
        and relrowsecurity and relforcerowsecurity
    ) and has_table_privilege('service_role', to_regclass('public.revision_events'), 'SELECT')
      and has_table_privilege('service_role', to_regclass('public.revision_events'), 'INSERT'),
    'aiUsageStorage', exists (
      select 1 from pg_catalog.pg_class where oid = to_regclass('public.ai_usage_reservations')
        and relrowsecurity and relforcerowsecurity
    ) and to_regprocedure('public.read_ai_usage(uuid,bigint,bigint,integer,integer)') is not null
      and to_regprocedure('public.reserve_ai_usage(uuid,text,text,text,text,text,text,bigint,bigint,bigint,integer,integer)') is not null
      and to_regprocedure('public.mark_ai_usage_dispatched(uuid,uuid)') is not null
      and to_regprocedure('public.settle_ai_usage(uuid,uuid,text,bigint)') is not null,
    'conversationStorage', to_regclass('public.user_study_artifacts_conversation_owner_idx') is not null
      and exists (select 1 from pg_catalog.pg_constraint
        where conrelid = to_regclass('public.user_study_artifacts')
          and conname = 'user_study_artifacts_kind_check' and convalidated
          and position('''conversation''' in pg_catalog.pg_get_constraintdef(oid)) > 0)
  );
$$;

revoke all on function public.vertexed_readiness() from public, anon, authenticated;
grant execute on function public.vertexed_readiness() to service_role;
