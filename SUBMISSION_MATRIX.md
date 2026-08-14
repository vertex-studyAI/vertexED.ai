# SUBMISSION MATRIX

Venue **class** is selected from current evidence maturity. No specific venue, deadline, acceptance probability, publication or submission is claimed here. Tier/prestige does not override missing evidence.

| Project | Contribution at current boundary | Evidence strength | Missing gates | Suitable venue class | Ready? |
|---|---|---|---|---|---|
| **LAM-JEPA** | Reproducible negative/inconclusive result on frozen ARC protocol; planner/target mechanism claims unsupported | **High bounded evidence**: five seeds, controls/ablations, independent artifact audit, locked test unused | complete claim→figure→raw→config→commit→command chain; originality/related-work audit; polished failure analysis; independent outside review | **Preprint / technical report now after provenance completion; negative-results or representation-learning workshop; full conference only if originality and methodological significance justify it** | **NO** — paper package not yet fully provenance/originality complete |
| **IRIS v0.2** | Reproduced negative development gate exposing robustness–adaptation tradeoff/failure | **High for the frozen development question**, not confirmatory | manuscript framing; baseline fairness audit; exact reproduction command; originality review; decide whether development result is sufficiently general/informative | **Technical report / preprint; robust ML/time-series workshop if failure analysis is substantive** | **NO** |
| **NGMT v0.1** | Equal-budget learned B0–B3 experiment misses both frozen adverse superiority gates | **High bounded negative** | exact artifact/command recovery; mechanism/failure analysis; literature audit; determine whether result generalizes beyond tiny benchmark | **Negative-results technical report / preprint; workshop if the confound + learned falsification teaches a general lesson** | **NO** |
| **Eigen-JEPA** | Strong classical baselines dominate/match the proposed primary covariance-forecast target | **High bounded negative**, with exact replay | fix/document 14,895 vs 14,899 provenance discrepancy; literature audit; paper-quality figures/tables; decide generalization scope | **Technical report / preprint; time-series/representation workshop if classical-baseline lesson is novel/useful** | **NO** |
| **NeuroCAD** | Typed/validated structured IR beats frozen direct baseline on controlled held-out-template benchmark | **Medium-high but baseline-limited** | same-provider learned direct vs IR; constrained/retrieval/search baselines; broader OOD/error taxonomy; external reproduction; originality audit | **Program synthesis/CAD/LLM workshop first; conference only after matched learned baselines + broader generalization** | **NO** |
| **APEN** | Temporal salience alignment matters in synthetic rare-event task; effect collapses when salience is randomized | **Medium-high bounded mechanism evidence** | matched learned recurrent/attention control; naturalistic task; salience-quality stress; originality audit | **Memory/sequence-model workshop or short paper after learned controls; full conference only if effect generalizes and mechanism remains distinct** | **NO** |
| **T2424-0027** | Reproduced synthetic injected-coordinate audit with independent verifier | **Medium-high synthetic**, real-encoder claim absent | real multilingual encoders; centering/random-group/random-subspace controls; preregistration; external reproduction | **Benchmark/audit release or workshop after real-encoder phase; no broad multilingual paper yet** | **NO** |
| **NPMS** | Coordinate invariance remains valid but regime classification is nearly reproduced by invariant-parameter summary | **Medium-high controlled / confounded** | causal/natural task; stronger learned memory baselines; OOD/generalization | **Technical report or mechanism workshop only if narrowed to invariance/confounding result** | **NO** |
| **Darcy T2424-0050** | Reproduced synthetic reduced-resistance pressure-MAE mechanism screen | **Medium**, synthetic and learned-baseline incomplete | matched FNO/DeepONet/U-Net or equivalent; OOD/misaligned/held-out physical regimes; uncertainty/physics checks | **Scientific-ML workshop after learned baseline gate; conference only if advantage survives serious operator controls** | **NO** |
| **T2424-1863** | Exact-head local-diffusion experiment fails frozen >75% gate | **Medium-high negative synthetic** | determine scientific lesson; real-PDE learned baseline would be a separate successor question | **Archive as negative evidence or short technical note; not a standalone conference claim currently** | **NO** |
| **Research Atlas V4** | Reproducibility/provenance packaging infrastructure | **High local package evidence**, independent-use evidence absent | second-machine/independent user reproduction; public-safe docs; artifact→claim demonstrations | **Open-source release + technical report/demo; systems/reproducibility workshop if independent use succeeds** | **NO** |
| **Percy** | Evidence-native orchestration architecture with truthful liveness/failure-preservation goals | **Medium design evidence; live-host qualification unavailable** | real Mac DB/process recovery; fault injection; throughput/cost accounting; independent systems test; security review | **Open-source systems release/technical report after live evidence; agent/systems workshop if evaluated against simpler orchestrators** | **NO** |
| **VertexED** | Product system, not currently a research contribution | Source evidence exists; production currently unhealthy | exact served revision, authenticated journey, real-user activation/retention evidence | **Product release / case study only after production + user validation; not a research paper by default** | **NO** |
| **FinanceMeta** | Product/education system | target evidence inaccessible | canonical target, security journey, user validation | **Product validation first; education/research report only if a real intervention is prospectively evaluated** | **NO** |
| **The Bu1LD** | Product/research-operations platform | target evidence inaccessible | canonical target, role boundaries, user workflow validation | **Product/research-infrastructure release after target validation; no paper claim now** | **NO** |

## Submission decision law

A manuscript moves to **READY** only when:

1. the scientific question and primary claim are frozen;
2. dangerous baselines are complete;
3. all displayed quantitative results have uncertainty/statistics appropriate to the design;
4. negative and failed runs are included where relevant;
5. every manuscript result traces to raw artifact/config/code/command;
6. originality/related-work audit is evidence-backed rather than name-based;
7. figures/tables regenerate from retained source data;
8. limitations and non-claims are explicit;
9. authorship/venue-format/anonymity/licensing/data-release requirements are resolved;
10. the venue class matches the contribution actually demonstrated.

A preprint is not used to launder an unsupported claim. A failed hypothesis can still be a strong submission when the question, protocol and lesson are strong.