# Bu1LD Immutable Source Release Certification

## Purpose

Independently rerun the non-secret release gate from `ryangomez010/bu1ld-landing` instead of relying only on its committed completion report.

## Immutable input

- Repository: `ryangomez010/bu1ld-landing`
- Commit: `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`
- Lockfile: committed `bun.lock`, installed with `bun install --frozen-lockfile`
- Command: `bun run release:check`

## Expected gate

The target release script must complete:

- TypeScript type checking;
- Bun tests;
- ESLint;
- production client and SSR builds;
- production-copy and unsupported-claim scans;
- migration presence and security-invariant checks through `phase33.sql`;
- required release-artifact checks.

The workflow records the exact target commit, Bun version, runner, full command output, and retained artifact identifier.

## Boundary

This source certification uses no production secrets and makes no production-readiness claim. It does not run `release:prod`, query the live Supabase project, verify deployed RLS, send email, authenticate users, test role separation, or certify Cloudflare deployment health. Those remain in issue #16.
