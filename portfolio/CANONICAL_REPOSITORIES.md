# Canonical project repositories

**Current as of:** 6 September 2026

This file is the current repository-routing boundary for portfolio automation. When an older status report, patch package, recovery note, or evidence artifact names a different repository, treat that reference as historical provenance unless the task explicitly targets the historical repository.

| Project | Canonical current repository | Routing rule |
|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | Use for VertexED product work and the research/control material currently hosted in this monorepo. |
| The Bu1LD member platform | `build-the-future-11/the-bu1ld-nexus` | Use for current Bu1LD application/source work. `ryangomez010/bu1ld-landing` is legacy evidence, not the current source target. |
| FinanceMeta / Finance4All portal | `build-the-future-11/finance4all-global-reach` | Use for the current portal/application. `FinanceMeta-Landing` and `FinanceMeta-Global` are separate sibling surfaces and must not be substituted automatically. |
| FinanceMeta evidence workspace | `build-the-future-11/FinanceMeta-Global` | Use for evidence/registry/operating-system work, not portal deployment. |
| FinanceMeta landing surface | `build-the-future-11/FinanceMeta-Landing` | Use only for standalone landing-surface work, not portal/auth/member-product work. |
| Eigen-JEPA | `Finance-Meta-Research/Eigen-JEPA` | Canonical research repository for Eigen-JEPA. Do not route this work into the FinanceMeta portal or generic evidence workspace. |
| FI-JEPA | `Finance-Meta-Research/FI-JEPA` | Canonical research repository for FI-JEPA. |
| EigenFinance | `Finance-Meta-Research/EigenFinance` | Canonical repository for EigenFinance work. |
| Fabric-Induced Memory | `THE-BU1LD/Fabric-Induced-Memory` | Current FIM research repository. `build-the-future-11/Fabric-Induced-Memory` is a legacy snapshot retained for provenance. |
| NeuroCAD / VeriCodeGen | `THE-BU1LD/NeuroCAD` | Canonical repository for NeuroCAD and its VeriCodeGen research line. |
| NGMT | `THE-BU1LD/NGMT` | Canonical NGMT repository. Preserve frozen/negative-result boundaries when working here. |
| NPMS | `THE-BU1LD/NPMS` | Canonical NPMS repository. Do not confuse with the empty `THE-BU1LD/NMPS` repository. |
| Olympus / Pantheon | `THE-BU1LD/Olympus-Pantheon` | Canonical repository for the current Olympus/Pantheon research-system line. |
| Speechly | `THE-BU1LD/Speechly` | Canonical Speechly repository. |
| ColorWorld | `THE-BU1LD/ColorWorld` | Canonical ColorWorld repository. |
| APEN / Synthica | `THE-BU1LD/APEN-Synthica` | Canonical APEN-Synthica repository. |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | Use only for LAM-JEPA-specific research work. |
| Text-To-Video | `vertex-studyAI/Text-To-Video` | Canonical repository for the separate Text-To-Video product/research line. |

## Known ambiguity traps

- `THE-BU1LD/NPMS` is the populated NPMS repository; `THE-BU1LD/NMPS` is a different empty repository and must not be substituted for it.
- `THE-BU1LD/Fabric-Induced-Memory` is the current FIM repository; `build-the-future-11/Fabric-Induced-Memory` is historical.
- FinanceMeta has three different surfaces: portal, evidence workspace, and landing surface. Their files, deployments, auth environments, and branches are not interchangeable.
- Space-JEPA work currently lives inside `vertex-studyAI/vertexED.ai`; do not invent or target a separate `Space-JEPA` repository unless one is explicitly created and designated later.

## Safety rules

- Never copy a branch, commit, file, deployment URL, environment identifier, Supabase project, or CI result from one project into another because names look similar.
- Never reinterpret a historical repository/commit reference as the current source repository.
- Before a write, verify the repository full name and branch against this file or a newer explicit user instruction.
- Current source truth and historical evidence may coexist; preserve historical provenance instead of rewriting old commit identities.
