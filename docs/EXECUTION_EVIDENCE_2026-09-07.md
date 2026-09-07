# VertexED Completion Mission — Evidence Ledger

**Mission start:** 2026-09-07T10:59:24Z

**Branch:** `codex/vertexed-publication-readiness`

**Base revision:** `19baf858dca033226c7f8aa8942fbdd70d1feffe`

Evidence labels: VERIFIED, PARTIALLY VERIFIED, SYNTHETIC, HISTORICAL, NEGATIVE RESULT, NOT RUN and BLOCKED.

| Check | Environment | Result | Evidence boundary |
|---|---|---|---|
| Repository state | Local Git worktree | VERIFIED: 66 added, 60 deleted and 150 modified paths were staged at mission start; no unstaged diff | The staged candidate is cumulative work from the preceding audit and remains uncommitted. |
| Runtime version | Default shell | NEGATIVE RESULT: Node 26.8.1 | The project requires Node 22.22.x, so the default shell is not a valid verification runtime. Subsequent Node checks use `/Users/ryan/.nvm/versions/node/v22.22.0/bin`. |
| Required runtime | Local pinned binary | VERIFIED: Node 22.22.0, npm 10.9.4 | Matches the package engine range; npm differs from the declared 10.9.8 package-manager hint but remains npm 10. |
| Git whitespace | Staged diff | NEGATIVE RESULT: `AUDIT_REPORT.md` contained trailing Markdown whitespace | The file was previously untracked when the tracked-diff check passed. Working-copy whitespace was removed; the corrected file must be restaged before this check can pass. |
| Supabase documentation | Current official changelog/docs, 2026-09-07 | VERIFIED | Relevant 2026 changes include explicit Data API grants, Postgres 17 local defaults and stricter RLS/grant guidance. |
| Supabase CLI | Local installed CLI | BLOCKED: sandbox prevents writing `~/.supabase/telemetry.json` | CLI commands cannot be treated as executed in the restricted environment. |
| Container runtime | Local Colima | BLOCKED: Colima is stopped; two narrow start approvals timed out | Database reset, pgTAP, lint and schema diff remain NOT RUN. |
| Database source inventory | Repository | PARTIALLY VERIFIED: 20 ordered migrations and 3 pgTAP files | Source presence and static inspection do not establish executable correctness. |
| Test ownership | Repository | VERIFIED: 179 root test files classified as 113 canonical VertexED and 66 quarantined cross-project files | Classification is filename/boundary based and enforced by tests; assertion totals require execution. |
| Guide corpus | Repository | VERIFIED: 245 Markdown files and 244 navigable manifest entries | File inventory only; curriculum accuracy, rights and educational quality are not implied. |
| Prior clean CI | Node 22.22 clean install on 2026-09-06 | HISTORICAL: 844 repository tests, lint, typecheck, synthetic evals, build and bundle budgets passed | Precedes this mission slice. It cannot certify new changes or external systems. |
| Production deployment | Canonical Vercel/Supabase | NOT RUN | No authorization to deploy or mutate production. |
| Live providers | External AI providers | NOT RUN | No authorized isolated credentials or benchmark environment. |

## Running entries

### Test-scope separation

- **Problem:** `npm test` reported one aggregate result spanning VertexED, Project 2424, NeuroCAD, Percy and research evidence.
- **Implementation:** Added explicit canonical and quarantined test scopes while retaining the aggregate gate.
- **Claim boundary:** This improves reporting and ownership. It does not increase behavioral coverage by itself.

### Study-guide provenance inventory

- **Problem:** The guide corpus had no page-level deterministic provenance ledger.
- **Implementation:** Added a generator that inventories every Markdown file, records stable IDs and content hashes, leaves unknown provenance fields null, flags risky language and holds every unapproved page from search indexing.
- **Claim boundary:** Automated flags are triage signals, not copyright or factual verdicts. Human editorial approval remains required.
