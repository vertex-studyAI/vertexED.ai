# VertexED Stage 08 — UX, accessibility, responsive and performance pass

**Gate: PASS locally.** The production build transforms 2,767 modules and validates one
Vercel function with 19 routes. Sequential Playwright verification passes eight
applicable keyboard/focus/contrast/responsive checks across 375, 390, 768, 1024 and
1440 px plus the mobile navigation inert/focus-restoration check. Public launch journeys
pass 8/8. A stale invite-flow assertion was corrected to require email verification
before password creation.

Commands: `npx playwright test e2e/local-accessibility.spec.ts --project=desktop-1440
--workers=1` (8 pass, 1 inapplicable mobile test); the mobile navigation grep (1/1);
and the public-launch grep (8/8). High parallelism was discarded as invalid evidence
after headless WebGL resource contention caused timeouts; the bounded sequential rerun
was clean.

Truth boundary: this is a local Chromium audit, not a full screen-reader/user study or
exact-revision production browser certification.
