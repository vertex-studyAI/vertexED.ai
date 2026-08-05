# Bu1LD Immutable Source Release Certification

## Purpose

Independently rerun the non-secret release gate from `ryangomez010/bu1ld-landing` instead of relying only on its committed completion report.

## Immutable input

- Repository: `ryangomez010/bu1ld-landing`
- Commit: `daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`
- Lockfile: committed `bun.lock`, installed with `bun install --frozen-lockfile`
- Command: `bun run release:check`
- Bun: `1.3.14`
- Runner: Ubuntu 24.04, Linux x64
- Public build configuration: explicit synthetic non-secret values; no production Supabase project or key was used

## Certified result — 5 August 2026

Workflow run `31021241912` completed successfully.

The immutable checkout passed:

- TypeScript type checking;
- 152 tests across 32 files with 435 assertions and zero failures;
- ESLint;
- production client build;
- production SSR build;
- production-copy and unsupported-claim scans;
- migration presence and security-invariant checks through `phase33.sql`;
- required release-artifact checks.

The target release script ended with `Code release checks passed` and retained the explicit instruction to run the strict deployment-environment gate before release.

Evidence artifact:

- Name: `bu1ld-source-release-31021241912`
- Artifact ID: `8936696356`
- SHA-256: `49d8f3acac568785b1eaa0d46874eeafea43aa0b02c3a77cda27508cbdb834ca`
- Files: immutable environment record and full release-check log
- Retention: 14 days

## Boundary

This source certification uses no production secrets and makes no production-readiness claim. It does not run `release:prod`, query the live Supabase project, verify deployed RLS, send email, authenticate users, test role separation, or certify Cloudflare deployment health. Those remain in issue #16.

The separate public-browser diagnostic found live hydration and deployment-skew defects and remains draft in PR #79, tracked by issue #84. A passing source build does not override those production findings.
