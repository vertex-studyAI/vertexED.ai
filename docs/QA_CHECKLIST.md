# VertexED.ai — Production QA Checklist

Use this before and after each production deploy to [www.vertexed.app](https://www.vertexed.app).

Automated checks run in GitHub Actions (`npm test`, `npm run build:ci`) and optional live smoke tests (`npm run test:smoke`).

---

## Pre-deploy (local / CI)

- [ ] `npm ci` completes without errors
- [ ] `npm test` passes (auth + API handler smoke tests)
- [ ] `npm run build:ci` passes
- [ ] All Vercel env vars from `.env.example` are set (especially `SUPABASE_ANON_KEY`, `GEMINI_API_KEY` server-side)
- [ ] Supabase schema + Phase 3 migration applied if upgrading an existing DB

---

## Waitlist admin (`/admin/waitlist`)

- [ ] Page loads when logged in as an `ADMIN_EMAILS` user
- [ ] Non-admin user sees 403 / access denied message
- [ ] Pending filter shows new signups
- [ ] Approve / Reject / Reset updates status in Supabase

---

## Waitlist (`/signup`)

- [ ] Page loads on desktop and mobile
- [ ] Invalid email shows validation error (client + server)
- [ ] Valid new email → success message
- [ ] Duplicate email → 409 with clear copy
- [ ] Existing auth account email → 409 “log in instead”
- [ ] Honeypot field (hidden) does not block real users
- [ ] Entry appears in Supabase `waitlist` table with `status: pending`

---

## Auth

- [ ] Google OAuth login works (`/login` → callback → `/main` or onboarding)
- [ ] Logged-out user cannot access protected routes (redirect to login)
- [ ] Session persists on page refresh
- [ ] Logout clears session and redirects appropriately
- [ ] New user profile row created in `profiles` with email

---

## AI features (logged in)

Each should return a useful response; unauthenticated API calls should return **401**.

| Feature | Route | Quick test |
|---------|-------|------------|
| Chatbot | `/chatbot` | Ask a math question; verify step-by-step reply |
| Study Zone Assistant | `/study-zone` → Assistant tab | Send a short question |
| Note Taker | `/notetaker` | Generate notes from a topic |
| Quiz | `/notetaker` → Quiz tab | Generate + grade a short quiz |
| Transcribe | `/notetaker` → Upload audio | Small audio file transcribes |
| Paper Maker | `/paper-maker` | Generate a short mock paper |
| Answer Reviewer | `/answer-reviewer` | Submit sample answer for feedback |
| Study Planner AI | `/planner` | Natural-language “add task” works |

---

## Study Zone (non-AI widgets)

- [ ] Pomodoro / timer starts, pauses, resets
- [ ] Calculator keyboard input only when focused
- [ ] Habit tracker add/toggle/delete
- [ ] Meditation timer play/pause/restart
- [ ] Note taker local notes save without duplicates

---

## Marketing & SEO

- [ ] Home, Features, About, Resources pages load
- [ ] `/robots.txt` and `/sitemap.xml` accessible
- [ ] No console errors on homepage (except third-party analytics)
- [ ] `www.vertexed.app` canonical; bare domain redirects to www

---

## Mobile (375px width)

- [ ] Navigation usable (menu, links)
- [ ] Signup form usable
- [ ] Chatbot input + send button reachable
- [ ] Study Zone widgets scroll and tap correctly

---

## Post-deploy smoke (automated)

```bash
npm run test:smoke
# or against a preview URL:
SMOKE_BASE_URL=https://your-preview.vercel.app npm run test:smoke
```

Expected:
- `GET /api/health` → 200 `{ ok: true }`
- `GET /` → 200
- `POST /api/waitlist` invalid email → 400
- `POST /api/ask` without token → 401

---

## Rollback triggers

Roll back the deploy if any of these occur:

- Waitlist returns 500 for valid emails
- All AI routes return 401 for logged-in users (check `SUPABASE_ANON_KEY` on server)
- Build succeeds but `/` returns 404 or blank page
- Auth callback loop (redirect never completes)

---

## Waitlist admin (manual)

1. Set `ADMIN_EMAILS=your@email.com` in Vercel and redeploy
2. Log in and open **`/admin/waitlist`**
3. Approve users by clicking **Approve** (updates `status` in Supabase)
4. Invite approved users via Supabase Auth or your email workflow

Fallback: Supabase → Table Editor → `waitlist` → edit `status` directly.
