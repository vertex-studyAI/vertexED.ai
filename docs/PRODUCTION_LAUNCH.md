# VertexED.ai — Production Launch

Use these evidence-based gates before expanding the private beta. Passing a local build does not certify live providers, database permissions, or educational accuracy.

## Automated (run locally or in CI)

```bash
npm run ci          # lint:ci + validate + prod audit + tests + build
npm run test:smoke  # live checks against www.vertexed.app (after deploy)
```

## Vercel environment (required)

| Variable | Required |
|----------|----------|
| `VITE_SUPABASE_URL` | Yes |
| `VITE_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` | Yes |
| `SUPABASE_URL` | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` or `SUPABASE_SECRET_KEY` | Yes, server only |
| `SUPABASE_PUBLISHABLE_KEY` or `SUPABASE_ANON_KEY` | Public auth key; client public-key aliases also supported |
| `OPENAI_API_KEY` or `ChatbotKey` | Yes |
| `GEMINI_API_KEY` | Yes (Study Planner) |
| `ADMIN_EMAILS` | Yes (waitlist admin UI) |
| `SIGNUP_INVITE_CODE` | Yes (invite signup) |
| `WAITLIST_RATE_LIMIT_SALT` | Yes (random secret for IP hashing) |

Remove `VITE_GEMINI_API_KEY` if still set — Gemini is server-only.

## Supabase (required)

**Hold for schema reconciliation, 8 September 2026:** a read-only audit of the configured project `xwlrzgfuhfbckgvcmyoq` found no learner-state table, observability table, readiness RPC, batch-sync RPC, atomic rate-limit RPC or singleton artifact index. Its ledger also contains FinanceMeta migrations, and Auth has both VertexED and FinanceMeta user-creation triggers. Do not run a blind `db push`, migration repair or reset against this shared project. Confirm ownership, back up, rehearse the ordered VertexED changes on a disposable clone, and review effects on the other application first. No remote database mutations were made during this audit. See [the execution report](./ASTRA_EXECUTION_2026-09-08.md).

1. Run `npx supabase start && npm run db:test` on a clean local stack. The test command resets local data; never point it at a live database.
2. Review the target project and migration plan before running `npx supabase db push`; `supabase/migrations/` is the application's schema source of truth, not evidence that a shared remote database matches it. Run the read-only `scripts/supabase-security-audit.sql` preflight and reconcile divergent migration histories before any push.
3. Confirm the migration ledger includes every ordered file through `20260908165433_exam_session_readiness.sql`, including `20260908105340_exam_session_history.sql`. Validate first, then apply before releasing exam-session writers.
4. Confirm `/api/health?readiness=1` reports `databaseConnection`, `atomicRateLimitRpc`, `learnerStateStorage`, `batchLearnerStateSync`, `examSessionStorage`, `observabilityStorage`, and `singletonIntegrity` as `true`.
   - If it reports historical singleton duplicates, stop and reconcile those learner-owned rows explicitly; the migration intentionally deletes nothing.
5. Enable Email + Google OAuth, but disable direct signup in Auth settings so private-beta account creation remains server-gated.
6. Supabase Site URL: `https://www.vertexed.app`. Allow the application callback `https://www.vertexed.app/auth/callback` and its recovery/invitation query variants, plus explicitly trusted development origins. Google Cloud's redirect URI is the Supabase `/auth/v1/callback`, not this application callback. Enable manual linking for Connect Google.

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
- **Dependency readiness:** `GET https://www.vertexed.app/api/health?readiness=1` checks database capabilities and provider-key presence. It does not call or certify the AI providers. Live provider checks remain a separate release gate.
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

## Release criteria

- [ ] All env vars set on Vercel
- [ ] Supabase migration ledger + auth configured; deep readiness is green
- [ ] `npm run ci` passes
- [ ] `npm run test:smoke` passes on production
- [ ] QA checklist completed (desktop + mobile)
- [ ] GitHub Actions CI green on `main`
- [ ] Editorially approved, licensed content exists for every publicly promised guide scope
- [ ] Real provider smoke checks and independent grading evaluation support the promised capabilities
- [ ] Snapshot conflicts, offline recovery, account export, and deletion are exercised against the target database

Record the candidate revision and supporting evidence when all gates pass. Continue monitoring real learner outcomes after release. See `PROJECT_FINISH_CHECKLIST.md` for the current local validation and unresolved external gates.
