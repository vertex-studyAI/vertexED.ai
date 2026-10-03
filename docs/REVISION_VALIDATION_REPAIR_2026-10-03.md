# Revision evidence validation repair — 3 October 2026

## Source binding

Parent: `572dd3a87e071d4ad41f2ee112923f2a18fe97be` (draft PR #1106).
Original module blob: `90531dccdee66fd6a74b2ea0d8fe2d7fb30245e0`.
The original module was reconstructed through the connected GitHub file read and its Git blob SHA was checked before testing. No existing task branch was overwritten.

## Reproduced defects and repair

The previous timestamp guard admitted impossible calendar dates normalized by Date.parse, including 2026-02-30; truncated/overflowed time forms also passed. The complete flag admitted truthy non-boolean values, whitespace-only identities passed, and finite out-of-format clocks could produce invalid retry dates.

The repair round-trips explicit UTC timestamps, requires complete === true, rejects blank identifiers and constrains both the clock and computed retry date to the four-digit UTC date format. Seconds and 1–3 fractional digits remain supported, including valid leap days. The revision ladder, evidence categories, diversity thresholds and existing deduplication behavior are unchanged.

## Executed local verification

Runtime: Node.js 22.16.0. Command:

```sh
node --test tests/revision-evidence.test.mjs tests/revision-validation-boundary.test.mjs
```

Before repair: 20 tests, 12 passed and 8 failed.
After repair: 20 tests, 20 passed, zero failures/skips.
The new suite contains nine tests; one sweeps 13,020 calendar-day inputs over 1996–2030. This is a deterministic validation sweep, not 13,020 independent research experiments.

`node --check` passed. The retained patch applied cleanly to the exact original module and reproduced the repaired bytes.

## Remaining gates

This is focused local source verification, not a full application release. The supported repository runtime is Node 22.22.0 and was not available in this shell. Full dependency installation, application CI, browser, database, account-scope integration and production checks were not executed here. Callers still must authenticate and supply complete account-scoped evidence; this module is not an authorization layer. No merge, deployment, data migration, protected evaluation or scientific claim change is included.
