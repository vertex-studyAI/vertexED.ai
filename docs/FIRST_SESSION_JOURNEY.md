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

Onboarding writes two short-lived session markers:

- `vertex_welcome=1` means onboarding completed and the starter plan exists.
- presence of `vertex_plan_sync_notice` means cloud persistence failed and the device copy is currently authoritative.

`consumeFirstSessionHandoff()` reads and removes both markers on the first dashboard render. It returns booleans only. Stored notice text is never rendered, preventing arbitrary session-storage content from entering the page.

## Accessibility contract

The handoff:

- uses a labelled live region;
- uses `role=status` for a normal successful handoff;
- uses `role=alert` when the plan is device-only;
- includes a direct `Review plan` link;
- includes a labelled dismiss button;
- does not replace the existing recent-session continuation banner after dismissal or on later visits.

## Evidence

- `tests/first-session-handoff.test.mjs` verifies one-time consumption, device-only reduction, sync-only recovery, live-region semantics, planner navigation, and dismissal labelling.
- The canonical release gate verifies TypeScript, application tests, deterministic evaluations, production dependencies, and the production build.
- Live browser certification remains required before merge.
