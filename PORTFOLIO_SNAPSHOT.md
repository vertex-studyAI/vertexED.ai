# PORTFOLIO_SNAPSHOT

**Canonical snapshot date:** 2026-08-14  
**Detailed verified snapshot:** [`PORTFOLIO_SNAPSHOT_20260814.md`](./PORTFOLIO_SNAPSHOT_20260814.md)

This pointer intentionally avoids maintaining two divergent full status tables. The dated snapshot is authoritative for portfolio ranking and A–F decisions and enforces **exactly one** meaningful project state per row.

Scientific evidence state remains claim-specific and is maintained separately in `RESEARCH_STATUS.md`, `CLAIM_LEDGER.md`, `EXPERIMENT_LEDGER.md`, and `RESEARCH_FAILURE_ATLAS.md`. A reproducible negative experiment may therefore be evidence-GREEN while its portfolio decision is `D — NEGATIVE RESULT`.

Live Percy task/worker counters remain `UNKNOWN` until the real `/Volumes/PRO-BLADE/Atlas/Percy` SQLite/WAL/process state is measured. Logical registry size must not be interpreted as physical concurrency.