# Space-JEPA ESA pre-outcome review packet

Purpose: give an independent reviewer one compact surface for deciding whether the frozen ESA experiment is ready to move from engineering/pre-outcome state to an authorized retained scientific run.

**This document does not itself authorize execution.** The reviewer must inspect the referenced artifacts and record an explicit decision separately.

## 1. Scientific question

Does JEPA-style future-latent prediction improve spacecraft telemetry anomaly detection under a leakage-controlled evaluation, relative to fixed simple/official baselines, without anomaly labels during representation training or threshold fitting?

Authoritative protocol: `portfolio/research/space-jepa/PROTOCOL.md`.

## 2. Frozen primary model/configuration

Authoritative config: `portfolio/research/space-jepa/configs/esa_first_pass.json`.

Expected exact values:

```text
context_length = 64
target_length = 16
d_model = 96
n_heads = 4
n_layers = 3
predictor_layers = 2
ff_mult = 4
dropout = 0.1
ema_decay = 0.996
variance_weight = 0.05

epochs = 20
batch_size = 128
learning_rate = 0.0003
train_stride = 4

score_stride = 1
score_batch_size = 256
threshold_quantile = 0.995

seeds = [17, 29, 43, 71, 101]
status = FROZEN_PRE_OUTCOME_FIRST_PASS
```

Reviewer check:

- [ ] the executable runner consumes these values without hidden overrides;
- [ ] no test/held-out outcome was used to select them;
- [ ] all five seeds will be retained;
- [ ] there is no best-seed selection rule.

## 3. Leakage boundary

Required:

- robust scaler fitted on training telemetry only;
- Space-JEPA representation training uses allowed training telemetry only;
- threshold is the 0.995 quantile of valid training-prefix scores only;
- test telemetry does not enter training, threshold fitting, hyperparameter selection, or early stopping;
- anomaly labels/types do not enter representation training, preprocessing, threshold fitting, or model selection;
- held-out labels are opened only by the frozen evaluation adapter after predictions/thresholds are immutable.

Reviewer check:

- [ ] runner/API signatures enforce this boundary rather than relying only on operator discipline;
- [ ] tests cover train-only scaling/thresholding and test isolation;
- [ ] no annotation columns are silently loaded by an outcome-blind exporter.

## 4. Dataset/evaluation provenance already pinned

Mission-1 metadata freeze: `portfolio/research/space-jepa/ESA_MISSION1_METADATA_FREEZE_V0.json`.

Pinned dataset surface:

```text
Zenodo record: 12528696
DOI: 10.5281/zenodo.12528696
archive: ESA-Mission1.zip
Zenodo MD5: 80750189d171f5f398fb3d96c49df12b
remote size: 3776246054 bytes
```

Pinned upstream evaluation source:

```text
repository: kplabs-pl/ESA-ADB
commit: aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33
```

Pinned metadata member SHA-256 identities:

```text
labels.csv        1564d630f1ec1387d699ec81531ce57118051a220c8b7cba050a446a652b9082
anomaly_types.csv e0cadee4ee9697c5ca8d4f9e81067454d7d7a00d063ee0de33cbc77660eec8bc
channels.csv      92fe4582f1907e42129a764e52afddaef02de8e555e4c47302acd4225222abbf
```

The existing freeze records that these metadata members were byte-hashed without parsing CSV rows or interpreting labels/anomaly types/channel declarations.

Reviewer check:

- [ ] independently verify the Zenodo record/archive identity;
- [ ] independently verify the pinned upstream ESA-ADB commit is the intended evaluation implementation;
- [ ] independently verify the metadata hashes before authorizing held-out metadata parsing;
- [ ] confirm any full telemetry/preprocessed train/test files used for retained execution have their own exact byte identities recorded in the run receipt.

## 5. Primary hierarchy and baselines

Primary hierarchy remains the global Space-JEPA score from `PROTOCOL.md`.

Mandatory minimum comparators:

1. robust z-score;
2. one-step persistence error;
3. official ESA-ADB benchmark methods that are feasible under the same split/contract.

Official ESA-ADB metrics are primary when the benchmark path is wired. Repository-native AUROC/AP/point-F1/event-F1 diagnostics are secondary and cannot rescue a failed official primary comparison.

Reviewer check:

- [ ] baseline definitions are frozen before held-out outcomes;
- [ ] all methods use a compatible split/evaluation boundary;
- [ ] no comparator is removed after it performs well;
- [ ] no secondary diagnostic can be promoted post hoc into the primary endpoint.

## 6. Secondary channel-aware amendment

Authoritative amendment: `portfolio/research/space-jepa/ESA_CHANNEL_PROBE_PROTOCOL_V0.md`.

Frozen constants:

```text
ridge alpha = 1.0
probe-fit stride = 4
score stride = 1
batch size = 128
per-channel threshold quantile = 0.995 (training residuals only)
binary rule = score >= channel_threshold
```

This surface is secondary. It cannot replace the global primary result. A positive ChannelAwareFScore result does not establish causal-channel identification or root-cause diagnosis.

Reviewer check:

- [ ] the global primary hierarchy remains authoritative;
- [ ] all three channel surfaces (Space-JEPA, robust-z, persistence) are frozen/aligned before labels are opened;
- [ ] the pinned official ChannelAwareFScore adapter is unchanged;
- [ ] ADTQC is not falsely inferred from the per-channel ranking path.

## 7. Runtime identity required before authorization

A retained run must freeze and record at minimum:

- exact Git execution SHA;
- exact resolved config bytes/hash;
- Python version;
- PyTorch version;
- NumPy/Pandas versions;
- device class and exact accelerator/CPU identity where available;
- deterministic/nondeterministic backend flags relevant to the run;
- environment lock/requirements identity;
- command/runner invocation;
- train/test/preprocessing byte identities;
- output directory policy proving retained artifacts cannot be silently overwritten.

Reviewer decision must remain **BLOCKED** if these are not fixed before outcome access.

## 8. Retained output package required

For each seed, require:

- `run.json`/equivalent receipt;
- exact threshold;
- model checkpoint + hash;
- raw continuous scores;
- frozen binary predictions where applicable;
- baseline outputs;
- official metric artifact;
- code/config/data/runtime identities;
- clear failure record if execution fails.

Aggregate analysis must derive from these retained outputs. Do not manually transcribe only favorable numbers into the manuscript.

## 9. Negative-result rule

The reviewer should explicitly confirm:

- [ ] a null/negative Space-JEPA result will be retained;
- [ ] no seed substitution is permitted;
- [ ] no threshold movement is permitted;
- [ ] no post-outcome split/baseline/model change is permitted for the same confirmatory claim;
- [ ] no secondary metric can rescue the primary claim;
- [ ] adverse failure modes remain in the paper/evidence package.

## 10. Reviewer decision record

The independent review should produce a separate immutable receipt containing:

```text
reviewer identity/role
review date/time + timezone
reviewed Git SHA
reviewed protocol/config paths + hashes
reviewed dataset/evaluation provenance identities
runtime freeze identity
verdict: APPROVE_EXECUTION | BLOCK_EXECUTION
blocking findings (if any)
non-blocking findings (if any)
explicit statement that no held-out scientific outcomes were supplied to the reviewer before the decision
signature/attestation mechanism
```

Only an explicit `APPROVE_EXECUTION` receipt after all blocking items close should permit the outcome-bearing runner/evaluator to proceed.

## 11. Workshop claim boundary

Even after a successful retained result, the workshop manuscript may claim only what the benchmark establishes. It must not silently upgrade anomaly-detection performance into causal diagnosis, autonomous control, physical failure mitigation, or cross-mission generalization.

The optional PLAsTiCC astronomy track remains a separate protocol and must not be used to strengthen the ESA claim unless its own independent gates close.