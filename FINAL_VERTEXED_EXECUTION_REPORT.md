# VertexED execution report

Updated 20 October 2026. This report covers the isolated
`codex/vertexed-mega-completion` branch only. Nothing was merged, deployed,
or applied to a live database.

## Delivered vertical slices

| Area | Delivered outcome | Persistence and safety boundary |
|---|---|---|
| IB Diploma | A protected workspace for real HL/SL subjects, chosen targets, IA/EE/Paper deadlines, and upcoming work. | Device-first `ib_plan` learner state is owner-scoped, validated on client/server and has an unapplied migration. Targets are never presented as predictions. |
| IA and EE planning | Per-project working question, method, supervisor-feedback notes, bibliography/source notes and an optional compatible deadline link. | IA must have a real subject; EE remains subject-neutral; invalid cross-links are rejected before sync. |
| Apex to Notes | A finished Apex response can be saved as an ordinary editable note. | The save includes the learner question, displayed cited excerpts and a clear verification notice. It uses the existing idempotent cloud write with durable device recovery, then opens through Saved Work into Notes. |
| Knowledge folders | Saved notes, papers and reviews can be put in named folders, filtered, renamed or removed. | Folder metadata is namespaced inside the existing artifact payload and written through the account-scoped update API. Bulk actions explicitly cover only loaded items; revision-checked singleton snapshots are excluded. |
| Admin analytics | An admin-only analytics page gives 7/30/90 day aggregate capability-level run, failure and feedback signals. | The server authenticates and rate-limits the admin, selects only fixed telemetry columns, and excludes learner identities, prompts, answers and saved work. |
| Feedback to support cases | A signed-in learner submits feedback through a guarded route and receives the generated request ID; an admin-only queue filters by category or retrieves that exact ID for follow-up. | It uses the existing feedback store with fixed projections, rate limits and excludes learner profiles, saved study work and account records. Retention and responder procedures need support-owner approval before operational use. |

The live feature ledger is [VERTEXED_MEGA_CHECKLIST.md](VERTEXED_MEGA_CHECKLIST.md).

## Verification receipts

- `npm run typecheck` passed.
- `npm run lint:copy` passed: 481 files scanned, 0 findings.
- `npm run build` passed in the isolated worktree; the production bundle and API route validation completed successfully.
- Focused tests passed: 68 tests covering artifact durable recovery, Apex-note conversion, folders, IB/learner-state validation, feedback submission, support-case privacy, analytics privacy and RLS schema boundaries.
- `node scripts/validate-vercel-functions.mjs` passed: one Serverless Function and 27 routed endpoints.
- The build’s content check remains restrictive: 0 approved items and 53 items flagged for editorial review.

## Remaining blockers and launch status

**Launch readiness: NO-GO.** The implementation branch has improved core workflows, but it is not a finished or launch-ready product.

- The IB learner-state migration is unapplied; production database migration/RLS/two-account proof is required.
- A beta-approved disposable account is needed for browser persistence, permission and error-state testing. The local preview also served an existing stale service-worker route cache, so no 1440px, 1024px or 390px protected-route screenshot is claimed.
- Real provider behaviour, spend enforcement and AI-quality evaluation need authorised provider access.
- The intended custom-domain/DNS/Vercel ownership and TLS checks remain external operational work.
- Billing, referrals, collaboration, moderation workflow and complete IB catalogue/content publication remain either intentionally blocked pending policy/commercial/editorial authority or not yet implemented. Support-case retention and responder procedures remain blocked on an approved policy.

No production service, billing setting, provider account, database, deployment or user data was changed.
