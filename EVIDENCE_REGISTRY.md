# EVIDENCE REGISTRY

**Machine-readable index:** [`EVIDENCE_REGISTRY.json`](./EVIDENCE_REGISTRY.json)

This registry locates decisive evidence. It does **not** own portfolio state (`portfolio/portfolio.yaml`), claim state (`CLAIM_LEDGER`), experiment state (`EXPERIMENT_LEDGER`), or negative-result state (`RESEARCH_FAILURE_ATLAS`). Project-native raw artifacts win on raw results.

| Project | Evidence boundary | What it supports | What it does not support |
|---|---|---|---|
| LAM-JEPA | signed `bf8311e...`; external packet `218ea1...` | internally reproducible frozen negative/inconclusive result; outside-review packet readiness | external validation, acceptance, publication |
| VertexED | prod monitor `31817794439`, artifact `9225715176`, SHA-256 `e7870e...`; revision-stamping source | public/API/auth/origin bounded smoke passes while served revision is absent; source can emit immutable revision | exact served revision, authenticated golden journey |
| FinanceMeta | existing 41-commit branch `6dcc037...`; fresh write 403 | hardening work exists and must be reviewed rather than recreated; current integration write path blocked | merge correctness or live production repair |
| The Bu1LD | target `daa80c...`; fresh exact-base write 403 | current connector write boundary | production runtime/security result |
| IRIS | `IRIS_SOURCE_RECOVERY_20260814.md` | checksum-backed source/config/environment lineage partly recovered | exact development trajectories or frozen adaptation-metric provenance |
| NPMS | recovered Atlas SHA-256 `076f127...`; clean replay; frozen invariant-parameter adverse control | source/results reproduce; 92.86% NPMS vs 89.29% invariant parameters gives +3.57pp, inside the predeclared 5pp non-uniqueness band | unique mechanism, natural/OOD validity, authorization for a new run |
| Darcy v2 | frozen protocol; merged main `86170b1...`; B2 blob `6e10c6...`; split hash `4211d11d...`; workflow `31822987002` | pre-outcome protocol/B2 identity and unit verification with `training_authorized=false` | any v2 training/ID/OOD scientific result |
| Percy | current execution-surface observation | real Mac state cannot be observed here | zero tasks, missing DB, failed host |
| Project 2424 | Wave-001 bundle SHA-256 `4c685af...`, HEAD `ff609f3...` | 2,424 historical rows, 24 source-backed Wave-001 packages, clean-clone gate pass, 0 independent reproductions | later overlay, present T2424 identity map, 2,424 implementations or research completions |

Internal verification, packet readiness, source CI, deployment attempt, external reproduction, peer review, publication, and real-user validation remain distinct evidence classes.
