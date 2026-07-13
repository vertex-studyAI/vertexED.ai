-- Safe, provenance-backed assessment and learning architecture.
-- This migration intentionally publishes no curriculum, paper, question, or mark scheme.
-- Content becomes learner-visible only through a server-side catalogue query after review.

create table if not exists public.curriculum_versions (
  id uuid primary key default gen_random_uuid(),
  board text not null,
  specification_code text not null,
  version_label text not null,
  title text not null,
  level text,
  language text not null default 'en',
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  official_source_url text,
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (board, specification_code, version_label, language)
);

create table if not exists public.curriculum_subjects (
  id uuid primary key default gen_random_uuid(),
  curriculum_version_id uuid not null references public.curriculum_versions(id) on delete cascade,
  code text not null,
  title text not null,
  component_code text,
  tier text,
  status text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.curriculum_nodes (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.curriculum_subjects(id) on delete cascade,
  code text not null,
  node_type text not null check (node_type in ('topic', 'skill', 'command_term', 'concept', 'assessment_objective')),
  title text not null,
  description text,
  official_locator jsonb not null default '{}'::jsonb,
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (subject_id, code)
);

create table if not exists public.concept_prerequisites (
  prerequisite_node_id uuid not null references public.curriculum_nodes(id) on delete cascade,
  dependent_node_id uuid not null references public.curriculum_nodes(id) on delete cascade,
  relation text not null default 'requires' check (relation in ('requires', 'supports')),
  source_locator jsonb not null default '{}'::jsonb,
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  primary key (prerequisite_node_id, dependent_node_id),
  check (prerequisite_node_id <> dependent_node_id)
);

create table if not exists public.content_sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  rights_holder text not null,
  authorization_basis text not null check (authorization_basis in ('licence', 'written_permission', 'public_domain', 'owned', 'other')),
  authorization_reference text not null,
  permitted_uses text[] not null default '{}',
  territory text,
  rights_expires_at timestamptz,
  source_url text,
  storage_key text,
  sha256 text not null,
  status text not null default 'pending_review' check (status in ('pending_review', 'approved', 'rejected', 'revoked', 'expired')),
  created_by uuid references auth.users(id) on delete set null,
  reviewed_by uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  rejection_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (cardinality(permitted_uses) > 0),
  check (length(sha256) >= 32)
);

create table if not exists public.content_source_versions (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.content_sources(id) on delete restrict,
  version_label text not null,
  exam_series text,
  component_code text,
  language text not null default 'en',
  page_count integer check (page_count is null or page_count > 0),
  parser_name text,
  parser_version text,
  parse_confidence numeric(4,3) check (parse_confidence is null or (parse_confidence >= 0 and parse_confidence <= 1)),
  parse_status text not null default 'not_started' check (parse_status in ('not_started', 'parsed', 'needs_review', 'verified', 'rejected')),
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_questions (
  id uuid primary key default gen_random_uuid(),
  source_version_id uuid not null references public.content_source_versions(id) on delete restrict,
  subject_id uuid not null references public.curriculum_subjects(id) on delete restrict,
  external_reference text not null,
  question_text text not null,
  question_payload jsonb not null default '{}'::jsonb,
  question_type text not null check (question_type in ('selected_response', 'numeric', 'short_response', 'structured_response', 'essay', 'other')),
  marks numeric(6,2) not null check (marks > 0),
  source_locator jsonb not null,
  parse_confidence numeric(4,3) check (parse_confidence is null or (parse_confidence >= 0 and parse_confidence <= 1)),
  difficulty_estimate numeric(4,3) check (difficulty_estimate is null or (difficulty_estimate >= 0 and difficulty_estimate <= 1)),
  difficulty_method text check (difficulty_method in ('human', 'empirical', 'model_assisted')),
  difficulty_confidence numeric(4,3) check (difficulty_confidence is null or (difficulty_confidence >= 0 and difficulty_confidence <= 1)),
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'verified', 'rejected')),
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_version_id, external_reference)
);

create table if not exists public.mark_scheme_points (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.assessment_questions(id) on delete cascade,
  point_code text not null,
  max_marks numeric(6,2) not null check (max_marks > 0),
  criterion_text text not null,
  acceptable_evidence jsonb not null default '[]'::jsonb,
  source_locator jsonb not null,
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (question_id, point_code)
);

create table if not exists public.question_classifications (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.assessment_questions(id) on delete cascade,
  curriculum_node_id uuid not null references public.curriculum_nodes(id) on delete restrict,
  relation text not null check (relation in ('primary', 'secondary', 'prerequisite', 'command_term')),
  method text not null check (method in ('human', 'rules', 'model_assisted')),
  model_or_rule_version text,
  confidence numeric(4,3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  review_status text not null default 'pending_review' check (review_status in ('pending_review', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  unique (question_id, curriculum_node_id, relation)
);

create table if not exists public.assessment_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject_id uuid not null references public.curriculum_subjects(id) on delete restrict,
  session_type text not null check (session_type in ('diagnostic', 'practice', 'mock')),
  scoring_mode text not null default 'verified_only' check (scoring_mode in ('verified_only', 'feedback_only')),
  status text not null default 'not_started' check (status in ('not_started', 'in_progress', 'submitted', 'reviewed', 'abandoned')),
  started_at timestamptz,
  submitted_at timestamptz,
  time_limit_seconds integer check (time_limit_seconds is null or time_limit_seconds > 0),
  selection_rule_version text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.assessment_session_items (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.assessment_sessions(id) on delete cascade,
  question_id uuid not null references public.assessment_questions(id) on delete restrict,
  ordinal integer not null check (ordinal > 0),
  question_version_snapshot jsonb not null,
  rubric_version_snapshot jsonb not null,
  marks numeric(6,2) not null check (marks > 0),
  created_at timestamptz not null default now(),
  unique (session_id, ordinal),
  unique (session_id, question_id)
);

create table if not exists public.assessment_responses (
  id uuid primary key default gen_random_uuid(),
  session_item_id uuid not null unique references public.assessment_session_items(id) on delete cascade,
  answer_text text,
  response_payload jsonb not null default '{}'::jsonb,
  submitted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.grading_runs (
  id uuid primary key default gen_random_uuid(),
  session_item_id uuid not null references public.assessment_session_items(id) on delete cascade,
  status text not null check (status in ('not_run', 'feedback_only', 'needs_review', 'verified', 'withheld')),
  method text not null check (method in ('deterministic', 'human', 'model_assisted')),
  scorer_version text,
  confidence numeric(4,3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  final_score numeric(6,2) check (final_score is null or final_score >= 0),
  uncertainty_reason text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);

create unique index if not exists grading_runs_session_item_unique
  on public.grading_runs(session_item_id);

create table if not exists public.grading_decisions (
  id uuid primary key default gen_random_uuid(),
  grading_run_id uuid not null references public.grading_runs(id) on delete cascade,
  mark_scheme_point_id uuid not null references public.mark_scheme_points(id) on delete restrict,
  awarded_marks numeric(6,2) not null check (awarded_marks >= 0),
  evidence_text text,
  evidence_locator jsonb not null default '{}'::jsonb,
  confidence numeric(4,3) check (confidence is null or (confidence >= 0 and confidence <= 1)),
  decision_status text not null check (decision_status in ('proposed', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  unique (grading_run_id, mark_scheme_point_id)
);

create table if not exists public.learning_evidence (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  curriculum_node_id uuid not null references public.curriculum_nodes(id) on delete restrict,
  assessment_response_id uuid references public.assessment_responses(id) on delete set null,
  grading_run_id uuid references public.grading_runs(id) on delete set null,
  outcome numeric(4,3) not null check (outcome >= 0 and outcome <= 1),
  reliability numeric(4,3) not null check (reliability > 0 and reliability <= 1),
  evidence_kind text not null check (evidence_kind in ('verified_score', 'selected_response', 'self_report')),
  eligible_for_mastery boolean not null default false,
  recorded_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  check (eligible_for_mastery = false or evidence_kind in ('verified_score', 'selected_response'))
);

create table if not exists public.mastery_states (
  user_id uuid not null references auth.users(id) on delete cascade,
  curriculum_node_id uuid not null references public.curriculum_nodes(id) on delete restrict,
  alpha numeric(10,3) not null default 1 check (alpha > 0),
  beta numeric(10,3) not null default 1 check (beta > 0),
  evidence_weight numeric(10,3) not null default 0 check (evidence_weight >= 0),
  evidence_count integer not null default 0 check (evidence_count >= 0),
  last_evidence_at timestamptz,
  model_version text not null default 'beta-v1',
  updated_at timestamptz not null default now(),
  primary key (user_id, curriculum_node_id)
);

create table if not exists public.concept_review_schedule (
  user_id uuid not null references auth.users(id) on delete cascade,
  curriculum_node_id uuid not null references public.curriculum_nodes(id) on delete restrict,
  due_at timestamptz not null,
  interval_days numeric(8,2) not null check (interval_days >= 0),
  ease numeric(5,3) not null default 2.5 check (ease >= 1.3 and ease <= 3.5),
  source_evidence_id uuid references public.learning_evidence(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, curriculum_node_id)
);

create table if not exists public.learning_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  curriculum_node_id uuid references public.curriculum_nodes(id) on delete set null,
  recommendation_type text not null check (recommendation_type in ('prerequisite', 'review', 'practice', 'diagnostic')),
  priority numeric(8,3) not null,
  rule_version text not null,
  evidence_ids uuid[] not null default '{}',
  explanation text not null,
  status text not null default 'active' check (status in ('active', 'dismissed', 'completed', 'superseded')),
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table if not exists public.content_admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  reason text,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);

create index if not exists curriculum_subjects_version_status_idx on public.curriculum_subjects (curriculum_version_id, status);
create unique index if not exists curriculum_subjects_natural_key_idx
  on public.curriculum_subjects (curriculum_version_id, code, coalesce(component_code, ''), coalesce(tier, ''));
create index if not exists source_versions_source_review_idx on public.content_source_versions (source_id, review_status);
create unique index if not exists content_source_versions_natural_key_idx
  on public.content_source_versions (source_id, version_label, coalesce(exam_series, ''), coalesce(component_code, ''), language);
create index if not exists assessment_questions_subject_active_idx on public.assessment_questions (subject_id, is_active, review_status);
create index if not exists classifications_question_review_idx on public.question_classifications (question_id, review_status);
create index if not exists sessions_user_created_idx on public.assessment_sessions (user_id, created_at desc);
create index if not exists learning_evidence_user_node_idx on public.learning_evidence (user_id, curriculum_node_id, recorded_at desc);
create index if not exists recommendation_user_status_idx on public.learning_recommendations (user_id, status, priority desc);

alter table public.curriculum_versions enable row level security;
alter table public.curriculum_subjects enable row level security;
alter table public.curriculum_nodes enable row level security;
alter table public.concept_prerequisites enable row level security;
alter table public.content_sources enable row level security;
alter table public.content_source_versions enable row level security;
alter table public.assessment_questions enable row level security;
alter table public.mark_scheme_points enable row level security;
alter table public.question_classifications enable row level security;
alter table public.assessment_sessions enable row level security;
alter table public.assessment_session_items enable row level security;
alter table public.assessment_responses enable row level security;
alter table public.grading_runs enable row level security;
alter table public.grading_decisions enable row level security;
alter table public.learning_evidence enable row level security;
alter table public.mastery_states enable row level security;
alter table public.concept_review_schedule enable row level security;
alter table public.learning_recommendations enable row level security;
alter table public.content_admin_audit_log enable row level security;

drop policy if exists "Students read own assessment sessions" on public.assessment_sessions;
create policy "Students read own assessment sessions" on public.assessment_sessions
  for select using (auth.uid() = user_id);

drop policy if exists "Students read own assessment items" on public.assessment_session_items;
create policy "Students read own assessment items" on public.assessment_session_items
  for select using (
    exists (select 1 from public.assessment_sessions s where s.id = session_id and s.user_id = auth.uid())
  );

drop policy if exists "Students read own assessment responses" on public.assessment_responses;
create policy "Students read own assessment responses" on public.assessment_responses
  for select using (
    exists (
      select 1 from public.assessment_session_items i
      join public.assessment_sessions s on s.id = i.session_id
      where i.id = session_item_id and s.user_id = auth.uid()
    )
  );

drop policy if exists "Students read own learning evidence" on public.learning_evidence;
create policy "Students read own learning evidence" on public.learning_evidence
  for select using (auth.uid() = user_id);

drop policy if exists "Students read own mastery" on public.mastery_states;
create policy "Students read own mastery" on public.mastery_states
  for select using (auth.uid() = user_id);

drop policy if exists "Students read own review schedule" on public.concept_review_schedule;
create policy "Students read own review schedule" on public.concept_review_schedule
  for select using (auth.uid() = user_id);

drop policy if exists "Students read own recommendations" on public.learning_recommendations;
create policy "Students read own recommendations" on public.learning_recommendations
  for select using (auth.uid() = user_id);
