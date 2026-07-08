# VertexED.ai — Production Launch

Use this as the final gate before calling the app **100% production-ready**.

## Automated (run locally or in CI)

```bash
npm run ci          # lint:ci + 15 tests + build
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

Remove `VITE_GEMINI_API_KEY` if still set — Gemini is server-only.

## Supabase (required)

1. Run `supabase/schema.sql` (new projects)
2. Run `supabase/migrations/20260708_phase3_waitlist_auth.sql` (existing DBs)
3. Enable Email + Google OAuth
4. Redirect URLs: `https://www.vertexed.app/auth/callback` (+ localhost for dev)

## Post-deploy verification (15 min)

1. `npm run test:smoke` — all green
2. `/signup` — join waitlist with a test email
3. `/admin/waitlist` — approve the test entry (as `ADMIN_EMAILS` user)
4. Log in → test chatbot, notetaker, paper maker, planner AI
5. Log out → confirm AI APIs return 401

Full checklist: [`docs/QA_CHECKLIST.md`](./QA_CHECKLIST.md)

## Monitoring

- **Health:** `GET https://www.vertexed.app/api/health` → `{ "ok": true }`
- **Vercel:** deployment logs + Analytics
- **Supabase:** auth logs + `waitlist` table

## 100% criteria

- [ ] All env vars set on Vercel
- [ ] Supabase schema + auth configured
- [ ] `npm run ci` passes
- [ ] `npm run test:smoke` passes on production
- [ ] QA checklist completed (desktop + mobile)
- [ ] GitHub Actions CI green on `main`

When all boxes are checked, you're at **100%**.
