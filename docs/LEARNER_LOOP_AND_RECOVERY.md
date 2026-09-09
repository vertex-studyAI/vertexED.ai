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
- Planner and notebook cloud records are database-enforced singletons per `(user_id, kind)`. Creation is insert-only; replacement requires the exact previously read `expectedUpdatedAt` value. A stale write receives HTTP 409 and retains the device copy. The generic update endpoint cannot bypass this guard. Update clients and server together: older clients without a comparison revision receive HTTP 428.
- Snapshot writes are serialized within each tab and bind requests to the captured account token. Each tab keeps the revision it actually read. Reloading the cloud copy requires explicit user action and first saves a device recovery backup. It does not automatically merge conflicting edits.
- Learner-state recovery uses an owner-scoped cursor over immutable type/key ordering; it follows every page instead of stopping at the first 500 records. Local history retention remains bounded (500 measurements, 200 retries).
- Flashcard creation merges content, preserves existing schedules, and repairs duplicate IDs. Review schedules remain device-only; they are included in device backups.
- Account export includes current-account localStorage, sessionStorage (including Apex chat history), conflict backups, and both IndexedDB outbox channels. Export Device Backup works without a server request and explicitly excludes cloud-only records. Export fails visibly when recovery storage cannot be read.
- Confirmed account deletion attempts all three browser stores before local logout. If browser restrictions prevent cleanup, the UI explains that the cloud account is gone and instructs the learner to clear this site's storage.
- Notebook creation rejects the thirteenth notebook instead of discarding existing work. Source limits (20 sources, 50,000 characters each) reject oversized input explicitly. The cloud collection payload still has a 256 KiB limit: local edits are retained and the UI requests an export/reduction when exceeded. Per-notebook cloud records and a validated import flow remain future schema/product work.
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
npm run test:app
npm run test:eval
npx supabase start
npm run db:test
npm run build:ci
```

After deployment, run `npm run test:smoke` and the authenticated golden-path suite. Verify the migration exists in the target Supabase migration ledger before judging sync, singleton, or distributed rate-limit behavior.

## Evidence boundaries

Learners can correct individual AI-suggested marks before confirming them. A teacher-confirmed or official-mark-scheme entry records the learner's attestation and optional reference; it does not authenticate a teacher. Weekly counts deduplicate measured attempt IDs within a real seven-day window. Subject trends compare repeated measurements of the same topic and board over time, never adjacent different topics.

Guide retrieval uses only editorially approved ledger entries with source, reviewer, review date, license, and permitted-use metadata. The current ledger has no approved guides, so guide chat reports that no approved passage is available. This restriction does not certify AI-generated resources or learner-uploaded sources.

Generated quiz/notebook structured output must pass bounded schemas. Source-only fallback output remains visibly degraded and cannot become measured mastery. Concept maps render a bounded Mermaid subset as SVG text plus an accessible relationship list; unsupported syntax stays visible for recovery.
