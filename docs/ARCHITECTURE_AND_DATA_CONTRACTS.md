# VertexED architecture and data contracts

**Canonical source:** `vertex-studyAI/vertexED.ai`
**Contract version:** `vertexed.grading.v1`

## Canonical runtime

VertexED is one React 19/Vite client and one Vercel catch-all serverless function. `src/app/App.tsx` is the route authority. `api/[[...path]].js` delegates only to the allowlisted route registry in `api/_lib/routes.js`; individual files under `api/_handlers/` are not independent public functions. Supabase Auth owns identity, while `public.profiles` and `public.user_study_artifacts` hold user-owned state. Every privileged database query derives ownership from the verified bearer token rather than request data.

```text
Browser → React routes → authFetch → /api/[[...path]] → route allowlist → handler
   │                                                        │
   ├─ account-scoped device fallback                        ├─ verified user id
   └─ accessible uncertainty/recovery UI                    └─ Supabase service role + owner filter
```

There is no second canonical application surface. `/learning-hub` and `/world-model` are compatibility redirects. Public resources and study guides share the same `SiteLayout`; authenticated tools are wrapped by `ProtectedRoute`.

## Trust boundaries

1. The browser is untrusted. Client-supplied `user_id`, admin claims, scores, and artifact ownership are never authoritative.
2. The API verifies the Supabase bearer token before privileged work and applies endpoint-specific rate limits and body limits.
3. Service-role database access must include the verified user ID in every read, update, and delete predicate.
4. RLS remains enabled as defense in depth even where server handlers use the service role.
5. AI output is untrusted data. Grading is normalized by `api/_lib/verifiedGrading.js`; unsupported evidence or low confidence produces `PROVISIONAL` status and human-review escalation.
6. Build identity is immutable and fail-closed in production. `/api/health` and readiness headers are the release identity contract.

## Typed domain contracts

The canonical compile-time contracts live in `src/types/domain.ts` and `src/types/learning.ts`. They cover identity/profile, course/subject, mock assessment, learner response, criterion feedback, notes, study plans, evidence spans, coverage, provenance, and privacy-safe AI run metadata.

Persisted learner artifacts use the envelope below:

```json
{
  "id": "uuid",
  "kind": "note | review | paper | planner | notebook",
  "title": "bounded display title",
  "payload": { "contractVersion": "feature-specific version", "...": "feature data" },
  "idempotency_key": "optional owner-scoped retry key",
  "created_at": "ISO-8601",
  "updated_at": "ISO-8601"
}
```

The database supplies `id`, `user_id`, and timestamps. Clients cannot set ownership. Payloads are bounded to 256 KiB and request bodies to 512 KiB. Artifact creation retries reuse an owner-scoped idempotency key; identical replays return the existing row, while key reuse with different content fails with `409`. Planner and notebook singleton replacement is owner-scoped and updates the existing snapshot without delete-before-insert data loss.

## Grading and learning evidence

Each awarded criterion carries exact character spans copied from the submitted answer. A positive criterion score without an exact span is not verified. Confidence below `0.70` is escalated. Provisional scores are shown as guidance but excluded from mastery history and coverage. Only verified grades update weakness/mastery state. Error codes route to a bounded remediation taxonomy instead of unconstrained generation.

Generated quiz artifacts identify their board, subject, source, generator/version, model where applicable, and objective IDs. If the provider is missing or fails, VertexED returns deterministic retrieval prompts derived from the learner's notes with a SHA-256 source digest; it never fabricates a successful AI run.

## Migration and compatibility policy

- Schema changes are append-only migrations under `supabase/migrations/`; production is never reset.
- Existing `user_study_artifacts` rows remain readable. New payload fields are versioned and optional at the envelope boundary.
- `20260902_artifact_idempotency.sql` adds a nullable key, so historical rows remain valid while new clients gain concurrency-safe retry semantics.
- Shared legacy browser keys are not migrated across accounts. Account-scoped storage keys are resolved before reads.
- Compatibility redirects may remain, but duplicate feature implementations must not acquire separate persistence or authorization rules.
- Rollback means reverting application code and applying an explicit forward recovery migration; applied production migrations are not destructively removed.

## Structural verification

`tests/architecture-contracts.test.mjs`, authorization tests, build-revision tests, and Vercel route validation enforce these boundaries. Live database/RLS and deployment identity still require environment-specific certification; source tests cannot substitute for those gates.
