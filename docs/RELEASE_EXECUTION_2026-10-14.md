# VertexED release execution — 14 October 2026

**Decision: NO-GO.** Local feature validation has advanced, but the production
domain and service readiness fail. No deployment or database mutation was made.

## Completed in this pass

- Confirmed all 15 source hashes and the built HTML hash in
  `evidence/formula-desk-20261014.json` match this checkout. Its retained logs
  record 1,374 application tests and 10 production-bundle browser tests passing.
  Those suites were not rerun in this pass.
- Fresh production dependency audit passed: no high or critical vulnerabilities.
- Fresh copy lint passed: 401 files, zero findings. The earlier full lint receipt
  retains two React hook warnings; they are not suppressed by this result.
- Fresh function validation passed: one Vercel function, 23 routed endpoints.
- Fresh content inventory passed: 245 imported guides, zero approved, 53 flagged.
- Fresh evaluation tests passed: 25 tests; Ask fixture evaluation passed 13/13;
  grading contract validation passed. These use synthetic fixtures, not live AI.
- Added three release browser suites to `.github/workflows/ci.yml`, bound to the
  candidate source SHA: formula/library, AI content/notebook, and MYP/product
  journeys. Production smoke now depends on all three. YAML parsing and test
  discovery were checked; the new CI job has not run remotely.
- The new MYP/product configuration discovers 95 cases in 18 files and reuses
  the isolated fixture build. Formula/library discovers 10 cases in two files.

## Fresh production findings

The initial sandbox probe could not resolve any host. The network-enabled retry
at 2026-10-14T11:31:57Z establishes the following, superseding that diagnostic:

- Both `vertexed.app` and `www.vertexed.app` fail TLS before HTTP. DNS returns
  `104.219.250.37` and `2.59.170.20`; the probe found no www CNAME.
- Both known Vercel fallback hosts return liveness 200 and readiness 503 on
  revision `2b0b51c5a0df8fd42af74252fabc5d8aec6d29e6`.
- Local base HEAD is `e28f24ff1c051eaa91b5443a79fe392987d0c688`, with extensive
  uncommitted product changes. Neither live host establishes this candidate.
- The CLI is authenticated as `build-the-future-11`, but its sole available team
  does not contain VertexED. Domain inspection denies access and deployment
  inspection cannot find the VertexED fallback in that team.
- No local `.env` or `.env.local` or relevant provider/readiness environment
  variable is available. Protected deployment diagnostics and real-provider
  evaluation remain unavailable through the current local configuration.

## Fresh hosted database findings

The connected project `xwlrzgfuhfbckgvcmyoq` is healthy. Its readiness RPC returns
true for atomic rate limits, exam storage, singleton integrity, learner-state
storage, observability storage and batch learner-state sync. This does not prove
that the deployed app uses this project or has valid server credentials.

Read-only privilege inspection confirms that `learner_state_items`,
`observability_events` and `schools` have RLS and FORCE RLS enabled. Anonymous
and authenticated browser roles have no SELECT/INSERT/UPDATE/DELETE privileges;
the service role has all four. The no-policy advisor findings therefore match
the intentional service-only design. Do not add client policies to hide them.

Two hosted security advisories remain open:

- [Leaked-password protection](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection)
  is disabled.
- [Postgres security updates](https://supabase.com/docs/guides/platform/upgrading)
  are available for the installed hosted build.

The migration-ledger comparison fails: 30 local files versus 35 hosted entries,
duplicate local version prefixes `20260711` and `20260725`, and differing
historical version identities. The hosted ledger also contains FinanceMeta
migrations. A name mismatch does not establish a missing schema object. No blind
push, ledger repair, shared database reset or upgrade was attempted. Reconcile
the actual schema on a disposable clone before changing production.

## Remaining blockers and next execution

1. Provide access to the VertexED hosting team and domain/DNS account. Inspect
   protected readiness details; correct the verified configuration and domain
   assignment, then recheck HTTPS and readiness.
2. Recover compute headroom or use an isolated remote candidate. Observed local
   free-plus-speculative memory stayed below the 512 MiB floor during this pass;
   builds and browser runs were deferred. No unrelated process was stopped.
3. Review/integrate outstanding changes into one committed candidate. Run full
   CI including the newly connected browser suites and isolated database replay.
   No clean candidate, push or PR is claimed by this working-tree manifest.
4. Reconcile shared database migrations, backups and upgrade compatibility;
   enable password protection through authorized project settings and verify it.
5. Complete real disposable-account isolation and recovery, live-provider
   evaluation, learner journeys, restore/rollback and monitoring acceptance.
6. Obtain subject, provenance/rights and privacy review. Imported guides remain
   unapproved; original MYP/formula content is not external curriculum approval.

## Evidence

Fresh logs and read-only hosted responses are retained in
`.tmp/release-finish-20261014/`. The portable summary and hashes are in
`evidence/release-execution-20261014.json`. Existing logs and uncommitted work
were preserved. The September master register remains a historical gate ledger;
partial local passes here do not close its complete-product or live gates.
