# VertexED

VertexED is a private-beta exam-prep workspace for planning, focused study, generated practice, evidence-linked answer review, notes, flashcards, and tutoring.

## Overview

This project brings together AI assisted study utilities (notes, quiz, paper generator, answer reviewer, chatbot, study planner) in a single modern, accessible web app built with:

- React + TypeScript (Vite)
- Tailwind CSS with a small layer of custom design tokens (HSL variables) for dark/light theming
- Supabase (auth + data)
- One Node.js Vercel Serverless Function with an explicit route registry

## Key Features (current focus)

- Unified learner dashboard with measured weak-topic, retry, mock-review, and sync status
- Personalized Exam Prep page using the learner's exam date, subjects, unfinished mocks, due retries, verified weak topics, and flashcard queue
- Study Zone with timers, calculator, graphing, quick notes, an activity log, and account-scoped daily habits
- AI note taking, deterministic/AI quiz grading, and evidence-gated progress updates
- Practice-paper generator with timed mock → answer review → scheduled retry handoff
- Study planner with device recovery and cloud sync
- Answer reviewer and AI tutor with privacy-safe quality feedback

## Design Tokens & Theming

The UI uses global tokens in `src/index.css`, the blue workbook system in `src/styles/workbook.css`, and landing-only rules in `src/styles/landing.css`. Read the four files in `brand/` before interface changes. Core tokens include:

```
--background
--foreground
--card
--primary
--accent
--border
```

New product surfaces should use these tokens, solid card backgrounds, high-contrast body text, visible focus states, and restrained motion.

## Study Planner Styling Guide

Files of interest:

- `src/pages/StudyPlanner.tsx` (page wrapper)
- `src/features/study-calendar/PlannerView.tsx` (calendar, schedule, widgets and AI modal)
- `src/features/study-calendar/components/Calendar.tsx`
- `src/features/study-calendar/components/Schedule.tsx`
- `src/features/study-calendar/components/TimeLeftWidget.tsx`
- `src/features/study-calendar/styles/planner.css` (layout, glass surfaces and focus rings)

### Fonts
The application uses the system-first Inter stack declared in `src/index.css`. New controls should inherit it.

### Layout Principles

- Responsive flex / grid wrappers (avoid fixed heights where possible)
- Intrinsic sizing for modals (AI Add Task popup auto-sizes to content)
- Consistent spacing scale (Tailwind `gap-*`, `p-*` utilities)
- Avoid magic numbers for vertical alignment; prefer flexbox centering

### Tasks & Time Slots

- Tasks are rendered as accessible interactive elements (`role="button"`, keyboard activation with Enter/Space)
- Font weight & contrast validated against dark background using token values
- Completed state handled via styling class (check `Schedule.tsx` for logic)

### Calendar

- Days are keyboard navigable (`tabIndex=0`)
- `aria-current="date"` applied to the selected day
- Focus ring uses `--primary` for consistent theming

### AI Add Task Modal

- Semantic dialog attributes: `role="dialog"`, `aria-modal="true"`
- Vertically centered via flex container on the viewport wrapper
- Advanced options appear in an auto-fit responsive grid

### Extending Styles

Keep additions token-driven:

```
/* Example: quiet elevated surface */
.planner-surface {
	background: hsl(var(--card) / 0.97);
	border: 1px solid hsl(var(--border));
	box-shadow: 0 10px 28px hsl(var(--background) / 0.25);
}
```

## Accessibility Enhancements

- Calendar & tasks fully keyboard operable
- Focus-visible outlines with sufficient contrast
- ARIA roles/labels for interactive and dialog elements
- Reduced motion friendly (animation kept subtle / removable)

When adding new components, ensure:

1. Keyboard navigation (Enter/Space activation, Escape to dismiss modals)
2. Meaningful `aria-label` or visible text
3. Focus trapping inside modals (if multiple new focusable elements introduced)

## Development

Install & run (Node 22.x required — see `engines` in `package.json`):

```
npm ci
cp .env.example .env.local   # then fill in your keys
npm run dev
```

Build:

```
npm run build
```

## Environment Variables

Copy `.env.example` to `.env.local` for local development. The same variables must be set in **Vercel → Project → Settings → Environment Variables** for production.

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Client | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Client | Preferred public auth key; `VITE_SUPABASE_ANON_KEY` is a supported fallback |
| `SUPABASE_URL` | Server | Same URL, for `/api/waitlist` and JWT verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role key for server-owned database operations — never expose |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Public auth key for JWT verification; `SUPABASE_ANON_KEY` and the client public-key variables are supported fallbacks |
| `ADMIN_EMAILS` | Server | Comma-separated emails allowed to use `/admin/waitlist` |
| `OPENAI_API_KEY` / `ChatbotKey` | Server | AI features (chatbot, notes, quiz, review, papers) |
| `GEMINI_API_KEY` | Server | Study Planner AI (`/api/planner`) — do not use `VITE_` prefix |

See `.env.example` for the full list and optional overrides.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Link the Supabase CLI to the target project and run `npx supabase db push`. The ordered files in `supabase/migrations/` are the only schema source of truth.
   - For local verification, run `npx supabase start` and then `npm run db:test`; this rebuilds a blank database, runs pgTAP contracts, and lints the result.
   - Never paste an individual migration or a stale schema snapshot into SQL Editor as a substitute for the migration ledger.
3. Enable **Email** auth under Authentication → Providers.
   - Keep direct email and general account signup disabled for private beta; accounts are created only by the server after waitlist approval or a verified team invitation.
4. Enable **Google** OAuth for linked-account sign-in. Google Cloud's authorized redirect URI is the Supabase provider callback, `https://<project-ref>.supabase.co/auth/v1/callback`, not the application page.
   - In Supabase Auth URL Configuration, set Site URL to `https://www.vertexed.app` and allow `https://www.vertexed.app/auth/callback`, plus its `?recovery=1` and `?invite=1` variants.
   - Allow local callbacks separately. The checked-in local configuration covers ports 8080 and 5173. A preview on another port needs its own allowlist entry.
   - Enable manual identity linking if offering Connect Google for existing beta accounts. Keep direct signup disabled.
5. Copy **Project URL**, **anon key**, and **service role key** into your env file.
6. Waitlist signups (`/signup`) write to the `waitlist` table via `/api/waitlist` using the service role key.
7. Manage waitlist at **`/admin/waitlist`** (set `ADMIN_EMAILS` in Vercel to your login email) or via Supabase Table Editor.

### Waitlist behavior
- Emails are normalized to lowercase before storage.
- Duplicate emails and existing auth accounts are rejected with clear errors.
- Rate limited to **5 submissions per IP per minute** (stored in `waitlist_rate_limits`).
- Required in production: `WAITLIST_RATE_LIMIT_SALT` salts rate-limit identities. Production fails closed when rate-limit persistence is unavailable.
- **Account creation** (`/api/signup-invite`): requires either a valid team invite code **or** `waitlist.status = approved` for that email. Pending/rejected waitlist emails cannot create accounts without a code.
- Account export (`GET /api/account-export`) returns all cloud artifacts and learner-state rows without silent pagination truncation; Settings adds explicit account-scoped device data before download.
- Account deletion revokes refresh sessions, deletes the Auth identity, and cascades learner-owned rows plus the linked waitlist email.

### Security (AI routes)
- All AI API routes (`/api/ask`, `/api/note`, `/api/quiz`, `/api/transcribe`, `/api/paper-generator`, `/api/review`, `/api/planner`, `/api/notebook`, `/api/board-resource`, `/api/study-guide-chat`) require a valid Supabase session token (`Authorization: Bearer <jwt>`).
- Provider requests have hard deadlines and record only fixed-field operational telemetry; prompts, answers, source text, emails, and provider bodies are not logged.
- `/api/waitlist` remains public (no auth).
- `/api/waitlist-admin` requires auth + email in `ADMIN_EMAILS`.
- `GET /api/health` is public (deploy monitoring).
- Set a public Supabase key on the server for JWT verification. Publishable-key aliases are listed in `docs/ENVIRONMENT_MATRIX.md`; service credentials must never be used as browser keys.
- `GEMINI_API_KEY` is server-only; never expose Gemini keys with a `VITE_` prefix.

## Deployment (Vercel)

- Framework preset: Vite (or leave as Other; `vercel.json` configures the build).
- Build command: `ROLLUP_SKIP_NODEJS_NATIVE=true npm run build` (set in `vercel.json`).
- Install uses `npm ci` for reproducible builds from `package-lock.json`.
- SPA rewrites and API routes are configured in `vercel.json`.

## CI & Testing

GitHub Actions runs on push/PR to `main`:

| Command | Purpose |
|---------|---------|
| `npm run test:app` | VertexED unit, domain, and handler contracts |
| `npm test` | App tests plus preserved cross-project quarantine checks; quarantine is outside app certification |
| `npm run build:ci` | Production build without SEO ping side effects |
| `npm run lint:ci` | Lint the complete application, API, scripts, evals, and tests |
| `npm run db:test` | Rebuild and verify the local Supabase schema (requires `npx supabase start`) |
| `npm run test:e2e:authenticated-golden` | Fresh production build, SDK callback regressions and mocked authenticated learner journey on exclusive local port 14174 |
| `npm run test:e2e:local-accessibility` | Keyboard, responsive layout, and contrast checks against the current build (local port 4175) |
| `npm run ci` | Candidate gate: lint + types + security audit + unit/eval checks + build + bundle budget |
| `npm run test:smoke` | Live checks against `https://www.vertexed.app` (or `SMOKE_BASE_URL`) |

Pre-deploy QA: see [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md).

Current implementation evidence and remaining release gates: [`PROJECT_FINISH_CHECKLIST.md`](PROJECT_FINISH_CHECKLIST.md).

Learner-loop and recovery contract: [`docs/LEARNER_LOOP_AND_RECOVERY.md`](docs/LEARNER_LOOP_AND_RECOVERY.md).

**Launch gate:** [`docs/PRODUCTION_LAUNCH.md`](docs/PRODUCTION_LAUNCH.md)

## Contributing Notes

Styling Consistency Checklist:

- Use design tokens – never raw hex unless adding a new global variable
- Reuse shared utility classes or create a small, purposeful class (avoid deep nesting)
- Inherit the global system-first font stack
- Provide focus styles (rely on `:focus-visible` + outline)
- Test dark mode contrast (use a contrast checker if introducing new combinations)

## Release truth

A green local build is necessary but does not prove production readiness. Apply the current database migrations, deploy the same tested revision, and complete the live smoke and authenticated journey gates in `docs/PRODUCTION_LAUNCH.md` before calling the app ready.
