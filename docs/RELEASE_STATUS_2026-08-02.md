# VertexED Release Status — 2026-08-02

## Release

- Main commit: `a93a408c4ecb8cc8f8b9d09c4f6281833b02eb07`
- Canonical release PR: #9
- Duplicate release PRs #10 and #11: closed as superseded
- Vercel status checks on the merge commit: successful for `vertex-ai` and `vertex-ed-ai`

## Verified before merge

- Clean `npm ci`
- ESLint passed
- TypeScript passed
- Vercel layout validation passed: 1 serverless function, 18 routed endpoints
- No high or critical production dependency audit findings
- 96/96 application and API tests passed
- 20/20 deterministic AI evaluation tests passed
- Vite production build passed with 2,833 modules transformed
- Both Vercel preview deployments reached Ready

## Included hardening

- One canonical `npm run ci` release gate
- Deterministic build lifecycle with indexing work moved to `seo:release`
- Bounded production smoke retries
- Patched `brace-expansion` and PostCSS dependency paths
- Approved-waitlist and team-invite signup paths
- Invite-code UI on `/signup`
- Explicit signup validation and 400/403/503 response contracts
- Rate limiting before shared-code validation
- In-memory protective fallback when database-backed rate limiting is unavailable
- Updated API documentation and regression tests

## Known debt

- Two moderate React Router advisories remain. Automated remediation requires the breaking React Router 7 migration.
- GitHub Actions emits a warning that `actions/checkout@v4` and `actions/setup-node@v4` target a deprecated action runtime; this is not currently failing the release gate.

## Remaining certification evidence

The release is merged and deployed, but must not be called fully end-to-end certified until both items are recorded:

- [ ] Confirm the push-triggered `main` CI run and `smoke-production` job pass against `https://www.vertexed.app`.
- [ ] Complete authenticated production checks with a real test/admin account:
  - [ ] Join waitlist
  - [ ] Approve waitlist entry
  - [ ] Create account from approved link
  - [ ] Create account with a valid team invite code
  - [ ] Log in through supported provider
  - [ ] Exercise chatbot, notes, quiz, paper generation, answer review, and planner
  - [ ] Confirm planner persistence
  - [ ] Log out
  - [ ] Confirm protected routes reject the logged-out session

## Rollback

If production fails, promote the previous healthy Vercel production deployment and investigate the merge commit before redeploying.
