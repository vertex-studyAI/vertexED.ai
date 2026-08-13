# EXPERIMENT_LEDGER

As of: **2026-08-13 22:00 IST**

| ID | Project | Protocol state | Result | Falsification outcome | Next action |
|---|---|---|---|---|---|
| EXP-LAM-ARC-V3 | LAM-JEPA | FROZEN + REPRODUCED | full `0.254915±0.012997` vs matched `0.266441±0.015460` | positive superiority falsified/unsupported | archive as negative; locked test stays closed |
| EXP-LAM-ABL | LAM-JEPA | FROZEN + REPRODUCED | no-planner `0.250169±0.012997`; no-target `0.261695±0.020395` | planner/target contribution unsupported | mechanism claim stays off |
| EXP-IRIS-LATE-DEV | IRIS | DEVELOPMENT ONLY | ~5.33–5.36% abrupt improvement vs fixed HTAM | fails frozen >=10% development gate; Huber not cleanly beaten | preserve failure; freeze next candidate before testing |
| EXP-P2424-0025 | robust readouts | FROZEN + REPRODUCED | robust effect under contamination; clean 0% control also positive | unique non-Gaussian mechanism not isolated | B0/B1/B2/B3 memory study |
| EXP-P2424-0027 | latent language audit | FROZEN + REPRODUCED | 8/8 + verifier | synthetic diagnostic passes; external claim untested | real encoder replication |
| EXP-NEUROCAD-CTRL | NeuroCAD | FROZEN + REPRODUCED | 6/6; 20/20 controlled benchmark retained | controlled compiler hypothesis passes | freeze OOD/direct-vs-IR experiment |
| EXP-DARCY-1D | Darcy | FROZEN + REPRODUCED | strong pressure-MAE reduction; 6/6 | bounded synthetic hypothesis passes | learned/OOD operator study |
| EXP-APEN-ROBUSTNESS | APEN | REPRODUCED | salience-dependent gain with degradation/reversal | global robustness claim unsupported | matched learned + salience stress |
| EXP-EIGEN-REAL | Eigen-JEPA | REPRODUCED | raw/log ridge stronger on primary MSE | superiority unsupported | freeze stronger spectral baseline/multi-data |
| EXP-NPMS-RESERVOIR | NPMS | REPRODUCED | regime accuracy `0.928571` | controlled mechanism supported only | learned/OOD baseline |
| EXP-NGMT-B3 | NGMT | NOT RUN — NOT FROZEN | none | none | freeze mechanism + B0/B1/B2/B3 first |
| EXP-HERCULES-MATCHED | Hercules | NOT RUN — NOT FROZEN | none | none | minimal matched-budget experiment |
| EXP-OLYMPUS-O1 | Olympus | NOT RUN — NOT FROZEN | none | none | matched-provider decomposition study |

## Run law

Confirmatory/final experiments execute once after the protocol, baselines, seed list, primary metric, effect statistic, gate, falsifier, and analysis code are frozen. Failed runs remain in the registry.