# Staging integration and recovery protocol

Run this protocol against an isolated staging project with synthetic accounts
and sanitized content. Bind every observation to the exact 40-character source
commit. Retain a separate log for each required scenario:

1. create, authenticate, use, export, and delete a synthetic account;
2. inject a provider timeout and malformed response, then verify safe fallback;
3. exhaust a staging-only rate-limit bucket and verify the declared `429` body;
4. expire a session during an eligible request and verify exactly one bounded retry;
5. deploy a reversible migration, restore the backup in isolation, and verify the
   authenticated golden journey after recovery.

Hash each sanitized log with SHA-256. Store those hashes in a receipt containing
`schema_version`, `environment: "staging"`, `source_sha`, `sanitized_data: true`,
`executed_at`, an identified operator, an immutable attestation URL, and exactly
the five scenario records accepted by `scripts/verify-staging-receipt.mjs`.

The verifier is fail-closed and may be invoked as:

```bash
node scripts/verify-staging-receipt.mjs path/to/receipt.json EXPECTED_COMMIT_SHA
```

A locally fabricated receipt is not completion evidence. Promotion requires the
actual owner-controlled staging run and an independently verifiable attestation.
