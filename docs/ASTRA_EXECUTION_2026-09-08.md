# VertexED audit and execution report

8 September 2026. Verdict: **FIX. The local product is real; the configured backend is not ready for this client. Do not publish this working tree as a completed release.**

## 1. Project and intended user

VertexED is a private-beta study workspace. A learner selects a subject, plans study, creates practice, records an answer, reviews feedback, confirms evidence and retries a topic. Notes, flashcards, a source notebook, timed mock practice and Apex tutoring support that loop. A baseline exercise is optional, not a validated diagnostic. AI suggestions and self-reported session completion are not measured attainment.

The canonical implementation is React 19/Vite in `src/`, one Node API catchall with 21 registered endpoints, and Supabase Auth/database contracts. `VERTEXED_REPO_ISOLATION.md` excludes unrelated portfolio research from application evidence.

## 2. Initial state and audit boundary

The branch was `codex/vertexed-publication-readiness`, based at `7cc7688712b8e61904ff0b80713d5d25366b7502`, with substantial staged UI/exam work and unstaged integrity work already present. These changes were preserved, not claimed as newly authored here. The initial application suite passed 560 tests. Existing passing tests did not cover several auth races, corrupt device snapshots or the live schema gap.

Inspected route and API ownership, state persistence, schema/migration history, auth handling, content provenance, evaluation boundaries, environment/build/CI configuration, brand memory, git history/diffs and rendered public/authenticated flows. Live database access was read-only and limited to catalog/project/advisor evidence. No learner rows, credentials or private answers were requested. Not every route received a complete real-provider, real-account end-to-end certification.

## 3. Ranked findings

| Priority | Finding and evidence | Disposition |
| --- | --- | --- |
| P0 release | Configured Supabase project lacks learner-state/observability tables, batch sync, atomic rate limiting, readiness RPC and singleton index. Read-only catalog checks returned false for all six. | External schema reconciliation required. No blind migration push. |
| P1 integrity | Corrupt local JSON was interpreted as empty data, exposing it to replacement/autosave. | Fixed: preserve bytes, pause editing, explicit backed-up cloud recovery. |
| P1 auth | Callback requests could hang before a timer was armed; initialization errors and early recovery events could be lost. Initial session restoration could overwrite a newer signout. | Fixed and exercised through actual React components and SDK browser fixtures. |
| P1 config | Readiness accepted `SUPABASE_SECRET_KEY`, while privileged clients, signup and rate-limit guards rejected it. | Unified server-only configuration resolution, with behavioral regression tests. |
| P1 reliability | Local API middleware bypassed the production catchall's CORS, byte limits and body parsing. Chunked artifact writes lacked their intended route-specific limit. | Canonical adapter and 512 KiB artifact limit implemented and tested. |
| P1 release | An older readiness result could pass without supporting `exam_session`. | Added fail-closed client/server gates, a local migration and database assertions. Migration execution remains unverified. |
| P1 evidence | Imported guide corpus: 245 files, zero approved, 53 review flags. No live independent grading or learning-outcome evidence. | Kept quarantine and explicit evidence limits. No approvals or results manufactured. |
| P2 tooling | SDK fixture builds overwrote the normal preview's `dist`. A golden test also matched two legitimate empty-state messages. | Isolated fixture output and strict port; narrowed the locator to the intended sentence. |
| P2 UI | Recovery controls were hidden in empty notebooks, and the planner error panel compressed/clipped mobile controls. | Visible recovery actions, read-only controls, full-width responsive notice and stricter element-bound assertions. |

## 4. Actual changes and important files

- Auth: `src/lib/authReturn.mjs`, `src/lib/supabaseClient.ts`, `src/main.tsx`, `src/pages/AuthCallback.tsx`, `src/contexts/AuthContext.tsx`, local callback allowlist in `supabase/config.toml`.
- Persistence: extended the pre-existing `src/lib/snapshotConcurrency.mjs`, `plannerSync.ts`, `notebookSync.ts`; integrated recovery in `src/pages/StudyNotebook.tsx` and `src/features/study-calendar/PlannerView.tsx`/`styles/planner.css`.
- API: `api/_lib/nodeAdapter.js`, `vite.config.ts`, `api/_lib/routes.js`, server Supabase configuration helpers, signup/rate-limit guards, `api/_handlers/health.js`.
- Release: `supabase/migrations/20260908165433_exam_session_readiness.sql`, `supabase/tests/database/state_sync.test.sql`, `scripts/smoke-deploy.mjs`, read-only `scripts/supabase-security-audit.sql`.
- Verification: auth-return/component/context/recovery/adapter tests, existing test corrections, `e2e/auth-return.spec.ts`, `playwright.golden.config.ts`, build argument forwarding and fixture-output ignore rule.
- Documentation: README, architecture/data-contract docs, environment matrix/example, production and exam release gates, finish checklist and brand QA record.

## 5. Root-cause repairs

Auth returns at the site root now route to the callback without leaving credentials in the final address. Provider errors are terminal and sanitized; late events cannot convert a failed callback into success. PKCE code exchange has one owner. The SDK owns implicit sessions. A short-lived, account-bound in-memory latch retains genuine early recovery events without retaining tokens. A query parameter alone does not grant password-reset or invitation authority. A deadline now covers initialization and exchange themselves.

Session bootstrap uses an event revision so a stale initial result cannot undo signout or switch storage ownership back. Storage exceptions are explicit, not successful empty restores. Raw snapshot bytes are retained in account-scoped backups before explicit cloud replacement; a failed recovery remains read-only. Existing account-scoped queues and conditional revision writes are preserved.

The local development server now sends the original request stream through the same API handler as deployment. Malformed JSON, route/method errors, CORS, request IDs and byte limits have one authority. A real HTTP check additionally caught Vite answering preflight before the plugin ran. Disabled Vite's own cross-origin handling so the API owns preflight and static development assets remain same-origin only; repeated requests verified rejection and security headers. This follows the installed Vite middleware ordering and its [server CORS configuration](https://vite.dev/config/server-options.html#server-cors). Server credential aliases are shared by the privileged client and its readiness/request guards.

## 6. Feature assessment and completed behavior

| Feature | Verified locally | Limit |
| --- | --- | --- |
| Sign-in and recovery | Actual SDK implicit return; rejected/provider-error returns; delayed recovery event; timeout/race/error handling | Real Google/account flow and project redirect settings not certified |
| Planner | Account-bound state, CAS conflicts, corruption preservation, visible recovery, week-plan contracts | Configured database lacks required backend capabilities; no live Gemini call |
| Notes, quizzes, flashcards | Golden journey, saved-work reload, generated-output validation, card identity/schedule preservation tests | Provider content quality is not established by fixture success |
| Answer review and retries | Provisional feedback, human-confirmed correction, evidence and retry restoration in the golden journey | Independent teacher agreement and learning benefit unmeasured |
| Exam Prep | Optional baseline, session selection/history, subject/date/task contracts, golden session journey | `exam_session` migration and real cross-device roundtrip not certified |
| Study Notebook | Source/output contracts, bounded concept-map rendering, raw-data recovery and disabled edits | Live cited generation/audio/import coverage is incomplete |
| Account export/deletion | Account-scoped collection/cleanup and pending-work regression coverage | Real disposable-account revocation, cascade and two-device checks pending |
| Landing/navigation | Blue/white identity, revision trace, fluid effect, keyboard gallery/modal, themes and responsive checks | Design judgment, not a user study or full accessibility conformance audit |
| Guide library | Provenance ledger, honest unavailable state and editorial retrieval quarantine | Zero editorially approved guides |

This pass completed missing recovery/reliability behavior. It did not invent another large feature to obscure release blockers. Existing exam, content-validation and measured-learning work was inspected and verified rather than rebuilt.

## 7. Product improvements

Lost-work recovery is actionable: the learner sees what happened, cannot accidentally overwrite unreadable data, and can open the existing account export or explicitly recover the cloud copy. Auth errors return to a usable login route. Release failures identify missing capabilities instead of treating environment-variable presence as complete readiness. No extra diagnostic/onboarding step was imposed.

## 8. Architecture and dead weight

Retained one router, one API registry, account ownership boundaries, the current schema architecture and existing controls. Removed the duplicated development request parser and duplicated server-configuration guards. Kept strict runtime output contracts distinct from legacy TypeScript feature interfaces; documentation no longer claims universal schema adoption or that RLS protects service-role calls.

Remaining debt is concrete: `tsconfig.app.json` still has `strict: false`; large workspace pages and layered global CSS remain; many older tests assert source patterns rather than behavior. Migrate risky boundaries incrementally, not by flipping strict mode or replacing the app. Quarantined cross-project files were not deleted. The shared remote database is a more serious ownership problem than local file aesthetics.

## 9. Design and content

Preserved the logo, blue/white palette, dark ink surfaces and Attempt/Review/Retry vocabulary. Read all four persistent brand documents before UI changes. Increased auth error readability, surfaced notebook recovery, disabled unavailable source inputs, and moved planner recovery out of the narrow control row. The rendered correction pass also added assertions on individual control bounds; root overflow alone missed clipping.

Captured and inspected corrected recovery screens at 1440, 1024 and 390px in both themes, with keyboard focus and reduced-motion coverage. Captures disable finite animation during the screenshot so an in-progress theme transition is not mistaken for the resting interface. Screenshot files are generated evidence, not committed illustrations. Copy lint found no current source findings; it does not approve factual claims in imported guides.

## 10. Automation

Added regression coverage for root auth returns, callback deadlines/errors, early recovery events, stale auth bootstrap, corrupt planner/notebook recovery and the raw Node API adapter. The existing golden job now includes six auth/recovery cases and builds into ignored `.vertexed-test-dist` on strict port 14174. It cannot replace `dist` used by the ordinary preview. No hosted automation or new dependency was installed.

## 11. Validation observed

| Command/check | Result |
| --- | --- |
| `npm run test:app` | 583 passed, zero failed/skipped; initial baseline was 560 |
| `npm run test:eval` | 25 passed, zero failed/skipped |
| `npm run eval:ask` | Fixture evaluation passed |
| `npm run eval:grading:check` | Frozen six-case synthetic contract gate passed; live model explicitly NOT_RUN |
| `npm run lint:ci` | Full ESLint passed; copy lint 248 files, zero findings; two copy-rule tests passed |
| `npm run typecheck` | Passed under current compiler settings, not strict-mode certification |
| `npm run build:ci` | Passed; latest normal Vite build completed in 12.57 seconds |
| `npm run performance:bundle` | Passed all unchanged gzip budgets; measurements below |
| `npm run audit:prod` | Zero reported production dependency vulnerabilities |
| `npm ls --omit=dev --depth=0` | Exit 0; Linux optional binaries absent on macOS; two extraneous local WASM helper packages, left untouched |
| `npm run content:audit` | 245 inventoried, zero approved, 53 review flags |
| Golden Playwright config, retries 0 | Seven passed, including full approved-learner journey; latest run 46.3 seconds |
| Landing + workbook + accessibility, desktop project | 32 passed; one mobile-only test skipped as inapplicable |
| Accessibility, mobile-390 project | Nine passed, including that mobile-only navigation case |
| `git diff --check` | Passed |
| Real local dev-server HTTP | Five checks passed: liveness 200, unconfigured readiness 503, malformed JSON 400, untrusted preflight 403, wrong method 405; all included request IDs and `nosniff` |
| Remote database catalog/advisors | Read-only checks succeeded and exposed release blockers |
| Local database pgTAP / SQL lint | Not executed: Docker daemon did not respond; no reset attempted |
| Production readiness HTTP | TLS connection failed from this environment, HTTP 000; not proof of global downtime |

Browser fixtures use synthetic identities and network responses, not real tokens. The fresh production build, test build and local tests concern the working tree, not an immutable published revision. No clean `npm ci` reinstall or remote GitHub Actions run was performed in this pass. Existing installed dependencies were exercised; CI still must validate a clean candidate. Scoped audit changes are staged, with prior staged and unstaged work preserved. Tests certify the complete working tree, not an independently validated staged-only commit. Review the remaining inherited changes when assembling the candidate.

## 12. Performance, security and research integrity

Frozen build-budget measurements: initial JS **230,512 gzip bytes** (275,000 budget); initial CSS **38,479** (45,000); largest JS **232,814** (240,000); total JS **989,718** (1,000,000). PDF and markdown remain separate heavy chunks. Total headroom is only 10,282 bytes; avoid additional animation/component dependencies without measuring their cost. No loading-speed improvement is inferred from this repair pass.

| Browser metric | Measurement |
| --- | --- |
| LCP | Not collected; no performance-trace tool available |
| CLS | Not collected; screenshot/overflow tests are not a CLS trace |
| INP | Not collected; no field interaction distribution |

Performance guidance was used for bundle/source analysis and to keep unmeasured Web Vitals explicit. No Lighthouse score is claimed.

The remote project reports ACTIVE_HEALTHY, which describes the service, not application readiness. Supabase advisors reported two security warnings: [leaked-password protection disabled](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) and [Postgres security patches available](https://supabase.com/docs/guides/platform/upgrading). There were 34 informational unused-index findings, many in the other application; none was dropped. Low traffic or a statistics reset does not establish that a constraint/supporting index is unnecessary.

No RLS was disabled and no remote permissions or data were changed. RLS is enabled on the inspected existing profiles, artifact and waitlist tables, but service-role access still requires server ownership checks. The previously shared credential-bearing auth URL was neither reused nor added to source. Its sessions/provider credentials should be revoked by the account owner.

Research evidence remains separated: frozen synthetic fixtures validate contract decisions, not current provider quality; the pilot protocol is preregistered, not a completed learner experiment; guide inventory is not editorial approval. No negative result, threshold, attribution or outcome was rewritten to make the project look complete. Official Supabase [implicit-flow](https://supabase.com/docs/guides/auth/sessions/implicit-flow), [PKCE](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [redirect](https://supabase.com/docs/guides/auth/redirect-urls) and [auth troubleshooting](https://supabase.com/docs/guides/troubleshooting/resolving-500-status-authentication-errors-7bU5U8) guidance informed the auth checks, not an unsupported diagnosis of the reported production error.

## 13. Remaining blockers and required authority

1. **Shared database:** `xwlrzgfuhfbckgvcmyoq` contains FinanceMeta migrations and both products' Auth creation triggers. VertexED's September learner-state/readiness migrations are absent. Need confirmed cross-product ownership, backup and a disposable rehearsal environment before migration reconciliation. No destructive migration repair or blind push is safe here.
2. **Database validation:** need responsive Docker or isolated CI Postgres to execute the ordered ledger, pgTAP permissions/two-account tests and the new exam-session assertions. Catalog inspection is not SQL execution validation.
3. **Production ownership/configuration:** need the owning Vercel team/project, environment verification and reachable candidate/custom-domain health with exact revision. No Vercel deployment connector was available. A prior preview URL is not production evidence.
4. **Real integrations:** local environment provides only public Supabase client configuration, not AI/service credentials. Need disposable approved users, actual provider calls, email delivery, Google linking/recovery, offline/two-device export and deletion checks. Shared Auth signup settings must be coordinated with the other product.
5. **Educational release evidence:** need licensed editorial approval for promised scopes and independent human grading evaluation. These require real reviewers/content rights, not code-generated approvals.

## 14. Highest-value remaining work

After the blockers, prioritize a small validated subject/paper scope rather than more decorative tools. Rehearse migrations and account isolation first; run the exact release revision through clean CI and real smoke checks second. Then validate one reviewed curriculum slice and pilot the Attempt/Review/Retry loop. Incrementally replace source-regex tests and unchecked legacy storage shapes with behavioral tests and runtime schemas. Consolidate the older planner CSS only while preserving calendar behavior.

## 15. Scores and final verdict

These are engineering judgments, not measured product benchmarks.

| Area | Score / 10 | Remaining gap |
| --- | --- | --- |
| Functionality | 7 | Local loop works; required remote capabilities absent |
| Engineering | 7 | Good boundaries and tests; legacy types and oversized pages |
| Reliability | 7 | Better races/recovery; no live two-device or DB certification |
| Design | 7 | Distinct landing and readable themes; older workspace density still uneven |
| Organization | 6 | Canonical boundary exists; mixed historical tree/shared database remains |
| Documentation | 8 | Current behavior and blockers recorded; historical reports need date-aware reading |
| Maintainability | 6 | Mixed contract adoption, layered CSS and source-based tests |
| Overall readiness | 4 | Missing backend capabilities and unverified production/educational gates |

**PROJECT STATUS: Salvageable. FINAL VERDICT: FIX.** Keep the real learning workflow, restore backend parity safely, then certify a narrow beta. Neither a rewrite nor another visual overhaul resolves the current release blocker.

## 16. Run and verify

Use Node 22.22.x and npm 10.9.8. Populate `.env.local` from `.env.example` with real values outside source control.

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 8080
npm run ci
npm run test:e2e:authenticated-golden
npm run build:ci
npm run preview -- --host 127.0.0.1 --port 4186 --strictPort
```

The dev server mounts the API; Vite preview serves static files only. Stop an existing server or choose another free port before starting a duplicate. The golden suite starts its own isolated port 14174 server and intercepts integrations.

On a **disposable local database only**, after Docker works:

```sh
npx supabase start
npm run db:test
```

`db:test` resets the local database. Do not run it against shared/persistent data. Remote deployment remains on hold: review the target and migration diff, rehearse, obtain shared-project approval, apply the approved sequence, then deploy the reviewed candidate through the owning Vercel project. Finally run `npm run test:smoke` and the real-account checks in `docs/PRODUCTION_LAUNCH.md`. No commit, push or deployment was made by this audit pass.
