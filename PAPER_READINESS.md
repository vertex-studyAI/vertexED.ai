# PAPER_READINESS

As of: **2026-08-13 22:00 IST**

This file is a claim-first manuscript gate, not a publication count.

## 1. LAM-JEPA — strongest paper-ready negative-result package

**QUESTION:** Does LAM-JEPA improve ARC-Challenge validation accuracy over a matched supervised model, and do planner/target components explain gains?  
**HYPOTHESIS:** Full LAM-JEPA should beat matched supervised and positive ablation effects should support planner/target mechanisms.  
**FALSIFIER:** Failure to beat matched supervised or ablation effects inconsistent with claimed mechanisms.  
**CONTRIBUTION BOUNDARY:** reproducible falsification/negative-result case study; not ARC superiority.  
**BASELINES:** matched supervised; no-planner; no-target; shuffled-label control; bounded pretrained comparator retained elsewhere.  
**PROTOCOL/DATA/SEEDS:** AI2 ARC-Challenge; frozen five-seed validation, seeds 1–5, 20 epochs, 1117 train and 295 validation eligible rows.  
**METRICS/RESULTS:** full `0.254915±0.012997`; matched supervised `0.266441±0.015460`; no-planner `0.250169±0.012997`; no-target `0.261695±0.020395`.  
**UNCERTAINTY:** sample SD across n=5; paired bootstrap mechanism intervals retained in canonical evidence.  
**ABLATIONS:** planner and target removal; negative control.  
**FAILURES:** superiority unsupported; planner contribution unsupported; target contribution unsupported; validation prediction-support collapse observed descriptively.  
**LIMITATIONS:** five validation seeds; no broad benchmark significance; locked test intentionally unused.  
**REPRODUCIBILITY:** artifact `9162165932`, digest `caa898...c30b`; current LAM main includes independent attempt-4 audit.  
**FIGURE PLAN:** five-seed paired accuracy plot; ablation-effect intervals; prediction-support/failure slice panel; provenance diagram.  
**CLAIM LEDGER:** GREEN reproducible negative result; no positive superiority/mechanism claim.  
**SUBMISSION BLOCKERS:** references/hardware/venue fit/final external review; do not open locked test for this failed line.

## 2. IRIS — negative/development paper package, candidate not ready

**QUESTION:** Can history-conditioned bounded influence improve the robustness-adaptation frontier of recurrent memory rather than merely smooth noise?  
**HYPOTHESIS:** a frozen candidate should beat strong robust baselines under corruption while satisfying clean/shift non-inferiority and the >=10% abrupt-regime development gate.  
**FALSIFIER:** any required endpoint fails or coherent outlier/change ambiguity causes unacceptable false/delayed adaptation.  
**CONTRIBUTION BOUNDARY:** robustness-adaptation failure analysis and candidate-development protocol; not a proven novel mechanism.  
**BASELINES:** Huber, fixed HTAM, robust filtering/changepoint controls, clipped estimator, switching/reference controls, matched learned recurrent control where feasible.  
**PROTOCOL/DATA/SEEDS:** synthetic/sequence development and stress seeds only; reserved confirmatory seeds untouched.  
**RESULTS:** current candidate only ~5.33–5.36% abrupt improvement vs fixed HTAM, below >=10% gate; PCRW does not cleanly beat Huber; coherent burst outliers adverse.  
**UNCERTAINTY:** retained development-seed evidence; no confirmatory uncertainty claim.  
**ABLATIONS:** gate behavior, false-open/delayed-open, bounded branch/removal, scale dynamics, change-aware baselines.  
**FAILURES:** scalar-to-learned transfer failure; insufficient abrupt improvement; burst-outlier ambiguity.  
**LIMITATIONS:** mechanism not frozen; strong robust/changepoint baselines and external datasets incomplete.  
**REPRODUCIBILITY:** v0.2 package retained; late-wave candidate evidence remains development-only.  
**FIGURE PLAN:** robustness-adaptation frontier; recovery-delay vs false-open curve; burst-failure trajectories; baseline ladder.  
**CLAIM LEDGER:** current candidate RED; research package can be defensible as negative/development work.  
**SUBMISSION BLOCKERS:** mechanism freeze, strong baselines, untouched confirmatory run, two external temporal datasets, full provenance.

## 3. T2424-0025 — strongest bounded Project 2424 ML story

**QUESTION:** Do robust memory readouts reduce error under heavy-tailed contamination relative to ordinary weighted means?  
**HYPOTHESIS/FALSIFIER:** robust readouts should improve contaminated conditions; a clean-control advantage of similar form prevents mechanism-specific non-Gaussian interpretation.  
**CONTRIBUTION BOUNDARY:** robust aggregation under a synthetic noisy-memory construction, not NGMT Transformer evidence.  
**BASELINES:** weighted mean, weighted median, trimmed mean, weighted Huber; clean 0% contamination control.  
**PROTOCOL/SEEDS:** 30-seed primary screen + 50-seed contamination ablation.  
**RESULTS:** strong heavy-tail improvement reproduced; robust estimators also materially improve at 0% contamination.  
**UNCERTAINTY:** 50-seed sample SD retained in canonical results.  
**FAILURE:** mechanism specificity not isolated.  
**REPRODUCIBILITY:** Project 2424 source `bd2a4d...`, workflow `31618609967`, `10/10` tests.  
**FIGURE PLAN:** contamination-vs-MAE curves including 0% control; estimator tradeoff panel.  
**SUBMISSION BLOCKERS:** learned sequence setting, matched Gaussian/reference memory, standard/no-memory controls, external task.

## 4. NeuroCAD

**QUESTION:** Does typed IR improve reliable CAD generation relative to direct generation under distribution shift?  
**HYPOTHESIS:** typed IR should improve parse/IR/execution/geometric/constraint validity and unsafe rejection.  
**FALSIFIER:** matched-provider direct baseline equals or beats IR on frozen OOD suite without safety penalty.  
**CONTRIBUTION BOUNDARY:** current evidence proves a controlled compiler benchmark only.  
**BASELINES:** deterministic direct/control baseline now; same frozen learned provider direct-vs-IR required next.  
**PROTOCOL/DATA:** frozen 20-case controlled grammar; next OOD suite must include part families, paraphrases, units, ordering and unsafe instructions.  
**RESULTS:** latest frozen reproduction `6/6`; controlled benchmark retained 20/20.  
**UNCERTAINTY:** deterministic current suite; no stochastic generalization claim.  
**FIGURE PLAN:** OOD failure taxonomy and direct-vs-IR outcome matrix.  
**SUBMISSION BLOCKERS:** frozen learned provider, retained prompts/raw outputs, CAD backend execution, OOD/compositional evidence, external reproduction.

## 5. Darcy

**QUESTION:** Does the reduced-resistance representation improve pressure prediction in the frozen synthetic Darcy screen?  
**HYPOTHESIS/FALSIFIER:** reduced representation should materially reduce pressure MAE under the frozen fixture; failure on learned/OOD physical regimes blocks operator generalization.  
**CONTRIBUTION BOUNDARY:** deterministic/synthetic 1D mechanism evidence, not a neural operator paper yet.  
**BASELINES:** baseline pressure estimator vs reduced-resistance representation.  
**RESULTS:** baseline MAE `0.0658913916`; reduced MAE `0.0011366559`; relative improvement `97.8766%`; mean flux relative error ~`1.369e-16`, n=20; latest focused tests `6/6`.  
**UNCERTAINTY:** retained 20-seed screen; broader physics uncertainty untested.  
**FIGURE PLAN:** per-seed pressure error; aligned/misaligned field OOD panel; learned baseline comparison.  
**SUBMISSION BLOCKERS:** actual learned operator, matched compute, real/frozen dataset, OOD fields and rollout evaluation.

## 6. NGMT

**QUESTION:** Does a specifically defined non-Gaussian memory improve delayed recall/predictive likelihood/corruption robustness under heavy-tailed, multimodal or regime-switching sequences?  
**HYPOTHESIS:** B3 non-Gaussian memory beats B0 no-memory, B1 standard memory and B2 Gaussian/reference memory under matched dimensions/parameters while remaining competitive on clean controls.  
**FALSIFIER:** B3 fails to distinguish itself from B0–B2 on the frozen benchmark.  
**CONTRIBUTION BOUNDARY:** no current Transformer-level result.  
**PROTOCOL/SEEDS/METRICS:** must be frozen before training.  
**RESULTS:** none for B3; T2424-0025 is precursor evidence only.  
**SUBMISSION BLOCKERS:** mechanism identity, read/write equations, non-Gaussian property, matched baselines, task, seed policy, advancement rule.

## 7. APEN

**QUESTION:** Does adaptive salience improve rare-event performance robustly to salience noise/failure?  
**RESULT:** synthetic gain retained, but degrades and can reverse as salience reliability fails.  
**BOUNDARY:** informative-salience mechanism tradeoff only.  
**BASELINES/ABLATIONS:** matched learned control, no-salience, corrupted/dropout salience.  
**UNCERTAINTY:** paired Atlas V4 evidence retained; no new closeout statistic computed.  
**FIGURE PLAN:** performance vs salience reliability.  
**BLOCKERS:** naturalistic task, matched learned baseline, preregistered reliability stress.

## 8. Eigen-JEPA

**QUESTION:** Does spectral/eigen representation improve real-market target prediction over strong direct controls?  
**RESULT:** current fresh rerun does not beat raw/log ridge on the primary covariance-matrix MSE comparison.  
**BOUNDARY:** reproducible boundary/negative study, not superiority.  
**BASELINES:** raw ridge, log ridge, stronger spectral/statistical controls next.  
**UNCERTAINTY:** retained Atlas artifacts; no new closeout significance claim.  
**FIGURE PLAN:** primary metric by baseline; spectral target sensitivity.  
**BLOCKERS:** preregistered metric, stronger spectral baseline, multi-dataset replication.

## 9. NPMS

**QUESTION:** Can memory-spectrum features identify dynamical regimes better than simpler summaries and generalize OOD?  
**RESULT:** controlled reservoir regime classification `0.928571`.  
**BOUNDARY:** controlled mechanism only.  
**BASELINES:** parameter-summary and stronger learned/standard memory controls.  
**FIGURE PLAN:** regime confusion + OOD shift.  
**BLOCKERS:** learned sequence model and OOD/generalization.

## 10. Hercules

**QUESTION:** Does the proposed compact architecture beat a same-budget Transformer and its own ablation?  
**RESULT:** no matched learned comparison yet.  
**FALSIFIER:** no consistent benefit under identical parameter/data/optimizer/training/evaluation budget.  
**FIGURE PLAN:** training curves, downstream score, throughput/memory.  
**BLOCKERS:** freeze and run minimal experiment.

## 11. Olympus

**QUESTION:** Does role decomposition improve correctness/evidence quality over a monolithic agent under matched provider/tool budget?  
**RESULT:** O0 deterministic runtime mechanics only; O1 unrun.  
**BASELINES:** monolith; full roles; minus adversarial falsifier; minus evidence gate.  
**FALSIFIER:** no quality benefit or worse efficiency under matched budget.  
**FIGURE PLAN:** correctness/evidence-quality/cost frontier.  
**BLOCKERS:** frozen provider/task set, approximately 100 matched tasks, O1/O2 execution.