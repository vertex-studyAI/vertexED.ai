# Checkpoint — 10 August 2026

## Completed

- Merged VertexED password-recovery authorization hardening: `f5e7d1f3631f718e89bafaa539ec65516786c53a`.
- Merged stale-profile auth-session race fix: `6961002e3fa6a311a25d16d23f4b8ff742b02a0d`.
- Merged transient Study Zone account-scope reset: `02f16b8b89daabf27a99cab405a39de481c19d2f`.
- Merged Apex current-question deduplication: `4e8648d6f453d1342b132703c52daac3c4e512df`.
- Merged the falsifiable Asteroid Tracklet Baseline: `e956ec60e8fe9675cb0ca90f8a11df403458890c`; latest branch head passed canonical CI run `31407928862` / #593 before merge.
- Merged the Project 2424 First-100 evidence-first execution wave: `f7c8ff7edd693f7daa0d2fc28e9a821eeb0d2702`; latest-head build-and-test completed successfully, including the canonical release gate and Project 2424 recovery-package test.
- Created evidence-backed portfolio status, execution queue, execution evidence ledger, and checkpoint on `agent/portfolio-execution-ledger-20260810`.
- Inspected the three repositories actually exposed by the connected GitHub installation: VertexED, LAM-JEPA, and Text-To-Video.

## In progress / verifying

- Apex network abort-on-cancel: PR #150 remains open; its functional cancellation head previously passed canonical CI, but the current stacked/current-main relationship needs a clean verification before merge.
- Portfolio execution ledger branch: PR #157 remains open until the refreshed ledger/handoff is verified.

## Blocked

- Exact immutable VertexED production SHA and authenticated production certification.
- Canonical Project 2424 Git source restore/access.
- FinanceMeta target GitHub/Supabase access.
- The Bu1LD target GitHub/Supabase/Cloudflare access and production hydration/deployment skew.
- Percy local SQLite/runtime source.
- Atlas canonical GitHub repo is not exposed to this GitHub installation.

## Tests passing

- PR #147 exact head: canonical CI #577 passed before merge.
- PR #152 exact head: canonical CI #580 passed before merge.
- PR #153 exact head: canonical CI #586 passed before merge.
- PR #149 exact head: canonical CI #579 passed before merge.
- PR #145 latest head: canonical CI #593 passed before merge.
- PR #155 latest head: `build-and-test` succeeded, including the canonical release gate and Project 2424 recovery-package test. Browser jobs were cancelled by workflow concurrency while main was moving; no runtime files were changed by #155.

## Tests failing

No failing test is claimed from the connector-visible merged work in this checkpoint.

## Project 2424 First-100

- Evidence-gated queue merged: 100 candidates.
- Certified complete from that queue: 0 / 100.
- Reason: queue metadata is not implementation evidence, and the canonical Project 2424 source is still not connector-visible.
- The next count increase requires a project-specific package with implementation plus test/result evidence.

## Research experiments completed

No new LAM-JEPA or other research experiment is claimed as executed by this checkpoint. The Asteroid Tracklet Baseline is a software/research prototype package with synthetic benchmark evidence; it is not claimed as astronomical validation or a publication result.

## Important discoveries

1. Connected GitHub access currently exposes only three repositories.
2. VertexED's old build-quota narrative is stale: pre-execution main had green Vercel commit statuses; the live release blocker is exact production revision identity and authenticated certification.
3. Project 2424 now has a stable First-100 evidence queue on main, but its completed count intentionally remains 0/100 until real packages pass their gates.
4. Text-To-Video is already a meaningful local-media prototype with real MP4/ffprobe provenance, but it does not claim hosted production rendering.
5. A small standalone project can be shipped defensibly: the Asteroid Tracklet Baseline now has implementation, tests, a benchmark CLI, limitations, and an explicit real-data next gate.

## Highest-value next tasks

1. Restore/expose the canonical Project 2424 source and execute the first First-100 package end-to-end.
2. Reconcile PR #150 onto current main and rerun its canonical CI before merging.
3. Complete exact VertexED live revision certification without weakening the health assertion.
4. Obtain connector access to FinanceMeta, The Bu1LD, Atlas, and local Percy/Project 2424 sources.
5. Move the Asteroid Tracklet Baseline from synthetic falsifier to a reproducible public moving-object dataset plus a stronger baseline comparison.
