# Publication readiness slice inventory — 2026-09-19

Parked study-UI salvage lived on `salvage/study-ui-refine-20260919` / related `salvage/*` branches. **Do not merge wholesale.**

## Landed as thin slices (non-exhaustive)

Ops/reliability, learner libs, MYP, global search, exam setup, graphing/calculator, a11y modal, Apex appearance/chat/portal, staging evidence, landing/nav polish, health contract v3, apex reaction fallbacks, authUi login/reset — see `git log --oneline` on `main` for #908–#964 range.

## Still parked / avoid

- Agents network UI/API → draft **#917** only (do not undraft until intentional prod smoke + a11y Escape/focus fixed).
- Salvage deletions that strip GlobalStudySearch CSS, a11y contract tests, or waitlist ProtectedRoute coverage.
- API handler dumps (`ask`/`quiz`/`transcribe`/…) without isolated review.
- Onboarding polish that failed account-scope serialization tests (#952).

## Before any further salvage PR

1. Diff only the intended paths against current `origin/main`.
2. Prefer additive files + tests; reject net test deletions unless obsolete on main.
3. `npm run typecheck && npm run test:app` (or focused suite) green.
4. Ignore Vercel rate-limit failures; require `build-and-test` pass.
