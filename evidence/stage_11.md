# VertexED Stage 11 — production release certification

**Gate: BLOCKED externally; `DEPLOYED_VERIFIED=false`.** Exact merged runtime candidate
`9cb1c81de9725152ad46c8928c1b0556f1251131` contains current canonical main
`6b92c32d59772aca3dec93d06336c062a8d67cba` and passes the complete local release gate.

## Exact-candidate certification

- `npm ci`: PASS; 677 packages installed, lockfile SHA-256
  `ae6c944073e669629e7d0d6af643cb956533253175a74541ff05910c266ac955` unchanged,
  and Git SHA unchanged.
- `npm run ci`: PASS after the clean install.
- Source tests: 745/745 PASS.
- Frozen evaluation tests: 25/25 PASS.
- Full and production dependency audits: PASS with **zero known vulnerabilities** after
  a lockfile-only refresh to patched transitive build-tool versions.
- Production build: PASS; 2,768 modules, one Vercel function, 19 routed endpoints,
  immutable revision stamped during the build.
- Frozen bundle budgets: all four PASS with zero violations.
- Exact-candidate browser: 34 accessibility/responsive PASS, two inapplicable skips,
  and one authenticated production-preview golden journey PASS.

The accessibility total is the final exact candidate's complete serial production-bundle
rerun. A runtime-equivalent parent's initial parallel rerun had one host-I/O timeout; its
trace, focused passing rerun and the final exact-candidate serial pass are documented in
`evidence/stage_08.md` rather than omitted.

## Live boundary

At `2026-09-02T11:11:33Z`, `https://www.vertexed.app/api/health?readiness=1`
returned HTTP 200 and the legacy 88-byte envelope:

`{"ok":true,"service":"vertexed","apiVersion":"1","timestamp":"..."}`

It did not return `revision`, readiness capability state, `X-VertexED-Revision`, or
`X-VertexED-Health`. No authorized deployment was attempted. Provider environment,
OAuth redirects, Supabase target, deployment receipt, rollback point and a real
authenticated production journey therefore remain unverified.

Smallest exact unblock: grant access to the Vercel project owning `www.vertexed.app`,
deploy this candidate through its authorized path, attest body/header/HEAD revision and
readiness, then run and clean up two disposable approved accounts.
