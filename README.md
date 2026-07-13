VertexED.ai is an all‑in‑one study hub aiming to make the process of education better for all.

## Overview

This project brings together AI assisted study utilities (notes, quiz, paper generator, answer reviewer, chatbot, study planner) in a single modern, accessible web app built with:

- React + TypeScript (Vite)
- Tailwind CSS with a small layer of custom design tokens (HSL variables) for dark/light theming
- Supabase (auth + data)
- Serverless / edge functions (API route scripts)

## Key Features (current focus)

- AI Note Taking & Quiz Generation
- Verified practice from administrator-approved, authorized assessment content (unavailable until it passes rights and human-review gates)
- Study Planner (calendar + schedule + AI task suggestions)
- Assistive answer feedback & chatbot (non-deterministic grading is explicitly withheld)

## Design Tokens & Theming

The UI relies on CSS custom properties defined globally (see `index.css`). Core tokens include:

```
--background
--foreground
--card
--primary
--accent
--border
```

Planner-specific styling now consumes ONLY these tokens (no hard‑coded hex colors) to ensure visual consistency with the rest of the app. Any additional color nuance (e.g. subtle gradients or glass effects) is derived using transparency (`background: hsl(var(--card) / 0.7)`) or layered shadows rather than introducing new brand colors.

## Study Planner Styling Guide

Files of interest:

- `src/pages/StudyPlanner.tsx` (page wrapper)
- `src/app/.../PlannerView.tsx` (main orchestrator – calendar, schedule, widgets, AI modal)
- `src/app/.../Calendar.tsx`
- `src/app/.../Schedule.tsx`
- `src/app/.../TimeLeftWidget.tsx`
- `planner.css` (theme-aligned custom rules – font, layout refinements, glass surfaces, focus rings)

### Fonts
The entire planner enforces the project primary font `"Sen", sans-serif`. If you add new interactive elements, rely on inheritance; only explicitly set the font where browser default widgets might override it.

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
/* Example: subtle elevated surface */
.planner-surface {
	background: hsl(var(--card) / 0.75);
	backdrop-filter: blur(12px) saturate(140%);
	box-shadow: 0 4px 10px -2px hsl(var(--background) / 0.6), 0 0 0 1px hsl(var(--border) / 0.4);
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

Install & run (Node 22.x recommended — see `engines` in `package.json`):

```
npm install
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
| `VITE_SUPABASE_ANON_KEY` | Client | Supabase anon key (auth) |
| `SUPABASE_URL` | Server | Same URL, for `/api/waitlist` and JWT verification |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Service role key (waitlist only — never expose) |
| `SUPABASE_ANON_KEY` | Server | Anon key for verifying user JWTs on AI API routes |
| `ADMIN_EMAILS` | Server | Comma-separated emails allowed to use `/admin/waitlist` |
| `OPENAI_API_KEY` / `ChatbotKey` | Server | AI features (chatbot, notes, quiz, review, papers) |
| `GEMINI_API_KEY` | Server | Study Planner AI (`/api/planner`) — do not use `VITE_` prefix |

See `.env.example` for the full list and optional overrides.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Run `supabase/schema.sql` in **SQL Editor** (creates `profiles`, `waitlist`, rate-limit table, and RPCs).
   - If you already ran an older schema, also run `supabase/migrations/20260708_phase3_waitlist_auth.sql`.
   - For planner cloud sync: run `supabase/migrations/20260711_planner_artifact_kind.sql`.
   - For verified practice, provenance, mastery, and spaced review: run `supabase/migrations/20260712_core_learning_exam_architecture.sql`.
3. Enable **Email** auth under Authentication → Providers.
4. Enable **Google** OAuth if using Google login; set redirect URL to:
   - Local: `http://localhost:8080/auth/callback`
   - Production: `https://www.vertexed.app/auth/callback`
5. Copy **Project URL**, **anon key**, and **service role key** into your env file.
6. Waitlist signups (`/signup`) write to the `waitlist` table via `/api/waitlist` using the service role key.
7. Manage waitlist at **`/admin/waitlist`** (set `ADMIN_EMAILS` in Vercel to your login email) or via Supabase Table Editor.

### Waitlist behavior
- Emails are normalized to lowercase before storage.
- Duplicate emails and existing auth accounts are rejected with clear errors.
- Rate limited to **5 submissions per IP per minute** (stored in `waitlist_rate_limits`).
- Optional env: `WAITLIST_RATE_LIMIT_SALT` to salt IP hashes.
- **Account creation** (`/api/signup-invite`): requires either a valid team invite code **or** `waitlist.status = approved` for that email. Pending/rejected waitlist emails cannot create accounts without a code.

### Security (AI routes)
- All AI and assessment routes require a valid Supabase session token (`Authorization: Bearer <jwt>`). `/api/paper-generator` is intentionally retired: VertexED does not fabricate exam papers.
- `/api/waitlist` remains public (no auth).
- `/api/waitlist-admin` requires auth + email in `ADMIN_EMAILS`.
- `GET /api/health` is public (deploy monitoring).
- Set `SUPABASE_ANON_KEY` on the server (same value as `VITE_SUPABASE_ANON_KEY`) for JWT verification.
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
| `npm test` | Unit + handler smoke tests (auth, waitlist validation, `/api/ask` 401) |
| `npm run build:ci` | Production build without SEO ping side effects |
| `npm run lint:ci` | Lint `api/lib` and `tests` only |
| `npm run ci` | Full local CI: lint + test + build |
| `npm run test:smoke` | Live checks against `https://www.vertexed.app` (or `SMOKE_BASE_URL`) |
| `npm run validate:prod-env` | Explicit deployment-secret gate; run only where production secrets are injected |

Pre-deploy QA: see [`docs/QA_CHECKLIST.md`](docs/QA_CHECKLIST.md).

**Launch gate:** [`docs/PRODUCTION_LAUNCH.md`](docs/PRODUCTION_LAUNCH.md)

## Contributing Notes

Styling Consistency Checklist:

- Use design tokens – never raw hex unless adding a new global variable
- Reuse shared utility classes or create a small, purposeful class (avoid deep nesting)
- Maintain font: `Sen` for all textual UI
- Provide focus styles (rely on `:focus-visible` + outline)
- Test dark mode contrast (use a contrast checker if introducing new combinations)

## Future Improvements (Ideas)

- Mobile-specific condensed planner layout
- Task categories / color coding via token hue shifts
- Animation preference toggle (reduced motion)
- Drag & drop task rescheduling

---

This document will evolve as new features/components are added. Feel free to extend sections with implementation details or architectural decisions.

✨✨😊😁
