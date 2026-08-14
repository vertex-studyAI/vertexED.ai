# LAM-JEPA INDEPENDENT ARTIFACT RE-AUDIT — 2026-08-14

**Purpose:** independently inspect and recompute the retained frozen ARC-v3 evidence without changing scientific source, metrics, thresholds, seeds or locked-test policy.

## Artifact identity

Primary rerun:

- artifact `9162165932`;
- independently downloaded ZIP SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`;
- recorded digest: same;
- scientific source SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`.

Attempt-4 audit:

- artifact `9163503934`;
- independently downloaded ZIP SHA-256 `14c315cd64b2b96d48af4b865bca700a101ea66842a78f35382a5f408805b10a`;
- recorded digest: same.

## Row-level recomputation

For every seed/variant, validation accuracy was recomputed from retained per-example `label` and `prediction` fields. Each seed has 295 eligible validation predictions.

### Full LAM-JEPA

Seed accuracies:

`[0.2406779661, 0.2644067797, 0.2644067797, 0.2406779661, 0.2644067797]`

Recomputed mean `0.2549152542`, sample SD `0.0129968064`. Stored mean `0.2549152493`, sample SD `0.0129968006`; the difference is low-order numeric representation and does not change the conclusion.

### `no_planner`

Seed accuracies:

`[0.2406779661, 0.2644067797, 0.2406779661, 0.2406779661, 0.2644067797]`

Recomputed mean `0.2501694915`, sample SD `0.0129968064`.

Full − no_planner paired effects:

`[0, 0, 0.0237288136, 0, 0]`

Recomputed mean `+0.0047457627`, sample SD `0.0106118480`. Mechanism criterion remains **not met**.

### `no_target`

Seed accuracies:

`[0.2406779661, 0.2644067797, 0.2813559322, 0.2406779661, 0.2813559322]`

Recomputed mean `0.2616949153`, sample SD `0.0203954020`.

Full − no_target paired effects:

`[0, 0, -0.0169491525, 0, -0.0169491525]`

Recomputed mean `-0.0067796610`, sample SD `0.0092834332`. Mechanism criterion remains **not met**.

### Shuffled-label negative control

Seed accuracies:

`[0.2644067797, 0.2406779661, 0.2813559322, 0.2644067797, 0.2644067797]`

Recomputed mean `0.2630508475`, sample SD `0.0145011862`. The frozen ceiling is `0.35`, so this control gate passes; it does not rescue the model/mechanism claim.

## Reporting-metadata inconsistency re-audited

The frozen raw result contains a stale `protocol.claim_boundary` sentence saying the invocation is “not the final five-seed/20-epoch protocol.” A strict verifier that respects that sentence reports `final_five_seed_20_epoch_protocol_executed=false` and an execution-only verdict.

However, the actual workflow at scientific SHA `760aa7f9…` explicitly executes:

- seeds `1 2 3 4 5`;
- `--epochs 20`;
- batch size `32`;
- learning rate `0.0003`;
- full eligible train rows `1117`;
- full eligible validation rows `295`;
- CPU;
- train + validation only;
- explicit assertion that the test parquet is absent.

The workflow then asserts from retained evidence that the seed/epoch/full-row budget executed, locked test is false, normalized verifier verdict is `PROTOCOL_V3_FULL_CONTROLS_VALIDATION_VERIFIED`, aggregate normalization drift is `<=1e-6`, and `research_complete=false`.

This re-audit agrees with the LAM-JEPA repository's existing classification: **the stale sentence is a preserved reporting-metadata defect, not evidence that the five-seed/twenty-epoch command failed to execute.** That conclusion is supported by executable workflow arguments plus retained row counts/seeds/epochs and independent arithmetic; the raw artifact is not rewritten.

## Scientific conclusion

This audit does not establish LAM-JEPA superiority. It strengthens only the reproducibility of the negative/mechanism-null result:

- planner contribution criterion: unsupported;
- target-path contribution criterion: unsupported;
- locked ARC test: unused;
- broad benchmark/JEPA failure: not claimed;
- `research_complete`: false.

The capacity-matched supervised comparison is a separate retained lineage and was not independently recomputed in this audit. Any manuscript sentence using that baseline must cite its own provenance rather than treating artifact `9162165932` as if it contained the supervised arm.

## Paper implication

The negative paper package may use full/no-planner/no-target/shuffled-control results above as independently re-audited evidence. The reporting-metadata defect must remain disclosed. The capacity-matched-supervised row still requires explicit separate artifact provenance before `PAPER_PACKAGE_GREEN`.