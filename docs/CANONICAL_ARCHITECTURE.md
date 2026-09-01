# VertexED canonical architecture and data contracts

## Canonical surfaces

- `src/app/App.tsx` is the only client route composition root. `/learning-hub`, `/world-model`, and the nested archive paths are compatibility redirects; they are not separate applications.
- `api/[[...path]].js` is the only deployed Serverless Function. `api/_lib/routes.js` dispatches to `api/_handlers/*`; underscore directories are internal modules, not deployable endpoints.
- Supabase Auth owns identity and sessions. `AuthContext` hydrates the browser session; `ProtectedRoute` and `AdminRoute` gate navigation, while every privileged API independently verifies the bearer token. Client routing is never authorization.
- `public.profiles` stores account profile/curriculum state. `public.user_study_artifacts` is the account-owned persistence envelope for `note`, `review`, `paper`, `planner`, and `notebook`. RLS and explicit `user_id` filters are both required.
- Account-scoped local/session storage is an offline/recovery layer. It does not override a newer cloud snapshot and must be invalidated when identity changes.

## Typed and runtime boundaries

- `src/contracts/domain.ts` defines strict schemas and inferred types for profiles, course/subject identity, mocks, responses, rubric feedback, notes, study plans, evidence references, AI-run metadata, and persisted artifact rows.
- `contracts/studyArtifact.js` is the dependency-light runtime contract shared by the browser and Serverless Function. Its adjacent declaration file provides the TypeScript surface.
- Artifact kinds must match in four places: shared runtime contract, SQL constraint/migrations, API validation, and client routing. `tests/domain-contracts.test.mjs` fails if these surfaces drift.
- New payload versions should remain JSON objects and carry a payload-local `version`. Readers must accept the currently deployed unversioned shapes until a read-compatible migration is shipped and measured.

## API and persistence flow

1. The browser obtains a Supabase session and calls the same-origin `/api/*` route with a bearer token.
2. The catch-all router applies API security controls and dispatches to one handler.
3. The handler authenticates before creating the service-role client, validates method/body/size, derives ownership only from the verified user, and performs an owner-scoped query.
4. Supabase RLS independently enforces the same ownership boundary.
5. The browser records a scoped local fallback only when cloud persistence is unavailable and clearly marks that state as local-only.

## Migration plan

1. Treat the current five artifact kinds and existing payloads as compatibility version 1; do not rewrite production rows in place.
2. Add payload-local `version: 2` only when a feature adopts its strict domain schema. Deploy tolerant readers before writers.
3. Backfill in bounded, idempotent batches with per-kind invalid-row counts and no deletion. Quarantine malformed rows for owner-visible recovery rather than silently coercing them.
4. After the read-compatible release is deployed and measured, make strict schema validation authoritative for new writes. Retain the legacy string `content` alias only until telemetry shows no callers.
5. Remove compatibility paths only after exact-revision production certification and a rollback artifact exist.

## Configuration boundary

Required variable names and secrecy rules remain in `docs/ENVIRONMENT_MATRIX.md`. Production readiness is exposed only by `/api/health?readiness=1`; liveness, source configuration, and a successful build are not substitutes for provider-side environment verification.
