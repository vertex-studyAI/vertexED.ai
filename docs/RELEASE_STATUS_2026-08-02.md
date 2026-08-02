# VertexED Release Status — 2026-08-02

## Release identifiers

- Application release commit: `a93a408c4ecb8cc8f8b9d09c4f6281833b02eb07`
- Public production-certification commit: `1f88db2adb70a52acf06457b577848ad9100fe39`
- Canonical release PR: #9
- Public browser-certification PR: #12
- Duplicate release PRs #10 and #11: closed as superseded after preserving their useful changes
- Vercel deployments for `1f88db2a`: successful in both `vertex-ai` and `vertex-ed-ai`

## Verified release gate

GitHub Actions run `30730199717` passed on the exact certification head merged by PR #12.

- Clean `npm ci`: 659 packages installed
- ESLint: passed
- TypeScript: passed
- Vercel layout validation: 1 serverless function and 18 routed endpoints
- Production dependency audit: no high or critical production findings
- Application and API tests: 96/96 passed
- Deterministic AI evaluations: 20/20 passed
- Vite production build: 2,833 modules transformed; completed in 8.63 seconds
- GitHub Actions runtime upgrades: `checkout@v5`, `setup-node@v6`, and `upload-artifact@v7`

## Live public production certification

The Playwright suite ran directly against `https://www.vertexed.app` and passed 52/52 checks in 36.9 seconds.

Viewport profiles:

- 1440 × 900 desktop
- 768 × 1024 tablet
- 390 × 844 mobile
- 375 × 812 mobile

Verified behavior:

- Homepage, login, and signup render meaningful content
- Team-invite account flow is exposed without revealing the server invite code
- Logged-out users do not receive protected admin content
- `/`, `/signup`, and `/login` have no horizontal overflow at all tested widths
- Keyboard navigation reaches a visible focus target
- Unknown client routes render a recoverable page
- `/api/health` returns HTTP 200 with the VertexED API marker
- Unknown API routes return HTTP 404
- Logged-out requests to protected APIs return HTTP 401
- Untrusted cross-origin API requests return HTTP 403
- Malformed waitlist email input returns HTTP 400 without creating data

Evidence artifact:

- Name: `playwright-production-report`
- Artifact ID: `8827720460`
- SHA-256: `e8a7aa1742b9ed2d94346e4c8a408a988cf2ca70db0280c46be92e28154849bf`
- Retention: 14 days from the certification run

## Included hardening

- One canonical `npm run ci` release gate
- Deterministic build lifecycle with indexing work moved to `seo:release`
- Bounded production smoke retries
- Patched `brace-expansion` and PostCSS production dependency paths
- Approved-waitlist and team-invite signup paths
- Team invite-code UI on `/signup`
- Explicit signup validation and 400/403/409/429/503 response contracts
- Rate limiting before shared-code validation
- Protective in-memory fallback when database-backed rate limiting is unavailable
- Live desktop, tablet, and mobile browser certification in CI
- Authoritative environment-variable matrix in `docs/ENVIRONMENT_MATRIX.md`
- Read-only Supabase verification queries in `docs/PRODUCTION_SQL_CHECKS.sql`
- Updated API documentation and regression tests

## Known limitations and debt

- Two moderate React Router advisories remain. Automated remediation requires the breaking React Router 7 migration and must be handled on a dedicated branch with route and authentication regression coverage.
- A clean install reports four total dependency-tree findings because development dependencies are included; the production-only audit has no high or critical findings.
- Public and logged-out production behavior is certified. Authenticated administration, account creation, OAuth, live AI-provider calls, and cross-session persistence require disposable credentials or dashboard access and are not claimed complete.
- Production environment-variable presence and Supabase RLS/provider configuration cannot be inferred from green builds alone.

## External certification boundary

Issue #13 is the authoritative remaining checklist. It requires non-secret access to:

- one disposable allowlisted administrator account
- one disposable approved beta-user journey, or permission to create and approve it
- the production Supabase project for read-only verification

The remaining steps are:

- Join and approve a production waitlist entry
- Create an account from the approved link
- Create a separate account with a valid team invite code
- Log in with email/password
- Complete Google OAuth and verify callback routing
- Exercise chatbot, notes, quiz generation, paper generation, answer review, and planner
- Save and retrieve planner content after a fresh session
- Log out and confirm protected pages and APIs reject the session
- Run `docs/PRODUCTION_SQL_CHECKS.sql` and record only pass/fail evidence
- Verify production variables against `docs/ENVIRONMENT_MATRIX.md` without exposing values

## Rollback

1. In each Vercel project, identify the last healthy production deployment before the suspect commit.
2. Promote that deployment instead of rebuilding unverified code.
3. Confirm `/api/health`, homepage, login, signup, unauthorized API behavior, and mobile navigation.
4. Revert the offending Git commit on a dedicated branch; do not force-push shared history.
5. Run `npm ci`, `npm run ci`, and the live Playwright certification before redeploying.
6. Rotate credentials only when exposure or misuse is suspected; never paste values into issues or logs.

## Post-launch monitoring checklist

- Watch both Vercel projects for build/runtime errors and unexpected divergence
- Review repeated 4xx/5xx responses by route without logging sensitive prompt content
- Monitor Supabase authentication, database, and rate-limit-table errors
- Track AI-provider failure rates separately for chatbot, notes, quiz, paper, review, and planner
- Check waitlist submission → approval → signup conversion
- Check signup → first successful action conversion
- Check planner save/retrieval failures
- Triage user reports against the production commit and request ID
- Keep `/api/health` under an external uptime check
- Record incident owner, rollback owner, and key-rotation owner

## Seven-day hardening backlog

Issue #14 contains the bounded post-launch hardening window. Major new features are excluded until the authenticated certification boundary is closed.