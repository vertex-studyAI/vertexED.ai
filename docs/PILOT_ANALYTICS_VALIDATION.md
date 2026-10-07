# Pilot analytics observation contract

The pilot exporter accepts measured numeric values as finite JSON numbers.
`null`, empty strings, numeric strings, booleans, arrays, and objects cannot be
converted into scores or loop counts. A measured score of `0` remains valid.
Loop counts must be nonnegative safe integers, and `completion_flag` must be an
explicit boolean.

Absent optional observations stay missing. A supplied malformed post-assessment,
completion timestamp, or usefulness rating rejects the session, so a corrupt
record cannot silently become an incomplete but otherwise valid observation.
The aggregate export includes accepted/rejected counts without exposing rejected
identifiers.

Timestamps must name a real UTC calendar instant. Dates such as February 30 and
`24:00:00` are rejected. Accepted timestamps are normalized to ISO millisecond
form before chronology comparisons, avoiding differences between strings with
and without fractional seconds.

## Verification

```bash
node --test tests/pilot-analytics-export.test.mjs tests/product-analytics.test.mjs tests/account-lifecycle-analytics.test.mjs tests/progress-analytics-evidence.test.mjs
```

All 49 tests passed on the project's specified Node 22.22.0 runtime. The suite
covers missing/coerced observations, real zero scores, malformed optional data,
calendar validity, partial completion, consent, withdrawal, aggregation, and
privacy boundaries. The [executed receipt](evidence/pilot-analytics-validation-2026-10-07.json)
binds the tested source files by SHA-256.

This completes an analytics integrity repair. It supplies no real learner
outcomes and does not establish educational benefit. The existing
[pilot protocol](PILOT_PROTOCOL.md) still governs provider readiness, consent,
comparison conditions, and learner-outcome collection. LAK, EDM, AIED, and related
research routes depend on evidence collected under that protocol.
