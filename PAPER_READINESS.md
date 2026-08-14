# PAPER_READINESS

**As of:** 2026-08-14 IST  
**Rule:** manuscript existence is not submission readiness. Every result must trace `claim -> table/figure -> processed artifact -> raw artifact -> protocol/config -> code commit`.

## Active paper conversions — maximum 2

### 1. LAM-JEPA — ACTIVE PAPER LANE

**TITLE DIRECTION:** *When Latent-Action JEPA Components Do Not Improve Frozen ARC Validation: A Reproducible Negative Study* `[FINAL TITLE TODO]`

**QUESTION:** Does the frozen LAM-JEPA ARC configuration beat a matched supervised baseline and show positive planner/target contributions?

**HYPOTHESIS / FALSIFIER:** full > supervised and component effects >0; baseline win or non-positive ablation effect defeats the claim.

**CURRENT RESULT:** full `0.254915±0.012997`; supervised `0.266441±0.015460`; no-planner `0.250169±0.012997`; no-target `0.261695±0.020395`. Superiority/planner/target claims are unsupported. Locked ARC test untouched.

**NOVELTY BOUNDARY:** JEPA, latent actions, quantization, world-model planning, EMA targets, memory and grokking-oriented training are established directions/components. Current defensible contribution is the quality of the frozen negative evaluation, provenance and failure analysis—not a claim that the stack is a new mechanism.

**REQUIRED PAPER STRUCTURE:** Title; Abstract; Introduction; Related Work; Problem Formulation; Frozen Method/Configuration; Hypotheses; Experimental Setup; Matched Baselines; Results; Ablations; Failure Analysis; Robustness/Diagnostics; Limitations; Reproducibility; Broader Impact where relevant; Conclusion; References; Appendix.

**FIGURES:** seedwise full-vs-control result; paired planner/target effects with uncertainty; prediction-support/failure diagnostic from retained evidence; provenance/reproduction flow. Every figure requires source data + generation command + limitation.

**READY:** **NEAR-READY FOR EXTERNAL REVIEW, NOT SUBMISSION-READY**.

**BLOCKERS:** stale positive architecture prose in current manuscript must be removed/reframed; final provenance map; related-work closure; license/authorship/citation check; final figures/tables regenerated from frozen evidence; external reviewer/reproduction.

**FORBIDDEN:** locked-test evaluation, seed reruns to seek significance, broad claim that JEPA/planning is generally ineffective.

---

### 2. IRIS / current PABIM — ACTIVE PAPER LANE

**TITLE DIRECTION:** *Robustness Without Adaptation: A Frozen Negative Study of Persistence-Gated Bounded-Influence State Tracking* `[FINAL TITLE TODO]`

**QUESTION:** Can the existing PABIM mechanism retain heavy-tail gains while matching strong fixed robust controls and change-aware controls under persistent shifts?

**FROZEN GATE:** all five must pass: clean non-inferiority, heavy-tail information gain, strongest-fixed-control guardrail, persistent-shift adaptation gate, false-open guardrail.

**CURRENT RESULT:** clean PASS; heavy-tail PASS; false-open PASS; strongest-fixed-control FAIL; persistent-shift FAIL. PABIM adverse mean MSE `0.059706` vs mean per-condition best fixed robust `0.033502`; PABIM `TWMSE25=0.215731`, median recovery `24` vs confirmed-Huber `0.162633`, `18.5`. Confirmatory seeds `1000–1029` untouched.

**PROVENANCE:** protocol SHA `0cdf22c...`; raw SHA `5f1bfb8c...`; summary SHA `62355d6a...`; bundle SHA `5643b59e...`. Attempt-1 JSON-boolean serialization failure preserved; minimal repair leaves scientific raw/summary byte-identical; independent verifier passes.

**NOVELTY BOUNDARY:** heavy-tail robust filtering, Student-t methods and abrupt-change tracking are established. Current contribution, if publishable, is the empirical robustness–adaptation failure under one common frozen harness and the failure decomposition—not a broad novel robust-filter mechanism.

**REQUIRED PAPER STRUCTURE:** Title; Abstract; Introduction; robust-filter/change-point Related Work; Problem Formulation; PABIM mechanism; frozen hypotheses/gates; Experimental Setup; strong controls; Results; failure decomposition; limitations; reproducibility; conclusion; references; appendix with invalid-attempt lineage.

**FIGURES:** robustness–adaptation frontier; adverse-condition control comparison; persistent-shift trajectories/TWMSE/recovery; failure/provenance flow.

**READY:** **NOT YET**.

**BINARY NEXT DECISION:** `NEGATIVE_PAPER_CONTINUE` only if originality/reviewer audit says this tradeoff is informative enough; otherwise `ARCHIVE_HIGH_QUALITY_NEGATIVE`.

**FORBIDDEN:** confirmatory-seed access, current-mechanism rescue tuning, removal of Student-t/confirmed-Huber controls.

---

## Conditional paper candidates

### 3. NeuroCAD — EVIDENCE GATE BEFORE PAPER

**QUESTION:** Does typed/validated IR improve executable semantic reliability over competent same-provider direct CAD generation under matched budget, especially OOD/compositionally?

**CURRENT EVIDENCE:** frozen v1 `19/20` vs direct `12/20`; `12/12` valid cases generate non-empty STL; one retained negative-width validator failure. Strong for controlled software behavior, insufficient for a broad research claim.

**DANGEROUS BASELINES:** same-provider direct code/CadQuery/OpenSCAD generation; direct+validator; retrieval/template; typed-IR without validator; full typed-IR+validator.

**PROMOTION GATE:** predeclared primary reliability metric survives a matched provider/model/token/tool budget on a frozen broader OOD/compositional/new-family set.

**IF PASS:** promote to paper lane after one of the two current papers closes.  
**IF FAIL:** classify research claim negative/product-only; preserve software usefulness.

### 4. APEN — TIER A

**CURRENT EVIDENCE:** prospective salience-specificity ablation supports temporal alignment in a synthetic ridge-readout task: true APEN rare-event MSE `17.131746` vs uniform `18.412450`; shuffled/random alignment erases >100% gain. Exact formula not unique; severe salience failure remains a known weakness.

**PROMOTION GATE:** matched recurrent/attention memory + naturalistic salience-quality stress under frozen capacity/compute/metric contract.

**NOT READY.**

### 5. Eigen-JEPA — NEGATIVE/BOUNDARY

**CURRENT EVIDENCE:** frozen primary covariance matrix MSE: Eigen `5.8318e-09`, spectral eigval ridge `5.4992e-09`; raw/log/PCA ridge also lower mean point estimates. Current parser `14,895` rows conflicts with old prose `14,899`.

**NEXT:** provenance reconciliation, then multi-dataset preregistered replication without changing metric hierarchy.

**PAPER CLASS:** negative/empirical evaluation only if provenance and breadth close. **NOT READY.**

### 6. NPMS — MECHANISM WEAKENED

**CURRENT EVIDENCE:** NPMS regime classification `92.86%`; invariant-parameter control `89.29%`; `3.57` pp gap triggers frozen non-unique/confounded boundary. Coordinate invariance can remain a bounded claim.

**PROMOTION GATE:** natural task or causal intervention where parameter summaries are controlled and spectra show incremental information.

**NOT READY.**

### 7. NGMT v0.1 — CLOSED NEGATIVE

**CURRENT EVIDENCE:** equal-budget learned four-arm study reproducibly misses both adverse superiority gates while clean regression gate passes.

**PAPER CLASS:** packageable negative technical note/preprint, but low priority behind LAM and IRIS. No v0.1 retuning.

### 8. Darcy / T2424-0050 — SYNTHETIC ONLY

**CURRENT EVIDENCE:** large frozen synthetic pressure-MAE effect with flux consistency.

**PROMOTION GATE:** matched FNO/DeepONet/U-Net/ROM-style learned controls, misaligned/OOD fields, held-out physical regimes, uncertainty and compute accounting.

**NOT READY.**

### 9. T2424-0027 — BENCHMARK/TOOL PATH

**CURRENT EVIDENCE:** strong reproducible synthetic injected-coordinate audit.

**PROMOTION GATE:** real multilingual encoders with frozen probes/leakage controls. Prefer benchmark/tool release before paper.

### 10. T2424-1863 — CLOSED NEGATIVE

**CURRENT EVIDENCE:** exact-head frozen negative against >75% gate. Current version receives no more compute. Optional negative technical note only if broader information value exists.

## Paper-factory operating rules

1. Maximum two major conversions at once.
2. No paper enters prose with a result that lacks provenance.
3. `[EXPERIMENT NOT YET RUN]`, `[EXTERNAL VALIDATION REQUIRED]`, and `[CITATION TODO]` remain explicit where applicable.
4. Figures never imply evidence not present in source data.
5. A reviewer attack chooses the next experiment; it does not choose a more flattering metric.
6. A negative result is not weakened by being negative; it is weakened by poor controls, poor provenance, weak framing, or overclaiming.