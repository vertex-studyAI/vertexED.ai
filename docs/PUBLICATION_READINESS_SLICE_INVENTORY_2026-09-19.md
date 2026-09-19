# PUBLICATION readiness slice inventory — 2026-09-19

Parked on branch `work/study-ui-wip-20260919` (local+remote WIP). **Do not deploy.**

## Intent

Study-interface / publication polish that accumulated on `codex/vertexed-publication-readiness`, with agents work removed (canonical agents = PR #917).

## Included themes (from commit)

- Global study search (`GlobalStudySearch`, `globalSearchIndex`)
- MYP practice progress + lesson expansion
- Revision stack scoring / landing example rotation
- Apex route + auth UI helpers
- Study guide publication helpers
- Assorted a11y / layout / CSS polish
- Docs: custom domain + Gate 1b notes (also on #917 line)

## Before merge

1. Rebase onto current `origin/main` (expect conflicts in `vercel.json`, smoke/readiness docs)
2. Drop any duplicate of already-merged #908/#912/#914 changes
3. Keep agents exclusively from #917
4. Full `npm run typecheck && npm run test:app && npm run lint`
5. Explicit product review of marketing/copy claims

## Verification at park time

- `npm run typecheck` PASS on parked tree
- New unit tests listed above intended to be run in CI after rebase
