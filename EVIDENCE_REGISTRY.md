# EVIDENCE REGISTRY

**Machine-readable index:** [`EVIDENCE_REGISTRY.json`](./EVIDENCE_REGISTRY.json)

This registry locates decisive evidence. It does **not** own claim state (`CLAIM_LEDGER`) or experiment state (`EXPERIMENT_LEDGER`), and project-native raw artifacts win on raw results.

| Project | Evidence boundary | What it supports | What it does not support |
|---|---|---|---|
| LAM-JEPA | signed `bf8311e...`; external packet `218ea1...` | internally reproducible frozen negative/inconclusive result; outside-review packet readiness | external validation, acceptance, publication |
| VertexED | prod monitor `31817794439`, artifact `9225715176`, SHA-256 `e7870e...`; revision-stamping source | public/API/auth/origin bounded smoke passes while served revision is absent; source can emit immutable revision | exact served revision, authenticated golden journey |
| FinanceMeta | existing 41-commit branch `6dcc037...`; control overlay workflow `31190278089`, artifact `8998523430`, patch SHA-256 `9192207d...`; fresh write 403 | hardening work exists and must be reviewed rather than recreated; current integration write path blocked | merge correctness or live production repair |
| The Bu1LD | target `daa80c...`; fresh exact-base write 403 | current connector write boundary | production runtime/security result |
| IRIS | `IRIS_SOURCE_RECOVERY_20260814.md` | checksum-backed source/config/environment lineage partly recovered | exact development trajectories or frozen adaptation-metric provenance |
| Darcy v2 | frozen protocol blob `65f756...`; generator blob `7858d...`; PR #376 B2 blob `6e10c6...`; split hash `4211d11d...` | pre-outcome protocol/generator identity and B2 implementation eligibility evidence | any v2 training/ID/OOD scientific result |
| Percy | current execution-surface observation | real Mac state cannot be observed here | zero tasks, missing DB, failed host |
| Project 2424 | partial canonical map | only directly supported child states are classified | full 2,424-child disposition/completion |

Internal verification, packet readiness, source CI, deployment attempt, external reproduction, peer review, publication, and real-user validation remain distinct evidence classes.
