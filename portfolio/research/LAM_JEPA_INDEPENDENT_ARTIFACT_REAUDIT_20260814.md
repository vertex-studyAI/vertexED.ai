# LAM-JEPA INDEPENDENT ARTIFACT RE-AUDIT — 2026-08-14

**Purpose:** independently inspect and recompute the retained frozen ARC-v3 evidence from GitHub Actions artifacts without changing the scientific source, metrics, thresholds, seeds or locked-test policy.

## Artifact identity

Primary retained rerun artifact:

- artifact `9162165932`;
- independently downloaded ZIP SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`;
- recorded digest in LAM-JEPA provenance: same value;
- scientific source SHA: `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`.

Attempt-4 audit artifact:

- artifact `9163503934`;
- independently downloaded ZIP SHA-256 `14c315cd64b2b96d48af4b865bca700a101ea66842a78f35382a5f408805b10a`;
- recorded digest: same value.

## Row-level recomputation

For every seed and variant, validation accuracy was recomputed from the retained per-example `label` and `prediction` fields rather than trusting the stored aggregate.

There are 295 retained eligible validation predictions per seed.

### Full LAM-JEPA

Seed accuracies recomputed from row-level predictions:

- seed 1: `71/295 = 0.2406779661`
- seed 2: `78/295 = 0.2644067797`
- seed 3: `78/295 = 0.2644067797`
- seed 4: `71/295 = 0.2406779661`
- seed 5: `78/295 = 0.2644067797`

Recomputed:

- mean `0.2549152542`;
- sample SD `0.0129968064`.

Stored result uses low-order floating-point values:

- mean `0.2549152493`;
- sample SD `0.0129968006`.

The difference is purely low-order numeric representation and does not change the scientific conclusion.

### `no_planner`

Recomputed seed accuracies:

`[0.2406779661, 0.2644067797, 0.2406779661, 0.2406779661, 0.2644067797]`

Recomputed:

- mean `0.2501694915`;
- sample SD `0.0129968064`.

Recomputed full − no_planner paired effects:

`[0, 0, 0.0237288136, 0, 0]`

- mean `+0.0047457627`;
- sample SD `0.0106118480`.

The retained paired mechanism criterion remains **not met**.

### `no_target`

Recomputed seed accuracies:

`[0.2406779661, 0.2644067797, 0.2813559322, 0.2406779661, 0.2813559322]`

Recomputed:

- mean `0.2616949153`;
- sample SD `0.0203954020`.

Recomputed full − no_target paired effects:

`[0, 0, -0.0169491525, 0, -0.0169491525]`

- mean `-0.0067796610`;
- sample SD `0.0092834332`.

The retained paired mechanism criterion remains **not met**.

### Shuffled-label negative control

Recomputed seed accuracies:

`[0.2644067797, 0.2406779661, 0.2813559322, 0.2644067797, 0.2644067797]`

Recomputed:

- mean `0.2630508475`;
- sample SD `0.0145011862`.

The retained negative-control ceiling is `0.35`; this control gate passes. It does not rescue the model or mechanism claim.

## Reporting-metadata inconsistency re-audited

The frozen raw result contains a stale `protocol.claim_boundary` sentence that says the invocation is “not the final five-seed/20-epoch protocol.” A strict verifier that respects this metadata therefore reports `final_five_seed_20_epoch_protocol_executed = false` and an execution-only verdict.

However, the actual scientific workflow at source SHA `760aa7f9…` explicitly executes:

- seeds `1 2 3 4 5`;
- `--epochs 20`;
- batch size `32`;
- learning rate `0.0003`;
- full eligible train rows `1117`;
- full eligible validation rows `295`;
- CPU;
- train + validation download only;
- explicit assertion that test parquet is absent.

The workflow also independently asserts from retained evidence that:

- seeds equal `[1,2,3,4,5]`;
- epochs equal `20`;
- eligible row budgets are complete;
- locked test is false;
- normalized verifier verdict is `PROTOCOL_V3_FULL_CONTROLS_VALIDATION_VERIFIED`;
- `final_five_seed_20_epoch_protocol_executed = true`;
- aggregate normalization drift is `<=1e-6`;
- `research_complete = false`.

The audit therefore agrees with the LAM-JEPA repository's existing classification:

**the stale sentence is a preserved reporting-metadata defect, not evidence that the five-seed/twenty-epoch command failed to execute.**

This classification is supported by executable workflow arguments plus retained row counts, seeds, epochs and independent arithmetic; it is not based only on a rewritten status label.

## Scientific conclusion

This re-audit does **not** establish LAM-JEPA superiority.

It strengthens only the reproducibility of the negative/mechanism-null result:

- planner contribution criterion: unsupported;
- target-path contribution criterion: unsupported;
- locked ARC test: unused;
- broad benchmark/JEPA failure: not claimed;
- `research_complete`: false.

The capacity-matched supervised comparison is a separate retained lineage and is not independently recomputed in this re-audit. Any manuscript sentence using that baseline must continue to cite its own provenance rather than treating this artifact as if it contained the supervised arm.

## Paper implication

The negative paper package may use the full/no-planner/no-target/shuffled-control results above as independently re-audited evidence. The reporting-metadata defect must remain disclosed. The capacity-matched-supervised row still requires its separate artifact lineage to be explicit in the manuscript provenance graph before PAPER_PACKAGE_GREEN.