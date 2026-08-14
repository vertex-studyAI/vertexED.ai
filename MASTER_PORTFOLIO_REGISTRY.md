# MASTER PORTFOLIO REGISTRY

**State:** `PARTIAL_CANONICAL_REGISTRY_SOURCE_GATED`  
**Machine-readable companion:** [`MASTER_PORTFOLIO_REGISTRY.json`](./MASTER_PORTFOLIO_REGISTRY.json)

This file is a **pointer and coverage contract**, not a second competing portfolio table.

## Authority

- The canonical same-day human A–F disposition table remains [`PORTFOLIO_SNAPSHOT_20260814.md`](./PORTFOLIO_SNAPSHOT_20260814.md).
- Same-day verified deltas are linked through [`PORTFOLIO_SNAPSHOT.md`](./PORTFOLIO_SNAPSHOT.md) and current status/queue ledgers.
- Identity/merge/versioning law remains [`PORTFOLIO_CANONICALIZATION.md`](./PORTFOLIO_CANONICALIZATION.md).
- Project-native raw scientific artifacts override cross-portfolio summaries on raw results.
- The JSON companion exists to make the resolved registry machine-readable without copying a second human truth table.

## Current coverage boundary

The machine-readable companion contains the **23 currently resolved canonical project/family entries** from the dated snapshot, updated only where later same-day evidence changes a blocker/gate without changing the frozen scientific result. It separately records repositories discovered during this run whose identity is still unresolved.

It does **not** claim that:

- all Project 2424 contracts have source-backed identities or dispositions;
- all Mac/external-SSD repositories have been recovered;
- every GitHub repository exposed to other installations has been discovered;
- a repository name proves a distinct project;
- source implementation, executed experiment, scientific support, paper readiness, external validation and publication are equivalent.

## Hard blockers to full registry closure

1. Percy live SQLite/WAL/checkpoint/process state is unavailable from this execution surface.
2. Project 2424 canonical source/dirty overlay is unavailable from this execution surface.
3. Several newly visible GitHub repositories remain alias/family/identity candidates rather than canonical projects.
4. FinanceMeta and The Bu1LD target write/runtime surfaces remain externally blocked.

Until those gates close, the registry must stay explicitly partial rather than fabricate a 100% canonical universe.
