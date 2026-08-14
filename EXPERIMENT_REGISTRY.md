# EXPERIMENT REGISTRY

The portfolio already has one canonical mutable experiment source:

- human-readable: [`EXPERIMENT_LEDGER.md`](./EXPERIMENT_LEDGER.md)
- machine-readable: [`EXPERIMENT_LEDGER.json`](./EXPERIMENT_LEDGER.json)

To obey the **do not create duplicate canonical ledgers** rule, this requested filename is a compatibility entrypoint, not a second experiment database.

## Reproducibility contract

For every Tier-S/A manuscript result, the canonical ledger must eventually resolve:

`claim -> table/figure -> processed artifact -> raw artifact -> frozen config -> code commit -> exact command`

A missing link stays explicit. It is never guessed from memory or backfilled with plausible-looking provenance.

Current high-priority provenance work:

1. LAM-JEPA — retain independent row-level re-audit and make the separate capacity-matched supervised lineage explicit in the manuscript graph.
2. NeuroCAD — retain v1 artifact audit separately from v2 validation-dominant mechanism falsification; do not collapse versions.
3. NGMT v0.1 — exact retained artifact/config/command/environment links for B0/B1/B2/B3.
4. Eigen-JEPA — reconcile `14,895` current-parser vs `14,899` historical-spec rows without changing data/parser to fit prose.
5. IRIS — ensure common-adaptation negative development evidence and untouched confirmatory-seed boundary are represented in the canonical ledger.

The machine-readable compatibility entrypoint is `EXPERIMENT_REGISTRY.json`.