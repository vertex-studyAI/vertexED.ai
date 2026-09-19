# DO NOT DEPLOY THIS BRANCH AS-IS

Branch: `codex/vertexed-publication-readiness`

As of 2026-09-19:

- Production serves `origin/main` (not this dirty tree).
- Divergent untracked agents copies were quarantined to
  `/Volumes/PRO-BLADE/.codex-tmp/quarantine-vertexed-dirty-agents-20260919`.
- Canonical agents work is PR https://github.com/vertex-studyAI/vertexED.ai/pull/917
- Remaining local changes are study-UI WIP only — rebase onto main before any PR.

Gate probes: on `work/heavy-exec` run `npm run probe:gates`.
