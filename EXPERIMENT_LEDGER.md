# EXPERIMENT_LEDGER

## LAM-JEPA
**Question:** Does LAM-JEPA beat a capacity-matched supervised ARC baseline and do planner/target mechanisms add validation benefit?  
**Falsifier:** matched baseline not beaten and/or mechanism criteria fail.  
**Protocol/data/seeds:** ARC-Challenge train/validation only; 1,117/295 eligible rows; seeds 1–5; 20 epochs; CPU; locked test absent.  
**Result:** full `0.2549152493 ± 0.0129968006`; matched `0.2664406780 ± 0.0154600058`; no_planner `0.2501694888 ± 0.0129968006`; no_target `0.2616949081 ± 0.0203953938`. Negative/inconclusive.  
**Uncertainty:** planner delta `+0.0047457606`, bootstrap CI `[0,0.0142372817]`; target delta `-0.0067796588`, CI `[-0.0135593176,0]`.  
**Limit:** one benchmark, five seeds; no significance/general-intelligence claim.

## IRIS
**Question:** Can robust adaptation clear an abrupt-change gate without corruption/clean penalties?  
**Falsifier:** <10% abrupt improvement, failure against Huber/PCRW-class controls, or adverse burst/false-open behavior.  
**Result:** v0.2 is mixed/negative; current successor only ~5.33–5.36% over fixed HTAM vs >=10% gate. Confirmatory seeds untouched.  
**Failure:** coherent bursts adverse; current candidate remains RED.

## T2424-0027 latent language audit
**Question:** Does centering preserve concept information while reducing language leakage?  
**Data/protocol:** deterministic frozen 72-record synthetic audit + independent verifier.  
**Result:** raw concept 1.0; raw language 1.0; centered concept 1.0; centered language 0.361111; normalized excess leakage reduction 0.958333; verifier PASS.  
**Limit:** synthetic construction; real multilingual encoder still required.

## NeuroCAD
**Question:** Does typed/validated IR improve frozen held-out validity/rejection over direct extraction?  
**Result:** v1 typed 19/20 vs direct 12/20 (+35pp); OpenSCAD 12/12; one negative-width failure retained; post-result fix separate.  
**Limit:** template constrained; no arbitrary NLP-to-CAD claim.

## Darcy
**Question:** Does reduced resistance improve the frozen 1D pressure surrogate?  
**Result:** baseline MAE `0.0658913916`; latent MAE `0.0011366559`; relative improvement `97.8766%`; flux relative error ~`1.369e-16`, n=20.  
**Limit:** deterministic 1D surrogate, not learned-operator evidence.

## NGMT v0.1
**Question:** Does Student-t B3 memory beat matched B1/B2 under adverse sequence conditions?  
**Baselines:** B0 no memory, B1 standard kernel, B2 Gaussian mixture, B3 Student-t ν=3 + robust write.  
**Protocol:** equal 6,049 params; B1/B2/B3 equal 18-scalar memory; seeds 11/23/37; six held-out conditions.  
**Result:** B3 vs B2 `+0.4946% ±1.5472%` vs >=5% FAIL; B3 vs B1 `+0.4393% ±1.1529%` vs >=3% FAIL; clean regression criterion PASS.  
**Verdict:** `NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`.

## APEN
**Question:** Is rare-event benefit robust to salience degradation?  
**Result:** APEN rare MSE `17.06035`; exponential-trace `18.86026`; oracle-delay `16.68771`; at 100% salience dropout APEN `20.906161` vs uniform `20.510165`, reversal preserved.  
**Limit:** synthetic; matched learned/naturalistic baseline open.

## Eigen-JEPA
**Question:** Does Eigen-JEPA improve real-market covariance forecasting over strong ridge controls?  
**Result:** Eigen matrix MSE `5.831823e-09`; raw ridge `5.773438e-09`; log ridge `5.789609e-09`; paired difference vs log ridge `+4.221e-11`, n=111 (worse).  
**Limit:** one data family; no superiority claim.

## NPMS
**Question:** Are memory spectra more regime-informative than coarse parameter summaries?  
**Result:** NPMS regime classification `0.928571` over 112 reservoir realizations; spectrum-transfer `0.875` vs parameter-summary `0.666667` across 24 models.  
**Limit:** controlled diagnostic; no causal/natural-task claim.

## Hercules
No scientific experiment is frozen/executed. Required: canonical source/mechanism, same-budget Transformer, ablation, frozen data/budget/seeds/metric.

## Olympus
O0 clean-room precursor only. O1 frozen spec requires monolithic/full/minus-falsifier/minus-evidence-gate arms under identical provider/tool/task budget and >=100 paired tasks across >=2 families; not executed.
