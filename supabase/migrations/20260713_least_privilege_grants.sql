-- RLS is the primary row boundary; SQL grants are an independent boundary.
-- The browser directly uses only profiles. Every other application table is
-- accessed through authenticated server handlers using the service-role key.

revoke all on table
  public."UserCache",
  public.profiles,
  public.education_lesson_progress,
  public.user_study_artifacts,
  public.waitlist_rate_limits,
  public.curriculum_versions,
  public.curriculum_subjects,
  public.curriculum_nodes,
  public.concept_prerequisites,
  public.content_sources,
  public.content_source_versions,
  public.assessment_questions,
  public.mark_scheme_points,
  public.question_classifications,
  public.assessment_sessions,
  public.assessment_session_items,
  public.assessment_responses,
  public.grading_runs,
  public.grading_decisions,
  public.learning_evidence,
  public.mastery_states,
  public.concept_review_schedule,
  public.learning_recommendations,
  public.content_admin_audit_log
from anon, authenticated;

-- Retain exactly the direct client capability required by onboarding/settings.
grant select, insert, update on table public.profiles to authenticated;

-- Public functions are not part of the client contract. The one privileged lookup
-- is explicitly granted only to service_role in the earlier hardening migration.
revoke all on all functions in schema public from anon, authenticated;

-- Future public tables should be deliberately exposed, not inherit broad grants.
alter default privileges for role postgres in schema public
  revoke all on tables from anon, authenticated;
alter default privileges for role postgres in schema public
  revoke execute on functions from anon, authenticated;
