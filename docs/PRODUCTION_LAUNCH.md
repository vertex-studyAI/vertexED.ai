# VertexED.ai — Production Launch

Use this as the final gate before calling the app **100% production-ready**.

## Automated (run locally or in CI)

```bash
npm run ci          # lint:ci + validate + prod audit + tests + build
npm run validate:prod-env # run where production secrets are injected
npm run test:smoke  # live checks against www.vertexed.app (after deploy)
```

## Vercel environment (required)

| Variable | Required |
|----------|----------|
| `VITE_SUPABASE_URL` | Yes |
| `VITE_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_URL` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes |
| `SUPABASE_ANON_KEY` | Yes (same as `VITE_SUPABASE_ANON_KEY`) |
| `OPENAI_API_KEY` or `ChatbotKey` | Yes |
| `GEMINI_API_KEY` | Yes (Study Planner) |
| `ADMIN_EMAILS` | Yes (waitlist admin UI) |
| `SIGNUP_INVITE_CODE` | Yes (invite signup) |
| `WAITLIST_RATE_LIMIT_SALT` | Yes (random secret for IP hashing) |

Remove `VITE_GEMINI_API_KEY` if still set — Gemini is server-only.

## Supabase (required)

1. Apply the tracked migrations in timestamp order, including:
   - `20260712_core_learning_exam_architecture.sql`
   - `20260713_production_baseline_alignment.sql`
   - `20260713_rls_hardening_performance.sql`
   - `20260713_remove_duplicate_lesson_progress_index.sql`
   - `20260713_least_privilege_grants.sql`
2. Configure Email + Google OAuth and set redirect URLs to `https://www.vertexed.app/auth/callback` (+ localhost for development).
3. In Supabase Auth, set email OTP expiry to one hour or less and enable leaked-password protection.
4. Apply the available Supabase Postgres security upgrade.
5. Enable a backup/PITR policy appropriate to the chosen Supabase plan.

### Required waitlist decision

`public.waitlist` is intentionally accessed only through server-side handlers. It is
currently the sole public table without RLS in the connected project. Before launch,
the project owner must choose and apply a policy. The recommended server-mediated
configuration preserves the existing handlers while blocking browser access:

```sql
alter table public.waitlist enable row level security;
create policy "No direct client access" on public.waitlist
  for all to anon, authenticated using (false) with check (false);
```

Do not apply that policy if the product is deliberately being changed to submit or
read waitlist data from the browser; that alternative needs a narrowly scoped,
separately reviewed insert policy and abuse controls.

Do not publish an exam component until its curriculum version and subject are published and at least one question has passed the entire content review chain in `/admin/exam-content`.

## Post-deploy verification (15 min)

1. `npm run test:smoke` — all green
2. `/signup` — join waitlist with a test email
3. `/admin/waitlist` — approve the test entry (as `ADMIN_EMAILS` user)
4. `/signup` → create account with approved email (no invite code required)
5. As an `ADMIN_EMAILS` user, open `/admin/exam-content` and confirm the content review chain is complete for every active question.
6. Log in → test chatbot, notetaker, verified practice, concept evidence, planner AI + confirm planner syncs.
7. Complete one selected-response verified practice question; confirm its persisted score, concept evidence, review date, and recommendation are internally consistent.
8. Complete one constructed response; confirm its score is withheld and it does not change mastery.
9. Export account data, then use a dedicated test account to verify account deletion clears cloud and local VertexED data.
10. Log out → confirm protected AI and assessment APIs return 401.

Full checklist: [`docs/QA_CHECKLIST.md`](./QA_CHECKLIST.md)

For the connected project’s exact database and dashboard closure actions, use [`SUPABASE_PRODUCTION_HARDENING.md`](./SUPABASE_PRODUCTION_HARDENING.md).

## Monitoring

- **Health:** `GET https://www.vertexed.app/api/health` → `{ "ok": true }`
- **Vercel:** deployment logs + Analytics + Speed Insights
- **Supabase:** auth logs, `waitlist`, `user_study_artifacts`, and the assessment/mastery tables

## Backup, rollback, and disaster recovery

| Scenario | Action |
|----------|--------|
| **Bad deploy** | Vercel → Deployments → promote previous production deployment (instant rollback) |
| **Database backup** | Supabase Dashboard → Database → Backups (enable PITR on Pro plan) |
| **Auth outage** | Supabase status page; app returns 401/503 on protected routes — no data loss |
| **API key rotation** | Rotate `OPENAI_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel; redeploy |
| **Data export** | Export `waitlist` and `user_study_artifacts` via Supabase SQL or CSV |

Recommended: enable Supabase daily backups before launch; document env vars in a secure vault (1Password, Vercel env groups).

## Release criteria

- [ ] All env vars set on Vercel
- [ ] `npm run validate:prod-env` passes in the production environment
- [ ] Supabase schema, every listed migration, and auth configured
- [ ] Waitlist RLS policy selected and applied by the project owner
- [ ] OTP expiry ≤ 1 hour, leaked-password protection, and the latest Postgres security patch applied
- [ ] `npm run ci` passes
- [ ] `npm run test:smoke` passes on production
- [ ] QA checklist completed (desktop + mobile)
- [ ] At least one licensed/authorized curriculum component is fully reviewed end to end; otherwise public copy and the practice workspace truthfully show content as unavailable
- [ ] An assessment specialist has sampled active questions, classifications, mark totals, and deterministic-score behaviour
- [ ] Account export/deletion and role separation have been tested in the production project
- [ ] GitHub Actions CI green on `main`

Only when all boxes are checked is the platform a release candidate. A passing build alone does not establish educational validity, content rights, or operational readiness.
