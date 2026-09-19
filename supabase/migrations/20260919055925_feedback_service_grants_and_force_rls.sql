-- DB integrity hardening (additive only).
-- 1) product_feedback never granted service_role explicitly despite insert-only
--    browser RLS and an admin-review comment contract.
-- 2) Align PUBLIC revokes with other fail-closed tables.
-- 3) FORCE RLS so table-owner sessions cannot accidentally bypass policies.

revoke all on table public.product_feedback from public, anon, authenticated;
grant insert (user_id, category, rating, feedback, page_path)
  on public.product_feedback to authenticated;
grant select, insert, delete on table public.product_feedback to service_role;

revoke all on table public.schools from public, anon, authenticated;
grant select, insert on table public.schools to service_role;

revoke all on table public.waitlist from public, anon, authenticated;
grant select, insert, update, delete on table public.waitlist to service_role;

alter table public.profiles force row level security;
alter table public.waitlist force row level security;
alter table public.waitlist_rate_limits force row level security;
alter table public.user_study_artifacts force row level security;
alter table public.product_feedback force row level security;
alter table public.learner_state_items force row level security;
alter table public.observability_events force row level security;
alter table public.schools force row level security;
