# AI4AutoSci 2026 experiment matrix — Space-JEPA

This document maps experiments to manuscript claims. It does not authorize any outcome access and does not modify the frozen protocols. The Priority A endpoint below is reconciled to the independently frozen pre-outcome endpoint in PR #751 at head `751a788e36d082ba96b0513289afb59e64ccef2f` (`ESA_PRIMARY_ENDPOINT_V0.json` blob `d6f0d48494271f1fb02f23cf6b554f8d2d12be3a`).

## Priority A — ESA global anomaly detection (paper primary)

| Item | Frozen treatment |
| --- | --- |
| Scientific question | Does JEPA-style future-latent prediction improve leakage-controlled spacecraft telemetry anomaly detection without anomaly labels during representation training or threshold fitting? |
| Benchmark | ESA-ADB pinned to upstream commit `aeebcd9ecd3e7266d6d6a035a8081b3da83dfe33` |
| Official metric source | `timeeval/metrics/ESA_ADB_metrics.py`, Git blob `dbfe1e20b121012f1f144cff1303710b98ed0df5` |
| Primary metric | anomaly-only `ESAScores`, beta `0.5`, exact key `EW_F_0.50`, higher is better |
| Primary surfaces | `mission1-lite`; `mission2-lite` |
| Space-JEPA seeds | 17, 29, 43, 71, 101 |
| Scaling | robust statistics fit on training partition only |
| Representation labels | none |
| Global operating point | 0.995 quantile of valid training-prefix Space-JEPA scores |
| Mandatory matched simple baselines | `robust_zscore`; `persistence` |
| Per-seed reference | stronger of the two matched baselines on the same mission surface and seed |
| Paired delta | `EW_F_0.50(space_jepa) - max(EW_F_0.50(robust_zscore), EW_F_0.50(persistence))` |
| Per-surface aggregation | arithmetic mean of all five paired seed deltas |
| Per-surface success | mean paired delta strictly `> 0` **and** at least `4/5` paired deltas strictly positive |
| Tie handling | ties are not wins |
| Overall primary success | conjunction: both `mission1-lite` and `mission2-lite` must pass |
| Missing/failed seeds | fail closed; do not drop, replace, or selectively rerun |
| Post-outcome rescue | no significance test or practical-effect threshold is part of the primary decision rule |
| Secondary diagnostics | anomaly-plus-rare-event, affiliation, channel-aware, repository-native, ablation, and astronomy outputs are secondary and cannot rescue primary failure |
| Outcome rule | retain and report every frozen seed and every null/adverse result |
| Forbidden drift | changing seeds, threshold, split, baselines, metric/view/key, surfaces, seed aggregation, conjunction, primary claim, or evaluation after held-out outcome access |

### Required retained artifact set

A result is manuscript-admissible only if the retained package contains:

- exact code commit SHA;
- resolved model/config identity;
- exact dataset version or byte identities;
- preprocessing identity/description;
- seed;
- hardware/runtime identity;
- learned training-only threshold;
- checkpoint identity/hash;
- raw continuous score surface;
- frozen binary predictions where applicable;
- baseline score/prediction surfaces;
- official `EW_F_0.50` metric output under the frozen anomaly-only ESA-ADB view;
- run receipt linking all artifacts.

### Claim mapping

Allowed only if directly supported by retained evidence:

- performance under the exact frozen `EW_F_0.50` primary endpoint;
- across-seed behavior for all five frozen stochastic seeds on each named mission surface;
- comparison only to the two retained matched simple baselines;
- the cross-mission primary conjunction only if both mission surfaces satisfy the frozen rule.

Not established by this experiment alone:

- superiority over unexecuted official benchmark algorithms;
- causal diagnosis;
- closed-loop autonomous control;
- physical failure mitigation;
- cross-mission generalization beyond the two named lightweight surfaces;
- astronomy performance.

## Priority B — ESA channel-aware residual surface (secondary)

| Item | Frozen treatment |
| --- | --- |
| Hierarchy | secondary; cannot replace or rescue Priority A |
| Decoder | ridge from predicted target latent to normalized telemetry target |
| Ridge alpha | 1.0 |
| Fit data | training windows only |
| Probe-fit stride | 4 |
| Score stride | 1 |
| Batch size | 128 |
| Channel threshold | one 0.995 train-score quantile per channel |
| Methods | Space-JEPA; robust z-score; persistence |
| Official target | pinned ChannelAwareFScore path |
| Outcome access | blocked until pre-outcome provenance + independent approval close |

### Claim mapping

A positive ChannelAwareFScore result may support a narrow statement about channel-aware anomaly-detection performance under the pinned benchmark metric. It does **not** establish that the identified channels are causal or that the system performs root-cause diagnosis, and it cannot rescue a failed Priority A conjunction.

ADTQC must not be silently inferred from the per-channel ranking path.

## Priority C — prespecified ESA ablations

Run only after the primary execution boundary is closed and only within the predeclared family:

- no EMA target encoder;
- no anti-collapse term;
- context lengths 32 / 64 / 128 if compute permits;
- target lengths 8 / 16 / 32 if compute permits.

Ablations are explanatory. They cannot rescue a failed primary comparison by changing the primary endpoint or promoting the best ablation post hoc.

## Priority D — PLAsTiCC astronomy track (optional and scientifically separate)

| Item | Frozen treatment |
| --- | --- |
| Benchmark candidate | PLAsTiCC v1, Zenodo DOI 10.5281/zenodo.2539456 |
| Status | simulated; public/unblinded; execution still blocked |
| Confirmatory comparison | time-aware JEPA vs same-capacity time-agnostic JEPA |
| Primary metric | class-balanced multiclass log loss |
| Effect direction | loss(time-agnostic) - loss(time-aware) |
| Practical threshold | mean paired improvement >= +0.02 |
| Seeds | 11, 23, 37, 53, 71 |
| Uncertainty | 10,000-replicate paired hierarchical bootstrap; seed 20260906 |
| Seed consistency | >= 4/5 seed deltas strictly positive |
| CI gate | frozen 95% bootstrap lower endpoint > 0 |
| Secondary only | macro one-vs-rest AP/AUROC |

### Before any held-out PLAsTiCC execution

Still required under the existing astronomy protocol:

- freeze exact representation-to-class-probability readout;
- establish/freeze local dataset byte receipts;
- freeze object-level development split identities;
- confirm licensing/use terms;
- prove outcome-blind parsing;
- freeze runtime/environment identity;
- complete freshness review;
- retain independent approval receipt.

If freshness cannot be established because the labels are already public/unblinded, PLAsTiCC becomes development/external-characterization evidence only. Do not relabel it confirmatory and do not claim real-sky validation.

## Workshop story hierarchy

The manuscript should read as one coherent scientific-instrument paper:

1. scientific-instrument telemetry problem;
2. predictive latent-state method;
3. leakage-controlled pre-outcome design;
4. exact frozen ESA primary endpoint and result;
5. bounded failure/channel analysis;
6. prespecified ablations;
7. optional cross-domain astronomy note only if independently admissible;
8. limitations and negative-result interpretation.

Do not turn the submission into a portfolio dump. One strong scientific question is the paper.
