# VertexED First-Session Journey

## Primary journey

1. An approved or team-invited user creates an account.
2. The user completes username and curriculum onboarding.
3. VertexED creates a starter planner snapshot from the selected subjects.
4. The planner is saved to device storage immediately and to cloud storage when available.
5. The user lands on `/main`.
6. A one-time dashboard handoff confirms that the starter plan is ready and links directly to `/planner`.
7. If cloud storage was unavailable, the handoff uses fixed copy to explain that the plan is currently device-only and should be saved again when sync is available.
8. The user reviews or edits the starter plan and begins a focused study action.

## First useful artifact

The first useful artifact is the starter planner snapshot created during onboarding. It is not considered successfully handed off merely because storage returned. The dashboard must tell the user that it exists and provide a direct route to review it.

## State contract

Onboarding writes two short-lived, account-scoped session markers:

- `vertex_welcome:<account-id>=1` means onboarding completed for that account and the starter plan exists.
- presence of `vertex_plan_sync_notice:<account-id>` means cloud persistence failed for that account and its device copy is currently authoritative.

`consumeFirstSessionHandoff()` requires the current authenticated account id, reads and removes only that account's markers, and returns booleans only. A marker belonging to account A cannot be consumed as account B. The dashboard also re-resolves the handoff when authentication identity changes so an already-rendered account-A handoff cannot remain visible after a switch to B.

Legacy unscoped `vertex_welcome` / `vertex_plan_sync_notice` markers are deliberately discarded when an authenticated dashboard consumes handoff state; they are never attributed to the current user because their original owner cannot be proven. Stored notice text is never rendered.

## Accessibility contract

The handoff:

- uses a labelled live region;
- uses `role=status` for a normal successful handoff;
- uses `role=alert` when the plan is device-only;
- includes a direct `Review plan` link;
- includes a labelled dismiss button;
- does not replace the existing recent-session continuation banner after dismissal or on later visits.

## Evidence

- `tests/first-session-handoff.test.mjs` verifies one-time account-scoped consumption, cross-account isolation, legacy-marker disposal, device-only reduction, sync-only recovery, authenticated-account rebinding, live-region semantics, planner navigation, and dismissal labelling.
- The canonical release gate verifies TypeScript, application tests, deterministic evaluations, production dependencies, and the production build.
- Live browser certification remains required before a production-release claim.
