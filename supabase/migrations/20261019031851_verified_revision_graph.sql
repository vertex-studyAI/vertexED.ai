-- Append-only, metadata-only revision graph. Raw answers, notes and feedback
-- remain in their purpose-built owner-scoped stores; this table links their
-- opaque identities and evidence status without duplicating private content.
create table public.revision_events (
  id uuid primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  event_type text not null check (event_type in ('note', 'attempt', 'feedback', 'confirmation', 'retry', 'retraction')),
  occurred_at timestamptz not null,
  evidence_status text not null check (evidence_status in ('generated', 'provisional', 'evidence-linked', 'learner-attested', 'independently-validated', 'retracted')),
  source_type text not null check (char_length(source_type) between 1 and 40),
  source_key text not null check (char_length(source_key) between 1 and 180),
  source_revision text not null check (char_length(source_revision) between 1 and 180),
  parent_event_ids uuid[] not null default '{}',
  payload jsonb not null default '{}'::jsonb check (jsonb_typeof(payload) = 'object' and pg_column_size(payload) <= 8192),
  payload_sha256 text not null check (payload_sha256 ~ '^[0-9a-f]{64}$'),
  created_at timestamptz not null default now(),
  unique (user_id, source_type, source_key, source_revision, event_type),
  check (array_length(parent_event_ids, 1) is null or array_length(parent_event_ids, 1) <= 8),
  check (not id = any(parent_event_ids)),
  check ((event_type = 'retraction' and evidence_status = 'retracted' and cardinality(parent_event_ids) = 1)
    or event_type <> 'retraction')
);

create index revision_events_user_chronology_idx
  on public.revision_events (user_id, occurred_at desc, id desc);

create index revision_events_user_source_idx
  on public.revision_events (user_id, source_type, source_key);

alter table public.revision_events enable row level security;
alter table public.revision_events force row level security;

revoke all on table public.revision_events from public, anon, authenticated;
grant select, insert on table public.revision_events to service_role;

comment on table public.revision_events is
  'Append-only learner revision metadata. Application code forbids update/delete and validates same-owner parents before insert; auth-user deletion cascades account erasure.';
