# T2424-0050 Darcy Latent Operator — release audit

Current decision: **NO-GO for PREPRINT_READY**.

This checklist is deliberately stricter than code/CI success. HOLD/MIXED scientific evidence remains visible.

## Closed gates

- [x] Canonical T2424-0050 identity restored to Darcy Latent Operator; prior auxiliary identity preserved outside the canonical queue path.
- [x] Canonical source package present.
- [x] Frozen 20-seed bounded screen retained in machine-readable form.
- [x] Unchanged-protocol clean reproduction documented: Linux x64, Node v22.16.0, 6/6 focused tests.
- [x] Exact reproduction lineage recorded: start `9cb6939711b82ef63c9bdd347863d74b71579d6f`, exact head `1767fa1916f0385fab22bcd0491e2bee8a9445f2`, merge `ecd13603c6105b1d69fa2a99e9fe6cbdad7b2875`.
- [x] Harder misaligned/correlated audit retained with arithmetic-mean ablation.
- [x] Negative rho=0 threshold miss and seed-6 reversal retained.
- [x] Claim-to-evidence matrix added.
- [x] Manuscript sections added: abstract, scope, methods, reproducibility, results, failure analysis, related-work boundary, limitations, data/code statement, conclusion.
- [x] Tables use only retained JSON metrics.
- [x] No learned-operator/FNO/DeepONet/PINN/POD/SOTA superiority claim.
- [x] Every bibliography entry is reconciled by title and stable identifier against its primary arXiv, Nature, or Wiley record; full metadata and explicit non-comparison boundaries are retained in `BIBLIOGRAPHY_AUDIT.md`.
- [x] Deterministic release-manifest generation binds the exact status, protocols, frozen configuration, retained result JSON, claim matrix, manuscript, bibliography audit, and release audit by byte length and SHA-256.
- [x] Automated metric reconciliation derives aligned and harder-audit values from retained JSON and fails closed if HOLD/MIXED, the rho=0 miss, seed-6 reversal, or prohibited-claim boundary drifts.
- [x] Exact-head PDF workflow renders twice and requires byte-for-byte equality after metadata normalization.
- [x] Four A4 pages visually inspected with no clipping, overlap, broken tables, missing glyphs, or pagination defects.
- [x] Extracted PDF text reconciled against the rho=0 miss, seed-6 reversal, no-learned-operator boundary, and NO-GO release state.
- [x] Release manifest records the verified PDF SHA-256, byte length, page/security properties, authored head, workflow run, temporary artifact identity, archive digest, and expiry.

## Open gates before PREPRINT_READY

- [ ] Verify repository/code license and state it exactly; do not infer.
- [ ] Record authorship and contribution statement.
- [ ] Perform independent sentence-level claim audit against the exact manuscript head.
- [ ] Place the exact digest-bound PDF in an authorized permanent archive and record its stable identifier; the expiring workflow artifact is not permanent archival evidence.
- [ ] Decide whether the parent bounded/mixed result is sufficiently novel for a standalone preprint; current evidence does not establish novelty.

## Experiments not required for this bounded parent paper

A new learned 2D successor is **not required** to document the present negative/mixed robustness lesson, but it is mandatory before any stronger learned-operator or broad Darcy superiority story. It must remain a separate preregistered study.

## Separately frozen successor gate

Before outcome access or training, the successor must fix and hash: 2D finite-volume generator/data identity; train/validation/test and OOD/resolution-transfer splits; harmonic/arithmetic/PCA or comparable reduced-order baselines; matched FNO and DeepONet comparator budgets; seeds; metrics/statistics; falsifier/success rules; hardware/environment; compute budget; artifact paths; and explicit execution authorization.

No parent-paper edit may relax the original result, remove the rho=0 miss, or erase seed 6.
