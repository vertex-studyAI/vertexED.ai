# Portfolio Repository Matrix — 2026-08-29

Evidence cutoff: 2026-08-29 06:32 IST execution wave.

This matrix records only currently connected GitHub evidence. It does not infer local-machine state, production deployment success, scientific success, sales, outreach, experiments, or external validation.

| Repository / lane | Canonical branch / head | Current verified state | Blocker | Next executable gate | Latest verified evidence |
|---|---|---|---|---|---|
| `vertex-studyAI/vertexED.ai` — repository controls | `main` @ `735b464957a4c05e803a6179af8619b23a27d42c` | `main` is unprotected; required status checks enforcement is off | Connected GitHub write surface does not expose repository-admin/ruleset mutation | Owner/admin enables PR + stable CI + review where supported + no force-push/delete, then re-read branch/ruleset state | Fresh branch read after Percy merge; issue #551 updated to current head |
| `vertex-studyAI/vertexED.ai` — Percy/control-plane | `main` @ `735b464957a4c05e803a6179af8619b23a27d42c` | PR #539 merged through the PR path; fail-closed runtime-resume checker is now integrated. Actual Percy V12 runtime remains UNKNOWN | Real Percy host/source/process/SQLite/queue/heartbeat/resource/provider evidence unavailable; issue #95 still requires old/current schema regressions and real worker classification | Repair/verify the actual runtime source and capture non-secret runtime evidence JSON from the real host | #539 source head `14fe57df0038fdfcb54c029bad443d06a79f2719`; CI `33176082068` SUCCESS; merge commit `735b464957a4c05e803a6179af8619b23a27d42c` |
| `vertex-studyAI/vertexED.ai` — Olympus | PR #553 head `9d3f1857926d4ab3ea2e4254fb2a8884145522a2` | O0 remains highest verified maturity. O1 preregistration is exact-head CI green and mergeable, but PR remains draft because connector draft→ready GraphQL transition fails | 100-row manifest, exact arm configs, harness, deterministic analysis, artifact schema, budget-parity checks not yet integrated; connector cannot mark PR ready | Human/UI or repaired connector marks #553 ready; then integrate the preregistration and build run-ready harness as a separate bounded gate | CI `33222164838` SUCCESS; no submitted reviews; no unresolved review threads |
| `vertex-studyAI/vertexED.ai` — competition/opportunity package | PR #543 head `bb5a398c16ca94f3ecfebbe2b8c1cf0af67b6560` | Open, non-draft, mergeable, exact-head CI verified | Follow-up product/research implementation belongs to specialist lanes | Leave implementation to owning lanes; normal review of package only | CI `33178562986` SUCCESS |
| `vertex-studyAI/Text-To-Video` — repository controls | `main` @ `15af0cf315fcf53235c7f4f2f3f90712fc13c5fe` | `main` remains unprotected; required checks enforcement off | Connected GitHub write surface lacks repository-admin/ruleset mutation | Owner/admin protects `main`, then re-read settings | Fresh branch read; issue #36 updated to current head |
| `vertex-studyAI/Text-To-Video` — local artifact store status | `main` @ `15af0cf315fcf53235c7f4f2f3f90712fc13c5fe` | PR #32 merged; local durable queue/store truth is integrated | Hosted/production storage remains unestablished | Keep hosted/production claims separate | Merge commit `15af0cf315fcf53235c7f4f2f3f90712fc13c5fe`; source CI `31932198400` SUCCESS |
| `vertex-studyAI/Text-To-Video` — Datapoint review pack | PR #34 head `f690f38d4955b48966f5cbf62793bef4dd8a64ae` | Open, non-draft, mergeable, exact-head CI green | Genuine external human-evaluation approval/data absent | Preserve preregistered review pack; do not convert source/CI evidence into a human-evaluation claim | CI `33085647817` SUCCESS |
| `vertex-studyAI/Text-To-Video` — WorldInvariant | PR #33 open | Research Deep Lab-owned; intentionally not advanced in this lane | Evaluator controls/research execution remain open | Leave to Research Deep Lab | Open PR #33 |
| `vertex-studyAI/LAM-JEPA` | Connected dedicated repository | Paper/Research specialist lane; intentionally excluded | Owner metadata/external review/submission/scientific gates tracked there | Do not duplicate specialist execution | Open Paper/Research PRs visible and excluded |
| Obscured Records | No matching installed GitHub repository found | NOT ACCESSIBLE through current GitHub connector | Canonical repo not connected/discoverable | Identify/connect canonical repo before mutation | Fresh installed-repo search returned no match |
| Cove / Shopify code | No matching installed GitHub repository found | GitHub code surface not accessible here | Canonical repo not connected/discoverable | Use Shopify lane for store operations; identify repo only if theme/app code exists | Fresh installed-repo search returned no match |

## Current open-PR deduplication

Specialist-owned and intentionally excluded from this lane: VertexED product/security/auth PRs #552/#550/#548/#547/#538; Research PRs #546/#522/#529/#492; Text-To-Video research PR #33; LAM-JEPA Paper/Research PRs. Competition #543 is tracked for package truth only and not used to take product/research implementation away from specialist lanes.

## Truth rules

- Source/CI green is not production green.
- Local artifact verification is not hosted production readiness.
- Runtime snapshots are not proof of a live Percy worker.
- Integrated Percy readiness logic is not proof that Percy V12 is running.
- Runtime-role names are not proof of trained learned models.
- Olympus remains O0 until O1 is actually executed under the frozen protocol and retained.
- Structural Project 2424 completeness is not scientific completion.
- Negative, mixed, inconclusive, falsified, and blocked scientific outcomes remain preserved exactly.
- An unprotected `main` branch is a repository-control gap even when operators voluntarily use PRs.
