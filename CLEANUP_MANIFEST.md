# Cleanup manifest

27 September 2026 ASTRA pass: no unique source, data, evidence, manuscript, asset or historical result was deleted, merged away or archived out of this repository.

- Preserved the initial working-tree patch and status in local `ci-evidence/astra-20260927/`.
- Added only that pass-specific evidence directory to `.gitignore`, preserving its files locally. It contains raw logs, screenshots and the pre-existing user diff and is not a public release bundle.
- Extracted practice-session parsing/navigation/write guards from `LearningWorkspace.tsx` into `src/lib/practiceSession.mjs`; the new module is imported by the real application and regression tests.
- Retained the 25 September reports, uncommitted workflow/docs changes, source lockfile, brand assets and repository-isolation history.
- Build and evaluation commands regenerate their normal derived outputs. No scientific or editorial threshold was relaxed.
