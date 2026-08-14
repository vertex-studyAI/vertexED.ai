# EXPERIMENT REGISTRY

The portfolio already had a canonical experiment source before this filename was requested:

- human-readable: [`EXPERIMENT_LEDGER.md`](./EXPERIMENT_LEDGER.md)
- machine-readable: [`EXPERIMENT_LEDGER.json`](./EXPERIMENT_LEDGER.json)

To obey the **do not create duplicate canonical ledgers** rule, this file is a compatibility entrypoint rather than a second copy of experiment rows. `EXPERIMENT_LEDGER.md/json` remain the single mutable experiment authority.

## Required provenance completion

For every Tier-S/A manuscript result, the canonical ledger must eventually be able to resolve:

`claim -> table/figure -> processed artifact -> raw artifact -> frozen config -> code commit -> exact command`

Fields not currently present in the canonical ledger must be recovered from retained artifacts/source. They must **not** be reconstructed from memory or guessed.

Highest-priority provenance gaps:

1. LAM-JEPA — exact paper table/figure regeneration commands and full raw→processed paths.
2. NGMT v0.1 — exact retained artifact/config/command/environment links for the B0/B1/B2/B3 result.
3. NeuroCAD v1 — exact benchmark artifact/config/command links before manuscript promotion.
4. Eigen-JEPA — reconcile the retained `14,895` current-parser vs `14,899` historical-spec row-count discrepancy without editing data to fit old prose.
5. IRIS — retain the common-adaptation negative development bundle and untouched confirmatory-seed boundary in the canonical experiment history.

`EXPERIMENT_REGISTRY.json` machine-readably points to the same authority and records the provenance contract; it does not duplicate experiment outcomes.