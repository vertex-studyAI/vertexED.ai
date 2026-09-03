-- Privacy-safe in-product feedback for authenticated VertexED users.
-- Applied to production as Supabase migration 20260903121711_product_feedback.
-- The table stores only the authenticated user UUID plus bounded feedback fields.
-- Email, name, prompts, answers, auth tokens, and analytics identifiers are not stored here.

create table if not exists public.product_feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  category text not null default 'other'
    check (category in ('bug', 'confusing', 'idea', 'praise', 'other')),
  rating smallint null check (rating between 1 and 5),
  feedback text not null
    check (char_length(feedback) between 1 and 1500),
  page_path text not null default '/'
    check (char_length(page_path) between 1 and 160),
  created_at timestamptz not null default now()
);

alter table public.product_feedback enable row level security;

-- Fail closed: anonymous clients have no access, and authenticated users can only
-- insert the bounded columns required by the feedback form. There is intentionally
-- no authenticated SELECT/UPDATE/DELETE policy, so feedback is not exposed back
-- through the browser client after submission.
revoke all on table public.product_feedback from anon, authenticated;
grant insert (user_id, category, rating, feedback, page_path)
  on public.product_feedback to authenticated;

drop policy if exists "Users can submit their own product feedback" on public.product_feedback;
create policy "Users can submit their own product feedback"
  on public.product_feedback
  for insert
  to authenticated
  with check ((select auth.uid()) is not null and (select auth.uid()) = user_id);

create index if not exists product_feedback_created_at_idx
  on public.product_feedback (created_at desc);
create index if not exists product_feedback_user_created_at_idx
  on public.product_feedback (user_id, created_at desc);

comment on table public.product_feedback is
  'Authenticated in-product feedback. Browser clients are insert-only under RLS; review requires a privileged server/admin connection.';
