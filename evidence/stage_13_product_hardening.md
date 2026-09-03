# VertexED Stage 13 — product hardening and truth consolidation

**Date:** 2026-09-02

**Result:** PASS at the local source and deterministic browser boundary.

**Production boundary:** `DEPLOYED_VERIFIED=false`.

## Material changes

- Removed all repository lint errors and React hook dependency warnings without weakening ESLint.
- Removed the unused fluid-cursor and particle renderers; live browser startup proved Three.js remains required by NeuroCAD, so that dependency was retained.
- Unified signup, invitation and recovery credential strength through `passwordPolicy.mjs`; recovery no longer accepts an eight-character password that account creation would reject.
- Added persistent labels, constraints and instructional text to password-creation and recovery forms.
- Rebuilt Paper Maker configuration as a stable labeled form and extended the authenticated golden journey to exercise its curriculum defaults and controls.
- Cleared the `fast-uri` 3.1.5 advisory with the compatible 3.1.6 override.
- Fixed local/CI build revision residue while preserving the immutable stamp during Vercel packaging.
- Made local public Playwright runs skip deployed-API assertions unless an explicit `PLAYWRIGHT_API_URL` is supplied.
- Prevented the ordinary source suite from rewriting tracked NeuroCAD QA timings; evidence refresh now requires `UPDATE_NEUROCAD_PRODUCT_QA=1`.
- Added canonical `PROJECT_STATUS.md` and `TRUTH_MAP.md`.

## Verification

| Gate | Result |
|---|---|
| Full CI (`npm run ci`) | PASS |
| Source tests | 747 passed, 0 failed |
| Frozen evaluation tests | 25 passed, 0 failed |
| TypeScript | PASS |
| Full ESLint | 0 errors; 14 Fast Refresh organization warnings |
| Production dependency audit | 0 vulnerabilities |
| Production build | PASS; 2,756 modules |
| Vercel topology | 1 function; 19 routed endpoints |
| Authenticated golden journey | 1 passed |
| Local accessibility | 34 passed; 2 inapplicable skips |
| Public responsive journey | 32 passed; 20 deployed-API checks intentionally skipped locally |
| NeuroCAD product matrix | 125 deterministic cases passed; tracked artifact remained clean |
| Git whitespace check | PASS |

## Frozen performance evidence

- Initial JavaScript gzip: 176,901 / 275,000 bytes.
- Initial CSS gzip: 33,751 / 45,000 bytes.
- Largest JavaScript gzip: 232,813 / 240,000 bytes.
- Total JavaScript gzip: 909,469 / 1,000,000 bytes.
- Violations: 0.

## Remaining release boundary

Canonical deployment, current production Supabase state, live providers and real disposable-account lifecycle certification require authorized external access. No deployment or efficacy claim was inferred from local evidence.
