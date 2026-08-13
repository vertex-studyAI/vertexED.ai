# RESEARCH_FAILURE_ATLAS

As of: **2026-08-13 22:00 IST**

Failures are retained research evidence. A failed hypothesis is not deleted or retuned into success.

| Project | Hypothesis / intended effect | Failure mode | Detection | Claim impact | Repair / next action |
|---|---|---|---|---|---|
| LAM-JEPA | LAM-JEPA beats matched supervised ARC baseline and planner/target mechanisms help | mean validation accuracy below matched supervised; planner/target ablations do not support mechanism; prediction-support collapse observed | frozen five-seed ARC validation + ablations + independent artifact audit | **invalidates superiority and mechanism-benefit claims** | no rescue; keep locked test untouched; new hypothesis must be separately frozen |
| LAM-JEPA software lineage | same-seed training should reproduce | model initialized before requested seed in older path | replay mismatch | invalidated deterministic-training claim for pre-fix path, not ARC scientific verdict | minimal seed-order repair retained with before/after lineage |
| IRIS HTAM/PGR/PCRW line | robust memory improves heavy-tail robustness without unacceptable shift cost | scalar gains fail to transfer cleanly; current late-wave candidate only ~5.33–5.36% abrupt improvement vs fixed HTAM against >=10% gate; Huber not cleanly beaten | learned/stress development runs | current candidate remains RED | preserve; stronger change-aware baselines; no confirmatory seeds yet |
| IRIS | distinguish persistent change from outliers | coherent burst outliers cause adverse gate behavior | failure trajectories / stress seeds | blocks positive mechanism claim | freeze false-open/delayed-open analysis and robust changepoint comparators |
| T2424-0025 | robust readout advantage indicates non-Gaussian memory mechanism | robust estimators also win materially at 0% contamination | clean-control ablation | blocks unique NGMT mechanism inference | formal B0/B1/B2/B3 memory experiment |
| APEN | salience mechanism robustly improves rare-event behavior | advantage weakens and can reverse as salience reliability collapses | salience-dropout stress | limits claim to informative-salience regimes | matched learned control + preregistered reliability curve |
| Eigen-JEPA | Eigen representation beats strong controls | raw/log ridge stronger on primary real-market covariance-matrix MSE | fresh Atlas V4 comparison | superiority unsupported | freeze metric; stronger spectral controls; replicate across datasets |
| Darcy | reduced representation generalizes as neural operator | current evidence is deterministic/synthetic and not learned | claim audit | blocks neural-operator/generalization claim | learned matched-budget baseline + physical OOD |
| NeuroCAD | typed IR solves general NLP-to-CAD | current benchmark is controlled grammar; no same-provider learned direct baseline | benchmark scope audit | blocks arbitrary-language/generalization claim | frozen OOD/compositional benchmark + same-provider comparison |
| Hercules | proposed architecture beats Transformer under equal budget | no matched learned experiment exists | evidence audit | blocks capability/advantage claim | run minimal equal-budget experiment |
| Olympus | role decomposition improves agent quality | O1 matched-provider comparison unrun | evidence audit | blocks learned advantage claim | monolith vs roles vs ablations under matched provider/tool budget |

## Failure handling law

1. Preserve failed raw outputs and commands.  
2. Classify scientific failure vs infrastructure failure vs verifier/analysis bug.  
3. If a bug invalidates analysis, retain pre-fix output, make the smallest versioned fix, rerun unchanged scientific protocol, and distinguish both.  
4. Never change seeds, metrics, thresholds, gates, architecture, or data after viewing a final/confirmatory result to obtain a preferred conclusion.