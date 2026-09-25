# VertexED launch readiness

> Current completion scope: [complete-product publication checklist](PUBLISHABLE_COMPLETION_CHECKLIST.md) and [gate register](COMPLETION_GATE_REGISTER.json). Results and statuses below are historical; they do not certify the current release.

**Assessment date:** 2026-09-20  
**Decision:** **NO-GO**  
**Assessed source:** local checkout `b009c9ab` plus preserved working-tree changes

`PASS` requires current proof in the relevant environment. A green source test cannot turn production or educational evidence into a pass.

The checkbox-based operational sequence is in `docs/FINAL_READINESS_CHECKLIST.md`.

## Checklist

| Area | Status | Proof or gap |
|---|---|---|
| Build | PASS | `npm run build:ci`; 2,617 modules transformed; revision stamp generated. |
| Lint | PASS | `npm run lint:ci`; ESLint, copy lint and copy tests passed with 0 copy findings. |
| Typecheck | PASS | `npm run typecheck`. |
| Unit/application tests | PASS | `npm run test:app`; 1,072 passed, 0 failed, 0 skipped. |
| Evaluation tests | PARTIAL | 25 eval tests, 13 ask fixtures and 6 grading fixtures pass; live provider run is `NOT_RUN`. |
| Integration tests | PARTIAL | API/persistence contracts pass in the app scope; SQL migration/pgTAP execution was blocked by the local container runtime. |
| Critical journeys | UNVERIFIED | Local selected journeys pass, but no exact-revision production signup-to-value/save-return/export-delete receipt exists. |
| Authentication | PARTIAL | Supabase session, route and bearer flows are implemented/tested locally; production invite/recovery/expiry/OAuth are unverified. |
| Authorization | PARTIAL | Independent API auth and owner filters exist; live RLS and two-account IDOR proof are absent. |
| Security headers | PARTIAL | HSTS, CSP, frame, MIME, referrer, permissions and API no-store/noindex are configured and source-tested; custom domain cannot be reached. |
| Input validation | PASS locally | Central method/body/JSON enforcement and endpoint schemas are exercised by app tests. |
| Rate limits | PARTIAL | Durable database limiters and fail-closed production behaviour exist; production readiness for the store is degraded. |
| Database permissions | UNVERIFIED | Policies/grants exist in migrations; isolated SQL execution did not complete. |
| Secrets | PARTIAL | `.env.local` is ignored and no tracked local secret file was found; remote Vercel/Supabase scopes were not audited. |
| Dependency vulnerabilities | PASS | Network-enabled `npm run audit:prod` found no high or critical production vulnerabilities. |
| Error handling | PASS locally | Provider, auth, persistence, malformed input, timeout and corruption paths have explicit states/tests. |
| Monitoring | PARTIAL | Privacy-safe telemetry, Vercel Analytics and Speed Insights are integrated; persistence, alerts and incident ownership are unverified in production. |
| Analytics | PARTIAL | First-core-action and product events are sanitised; production funnel correctness and consent/retention operation were not inspected. |
| Mobile | PASS for selected public routes | 390px landing/login/signup case passed; landing capture had no horizontal overflow but is 18,308px tall. Complete authenticated coverage remains unverified. |
| Accessibility | PARTIAL | Selected 1440/1024/390 keyboard, focus and reduced-motion checks passed; no complete authenticated/browser matrix was rerun. |
| Performance | PARTIAL | Frozen bundle gate passes: 234,273 B JS and 34,506 B CSS initial gzip. Current CWV/trace/field evidence is absent. |
| SEO | PARTIAL | Sitemap, robots, canonical, metadata, structured data and social metadata exist; custom-domain crawlability is blocked. |
| Metadata/social preview | PASS locally | Shared SEO component and committed preview references are present; public fetch was not verified. |
| Payments | N/A | No payment/billing system is part of the private-beta product. |
| Email | UNVERIFIED | Waitlist/invite/recovery surfaces exist; provider-side delivery was not exercised. |
| Privacy | PARTIAL | Privacy policy and content-excluding telemetry controls exist; remote retention and operational compliance were not audited. |
| Terms/legal trust | PARTIAL | Terms/privacy pages exist; educational/content claims and final legal review remain human gates. |
| Content approval | FAIL | 245 guide files, 0 approved, 53 flagged; sitemap correctly publishes 0 approved guide URLs. |
| Backups/recovery | UNVERIFIED | Client corruption recovery exists; remote database backup/restore proof and RPO/RTO are absent. |
| Deployment configuration | FAIL | Custom domain TLS fails before HTTP; fallback readiness returns HTTP 503 degraded. |
| Release provenance | FAIL | Checkout is dirty, explicitly non-canonical and 12 commits behind `origin/main`. |
| Rollback | UNVERIFIED | Source-bound health and rollback concepts exist, but no rehearsal for this candidate was available. |

## What is now verified

- The current dirty application source lints, typechecks and builds under Node 22.22.0.
- The app scope passes 1,072 tests and the offline eval harness passes its fixture gates.
- The final build remains within all frozen gzip budgets.
- The selected landing, guided-reasoning, feature and auth responsive checks pass at the tested viewports; the corrected 390px case passes.
- API routes are centrally allowlisted and the build contains one Vercel Serverless Function for 22 endpoints.
- The production dependency audit reports no high or critical runtime vulnerabilities.
- Unapproved study guides are excluded from the generated sitemap.
- An unauthenticated request to the production fallback agents endpoint returns 401.

## What was fixed

1. `Home` is lazy-loaded behind the auth redirect. Initial gzip moved from the failing audit baseline to 234,273 B JavaScript and 34,506 B CSS, saving about 20 KB JS and 11 KB CSS at startup.
2. Unverified institutional-support copy was replaced with an evidence-aligned explanation of the connected revision trace.
3. Regression tests now protect the lazy route boundary and public claim boundary.
4. The 390px three-page full-capture Playwright case receives a visual-only 90s budget; interaction and assertion timeouts remain unchanged. It passes in the isolated rerun.
5. Audit, architecture, execution, QA, launch and work-session control documents now describe the current evidence and blockers.

## What remains unverified

- A clean exact-revision candidate and production deployment identity.
- Production database readiness, migrations, RLS, grants and two-account isolation.
- Production invite, login, OAuth, recovery, expiry, save/return, export and deletion.
- Live AI provider quality, fallback, timeout, cost and quota behaviour.
- SMTP/email delivery, remote secrets/key scopes and network restrictions.
- Backup restore, monitoring alerts, incident response and rollback rehearsal.
- Complete authenticated accessibility/browser coverage and current Core Web Vitals.
- Educational accuracy/approval and any efficacy or calibrated-grade claim.

## Known defects

1. `www.vertexed.app` fails TLS before HTTP.
2. The fallback deployment returns readiness 503 degraded.
3. The current tree is not a valid release candidate.
4. No study guide has editorial approval.
5. The mobile landing is extremely long even though it remains responsive.
6. Declared npm 10.9.8 is not explicitly installed in CI and differs from the local Node 22.22.0 bundle.

## P0 blockers

1. Restore custom-domain transport.
2. Restore production readiness to 200 for the exact release revision.
3. Produce a clean source-bound candidate.
4. Pass isolated migration/pgTAP and live two-account authorization tests.
5. Resolve content publication approval for any guide intended to be indexed.
6. Pass exact-revision production critical journeys.

## P1 follow-ups

1. Certify authentication, recovery and account lifecycle.
2. Run the bounded live-provider evaluation.
3. Audit remote database/key/network/backup settings.
4. Verify telemetry persistence and alerts.
5. Align npm toolchain declarations and CI.
6. Complete the authenticated responsive/accessibility matrix.

## Post-launch items

Only after the P0/P1 evidence is complete:

- unified revision timeline;
- saved-work search and retrieval;
- integrated retry calendar;
- privacy-controlled artefact sharing;
- authorised teacher/tutor confirmation;
- curriculum objective search;
- longitudinal measured-evidence summaries;
- evaluation-fixture feedback loop.

## Rollback and risk notes

- Keep database migrations forward compatible. Do not remove an applied production migration during rollback.
- Deploy tolerant readers before versioned writers for changed artefact payloads.
- Record the previous healthy application revision and validate it against the current schema before promotion.
- Treat readiness failure, source mismatch, RLS failure or auth lifecycle failure as automatic rollback/no-go conditions.
- Do not publish unapproved content or reinterpret fixture scores as learner outcome evidence during incident pressure.

The release remains **NO-GO** until every P0 item has a current `PASS` receipt tied to one deployable revision.
