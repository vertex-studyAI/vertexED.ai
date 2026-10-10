# VertexED limitations

The original checkout remains WIP and noncanonical. The isolated integrated candidate is pushed for review; no production promotion or main merge is claimed. Local tests and browser service fixtures are engineering evidence.

- The question bank has 35 questions, including ten original complex-number questions. It does not cover a full curriculum or establish measured learning gains.
- All 245 imported guides remain without editorial approval; 53 content flags remain. Rights, subject review and appropriate privacy/safeguarding approval are open.
- Tutor history has revision-checked account persistence, search, export and conflict recovery. It is bounded to 24 threads, 200 messages per thread and 240 KiB overall. The deployed migration and actual multi-device acceptance still need verification.
- PDF import extracts selectable text within 1 MB, 25 pages and 50,000 characters. It does not provide OCR or guarantee formula/layout interpretation. Editable text imports require review before saving.
- Calendar export creates a local .ics copy in the device time zone. It omits completed tasks and private task names by default. Importing, notification permissions and delivery belong to the receiving calendar. Changes and deletions do not sync; remove old copies before replacing them. Clock-change gaps reject; repeated local times use their first occurrence. No background rescheduling or provider OAuth connection is implemented.
- Offline application startup and versioned, account-isolated material caches remain open. Existing device recovery is not a complete offline product.
- Thirty migrations and 69 SQL assertions passed locally. Live migration-ledger reconciliation, restore/rollback and real-account permissions remain unverified.
- The connected Vercel account cannot access the VertexED projects. Custom hosts fail TLS; fallback readiness returns 503. Their production revision differs from this candidate. No protected readiness/provider credentials or controlled real test accounts were available for this execution.
- Real-device certification, sustained two-hour study, monitoring delivery, backup restoration and full live export/deletion remain open.

See [feature delivery](docs/FEATURE_COMPLETION_2026-09-28.md), [site closeout](docs/SITE_CLOSEOUT_2026-09-28.md) and the [complete-product checklist](docs/PUBLISHABLE_COMPLETION_CHECKLIST.md). These limitations are not waivers or a claim that the full product is finished.
