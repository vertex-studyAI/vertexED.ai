# Learner loop and recovery contract

VertexED's supported private-beta loop is:

1. Generate or choose practice.
2. Complete a deterministic quiz or submit an answer/mock for structured review.
3. Update weakness history only from `measured-v2` evidence with a teacher, official mark scheme, or validated answer-key provenance. AI confidence alone must never affect mastery.
4. Schedule a topic retry automatically from the measured percentage: below 40% in one day, below 70% in three days, otherwise in seven days.
5. Replace the existing topic retry after another measured attempt instead of accumulating duplicates.
6. Surface the next retry, weakest measured topic, pending mock review, and sync state on `/main`.

## Persistence and recovery

- Learner state stored in the browser is scoped to the resolved authenticated account. Active mock answers, position, and deadline are saved in account-scoped durable local storage and can be resumed after refresh or browser restart.
- Device recovery uses a revisioned IndexedDB outbox with a local-storage mirror. Weakness measurements, retry lifecycle records, mock drafts, and unsynced artifacts remain replayable if the smaller local-storage mirror reaches quota. Confirmed writes are removed by exact revision so an edit made during an in-flight request cannot be lost.
- Cloud artifact writes carry a stable idempotency key. If a response is lost or the cloud is unavailable, the device copy retains that key.
- `syncLocalStudyArtifacts` removes a device copy only after the API confirms either the original write or a safe idempotent replay.
- Planner and notebook cloud records are database-enforced singletons per `(user_id, kind)`. A concurrent first-write conflict is recovered by updating the winning row.
- Apply every ordered migration through `20260906115242_account_deletion_privacy_and_rate_limit_invoker.sql` before enabling the corresponding production revision. The singleton migration fails without deleting anything if historical planner/notebook duplicates need manual reconciliation.

## Quality telemetry

- Client AI runs report only capability, fixed outcome/error class, route pathname, and bounded duration.
- Server provider runs report only provider, model, status, capability, and bounded duration.
- Helpful/not-helpful/incorrect controls submit fixed categories only. Prompts, answers, sources, identities, URLs with query strings, and free-form messages are never sent.

## Verification

Run:

```bash
npm run lint
npm run typecheck
npm test
npm run test:eval
npx supabase start
npm run db:test
npm run build:ci
```

After deployment, run `npm run test:smoke` and the authenticated golden-path suite. Verify the migration exists in the target Supabase migration ledger before judging sync, singleton, or distributed rate-limit behavior.
