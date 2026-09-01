# VertexED pilot analytics export

This export is an evidence-preserving reporting surface for small, consented VertexED pilots. It is designed to support competition/pilot reporting without turning heuristic product metrics into measured learning outcomes.

## Claim boundary

The export is descriptive convenience-pilot evidence only. It does not establish causal efficacy. `studyMinutesEstimate`, default mastery values, streaks, synthetic review fallbacks, and other heuristic fields are intentionally outside this schema.

## Required session input

Each source record must contain:

- `participant_id`: pseudonymous identifier only; email-like identifiers are rejected;
- `session_id`: stable session identifier;
- `consent_opt_in: true`;
- `curriculum`, `subject`, `topic`;
- `pre_assessment: { id, score, max }`;
- `intervention_start`, `intervention_end` as UTC ISO timestamps;
- `completed_practice_loops`, `completed_review_loops` as non-negative integers;
- optional `post_assessment: { id, score, max }` for completed sessions only;
- `started_at`, optional `completed_at`;
- `completion_flag`;
- optional `usefulness_rating` from 1–5.

A completed record requires a valid post assessment and completion timestamp. An incomplete record must not carry a post assessment or completion timestamp. Timestamps must satisfy `started_at <= intervention_start <= intervention_end <= completed_at` whenever `completed_at` exists. Contradictory rows fail closed rather than silently entering the aggregate.

Duplicate `participant_id + session_id` pairs fail closed instead of double-counting. Non-consented or malformed rows are excluded and counted only as rejected records; their identifiers are not copied into output diagnostics.

## Deterministic export

Run:

```bash
node scripts/export-pilot-analytics.mjs \
  --input pilot-sessions.json \
  --json pilot-export.json \
  --csv pilot-sessions.csv \
  --generated-at 2026-09-02T00:00:00.000Z \
  --source-revision <full-immutable-git-sha>
```

For an account-scoped export, add `--participant <pseudonymous-id>`. The participant export filters raw input before aggregation so another account's records cannot enter that output.

`--generated-at` is required rather than generated implicitly so the same input and metadata produce byte-stable JSON/CSV. `--source-revision` must be a full 40- or 64-hex Git revision rather than an abbreviated label. The CLI hashes the exact input bytes with SHA-256 and stores only the digest as provenance.

## Aggregate output

The JSON report includes:

- unique participants enrolled and completed;
- session and completed-session counts;
- dropout/missing-data counts;
- pre/post mean and median percentages;
- paired completer deltas only;
- repeat-participant count and rate;
- completed practice/review loop totals;
- exact measurement-window bounds;
- source revision, generation timestamp, and input SHA-256 provenance.

The CSV contains only the bounded pseudonymous session schema. It does not include consent text, email, auth identifiers/tokens, free-form answers, application content, or heuristic mastery/time fields. Text cells beginning with spreadsheet formula prefixes (`=`, `+`, `-`, or `@`, including after leading whitespace) are neutralized before CSV serialization so opening the export in spreadsheet software cannot interpret user-controlled text as a formula.

## Tests

`tests/pilot-analytics-export.test.mjs` covers empty data, partial completion, account isolation, non-consent/PII rejection, measured paired deltas, duplicate-session fail-closed behavior, full immutable revision provenance, chronological/completion consistency, spreadsheet-formula neutralization, and the bounded CSV field surface.

## Production use

This module does not itself collect or consent participants and does not bypass RLS. A production pilot still needs an appropriate opt-in/consent process and an account-isolated source query/export path. Preserve the exact source revision and export inputs used for any public quantitative claim.
