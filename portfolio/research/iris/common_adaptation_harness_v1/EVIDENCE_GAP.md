# IRIS common adaptation harness v1 — evidence gap

## Status

**Release/reproducibility status: BLOCKED_ON_RETAINED_EVIDENCE_PROVENANCE**

This note does **not** alter the frozen scientific result. The development verdict remains `NEGATIVE_OR_INCONCLUSIVE_DEVELOPMENT_GATE`, and reserved confirmatory seeds `1000–1029` remain quarantined.

## Why this note exists

`RESULTS.md` states that the experiment retained `raw.csv` and `summary.csv`, that a repaired attempt reproduced their scientific outputs byte-for-byte, and that `verify.py` independently recomputed the frozen criteria from those retained artifacts.

At the time of this audit, the canonical branch directory `portfolio/research/iris/common_adaptation_harness_v1/` exposes only:

- `PROTOCOL.json`
- `REPRODUCE.md`
- `RESULTS.md`

The claimed retained CSV evidence and verifier are therefore not present in this directory. They may exist elsewhere, but their canonical location/provenance is not established by the branch-local release surface.

## Integrity consequence

The numerical result may remain a valid internal development result, but this branch must **not** be represented as a self-contained reproducibility package or submission-ready evidence bundle until the retained artifacts are located and provenance-checked.

Do not regenerate missing evidence and present it as the original retained evidence. Do not access reserved confirmatory seeds to repair this packaging gap.

## Required closure evidence

Close this block only when all of the following are satisfied:

1. Locate the original retained `raw.csv` from the valid repaired attempt.
2. Verify its SHA-256 is exactly `5f1bfb8cfc8114583e0e55d491d2776522cc9d1e4451289ef260c502e27c501e`.
3. Locate the original retained `summary.csv` from the valid repaired attempt.
4. Verify its SHA-256 is exactly `62355d6aa7eff081e3a940bae65a6ec71a55f789f9e48f398e1031439dc34c1b`.
5. Locate the exact `verify.py` used for the independent verification reported in `RESULTS.md`, or establish a cryptographically/procedurally traceable canonical verifier location.
6. Confirm the raw evidence contains 720 rows as reported.
7. Confirm no seed in `1000–1029` appears in any retained evidence.
8. Record source paths, commit/artifact identifiers, hashes, and verification commands in a manifest.
9. Re-run only the verifier against the retained artifacts; do **not** rerun or retune the scientific experiment merely to fill this provenance gap.
10. Preserve any invalid-attempt evidence separately and label it invalid rather than overwriting it.

## Allowed next actions

- provenance search for the original retained artifacts;
- hash verification;
- manifest creation;
- independent verifier execution on the retained development artifacts;
- documentation fixes that do not change the frozen protocol or scientific verdict.

## Forbidden next actions

- accessing confirmatory seeds `1000–1029`;
- changing thresholds, metrics, methods, seeds, or gate arithmetic retroactively;
- retuning PABIM against this result;
- regenerating evidence and calling it the original retained evidence;
- upgrading the scientific claim beyond the frozen negative/inconclusive development verdict.

## Closure record

When the block is resolved, append a closure record here with the canonical artifact locations, exact hashes, verifier identity, verification output, and commit SHA. Until then, this file is the authoritative warning that the branch-local evidence package is incomplete.
