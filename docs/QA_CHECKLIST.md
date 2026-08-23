# VertexED.ai — Production QA Checklist

Use this before and after each production deploy to [www.vertexed.app](https://www.vertexed.app).

Automated checks run in GitHub Actions (`npm test`, `npm run build:ci`) and optional live smoke tests (`npm run test:smoke`).

> **Evidence rule:** checklist boxes describe required procedures; they are not release evidence by themselves. For each certification run, record the timestamp, exact deployed Git revision, deployment identifier, expected result, actual result, pass/fail verdict, and a non-secret evidence link or artifact. Do not mark production GREEN from source-only or logged-out checks.

---

## Pre-deploy (local / CI)

- [ ] `npm ci` completes without errors
- [ ] `npm test` passes (auth + API handler smoke tests)
- [ ] `npm run build:ci` passes
- [ ] All Vercel env vars from `.env.example` are set (especially `SUPABASE_ANON_KEY`, `GEMINI_API_KEY` server-side)
- [ ] Supabase schema + required migrations are applied if upgrading an existing DB
- [ ] The intended production deployment is tied to an immutable Git revision

---

## Waitlist admin (`/admin/waitlist`)

- [ ] Page loads when logged in as an `ADMIN_EMAILS` user
- [ ] Non-admin user sees 403 / access denied message
- [ ] Pending filter shows new signups
- [ ] Approve / Reject / Reset updates status in Supabase

---

## Private-beta signup (`/signup`)

VertexED currently uses an approved waitlist / invite path rather than unrestricted self-service account creation. Test the intended production path, not an open-signup flow that is deliberately disabled.

- [ ] Page loads on desktop and mobile
- [ ] Invalid email shows validation error (client + server)
- [ ] Valid new email → success message
- [ ] Duplicate email → 409 with clear copy
- [ ] Existing auth account email → 409 “log in instead”
- [ ] Honeypot field (hidden) does not block real users
- [ ] Entry appears in Supabase `waitlist` table with `status: pending`
- [ ] Allowlisted admin can approve a disposable waitlist entry
- [ ] Approved link creates the disposable account successfully
- [ ] Valid team invite sends an ownership-verifying mailbox invitation
- [ ] Invalid/expired approval links fail closed with a recovery path

---

## Auth

- [ ] Existing approved user can complete Google OAuth (`/login` → callback → `/main` or onboarding)
- [ ] Approved disposable user can log in with email/password
- [ ] Logged-out user cannot access protected routes (redirect to login)
- [ ] Protected APIs reject logged-out requests with 401
- [ ] Session persists on page refresh
- [ ] Logout clears session and redirects appropriately
- [ ] New approved user profile row is created in `profiles` with the correct owner
- [ ] Password-recovery email establishes a genuine recovery session
- [ ] Password update succeeds, clears recovery authorization, signs the user out, and the new password works

---

## Core learning features (logged in)

Each should return a useful response; unauthenticated API calls should return **401** where applicable.

| Feature | Route | Quick test |
|---------|-------|------------|
| Apex | `/chatbot` | Ask a math question; verify a useful reasoning-oriented reply |
| Study Zone / Apex | `/study-zone` | Run a focus session and send a short question |
| Notes · Flashcards · Quiz | `/notetaker` | Generate notes, create retrieval material, and grade a short quiz |
| Transcribe | `/notetaker` → Upload audio | Small audio file transcribes |
| Paper Maker | `/paper-maker` | Generate a short board-shaped mock paper |
| Answer Reviewer | `/answer-reviewer` | Submit a sample answer and verify actionable rubric-oriented feedback |
| Study Planner AI | `/planner` | Natural-language “add task” works |

---

## Persistence and account isolation

- [ ] Create at least one disposable planner/note artifact as User A
- [ ] Fresh session retrieves User A's saved state correctly
- [ ] User B cannot read User A's profile or study artifacts
- [ ] User B cannot update or delete User A's study artifacts
- [ ] Server-side user-content operations remain scoped to the authenticated `user.id`
- [ ] Logout followed by protected-page/API access is rejected
- [ ] Disposable certification data is deleted or has an explicit cleanup owner

---

## Study Zone (non-AI widgets)

- [ ] Pomodoro / timer starts, pauses, resets
- [ ] Calculator keyboard input only when focused
- [ ] Habit tracker add/toggle/delete
- [ ] Meditation timer play/pause/restart
- [ ] Local notes save without duplicates

---

## Marketing & SEO

- [ ] Home, Features, About, Resources pages load
- [ ] `/robots.txt` and `/sitemap.xml` accessible
- [ ] No console errors on homepage (except accepted third-party analytics noise)
- [ ] `www.vertexed.app` is canonical; bare domain redirects to www
- [ ] Private-beta calls to action describe the actual waitlist/invite access model consistently

---

## Mobile and accessibility

- [ ] Navigation usable (menu, links) at 375px width
- [ ] Signup form usable at 375px width
- [ ] Apex input + send button reachable
- [ ] Study Zone widgets scroll and tap correctly
- [ ] Keyboard-only pass succeeds through authenticated core journeys
- [ ] Dialogs and generated-content controls have usable accessible names
- [ ] Contrast/focus review covers 375, 390, 768, 1024, and 1440 px checkpoints
- [ ] Slow-network loading, empty, timeout, and error states are understandable

---

## Post-deploy smoke (automated)

```bash
npm run test:smoke
# or against a preview URL:
SMOKE_BASE_URL=https://your-preview.vercel.app npm run test:smoke
```

Expected minimum contract:
- `GET /api/health` → healthy response for the intended production revision
- `/api/health` body `revision` equals the exact immutable deployed Git SHA
- `X-VertexED-Revision` equals the same SHA
- `GET /` → 200
- `POST /api/waitlist` invalid email → 400
- `POST /api/ask` without token → 401
- `POST /api/user-content` without token → 401
- admin-only APIs reject logged-out/non-admin access
- untrusted cross-origin API writes are rejected

A healthy body without an immutable revision is **not** sufficient production certification.

---

## Rollback triggers

Roll back or halt promotion if any of these occur:

- Production serves a different or missing immutable revision
- Waitlist returns 500 for valid emails
- Approved account provisioning is broken
- All AI routes return 401 for logged-in users (check `SUPABASE_ANON_KEY` on server)
- Build succeeds but `/` returns 404 or blank page
- Auth callback loop (redirect never completes)
- Cross-account access or mutation is possible

---

## Waitlist admin (manual)

1. Ensure `ADMIN_EMAILS` is configured in the canonical production environment.
2. Log in and open **`/admin/waitlist`**.
3. Approve a disposable pending user (updates `status` in Supabase).
4. Use the resulting approved-user flow to create the disposable account.
5. Complete the authenticated golden journey and record non-secret evidence.
6. Delete the disposable account/data or record the cleanup owner.

Fallback database edits are for recovery only and do not replace the real user-facing certification flow.
