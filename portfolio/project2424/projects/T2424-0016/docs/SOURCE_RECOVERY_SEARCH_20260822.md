# T2424-0016 PST — Source Recovery Search — 2026-08-22

## Purpose

Recover the original Prompt-6 PST implementation/evidence tree **without reconstructing it from prose and without rerunning a different experiment under the same identity**.

Canonical task: `T2424-0016` — PST — Predictive Single-Cell Transition Score.  
Recovered source alias: `MODEL-PST`.  
Recorded isolated workspace: `/mnt/data/pst_prompt6_bundle/projects/MODEL-PST/`.

## Search result

**Verdict: `SOURCE_ARTIFACT_NOT_RECOVERED_FROM_CURRENT_CONNECTED_SURFACES`**

The search found strong evidence that the original tree existed and was executed, but it did not find an accessible byte-identical source archive/tree that can be safely migrated today.

### GitHub canonical repository

Present:

- canonical T2424 identity and recovery package;
- recovered claim/evidence records;
- recovery validator and regression tests;
- detailed recovery report;
- historical PR/CI evidence for the recovery package.

Absent from the canonical repository:

- original Prompt-6 neural source tree;
- original checkpoints;
- original raw per-run evidence directories;
- original `evidence/INDEX.json` with the 24 manifest/hash records;
- original compact/full config tree as executable source provenance;
- an immutable original Git commit, because the isolated handoff explicitly recorded that no Git repository was mounted.

### File Library recovery sweep

Search terms included:

- `pst_prompt6_bundle`;
- `MODEL-PST`;
- `PROJECT_2424_SWARM_PROMPT06`;
- Prompt-6 PST archive/manifest variants;
- `experiments/run.py`, `configs/compact.json`, `evidence/INDEX.json`, checkpoint/evidence archive combinations.

Recovered:

1. `MODEL-PST.md` handoff, which records that the complete project-local package existed beneath `projects/MODEL-PST/` and included source, tests, configs, dataset/baseline contracts, experiment CLIs, evidence, checkpoints, reports, documentation, manuscript sources, compiled PDF, bibliography and claim-evidence matrix.
2. Historical PST manuscripts/LaTeX drafts.
3. Historical audit documents explicitly stating that the current Prompt-6 bundle/raw logs were not discoverable at the time of those audits.

Not recovered:

- a Prompt-6 PST `.zip`, `.tar`, directory export or equivalent source archive;
- a Prompt-6 archive manifest enumerating the original files/hashes;
- the original individual source modules from `projects/MODEL-PST/`;
- the original checkpoint files;
- the original 24 per-experiment evidence directories/manifests.

### Google Drive sweep

A direct search for `pst_prompt6_bundle` returned no matching Drive artifact. A broader Predictive Stability Theory search returned research/portfolio documents but did not identify an original Prompt-6 source archive suitable for migration.

## Provenance conflict discovered and quarantined

The File Library contains historical PST manuscripts that claim results on Paul15, Pancreas and Dentate Gyrus, including headline metrics around AUROC `0.8090`, AUPRC `0.9216`, Top-K `0.9902`, and a claim that calibration improved the reported metrics.

Those manuscripts are **not valid evidence for the recovered Prompt-6 package**.

The stronger recovered Prompt-6 handoff/recovery report instead records:

- executed evidence class `SYNTHETIC_CONTROLLED`;
- main calibrated compact AUROC `0.9744 ± 0.0115` and AUPRC `0.9101 ± 0.0320` on the controlled generator;
- raw-expression logistic AUROC `0.9968`, outperforming the neural PST variant;
- validation-only calibration worsening AUROC/AUPRC/ECE/Brier relative to the raw score;
- fixed family-A→family-B transfer AUROC `0.6577` despite strong family-B in-domain retraining;
- **no external biological dataset executed in the recovered compact release**;
- historical Paul15/Pancreas/Dentate metrics explicitly quarantined until raw logs, exact dataset identities/checksums and executable source provenance are recovered.

Therefore all older manuscript statements presenting those biological numbers as current verified results remain `UNVERIFIED_HISTORICAL`. They must not be copied into the canonical claim ledger or used to promote PST.

## What can be trusted now

The following are recoverable as provenance statements, not independent rerun proof:

- `python -m pytest -q` — 7 passed in the isolated package;
- smoke run: seed 11, synthetic family A;
- compact: seeds 11/29/47, 21 runs across main plus six variants;
- transfer: seed 71, A→B;
- family-B in-domain: seed 71;
- recorded 24 per-experiment manifests passed SHA-256 and size validation;
- recovered controlled metrics and negative findings recorded in the canonical recovery report.

The current GitHub recovery package can validate that these recovered statements and claim boundaries are internally represented. It cannot recreate the missing original source/checkpoint/raw-evidence bytes.

## Fail-closed migration acceptance contract

Do not mark source recovery complete until an artifact is found that can satisfy all of the following:

1. contains the original `projects/MODEL-PST/` source tree or a demonstrably byte-identical export;
2. contains executable source, tests and configs rather than manuscript-only descriptions;
3. contains the original evidence index/manifests or enough raw evidence to validate their recorded hashes;
4. contains checkpoint files or explicit original checkpoint hashes with matching recovered bytes;
5. preserves the recorded seed/config/split semantics;
6. does not silently replace historical external-data claims with synthetic evidence or vice versa;
7. receives a new immutable canonical Git commit after migration;
8. passes tests in a clean environment;
9. replays the compact synthetic protocol without changing thresholds/seeds after observing outcomes;
10. produces a reproduction report comparing recovered results to the retained values and preserving deviations/failures.

If a candidate archive cannot satisfy these conditions, record it as partial provenance and continue searching. Do not synthesize missing modules to make the tree appear complete.

## Next action

Search any still-unmounted local/external storage that may retain `/mnt/data/pst_prompt6_bundle`, a Prompt-6 export, or an archive created around 2026-07-26. If a candidate is found, hash the archive before extraction, inventory every file, compare against the handoff's expected path families, and migrate it on a dedicated recovery branch without semantic changes.

External biological validation is **not** the next action. It remains blocked until source recovery/reproduction and exact dataset accession/version/licence/checksum/label/split contracts are resolved.
