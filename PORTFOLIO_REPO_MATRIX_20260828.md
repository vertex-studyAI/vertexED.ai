# Portfolio Repository Matrix — 2026-08-28

Evidence cutoff: 2026-08-28 23:31 IST automation wave.

This matrix records only currently connected GitHub evidence. It does not infer local-machine state, production deployment success, scientific success, sales, or external validation.

| Repository / lane | Canonical branch / head | Current verified state | Blocker | Next executable gate | Latest verified evidence |
|---|---|---|---|---|---|
| `vertex-studyAI/vertexED.ai` — Percy/control-plane slice | `main` @ `9b3a5c350101c466c82621acee38750f1a456a0c` | Repo-level Percy readiness checker has exact-head CI success on PR #539; actual Percy V12 runtime remains UNKNOWN | Real Percy host/source/process/SQLite/queue/heartbeat/resource/provider evidence unavailable | Capture non-secret runtime evidence JSON on actual host; run readiness checker; keep issue #95 open until runtime defects are fixed | PR #539 head `14fe57df0038fdfcb54c029bad443d06a79f2719`; CI run `33176082068` SUCCESS |
| `vertex-studyAI/vertexED.ai` — Olympus | `main` @ `9b3a5c350101c466c82621acee38750f1a456a0c` | O0 recovered runtime mechanics supported; Hermes/Prometheus/Perseus/Atlas/Kronos are runtime roles, not evidenced trained frontier models | O1 matched-provider controlled experiment not yet executed | Freeze provider/version/task set/budgets and execute O1 benchmark only when specialist ownership is clear | `portfolio/research/OLYMPUS_ROADMAP.md` |
| `vertex-studyAI/vertexED.ai` — competition/opportunity package | PR #543 head `bb5a398c16ca94f3ecfebbe2b8c1cf0af67b6560` | Source package exact-head CI verified | Follow-up implementation issues #540/#541/#542 remain open | Progress judge path, pilot export, and evidence-safe progress metrics without upgrading production/research claims | CI run `33178562986` SUCCESS |
| `vertex-studyAI/Text-To-Video` — local artifact store status | `main` @ `5b9835a06f41f07f52029ee830b82565969c0965`; PR #32 head `3dd93b8c5470d3f2988e7ec96968973d85d3a38b` | Durable queue + verified local artifact-store lineage integrated on main; reconciliation PR exact-head CI verified | PR #32 still open/draft; hosted/production storage not established | Review/merge documentation reconciliation through normal process; separately define remote/hosted boundary if desired | CI run `31932198400` SUCCESS |
| `vertex-studyAI/Text-To-Video` — Datapoint review pack | PR #34 head `f690f38d4955b48966f5cbf62793bef4dd8a64ae` | External-review package source/CI verified | Real human-review data not yet collected | Review package; retain freeze checklist; collect only predeclared human-evaluation evidence if authorized | CI run `33085647817` SUCCESS |
| `vertex-studyAI/Text-To-Video` — WorldInvariant research | PR #33 open | Specialist research lane; intentionally not advanced here | Research/evaluator control gates remain | Leave to Research Deep Lab to avoid duplicate scientific execution | Open PR #33 |
| `vertex-studyAI/LAM-JEPA` | `main` @ latest connected specialist state | Specialist Paper/Research lane; intentionally not advanced here | Owner metadata/external review/submission gates tracked elsewhere | Leave scientific/paper execution to specialist lanes | Dedicated LAM-JEPA repository connected |
| Obscured Records | No installed GitHub repository found in connected installation | NOT ACCESSIBLE through current GitHub connector | Repository not connected/discoverable | Connect or identify canonical repository before repo-level work | Installed-repo search returned no match |
| Cove / Shopify code repository | No installed GitHub repository found under `Cove` | GitHub code surface not found here | No canonical connected repo | Use Shopify lane/plugin for store operations; identify repo only if theme/app code exists | Installed-repo search returned no match |

## Deduplication boundary

This lane does not take work actively owned by the Paper, Research Deep Lab, VertexED specialist, or Bu1LD+FinanceMeta specialist lanes. It may record their current evidence only to prevent duplicate work.

## Truth rules

- Source/CI green is not production green.
- Local artifact verification is not hosted production readiness.
- Runtime snapshots are not proof of a live Percy worker.
- Runtime-role names are not proof of trained learned models.
- Structural Project 2424 completeness is not scientific completion.
- Negative, mixed, inconclusive, falsified, and blocked scientific outcomes remain preserved exactly.
