# Reproducibility wave — frozen evidence boundary

This marker exists to distinguish the **scientific execution head** from later documentation/package commits.

- Frozen scientific Project 2424 execution commit: `f439498fa6aaf86bb9c0cb37002fcfaa2156c925`
- Frozen workflow run: `31659677450` (`SUCCESS`)
- Artifact id: `9165714770`
- Artifact digest: `sha256:e14bc156dae3190c48bfcb910ce3318207f64f27fb1dcc5ab2e7f774699442a0`
- The artifact contains environment capture, raw JSON, focused test logs, per-experiment runtime files, and `SHA256SUMS.txt`.

Subsequent commits in this draft PR package and document that evidence, including the NeuroCAD bug-before/fix-after record and IRIS local audit. They do **not** retroactively change the frozen scientific outputs, thresholds, seed policies, or claim boundaries.

The dedicated reproducibility workflow is manual-dispatch only after this freeze. Canonical repository CI may run on later documentation/package heads, but those CI runs are software-integration evidence rather than new scientific experiments.
