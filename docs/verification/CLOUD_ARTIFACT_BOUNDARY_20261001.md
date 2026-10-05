# Cloud saved-work response validation — 1 October 2026

## Source binding

- Parent candidate: PR #1098 head `2b0db6e3ae3bd3613c5e7ff0bc9f108798d59a33`.
- Inspected `src/lib/userContent.ts` blob: `bff160d6172871cf1eb519aa62308f89f95ead96`.
- Active PR #1103 touches no files in this change.

## Defect and repair

`listStudyArtifactsDetailed()` previously cast every object in a successful cloud response to `StudyArtifact`. Local storage, durable recovery, and one-time restore handoffs already use `normalizeStoredArtifact()`. The cloud response now crosses the same boundary: malformed records are removed before merge, sorting, or display.

This is a client-side defense-in-depth boundary. It does not replace server validation, change ownership rules, mutate stored data, or certify production serving.

## Verification

Run from the repository root:

```bash
node --test tests/user-content-cloud-response-validation.test.mjs
npm run typecheck
```

The focused source-bound suite covers normalization order, removal of the unchecked cast, and the required cross-session fields. Hosted CI remains responsible for full repository, browser, database, preview, and production checks on the exact branch head.
