# EXPERIMENT REGISTRY

**Canonical machine-readable registry:** [`EXPERIMENT_REGISTRY.json`](./EXPERIMENT_REGISTRY.json)  
**Canonical human-readable outcome ledger:** [`EXPERIMENT_LEDGER.md`](./EXPERIMENT_LEDGER.md)

This index intentionally does not duplicate the experiment table. New confirmatory experiments must be registered before execution with candidate/version, question, hypothesis, baselines, data/split, seed policy, primary metric, effect statistic, advancement threshold, falsifier, analysis plan, compute budget and stop rule. Protocol changes create a new experiment version; they never overwrite a failed frozen experiment.
