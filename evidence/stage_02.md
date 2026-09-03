# VertexED Stage 02 — canonical architecture and data contracts

**Checked:** 2026-09-01
**Gate:** PASS — the application has one documented architecture, strict typed domain boundaries, a shared runtime artifact contract, a compatibility-safe migration plan, and green structural tests.

## Revision boundary

- Canonical source baseline recovered in Stage 01: `vertex-studyAI/vertexED.ai@eb72c18897773edd42cb81188a0d7938b554c99f`.
- Git provenance was recovered from a clean clone of the canonical remote before Stage 02 changes. The source baseline is therefore exact; Stage 02 changes remain an uncommitted working-tree overlay at this evidence point.
- Other workspace changes appeared concurrently while this stage ran, including grading-contract work in `NotetakerQuiz.tsx`. They were preserved and are not claimed as Stage 02 changes.

## Material changes

- Added `docs/CANONICAL_ARCHITECTURE.md`: client/API/Auth/Supabase/persistence topology, compatibility routes, data flow, configuration boundary, and an additive payload-version migration plan.
- Added `src/contracts/domain.ts`: strict Zod schemas and inferred types for user/profile, course/subject, mock, response, rubric feedback, notes, study plan, evidence, AI-run metadata, and persisted artifact rows.
- Added `contracts/studyArtifact.js` plus `contracts/studyArtifact.d.ts`: a dependency-light shared runtime/TypeScript contract for the five persisted artifact kinds.
- Updated `api/_handlers/user-content.js` to consume the shared kind list, require a payload, accept only JSON records or the retained legacy text alias, and reject null/array payloads before database work.
- Updated `src/lib/userContent.ts` to use the canonical artifact-kind type and route `planner` and `notebook` artifacts to their canonical tools.
- Added `tests/domain-contracts.test.mjs` to fail on kind drift across shared runtime, SQL, API and client routing; verify fail-closed payload parsing; load the TypeScript schemas at runtime; and assert every required boundary schema exists.
- Restored the generated build-revision module to its required neutral checked-in state after a local deploy-shaped build had stamped it. No production identity claim was made from that local build.

## Verification

| Command | Result |
| --- | --- |
| `node --test tests/domain-contracts.test.mjs` | PASS, 5/5. |
| `node --test tests/user-content-security.test.mjs tests/user-content-isolation.test.mjs tests/domain-contracts.test.mjs` | PASS, 11/11 at the point run. |
| `node --test tests/health.test.mjs tests/vercelRevisionPackaging.test.mjs tests/domain-contracts.test.mjs` | PASS, 16/16 after restoring neutral generated revision state. |
| `npm run typecheck` under isolated Node `v22.22.0` | PASS. |
| `npx eslint contracts/studyArtifact.js src/contracts/domain.ts src/lib/userContent.ts api/_handlers/user-content.js tests/domain-contracts.test.mjs` | PASS. |
| `npm test` | PASS, 682/682 current-workspace tests. |

## Architectural truth

- Client route composition is canonical in `src/app/App.tsx`; legacy routes redirect instead of hosting duplicate applications.
- The single deployed Serverless Function is `api/[[...path]].js`; internal handlers remain under underscore directories.
- Authenticated ownership is derived server-side, enforced in queries, and independently enforced by Supabase RLS.
- The persisted artifact envelope has one canonical five-kind vocabulary shared across runtime, types, SQL assertions and routing.
- Strict v2 domain schemas are implemented and tested, but existing unversioned production payloads are not claimed migrated. The documented plan requires tolerant readers before bounded, idempotent backfill and later strict writers.

## Claim boundary

The architecture and contracts are `IMPLEMENTED` and `SMOKE_TESTED` locally. Production rows have not been backfilled or schema-version certified, and no deployment has occurred. `DEPLOYED_VERIFIED` remains false.

## Next action

Execute Stage 03 against these contracts: certify auth/onboarding/account isolation source invariants, then retain the external production golden-journey blocker without weakening it.
