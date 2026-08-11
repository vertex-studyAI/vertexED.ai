# Project 2424 Certification Readiness Validator

This auxiliary tool turns the nine-gate completion contract into a **fail-closed evidence-integrity check**. It is designed to make inflated `CERTIFIED_COMPLETE` labels harder, not easier.

It does not certify science.

## Nine required gates

A manifest must contain exactly these keys:

1. `source_identity`
2. `falsifiable_claim`
3. `frozen_protocol`
4. `runnable_command`
5. `baseline_evidence`
6. `raw_results`
7. `ablation_or_negative_result`
8. `explicit_verdict`
9. `independent_qa`

A gate marked `passed: true` must reference at least one non-empty file inside the project root. Evidence paths may not be absolute and may not escape the project directory.

If the manifest itself declares `CERTIFIED_COMPLETE`, every gate must pass **and every referenced evidence file must have a pinned SHA-256 that matches the bytes on disk**. A missing gate, empty evidence list, missing file, empty file, path escape, malformed digest, or hash mismatch fails closed.

## Manifest shape

```json
{
  "schemaVersion": 1,
  "projectId": "T2424-0034",
  "declaredStatus": "CERTIFICATION_PENDING",
  "gates": {
    "source_identity": {
      "passed": true,
      "evidence": [
        { "path": "evidence/source-identity.txt", "sha256": "<optional while pending>" }
      ]
    },
    "falsifiable_claim": { "passed": false, "evidence": [] },
    "frozen_protocol": { "passed": false, "evidence": [] },
    "runnable_command": { "passed": false, "evidence": [] },
    "baseline_evidence": { "passed": false, "evidence": [] },
    "raw_results": { "passed": false, "evidence": [] },
    "ablation_or_negative_result": { "passed": false, "evidence": [] },
    "explicit_verdict": { "passed": false, "evidence": [] },
    "independent_qa": { "passed": false, "evidence": [] }
  }
}
```

For a pending manifest, evidence hashes are optional but the validator reports every unpinned reference. This makes the path toward immutable certification evidence explicit without pretending a pending package is complete.

## Run

```bash
node portfolio/project2424/tools/certification-readiness/check.mjs \
  --project portfolio/project2424/projects/T2424-0034 \
  --manifest portfolio/project2424/projects/T2424-0034/certification-manifest.json
```

The command prints JSON containing:

- the declared state;
- `CERTIFICATION_PENDING` or mechanical `CERTIFICATION_READY` validation state;
- missing gates;
- unpinned evidence references;
- verified evidence byte counts and actual SHA-256 digests;
- an explicit boundary object describing what the tool does **not** establish.

## Critical boundary

`CERTIFICATION_READY` means only that the manifest is structurally complete and its referenced evidence files exist, are non-empty, remain inside the project root, and match the declared hashes.

It does **not** establish:

- that a hypothesis is scientifically meaningful;
- that a protocol is well designed;
- that a baseline is appropriate;
- that raw results are correct rather than fabricated;
- that an ablation is informative;
- that a GO/PIVOT/STOP verdict is justified;
- that the QA author is actually independent;
- external validity, novelty, significance, publication readiness, or production readiness.

Therefore this tool deliberately outputs `CERTIFICATION_READY`, not `CERTIFIED_COMPLETE`, even when all mechanical gates pass. Status promotion remains an evidence-review decision outside this validator.

## Tests

The repository test suite includes `tests/project2424CertificationReadiness.test.mjs`, which covers:

- honest pending manifests;
- passed gates with no evidence;
- incomplete or unpinned `CERTIFIED_COMPLETE` claims;
- SHA-256 mismatches;
- project-root path escapes;
- exact nine-gate schema enforcement;
- a fully pinned, mechanically complete manifest.
