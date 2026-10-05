# VertexED site closeout: 28 September 2026

**Production remains NO-GO.** The integrated learning workspace, tutor history and reviewed imports are already on draft PR #1098. This follow-up implements the planner calendar handoff and refreshes the actual hosting evidence. It does not award full-product completion or imply that a preview updates the public domain.

## Completed code

Export calendar opens the existing accessible dialog with an inclusive date range. It exports unfinished tasks and commitments into a local iCalendar file; no calendar-provider login, external write or new dependency is involved. Task names are opt-in. Notes, answers, account identifiers and conversations never enter event fields. Optional reminders are encoded for the receiving calendar, which controls importing, notifications and delivery while VertexED is closed.

The file is a copy. Changes, completions and automatic rescheduling in VertexED do not update imported events. The UI explains replacement/duplicate handling and shows the device time zone. Stable account-specific hashed event identifiers distinguish accounts without exposing their IDs. The exporter uses UTC instants, preserves elapsed duration and midnight rollover, rejects daylight-saving gaps, and uses the first occurrence of an ambiguous local time. UTF-8 folding, escaping and display alarms follow [RFC 5545](https://www.rfc-editor.org/rfc/rfc5545).

Exports are bounded to 1,000 tasks. Invalid/empty ranges fail visibly. Account changes, unmount, cancellation and task changes during preparation discard stale work. No task is marked complete or rescheduled by export. The optional reminder is off by default. The planner help page now describes this supported handoff.

Visual review corrected the dark-mode reminder selector, giving it the existing input surface, readable text, 44px control height and keyboard focus. Browser tests found that disabling the download button moved focus outside the dialog; it now retains focus while an in-flight guard prevents duplicate work. Original failing receipts are retained. Direct DOM theme switching was replaced with the actual theme control before final captures to avoid partially transitioned colours.

## Verification

Receipts remain in `ci-evidence/conversations-20260927/`; the final sanitised evidence index is `docs/evidence/calendar-delivery-20260928.json`.

- All 1,280 application tests passed, including seven new calendar cases covering privacy, date range, completed tasks, account-specific identities, injected content, Unicode byte limits, time-zone offsets, midnight and daylight saving.
- Type checking and lint passed. Copy lint scanned 373 files with zero findings. The two pre-existing React hook warnings remain visible and unsuppressed.
- The first browser run exposed the focus bug and was interrupted after retaining failures. The focus-corrected run passed all 12 cases across Chromium, WebKit and Firefox.
- The combined calendar/scheduling run passed 21 cases. Final theme review then caught Safari shrinking its native selector to 18px; reusing the existing styled select fixed it. The final calendar run passed all 12 cases with the actual theme control and an explicit 44px control assertion. Captures cover 1440, 1024 and 390 pixels in both themes; tests exercise reduced motion, focus trapping, Escape/focus restoration, private/named downloads, optional reminders and empty ranges.
- Existing conversation/PDF/import/database evidence remains in [the integrated delivery report](FEATURE_COMPLETION_2026-09-28.md). No database change was made in this follow-up.

Calendar files have been verified structurally and through actual browser downloads. A calendar-provider account import and real notification delivery have not been certified. Export is partial progress on DAY-09; background rescheduling and provider synchronisation remain open.

## Live checks and external blockers

Read-only production probes at `2026-09-28T06:18:14.547Z` found:

- `www.vertexed.app` and `vertexed.app`: TLS connection failure before HTTP. Both resolved to `104.219.250.37` and `2.59.170.20`; no CNAME was returned. These observations are not instructions to replace DNS with guessed records.
- Both `.ai` hostnames: no resolved address.
- `vertex-ed-ai.vercel.app` and `vertex-ai-rho.vercel.app`: liveness HTTP 200, readiness HTTP 503, revision `caf46f16088cade0376efa1e6850d1182ae47ca2`. Liveness does not mean the services are ready.
- The protected agents endpoint correctly returned 401 without authentication.
- The signed-in Vercel account is `build-the-future-11`, with one visible team, `build-the-future-11s-projects`. Its project list contains no VertexED project. PR preview checks belong to Ryan Gomez’s and Pratyush Vel Shankar’s separate teams. No ownership was inferred and no parallel production project was created.

The user was asked to connect the actual hosting/domain owner and identify the intended production project through normal sign-in controls. No credentials should be pasted into source or reports. Protected readiness, actual provider tests, deployed migration-ledger reconciliation and controlled real accounts still require owner access. No main merge, DNS write, shared database mutation or production promotion was performed.

Full offline app loading, account-isolated offline material caching, background rescheduling, broader reviewed curriculum coverage, rights/privacy review, restore/rollback and live acceptance remain on the existing complete-product checklist. There are 35 bank questions and 245 guides with zero editorial approvals and 53 flags. These are open requirements, not successful results.

## Reproduce

Use Node 22.22.0/npm 10.9.4. Run `npm run test:app`, `npm run typecheck`, `npm run lint:ci`, `npm run build:ci` and `npm run performance:bundle`. Run `node node_modules/@playwright/test/cli.js test --config=playwright.learning-loop.config.ts --grep="planner calendar|planner commitments"` separately from any other build/browser run. CI includes the calendar download cases. Read-only hosting verification uses `vercel whoami`, `vercel teams list`, `vercel project ls` and `node scripts/probe-production-gates.mjs --json`.

No unique original work was deleted or overwritten. The original WIP checkout and older dirty candidate remain preserved. Current work is limited to the isolated candidate and the existing GitHub review.
