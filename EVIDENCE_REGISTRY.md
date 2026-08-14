# EVIDENCE REGISTRY

**Machine-readable registry:** [`EVIDENCE_REGISTRY.json`](./EVIDENCE_REGISTRY.json)  
**Purpose:** locate decisive evidence; do not duplicate claim or experiment state.

## Authority boundaries

- [`CLAIM_LEDGER.md`](./CLAIM_LEDGER.md) / JSON owns what each claim currently supports or does not support.
- [`EXPERIMENT_LEDGER.md`](./EXPERIMENT_LEDGER.md) / JSON owns frozen experiment identities, metrics and next gates.
- [`RESEARCH_FAILURE_ATLAS.md`](./RESEARCH_FAILURE_ATLAS.md) owns preserved failed/falsified hypotheses.
- Project-native raw artifacts and commits win over this cross-portfolio index on raw results.
- Packet readiness, internal verification and outreach are **not** external validation.
- Source CI is **not** production verification without exact served revision and real authenticated workflow evidence.

## Highest-value indexed evidence

| Project | Evidence | Supports | Does **not** support |
|---|---|---|---|
| LAM-JEPA | raw ARC artifact + internal verification through `bf8311e...`; immutable external packet `218ea1...` | frozen negative/inconclusive result is internally reproducible; packet is ready | external reproduction, superiority, locked-test result, publication |
| VertexED | production monitor `31817794439`, artifact `9225715176`, SHA-256 `e7870e...`; revision-stamping source | public/auth/origin boundaries passed while revision identity remained absent; source can emit immutable revision | served revision proof, authenticated golden journey, deployment certification |
| FinanceMeta | workflow `31190278089`, artifact `8998523430`, patch SHA-256 `9192207d...`; fresh 403 probe | exact-base local integrated overlay is certified and target write is currently blocked | target repair, live Supabase authorization, production journey |
| The Bu1LD | fresh exact-base branch-create 403 probe | current integration lacks target write authority | production runtime correctness or failure |
| Percy | start-snapshot execution-surface observation | current runtime cannot see the real Mac Percy state | zero tasks, missing DB, unhealthy host |
| Project 2424 | source-visibility observation + partial canonical map | full 2,424-ID source map cannot be revalidated from this surface | claim that only currently mapped IDs exist |
| NeuroCAD | component-v2 workflow/artifact | matched validation closes reused diagnostic gap; typed/parser mechanism falsified there | general validation novelty or parser superiority |
| Darcy | frozen v2 learned/OOD protocol | protocol is predeclared before outcomes | any v2 training/evaluation result |
| NGMT v0.1 | frozen experiment record | superiority gates fail, clean-regression gate passes | v0.1 rescue |
| T2424-1863 | frozen experiment record | frozen promotion gate fails | operator superiority |

The JSON file carries exact artifact IDs/hashes/commit locators where available.
