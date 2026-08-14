# LAM-JEPA INDEPENDENT ARTIFACT RE-AUDIT — 2026-08-14

**Purpose:** independently inspect and recompute the retained frozen ARC-v3 evidence without changing scientific source, metrics, thresholds, seeds or locked-test policy.

## Artifact identity
Primary rerun artifact `9162165932`, independently downloaded ZIP SHA-256 `caa898f1ff046a337db9b5ddbffe1b332943a732868e2fd809abeda8ee89c30b`; scientific source SHA `760aa7f9a73a177d5ff4ba7eb470f7e68ace63cb`.

Attempt-4 audit artifact `9163503934`, independently downloaded ZIP SHA-256 `14c315cd64b2b96d48af4b865bca700a101ea66842a78f35382a5f408805b10a`.

## Row-level recomputation
For every seed/variant, validation accuracy was recomputed from retained per-example `label` and `prediction` fields. Each seed has 295 eligible validation predictions.

- Full seed accuracies `[0.2406779661, 0.2644067797, 0.2644067797, 0.2406779661, 0.2644067797]`; recomputed mean `0.2549152542`, sample SD `0.0129968064`.
- `no_planner` seed accuracies `[0.2406779661, 0.2644067797, 0.2406779661, 0.2406779661, 0.2644067797]`; mean `0.2501694915`, SD `0.0129968064`. Full − no_planner mean `+0.0047457627`, SD `0.0106118480`; mechanism criterion remains not met.
- `no_target` seed accuracies `[0.2406779661, 0.2644067797, 0.2813559322, 0.2406779661, 0.2813559322]`; mean `0.2616949153`, SD `0.0203954020`. Full − no_target mean `-0.0067796610`, SD `0.0092834332`; mechanism criterion remains not met.
- shuffled-label seed accuracies `[0.2644067797, 0.2406779661, 0.2813559322, 0.2644067797, 0.2644067797]`; mean `0.2630508475`, SD `0.0145011862`. Frozen ceiling `0.35` passes; this does not rescue the mechanism claim.

## Reporting-metadata inconsistency
The frozen raw result contains a stale `protocol.claim_boundary` sentence saying the invocation is “not the final five-seed/20-epoch protocol.” The actual workflow at scientific SHA `760aa7f9…` explicitly executes seeds `1 2 3 4 5`, `--epochs 20`, batch size `32`, learning rate `0.0003`, 1117 eligible train rows, 295 eligible validation rows, CPU, train+validation only, and explicitly asserts the test parquet is absent. This is classified as a preserved reporting-metadata defect, not evidence that the five-seed/twenty-epoch command failed. The raw artifact is not rewritten.

## Scientific conclusion
This audit strengthens only reproducibility of the negative/mechanism-null result: planner contribution unsupported; target-path contribution unsupported; locked ARC test unused; broad benchmark/JEPA failure not claimed; `research_complete=false`. The capacity-matched supervised comparison is a separate retained lineage and was not independently recomputed here.

## Paper implication
The negative paper may use the full/no-planner/no-target/shuffled-control results above as independently re-audited evidence. The metadata defect remains disclosed. The matched-supervised row requires its separate artifact provenance before any paper-package GREEN claim.
