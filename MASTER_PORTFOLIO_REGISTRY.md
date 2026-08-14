# MASTER_PORTFOLIO_REGISTRY

**Canonical machine-readable source:** `MASTER_PORTFOLIO_REGISTRY.json`  
**As of:** 2026-08-14 convergence re-verification

This file is a human view, not an independent truth source. The JSON registry is authoritative for the discovered coverage represented in this convergence run.

## Coverage boundary

- Connected portfolio control repo: **VERIFIED**.
- Percy live Mac SQLite/WAL/process state: **BLOCKED_EXTERNAL_MAC**.
- Full Project 2424 2,424-ID canonical map: **BLOCKED_EXTERNAL_SOURCE**; do not synthesize missing identities or source existence.
- VertexED connected Supabase controls: **PARTIAL VERIFIED**, production served revision still blocked.
- FinanceMeta source/security recovery: **PARTIAL VERIFIED**, exact-head CI failing and connector writes blocked; production runtime unavailable.
- The Bu1LD source/current-main CI: **VERIFIED**, production deployment verification blocked.

## Current high-value canonical projects

| Project/family | State | A–F disposition | Next gate |
|---|---|---:|---|
| Percy | BLOCKED | F | non-destructive live snapshot/integrity/recount |
| Project 2424 umbrella | PARTIAL | F | recover canonical source/overlay; then all-ID disposition |
| LAM-JEPA | VERIFIED negative | A | owner release metadata + independent external review |
| IRIS v0.2 | VERIFIED mixed/negative | A | exact raw/source recovery for frozen frontier |
| NeuroCAD v1 | VERIFIED historical software benchmark | B | preserve; avoid causal overclaim |
| NeuroCAD component v2 | VERIFIED negative mechanism | D | preserve `VALIDATION_DOMINANT` falsifier |
| NGMT v0.1 | VERIFIED negative | D | preserve; no rescue |
| Eigen-JEPA | VERIFIED mixed/negative | D | new version only for new claim |
| APEN | VERIFIED mixed | C | stronger matched controls |
| NPMS | PARTIAL/source-gated | F | recover original source/config/checkpoint |
| T2424-0025 | VERIFIED bounded precursor | A | keep claim bounded |
| Darcy / T2424-0050 | frozen protocol, unexecuted | C | source + authorization, then exact frozen run only |
| JEPA × time-series | design only | C | separate cheap synthetic freeze; no run authorized |
| VertexED | source green / production blocked | B | served revision + authenticated golden journey |
| FinanceMeta | preserved source recovery / production blocked | B | exact-head CI/security recovery + runtime qualification |
| The Bu1LD | source CI green / deployment blocked | B | release-check fix + exact-SHA deployment/role journeys |
| Hercules/Olympus | archived from active compute | E | matched protocol required for reactivation |
| Notes-to-Video V6 | verified local child subsystem | B | remain child-scoped unless parent-user evidence justifies expansion |

For full fields and coverage flags, use `MASTER_PORTFOLIO_REGISTRY.json`. Absence from this bounded view is **not** an archive decision; undiscovered/local-only work remains UNKNOWN until recovered.
