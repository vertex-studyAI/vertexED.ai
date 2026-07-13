-- Defence-in-depth for the production learning architecture.
-- Learner data is direct-client readable only through explicit ownership policies;
-- curriculum, source, question, grading and audit records remain server-mediated.

-- The service role is the only caller of these server-side functions.  The auth
-- trigger still executes as its owner when a new Auth user is created.
revoke all on function public.auth_email_exists(text) from public, anon, authenticated;
grant execute on function public.auth_email_exists(text) to service_role;
revoke all on function public.handle_new_user() from public, anon, authenticated;

-- Make no-browser-access explicit for sensitive content and audit tables.  Service
-- role requests used by the reviewed API handlers bypass RLS; public clients do not.
create policy "No direct client access" on public."UserCache"
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.waitlist_rate_limits
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.curriculum_versions
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.curriculum_subjects
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.curriculum_nodes
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.concept_prerequisites
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.content_sources
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.content_source_versions
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.assessment_questions
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.mark_scheme_points
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.question_classifications
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.grading_runs
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.grading_decisions
  for all to anon, authenticated using (false) with check (false);
create policy "No direct client access" on public.content_admin_audit_log
  for all to anon, authenticated using (false) with check (false);

-- Auth helper calls are evaluated once per query rather than once per candidate row.
drop policy if exists "Students read own assessment sessions" on public.assessment_sessions;
create policy "Students read own assessment sessions" on public.assessment_sessions
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Students read own assessment items" on public.assessment_session_items;
create policy "Students read own assessment items" on public.assessment_session_items
  for select to authenticated using (
    exists (select 1 from public.assessment_sessions s where s.id = session_id and s.user_id = (select auth.uid()))
  );

drop policy if exists "Students read own assessment responses" on public.assessment_responses;
create policy "Students read own assessment responses" on public.assessment_responses
  for select to authenticated using (
    exists (
      select 1 from public.assessment_session_items i
      join public.assessment_sessions s on s.id = i.session_id
      where i.id = session_item_id and s.user_id = (select auth.uid())
    )
  );

drop policy if exists "Students read own learning evidence" on public.learning_evidence;
create policy "Students read own learning evidence" on public.learning_evidence
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Students read own mastery" on public.mastery_states;
create policy "Students read own mastery" on public.mastery_states
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Students read own review schedule" on public.concept_review_schedule;
create policy "Students read own review schedule" on public.concept_review_schedule
  for select to authenticated using ((select auth.uid()) = user_id);

drop policy if exists "Students read own recommendations" on public.learning_recommendations;
create policy "Students read own recommendations" on public.learning_recommendations
  for select to authenticated using ((select auth.uid()) = user_id);

-- Foreign-key indexes keep grading, recommendations and administrative review fast as
-- the product grows. Existing primary/unique/composite indexes already cover the rest.
create index if not exists curriculum_nodes_subject_idx on public.curriculum_nodes(subject_id);
create index if not exists concept_prerequisites_dependent_idx on public.concept_prerequisites(dependent_node_id);
create index if not exists content_sources_created_by_idx on public.content_sources(created_by) where created_by is not null;
create index if not exists content_sources_reviewed_by_idx on public.content_sources(reviewed_by) where reviewed_by is not null;
create index if not exists curriculum_versions_reviewed_by_idx on public.curriculum_versions(reviewed_by) where reviewed_by is not null;
create index if not exists assessment_questions_source_version_idx on public.assessment_questions(source_version_id);
create index if not exists assessment_session_items_question_idx on public.assessment_session_items(question_id);
create index if not exists assessment_sessions_subject_idx on public.assessment_sessions(subject_id);
create index if not exists mark_scheme_points_question_idx on public.mark_scheme_points(question_id);
create index if not exists question_classifications_node_idx on public.question_classifications(curriculum_node_id);
create index if not exists grading_runs_reviewed_by_idx on public.grading_runs(reviewed_by) where reviewed_by is not null;
create index if not exists grading_decisions_mark_scheme_point_idx on public.grading_decisions(mark_scheme_point_id);
create index if not exists learning_evidence_response_idx on public.learning_evidence(assessment_response_id) where assessment_response_id is not null;
create index if not exists learning_evidence_node_idx on public.learning_evidence(curriculum_node_id);
create index if not exists learning_evidence_grading_run_idx on public.learning_evidence(grading_run_id) where grading_run_id is not null;
create index if not exists mastery_states_node_idx on public.mastery_states(curriculum_node_id);
create index if not exists review_schedule_node_idx on public.concept_review_schedule(curriculum_node_id);
create index if not exists review_schedule_evidence_idx on public.concept_review_schedule(source_evidence_id) where source_evidence_id is not null;
create index if not exists recommendations_node_idx on public.learning_recommendations(curriculum_node_id) where curriculum_node_id is not null;
create index if not exists content_admin_audit_actor_idx on public.content_admin_audit_log(actor_id) where actor_id is not null;
create index if not exists education_lesson_progress_user_idx on public.education_lesson_progress(user_id);
