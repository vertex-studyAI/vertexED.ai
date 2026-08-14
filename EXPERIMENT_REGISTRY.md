# EXPERIMENT REGISTRY

Machine-readable authority: [`EXPERIMENT_REGISTRY.json`](./EXPERIMENT_REGISTRY.json).  
Recovered against `PORTFOLIO_SNAPSHOT_20260814.md`.

`UNKNOWN_IN_RECOVERED_LEDGER` is a blocker, not a placeholder success. Exact reproduction commands and artifact hashes must be filled only from verified source/evidence.

| Registry ID | Project | Protocol | Result | Provenance strength | Next gate |
|---|---|---|---|---|---|
| `EXP-LAM-ARC-FROZEN-AUDIT` | LAM-JEPA | frozen ARC, 5 seeds, locked test unused | reproduced negative/inconclusive | workflow + artifact hash + independent raw recomputation | paper provenance/figures/external review; no rescue |
| `EXP-IRIS-COMMON-ADAPTATION-V1` | IRIS | frozen development seeds 0–9, confirmatory 1000–1029 untouched | negative development gate | protocol/raw/summary/bundle hashes | stop current candidate; negative package or new successor |
| `EXP-APEN-SALIENCE-SPECIFICITY-V1` | APEN | prospective synthetic salience ablation | bounded positive mechanism ablation | protocol/raw/summary/verifier/bundle hashes; exact replay | matched learned control + naturalistic salience stress |
| `EXP-EIGEN-JEPA-CLASSICAL-BASELINES-V1` | Eigen-JEPA | frozen primary covariance-matrix MSE | baseline dominated/non-superior | protocol/raw/summary/verifier/bundle hashes | row-count provenance; negative conversion |
| `EXP-NPMS-INVARIANT-PARAMETER-CONTROL-V1` | NPMS | frozen invariant-parameter control | confounded/non-unique classifier evidence | protocol/features/predictions/verifier/bundle hashes | natural task / causal intervention |
| `EXP-NGMT-V01-B0-B3` | NGMT | equal-budget B0/B1/B2/B3 | negative/inconclusive | aggregate result recovered; exact artifact/command missing in current ledger | negative package; versioned successor only |
| `EXP-NEUROCAD-V1-CONTROLLED` | NeuroCAD | v1 controlled + held-out-template | 19/20 vs 12/20; retained validator failure | bounded result recovered; exact artifact/command missing in current ledger | matched same-provider direct-vs-IR |
| `EXP-P2424-CANONICAL-REPRO-20260813` | Project 2424 | frozen-source reproduction | scientific-value agreement, not latest byte identity | source/workflow/job/artifact/hash | recover canonical source; consolidate children |
| `EXP-T2424-1863-LOCAL-DIFFUSION` | T2424-1863 | frozen >75% gate | reproduced negative | workflow + canonical CI; exact artifact hash missing here | no rescue; new real-PDE successor only |
| `EXP-DARCY-T2424-0050-PRESSURE-MAE` | Darcy | 20-seed bounded synthetic screen | reproduced bounded mechanism | seed count/metric/result recovered; exact artifact/command missing here | learned matched-budget operator + OOD |
| `EXP-T2424-0027-SYNTHETIC-AUDIT` | T2424-0027 | synthetic injected-coordinate audit | reproduced + independently verified synthetic | 8/8 and verifier recovered; exact artifact/command missing here | real encoder + nuisance controls |

## Registry completion rule

An experiment is **reproducibility GREEN** only when the registry can trace:

`claim -> table/figure -> processed artifact -> raw artifact -> frozen config -> code commit -> exact command`

If any link is missing, the registry records the missing field. It does not infer or regenerate provenance after the fact.