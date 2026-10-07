# Production gate contract repair — 7 October 2026

## Reproduced defect

At source `18b22e51fe5e2f041d7e45335da95546d7a9ae94`, the provider classifier accepted empty, incomplete and truthy non-boolean capability objects. It did not bind deep readiness to the shallow probe's deployment revision. The separate Gate 1b shortcut also ignored the readiness HTTP status and transfer result. Consequently the actual command could exit successfully for empty capabilities, a different readiness revision, an interrupted readiness transfer, or HTTP 503 with a superficially positive body.

The canonical-domain classifier could also accept an HTTP 200 body with a matching revision while `ok` was false or the reported status was degraded.

## Change

- Require the VertexED service, expected liveness/readiness state, and a recognized health contract.
- Require every capability in the declared contract to be present and literally `true`. Reject arrays, partial objects, failed additional checks, reported database errors and redacted detailed evidence.
- Require complete immutable revisions and the same revision and health contract for shallow and deep probes.
- Make the command's Gate 1b use the same classifier instead of a weaker duplicate shortcut.
- Keep the existing actionable RPC/salt failure hints and the existing nonzero exit while a gate is blocked.

Health v3 uses the 12 capabilities in current main. Known v4 additionally requires `expiringHashedInvites` and `automaticTimestamps`, as specified by the source of held PR #1070 at `9a32974d2eaeebcf240a304a9fc0a99e5f2cfe61`. Recognizing its complete payload does not change the health handler, apply its migrations or resolve that PR's release hold. Unknown contract versions fail closed.

## Verification

The new regression file was executed against unchanged main before the fix: **27 tests, 3 passed, 24 failed**. This includes four actual-command false-positive reproductions using controlled `curl` and DNS command fixtures. These fixtures execute the real probe script, including its final exit decision; they do not contact production.

After the fix, the focused and adjacent suite passed **50/50** on both the declared **Node 22.22.0** runtime and available Node 24.19.0:

```sh
node --test tests/probe-production-gates.test.mjs \
  tests/production-gate-fail-closed.test.mjs \
  tests/production-transport-diagnostics.test.mjs \
  tests/productionHealthWorkflow.test.mjs \
  tests/production-smoke-readiness.test.mjs
```

JavaScript syntax and Git whitespace checks passed. This change is confined to diagnostics and their tests; it does not claim an application rebuild, browser certification, deployment or production repair.

## Remaining production boundary

Read-only requests from this execution environment to both custom-domain health endpoints and the documented Vercel fallback failed at the environment's proxy CONNECT stage. The failure occurred before an application response, so it cannot establish a new production outage or identify its cause.

The current repository still specifies `www.vertexed.app` as the custom origin and `vertex-ed-ai.vercel.app` as the fallback. Public GitHub integration statuses identify two provider projects, but those statuses do not prove custom-domain ownership. Before any provider-side mutation, the owner needs this concrete evidence:

1. The authoritative Vercel project that currently owns `www.vertexed.app` and `vertexed.app`, including the domain's assigned deployment/alias and the provider-reported verification/certificate state.
2. The deployment's exact Git SHA, compared with the intended release candidate. Resolve a routing mismatch at the demonstrated owner; do not infer ownership from the healthier provider host.
3. A readiness response from that deployment using the existing protected readiness mechanism. Record the failed capability names and stable database error token, not credential values or raw private configuration.
4. After the identified repair and normal release review, rerun the unchanged production health, transport, smoke and authenticated browser gates against the intended immutable revision.

Public readiness may intentionally redact capability details. This detailed provider classifier keeps such evidence unverified; it does not remove redaction or claim that a redacted summary identifies a failed database capability. Existing protected smoke tooling remains available to an authorized operator.
