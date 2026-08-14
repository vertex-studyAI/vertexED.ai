# CLAIM_LEDGER

**As of:** 2026-08-14 IST  
**Rule:** claims are narrower than projects. `GREEN` means only that the named evidence gate is complete. Frozen negative results are not rescued by retuning.

| Claim ID | Project | Claim | Status | Evidence / boundary | Forbidden inference |
|---|---|---|---|---|---|
| CL-LAM-001 | LAM-JEPA | Frozen ARC pipeline result is reproducible | **SUPPORTED** | five-seed frozen result, artifact `9162165932`, independent audit | does not imply model superiority |
| CL-LAM-002 | LAM-JEPA | Full LAM-JEPA beats matched supervised | **UNSUPPORTED / NEGATIVE** | `0.254915±0.012997` vs `0.266441±0.015460` | no locked-test rescue |
| CL-LAM-003 | LAM-JEPA | Planner contributes positive ARC effect | **UNSUPPORTED** | no-planner `0.250169±0.012997` | no broad claim that planning is useless |
| CL-LAM-004 | LAM-JEPA | Target/EMA mechanism contributes positive ARC effect | **UNSUPPORTED** | no-target `0.261695±0.020395` | no broad JEPA impossibility claim |
| CL-LAM-005 | LAM-JEPA | Locked ARC test validates the line | **NOT RUN / PROHIBITED FOR RESCUE** | locked test retained untouched | test cannot be opened to tune current failed hypothesis |
| CL-IRIS-001 | IRIS | Current PABIM common-harness mechanism passes the frozen development advancement gate | **FALSE / NEGATIVE** | 3/5 criteria pass; fixed-robust and persistent-shift gates fail | no confirmatory seeds |
| CL-IRIS-002 | IRIS | PABIM has localized heavy-tail/corruption information gain vs Huber | **SUPPORTED IN DEVELOPMENT HARNESS** | >=5% gains on `student_t2`, `student_t3`, `contaminated` | not overall robust-adaptation superiority |
| CL-IRIS-003 | IRIS | PABIM matches strongest fixed robust controls across adverse conditions | **FALSE** | mean adverse MSE `0.059706` vs per-condition best fixed robust mean `0.033502` | do not remove strong Student-t control |
| CL-IRIS-004 | IRIS | PABIM matches change-aware robust control on persistent shift | **FALSE** | PABIM `TWMSE25=0.215731`, recovery `24`; confirmed-Huber `0.162633`, `18.5` | no goalpost change after result |
| CL-IRIS-005 | IRIS | Reserved confirmatory seeds were used | **FALSE** | `1000–1029` remained quarantined | no confirmatory-success language |
| CL-APEN-001 | APEN | Correct temporal salience alignment matters in the frozen synthetic ridge-readout task | **SUPPORTED / BOUNDED** | true APEN rare-event MSE `17.131746` vs uniform `18.412450`; shuffled/randomized salience erase >100% of gain | not architecture superiority |
| CL-APEN-002 | APEN | Exact APEN salience formula is uniquely necessary | **UNSUPPORTED** | magnitude proxy retains part of benefit | no uniqueness claim |
| CL-APEN-003 | APEN | APEN is robust to arbitrary salience failure | **UNSUPPORTED / NEGATIVE BOUNDARY** | severe dropout previously weakens/reverses benefit | no naturalistic robustness claim |
| CL-EIGEN-001 | Eigen-JEPA | Eigen-JEPA beats strong classical baselines on frozen primary covariance-matrix MSE | **UNSUPPORTED / NEGATIVE** | Eigen `5.8318e-09`; spectral eigval ridge `5.4992e-09`; raw/log/PCA ridge lower mean point estimates | no secondary-metric rescue |
| CL-EIGEN-002 | Eigen-JEPA | Current dataset provenance is perfectly reconciled | **FALSE / DEFECT RETAINED** | current parser `14,895` rows vs older specification `14,899` | dataset/parser may not be changed to match prose |
| CL-NPMS-001 | NPMS | Reservoir-regime classification demonstrates information beyond invariant parameters | **WEAKENED / NON-UNIQUE** | NPMS `92.86%` vs invariant-parameter control `89.29%`; only `3.57` pp gap | no causal mechanism claim |
| CL-NPMS-002 | NPMS | Functional spectra are coordinate-invariant in retained controlled transform | **SUPPORTED IN CONTROLLED SETTING** | transform drift retained near numerical precision | not natural-task usefulness |
| CL-NGMT-001 | NGMT v0.1 | Equal-budget B3 meets adverse-condition superiority gates | **FALSE / NEGATIVE** | B3-B2 `+0.4946%±1.5472%` vs >=5%; B3-B1 `+0.4393%±1.1529%` vs >=3% | no v0.1 retuning |
| CL-P2424-0025 | T2424-0025 | Robust readouts help in frozen synthetic contamination screen | **SUPPORTED IN SYNTHETIC PROTOCOL** | reproduced robust aggregation effect | not a Transformer/NGMT success |
| CL-NEUROCAD-001 | NeuroCAD | Typed/validated IR beats frozen direct baseline on controlled held-out-template benchmark | **SUPPORTED** | `19/20` vs `12/20`; `12/12` valid STL | not arbitrary NLP-to-CAD, SOTA, or manufacturing validity |
| CL-DARCY-001 | Darcy | Reduced-resistance mechanism improves frozen synthetic pressure-MAE screen | **SUPPORTED / BOUNDED** | `0.0658913916→0.0011366559`, 20 seeds, flux consistency | not a learned neural-operator result |
| CL-P2424-0027 | T2424-0027 | Synthetic injected-coordinate leakage audit reproduces | **SUPPORTED** | `8/8` + verifier | not evidence about real multilingual encoders |
| CL-P2424-1863 | T2424-1863 | Frozen local-diffusion screen exceeds predeclared >75% improvement gate | **FALSE / NEGATIVE** | exact-head reproduced gate miss | not operator superiority or real-PDE generalization |
| CL-PERCY-001 | Percy | Registry defines 16,256 logical identities | **SUPPORTED AS SPECIFICATION** | `P00000..P16255`, 127×128 | not 16,256 physical workers/tasks |
| CL-PERCY-002 | Percy | Live host queue/workers/leases are healthy now | **UNKNOWN** | Mac SQLite/WAL/process state unavailable from this surface | no inferred operational counters |
| CL-VERTEX-001 | VertexED | Current source head has successful linked Vercel status contexts | **SUPPORTED FOR SOURCE STATUS ONLY** | observed on `f177d87...` before convergence branch | not exact served production identity |
| CL-VERTEX-002 | VertexED | Production serves the intended exact source revision and passes authenticated golden journey | **UNVERIFIED / BLOCKED** | prior monitor failed revision identity | no production GREEN |
| CL-FM-001 | FinanceMeta | Canonical live product is validated | **UNVERIFIED / EXTERNALLY BLOCKED** | canonical target/live authorization unavailable | no production/security claim |
| CL-BU1LD-001 | The Bu1LD | Canonical live portal is validated | **UNVERIFIED / EXTERNALLY BLOCKED** | target-source/deploy access unavailable | no production claim |
| CL-PEN-001 | PEN | PEN inherits APEN evidence | **FALSE / FORBIDDEN** | distinct source/protocol required | no evidence inheritance |
| CL-HERC-001 | Hercules | Proposed architecture has learned matched-budget advantage | **UNTESTED** | no credible matched-budget result | no frontier/AGI claim |
| CL-OLY-001 | Olympus | Role decomposition improves matched-provider agent performance | **UNTESTED** | O1 comparison absent | no learned-agent superiority claim |

## Claim freeze law

Before confirmatory/final evaluation, freeze: project/version, question, hypothesis, mechanism, baseline family, data/split, seed policy, primary metric, effect statistic, threshold/gate, falsifier, analysis plan, compute budget and stop rule. A protocol change after observing results creates a new experiment version and must cite the failed predecessor.

## Manuscript provenance law

Every quantitative manuscript claim must resolve as:

`claim_id -> table/figure -> processed artifact -> raw artifact -> protocol/config -> code commit`

Any missing edge is a release blocker, not a prose TODO to hide.