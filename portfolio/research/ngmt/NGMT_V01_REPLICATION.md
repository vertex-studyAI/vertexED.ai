# NGMT v0.1 — Unchanged-Protocol Replay Verification

After the first valid scientific result was observed, the workflow trigger was narrowed so result/bug documentation no longer retriggers scientific execution. The workflow-file change itself intentionally caused one final unchanged-protocol replay.

This replay is **reproducibility evidence**, not a new hypothesis test and not an opportunity to alter the frozen v0.1 gate.

## Replay provenance

**Actions run:** `31661621771`  
**Execution head:** `7e4547345052c3514219005fc00f396d4efa0838`  
**Artifact:** `9166406618`  
**Artifact ZIP SHA-256:** `5a34b13b54761e894b5cd3de2941c44121ea39705f8588e83aaf8a18dd2d7d06`  
**Replay raw `results.json` SHA-256:** `7f67822872960ed037cb4bbe66dbcd1faa99d86d7ea0b954636c5ccc37c7b684`

Replay scientific verdict:

`NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`

## Independent comparison against first valid run

First valid run:

- run `31661313386`;
- head `385ea6251561ed2a7b05b6a6f10307666b169b80`;
- artifact `9166307730`;
- artifact digest `sha256:ec7d88d342271ad28b6f9ae485338985a219b7d43d55dd45350a4611c585ce76`;
- raw `results.json` SHA-256 `f8feeccc6ca864efc6389c9e8b9b952698d349251d332f81735c542913f33b14`.

The two artifact payloads were unpacked independently and compared after execution.

Exactly identical across the two valid runs:

- all six-condition aggregate metric tables;
- all three paired-seed adverse/clean effect rows;
- aggregate paired-effect means and sample SDs;
- all frozen criteria booleans;
- final negative/inconclusive verdict;
- B0/B1/B2/B3 parameter counts;
- B1/B2/B3 runtime-memory capacities;
- all twelve epoch-by-epoch training histories;
- **all twelve model-checkpoint SHA-256 hashes**.

Not identical:

- per-arm wall-clock runtime fields;
- therefore the full `results.json` byte hash and artifact ZIP hash.

The differing timing fields are expected nondeterministic execution metadata and do not change any scientific metric, checkpoint, criterion or conclusion.

Replay process envelope:

- wall clock about `69.65 s`;
- peak RSS `324164 KiB`;
- exit status `0`.

## Scientific implication

This replay materially strengthens execution reproducibility of the **negative** v0.1 result. It does not turn the result positive and does not support statistical significance or general NGMT superiority.
