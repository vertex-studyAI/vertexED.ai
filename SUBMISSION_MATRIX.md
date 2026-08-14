# SUBMISSION MATRIX

**As of:** 2026-08-14  
**Rule:** venue class follows evidence maturity. No entry implies acceptance, submission, publication or venue fit has been externally confirmed.

| Project | Contribution | Evidence Strength | Missing Gates | Suitable Venue Class | Ready? |
|---|---|---|---|---|---|
| LAM-JEPA | Reproducible negative result on frozen ARC comparison; planner/target contributions unsupported | **High for the bounded negative claim** | related-work/originality audit; final figure/table provenance check; license/authorship/citation approval; independent external review/reproduction | preprint/technical report; negative-results or representation-learning workshop; broader venue only after reviewer attack says contribution is sufficient | **NEAR — not submission-ready** |
| IRIS v0.2 | Robustness–adaptation tradeoff and failed >=10% abrupt-regime gate against stronger robust controls | **Moderate–high for synthetic mixed/negative claim** | prior-art closure; external dataset; stronger changepoint/robust controls; final claim boundary | technical report/preprint; robustness/time-series workshop; broader venue only if external result generalizes | **NO** |
| NeuroCAD / T2424-0037 | Typed/validated IR improves controlled held-out-template executable CAD performance over direct extraction | **Moderate–high within narrow benchmark** | same-provider learned direct-generation baseline; new-part-family OOD; larger independent benchmark; novelty audit; external reproduction | CAD/program-synthesis/ML-systems workshop; technical report; conference only after stronger learned/OOD evidence | **NO** |
| T2424-0027 | Deterministic synthetic latent-language leakage diagnostic with negative control | **Moderate for mechanics; low externally** | real multilingual encoder/dataset; stronger probes; external reproduction; originality audit | diagnostic/representation workshop or technical note after real-model study | **NO** |
| Darcy / T2424-0050 | Strong bounded 1D reduced-resistance numerical mechanism | **Moderate within synthetic 1D screen** | learned matched-budget operator; 2D/held-out physical regimes; OOD/misaligned fields; numerical-baseline audit | scientific-ML workshop/technical report after learned/OOD comparison | **NO** |
| NGMT v0.1 | Equal-budget learned negative result; proposed adverse-condition superiority gates fail | **High reproducibility, narrow task breadth** | more seeds/task families only if preregistered as a separate replication study; prior work; external review | negative-results technical note/workshop; appendix to a broader robust-memory study | **NO — packageable, not strong standalone submission yet** |
| Eigen-JEPA | Real-data mixed/negative spectral representation comparison; ridge remains stronger on primary metric | **Moderate** | stronger spectral baselines; multiple datasets; frozen metric hierarchy; independent reproduction | time-series/financial-ML workshop or negative-results technical report | **NO** |
| APEN | Reproduced salience-dependent tradeoff with degradation/reversal under severe dropout | **Moderate controlled evidence** | matched learned baseline; naturalistic task; realistic salience-quality stress; external reproduction | robustness/attention workshop or technical report | **NO** |
| NPMS | Controlled memory diagnostic plus learned companion evidence | **Moderate controlled evidence** | stronger memory baselines; natural task; OOD/generalization; statistics plan | memory/dynamics workshop after external gate | **NO** |
| T2424-1863 | Exact-head reproducible negative local-diffusion screen | **High for narrow negative screen** | real PDE data and learned baseline would be required for broader relevance | archive/negative-result note; not a priority standalone paper | **NO / low priority** |
| Research Atlas V4 | Reproducibility bundle and artifact-verification infrastructure | **High local package evidence** | independent clean-environment reproduction and documentation polish | reproducibility artifact/research-software release; methods appendix | **NO for external-reproduction claim** |
| Percy | Evidence-native orchestration architecture/runtime | **Insufficient real-host scientific evidence** | real-host recovery; bounded benchmark; failure injection; cost/throughput accounting; matched orchestration baseline; independent verifier | systems/tool release first; research paper only after measured study | **NO** |
| Text-To-Video V6 | Durable local notes-to-video render pipeline | **Strong local engineering evidence** | hosted worker/storage/auth/retention/observability; real narration; user validation | software/demo release after deployment gate; not currently a research submission | **NO** |

## Submission order

1. **LAM-JEPA negative-result paper package** — highest probability of defensible closure.
2. **IRIS v0.2 mixed/negative package** — close without rescue; external dataset determines whether it remains a report or grows into a paper.
3. **NeuroCAD / T2424-0037** — run the two decisive gates before manuscript expansion.
4. **One Project 2424 child only** after evidence attack; current candidates are T2424-0027 or Darcy, not the umbrella registry.
5. **Eigen-JEPA / NGMT / APEN / NPMS** only if the negative/mixed story is informative enough after reviewer attack.

## Publication integrity rule

A manuscript becomes `READY` only when every result can be traced:

`claim → table/figure → processed artifact → raw artifact → frozen config/protocol → exact code commit`.

Missing provenance is a blocker, not a copy-editing TODO.
