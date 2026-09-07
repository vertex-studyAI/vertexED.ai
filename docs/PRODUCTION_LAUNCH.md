# VertexED.ai — Production Launch

Use this as the final gate before calling the app **100% production-ready**.

## Automated (run locally or in CI)

```bash
npm run ci          # lint:ci + validate + prod audit + tests + build
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

1. Run `npx supabase db push` against the linked target; `supabase/migrations/` is the only schema source of truth.
2. Run `npx supabase start && npm run db:test` on a clean local stack before pushing remotely.
3. Confirm the migration ledger includes every ordered file through `20260906115242_account_deletion_privacy_and_rate_limit_invoker.sql`.
4. Confirm `/api/health?readiness=1` reports `databaseConnection`, `atomicRateLimitRpc`, `learnerStateStorage`, `batchLearnerStateSync`, `observabilityStorage`, and `singletonIntegrity` as `true`.
   - If it reports historical singleton duplicates, stop and reconcile those learner-owned rows explicitly; the migration intentionally deletes nothing.
5. Enable Email + Google OAuth, but disable direct signup in Auth settings so private-beta account creation remains server-gated.
6. Redirect URLs: `https://www.vertexed.app/auth/callback` (+ localhost for dev).

## Post-deploy verification (15 min)

1. `npm run test:smoke` — all green
2. `/signup` — join waitlist with a test email
3. `/admin/waitlist` — approve the test entry (as `ADMIN_EMAILS` user)
4. `/signup` → create account with approved email (no invite code required)
5. Log in → complete mock → evidence-linked review → confirm against an official mark scheme → dashboard retry; confirm device-save recovery and planner/learner-state sync.
6. Test chatbot, notetaker, paper maker, and planner AI; confirm feedback controls emit no study content.
7. Export account data → confirm cloud artifacts, learner state, and device data are present without invite/session secrets.
8. Delete a disposable account → confirm refresh-session revocation, Auth deletion, content cascade, linked waitlist-email deletion, and subsequent API denial.
9. Log out → confirm AI APIs return 401.

Full checklist: [`docs/QA_CHECKLIST.md`](./QA_CHECKLIST.md)

## Monitoring

- **Liveness:** `GET https://www.vertexed.app/api/health` → v2 response with `status` and `X-VertexED-Revision`
- **Dependency readiness:** `GET https://www.vertexed.app/api/health?readiness=1` → database and provider checks; returns `503` on a missing migration or dependency
- **Vercel:** deployment logs + Analytics + Speed Insights
- **Supabase:** auth logs, `waitlist`, `user_study_artifacts` tables

## Backup, rollback, and disaster recovery

| Scenario | Action |
|----------|--------|
| **Bad deploy** | Vercel → Deployments → promote previous production deployment (instant rollback) |
| **Database backup** | Supabase Dashboard → Database → Backups (enable PITR on Pro plan) |
| **Auth outage** | Supabase status page; app returns 401/503 on protected routes — no data loss |
| **API key rotation** | Rotate `OPENAI_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel; redeploy |
| **Data export** | Export `waitlist`, `user_study_artifacts`, and `learner_state_items` via Supabase SQL or CSV |

Recommended: enable Supabase daily backups before launch; document env vars in a secure vault (1Password, Vercel env groups).

## 100% criteria

- [ ] All env vars set on Vercel
- [ ] Supabase migration ledger + auth configured; deep readiness is green
- [ ] `npm run ci` passes
- [ ] `npm run test:smoke` passes on production
- [ ] QA checklist completed (desktop + mobile)
- [ ] GitHub Actions CI green on `main`

When all boxes are checked, you're at **100%**.
