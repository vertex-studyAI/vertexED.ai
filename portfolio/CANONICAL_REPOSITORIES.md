# Canonical project repositories

**Current as of:** 6 September 2026

This file is the current repository-routing boundary for portfolio automation. When an older status report, patch package, recovery note, or evidence artifact names a different repository, treat that reference as historical provenance unless the task explicitly targets the historical repository.

| Project | Canonical current repository | Routing rule |
|---|---|---|
| VertexED.ai | `vertex-studyAI/vertexED.ai` | Use for VertexED product work and the research/control material currently hosted in this monorepo. |
| The Bu1LD member platform | `build-the-future-11/the-bu1ld-nexus` | Use for current Bu1LD application/source work. `ryangomez010/bu1ld-landing` is legacy evidence, not the current source target. |
| FinanceMeta / Finance4All portal | `build-the-future-11/finance4all-global-reach` | Use for the current portal/application. `FinanceMeta-Landing` and `FinanceMeta-Global` are separate sibling/legacy surfaces and must not be substituted automatically. |
| LAM-JEPA | `vertex-studyAI/LAM-JEPA` | Use only for LAM-JEPA-specific research work. |

## Safety rules

- Never copy a branch, commit, file, deployment URL, environment identifier, Supabase project, or CI result from one project into another because names look similar.
- Never reinterpret a historical repository/commit reference as the current source repository.
- Before a write, verify the repository full name and branch against this file or a newer explicit user instruction.
- Current source truth and historical evidence may coexist; preserve historical provenance instead of rewriting old commit identities.
