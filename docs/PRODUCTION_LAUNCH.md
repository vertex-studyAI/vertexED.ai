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
| `SIGNUP_INVITE_CODE` | Optional (global team invite code). When unset, only waitlist-approved emails (or per-user `waitlist.invite_token`) can sign up. |
| `WAITLIST_RATE_LIMIT_SALT` | Yes (random secret for IP hashing) |

Remove `VITE_GEMINI_API_KEY` if still set — Gemini is server-only.

## Supabase (required)

1. Run `supabase/schema.sql` (new projects)
2. Run `supabase/migrations/20260708_phase3_waitlist_auth.sql` (existing DBs)
3. Run `supabase/migrations/20260711_planner_artifact_kind.sql` (planner cloud sync)
4. Enable Email + Google OAuth
5. Redirect URLs: `https://www.vertexed.app/auth/callback` (+ localhost for dev)

## Post-deploy verification (15 min)

1. `npm run test:smoke` — all green
2. `/signup` — join waitlist with a test email
3. `/admin/waitlist` — approve the test entry (as `ADMIN_EMAILS` user)
4. `/signup` → create account with approved email (no invite code required; works whether `SIGNUP_INVITE_CODE` is set or unset)
5. Log in → test chatbot, notetaker, paper maker, planner AI + confirm planner syncs
6. Log out → confirm AI APIs return 401

Full checklist: [`docs/QA_CHECKLIST.md`](./QA_CHECKLIST.md)

## Monitoring

- **Health:** `GET https://www.vertexed.app/api/health` → `{ "ok": true }`
- **Vercel:** deployment logs + Analytics + Speed Insights
- **Supabase:** auth logs, `waitlist`, `user_study_artifacts` tables

## Backup, rollback, and disaster recovery

| Scenario | Action |
|----------|--------|
| **Bad deploy** | Vercel → Deployments → promote previous production deployment (instant rollback) |
| **Database backup** | Supabase Dashboard → Database → Backups (enable PITR on Pro plan) |
| **Auth outage** | Supabase status page; app returns 401/503 on protected routes — no data loss |
| **API key rotation** | Rotate `OPENAI_API_KEY`, `GEMINI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY` in Vercel; redeploy |
| **Data export** | Export `waitlist` and `user_study_artifacts` via Supabase SQL or CSV |

Recommended: enable Supabase daily backups before launch; document env vars in a secure vault (1Password, Vercel env groups).

## 100% criteria

- [ ] All env vars set on Vercel
- [ ] Supabase schema + auth configured
- [ ] `npm run ci` passes
- [ ] `npm run test:smoke` passes on production
- [ ] QA checklist completed (desktop + mobile)
- [ ] GitHub Actions CI green on `main`

When all boxes are checked, you're at **100%**.
