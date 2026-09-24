\set ON_ERROR_STOP on
begin;
do $$
declare r text; obj text;
begin
 if not (select bool_and(value::boolean) from jsonb_each_text(public.vertexed_readiness())) then raise exception 'Readiness failed'; end if;
 if (select count(*) from public.user_study_artifacts where title='Synthetic retained planner') <> 1 then raise exception 'Existing artifact not preserved'; end if;
 foreach r in array array['anon','authenticated'] loop
  foreach obj in array array['learner_state_items','observability_events','waitlist_rate_limits'] loop
   if has_table_privilege(r,'public.'||obj,'SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER') then raise exception 'Client table grant: % %',r,obj; end if;
  end loop;
  foreach obj in array array['observability_events_id_seq','waitlist_rate_limits_id_seq'] loop
   if has_sequence_privilege(r,'public.'||obj,'USAGE,SELECT,UPDATE') then raise exception 'Client sequence grant: % %',r,obj; end if;
  end loop;
  if exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname in ('vertexed_readiness','sync_learner_state_item','sync_learner_state_items','consume_waitlist_rate_limit','prune_observability_events') and has_function_privilege(r,oid,'EXECUTE')) then raise exception 'Client RPC grant: %',r; end if;
 end loop;
 if exists(select 1 from pg_proc where pronamespace='public'::regnamespace and proname in ('vertexed_readiness','sync_learner_state_item','sync_learner_state_items','consume_waitlist_rate_limit','prune_observability_events') and (prosecdef or not coalesce(proconfig @> array['search_path=""'],false))) then raise exception 'Unsafe RPC configuration'; end if;
 if exists(select 1 from pg_class where oid in ('public.learner_state_items'::regclass,'public.observability_events'::regclass) and not relrowsecurity) then raise exception 'RLS missing'; end if;
end $$;
set local role service_role;
do $$
declare applied_result boolean; allowed_result boolean; n integer;
begin
 select applied into applied_result from public.sync_learner_state_item('00000000-0000-4000-8000-000000000001','exam_session','rehearsal','{"v":2}','state:1788681660000:bbbbbbbb','2026-09-06T00:01:00Z');
 if applied_result is distinct from true then raise exception 'Service write failed'; end if;
 select applied into applied_result from public.sync_learner_state_item('00000000-0000-4000-8000-000000000001','exam_session','rehearsal','{"v":1}','state:1788681600000:aaaaaaaa','2026-09-06T00:00:00Z');
 if applied_result is distinct from false then raise exception 'Stale revision accepted'; end if;
 perform * from public.sync_learner_state_item('00000000-0000-4000-8000-000000000002','exam_session','rehearsal','{"v":3}','state:1788681660000:bbbbbbbb','2026-09-06T00:01:00Z');
 if (select count(*) from public.learner_state_items where state_key='rehearsal') <> 2 then raise exception 'Account keys collided'; end if;
 begin
  perform * from public.sync_learner_state_items('00000000-0000-4000-8000-000000000001','[{"stateType":"retry","stateKey":"atomic","payload":{},"clientRevision":"state:1788681720000:cccccccc","clientUpdatedAt":"2026-09-06T00:02:00Z"},{"stateType":"invalid","stateKey":"bad","payload":{},"clientRevision":"state:1788681780000:dddddddd","clientUpdatedAt":"2026-09-06T00:03:00Z"}]');
  raise exception 'Invalid batch accepted';
 exception when invalid_parameter_value then null; end;
 if exists(select 1 from public.learner_state_items where state_key='atomic') then raise exception 'Batch partially committed'; end if;
 begin
  perform * from public.sync_learner_state_items('00000000-0000-4000-8000-000000000001','[{"stateType":"retry","stateKey":"same"},{"stateType":"retry","stateKey":"same"}]');
  raise exception 'Duplicate batch keys accepted';
 exception when invalid_parameter_value then null; end;
 select count(*) into n from public.sync_learner_state_items('00000000-0000-4000-8000-000000000001','[{"stateType":"weakness","stateKey":"ok","payload":{},"clientRevision":"state:1788681720000:cccccccc","clientUpdatedAt":"2026-09-06T00:02:00Z"}]');
 if n <> 1 then raise exception 'Valid batch failed'; end if;
 select allowed into allowed_result from public.consume_waitlist_rate_limit('synthetic-rehearsal-rate',now()-interval '1 hour',1,now());
 if allowed_result is distinct from true then raise exception 'First rate attempt rejected'; end if;
 select allowed into allowed_result from public.consume_waitlist_rate_limit('synthetic-rehearsal-rate',now()-interval '1 hour',1,now());
 if allowed_result is distinct from false then raise exception 'Rate limit not enforced'; end if;
 begin
  insert into public.user_study_artifacts(user_id,kind) values ('00000000-0000-4000-8000-000000000001','planner');
  raise exception 'Duplicate planner accepted';
 exception when unique_violation then null; end;
 insert into public.observability_events(schema_version,event_type,outcome,recorded_at) values ('vertexed.telemetry.v1','performance','success',now());
 begin
  perform public.prune_observability_events(now());
  raise exception 'Unsafe retention accepted';
 exception when invalid_parameter_value then null; end;
 perform public.prune_observability_events(now()-interval '8 days');
end $$;
set local role anon;
do $$ begin
 begin perform public.vertexed_readiness(); raise exception 'Anon executed RPC'; exception when insufficient_privilege then null; end;
 begin perform * from public.learner_state_items; raise exception 'Anon read learner data'; exception when insufficient_privilege then null; end;
end $$;
set local role authenticated;
do $$ begin
 begin perform * from public.sync_learner_state_items('00000000-0000-4000-8000-000000000001','[]'); raise exception 'Authenticated executed RPC'; exception when insufficient_privilege then null; end;
 begin perform * from public.learner_state_items; raise exception 'Authenticated read learner data'; exception when insufficient_privilege then null; end;
end $$;
rollback;
select 'PASS: readiness, preservation, privileges, RLS, service writes, stale revisions, account keys, batch atomicity, rate limits, singleton, telemetry, retention, denied clients' as result;
