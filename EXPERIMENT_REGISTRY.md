# EXPERIMENT REGISTRY

**Canonical machine-readable experiment records:** [`EXPERIMENT_LEDGER.json`](./EXPERIMENT_LEDGER.json)  
**Canonical human-readable experiment records:** [`EXPERIMENT_LEDGER.md`](./EXPERIMENT_LEDGER.md)  
**Registry index:** [`EXPERIMENT_REGISTRY.json`](./EXPERIMENT_REGISTRY.json)

This file intentionally does **not** duplicate experiment outcomes. `EXPERIMENT_LEDGER.json` is the authoritative current record of frozen experiment IDs, states, metrics, provenance and next gates. The registry exists to satisfy stable tooling/discovery paths while keeping one source of truth.

## Mutation rule

- Frozen outcomes are immutable.
- A changed hypothesis, protocol, threshold, seed policy, dataset role or confirmatory plan creates a new experiment/version in `EXPERIMENT_LEDGER.json`.
- Negative results remain preserved.
- Reserved test/confirmatory data may not be used to rescue a failed development result.
- This registry pointer must never be used to promote proposal/specification status into executed evidence.
