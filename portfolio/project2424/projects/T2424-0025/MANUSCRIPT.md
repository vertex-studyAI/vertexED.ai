# Robust Weighted Readouts Under Synthetic Contamination: A Reproducible Bounded Study

**Authors:** To be finalized before release

## Abstract

Ordinary weighted averaging can be unstable when a small number of observations have unusually large errors. We study a deliberately narrow version of that problem in a synthetic weighted-aggregation setting. A smooth one-dimensional latent signal is observed through repeated noisy replicas, and deterministic radial-basis-function weights are used to aggregate nearby observations. We compare a weighted arithmetic mean with a weighted median, a 10% weighted trimmed mean, and a Huber-style robust readout. The frozen experiment was independently reproduced byte-for-byte from the recorded source revision. In the 30-seed heavy-tail screen, the arithmetic mean obtained mean absolute error (MAE) 0.36153 while the weighted median obtained 0.01656, a 95.42% relative reduction. The same comparison also favors the median under the clean Gaussian control: 0.02435 versus 0.01259 MAE, a 48.29% relative reduction. A 50-seed contamination sweep shows the median remaining substantially below the arithmetic mean from 0% through 35% Cauchy contamination. The clean-control result is central to the interpretation. It rules out a claim that the observed advantage is uniquely caused by heavy-tailed contamination or by a specifically non-Gaussian memory mechanism. The supported result is narrower: under this frozen synthetic procedure, robust weighted readouts can substantially outperform an arithmetic weighted mean, and that advantage persists beyond the contaminated regime that motivated the study. We present the result as a reproducible precursor and preserve the negative control as a constraint on successor claims.

## 1. Introduction

Weighted averaging is a natural operation in systems that combine nearby observations, retrieved records, or similarity-weighted evidence. Its appeal comes from simplicity and smoothness, but an arithmetic mean can be disproportionately affected by extreme values. Classical robust statistics studies this problem through estimators designed to limit the influence of contaminated observations. Huber's work on robust location estimation formalized a broad setting in which an estimator should remain useful when an idealized distribution is only approximately correct [1]. Later work developed concentration guarantees for robust alternatives to the empirical mean under weaker tail assumptions [2].

This issue also appears inside learned systems, although the details depend on the architecture and threat model. Geisler, Zügner, and Günnemann replace conventional graph-neighborhood aggregation with a robust, differentiable alternative in graph neural networks [3]. RobustTSF studies time-series forecasting when training observations are contaminated by anomalies [4]. Other lines of work address learned external memory [5,6] or modify Transformer attention for robustness [7]. Those literatures motivate a broader question about robust aggregation, but they should not be conflated with the experiment studied here.

The present work isolates a much smaller question. We consider deterministic similarity weights over a synthetic scalar signal and compare several readout rules. There is no learned Transformer, no trainable memory controller, and no sequence-modeling benchmark in the frozen precursor. This restriction matters because an early interpretation of the result could have been framed as evidence for a specifically non-Gaussian memory mechanism. The retained controls do not support that interpretation.

The strongest evidence comes from a simple but consequential observation. The weighted median improves substantially over the weighted arithmetic mean even when the Cauchy-contamination rate is exactly zero. Heavy-tailed contamination therefore cannot be the unique explanation of the effect. Rather than hiding that control, we use it to define the paper's claim boundary.

The contribution of this study is an evidence-bounded empirical characterization of robust weighted readouts under a frozen synthetic procedure, together with exact reproduction metadata. We report the favorable contaminated-regime results and the clean-control result in the same analysis. This makes the precursor useful both as a reproducible observation and as a falsifier of an overly specific mechanism story.

## 2. Related Work

### 2.1 Robust location estimation

Huber [1] studies robust estimation of a location parameter under contamination, establishing a classical foundation for estimators that reduce sensitivity to deviations from an assumed distribution. The motivation is directly relevant to our comparison between an arithmetic mean and robust alternatives. The exact weighted estimators used in our code are specific to this experiment, so the classical theory should be treated as background rather than as a proof of our empirical behavior.

Catoni [2] develops robust estimators of mean and variance with deviation guarantees under weak moment conditions. This work illustrates why replacing an empirical mean can be useful when tails are insufficiently controlled. Our weighted median and trimmed readout are not Catoni estimators, and we do not claim their theoretical guarantees.

### 2.2 Robust aggregation in learned systems

Geisler et al. [3] show that ordinary aggregation can be a vulnerability in graph neural networks and develop a differentiable robust aggregation scheme. The architectural setting and adversarial perturbation model differ from ours, but the work provides a useful example of robust statistics entering a learned aggregation pipeline.

Cheng et al. [4] study robust time-series forecasting under anomalous training observations. Their setting is substantially more realistic than our synthetic weighted-readout problem and includes learned forecasting models. We cite it to situate data contamination as an active machine-learning robustness problem, not as evidence that our frozen experiment solves forecasting under anomalies.

### 2.3 Learned memory and robust attention as distinct lines

Memory Networks [5] and Neural Turing Machines [6] are foundational examples of learned systems with explicit memory interactions. ProTransformer [7] modifies Transformer attention to improve robustness. These works are important contrasts because the frozen T2424-0025 precursor does not implement their defining architectural features. Any learned-memory or Transformer successor should therefore be evaluated as a separate experiment with its own protocol and evidence lineage.

## 3. Experimental Setup

### 3.1 Synthetic signal and observations

The frozen experiment operates on a bounded one-dimensional domain. It uses 24 anchor queries distributed on the interval [0,1]. For each anchor, seven replicated observations are generated from a deterministic smooth latent signal plus noise. Similarity between an anchor and an observation is converted into a deterministic radial-basis-function weight. The experiment then estimates the local signal from those weighted observations.

Two broad noise conditions are retained. The clean condition uses Gaussian noise. The contaminated condition introduces Cauchy contamination at a specified fraction of observations. The contamination sweep evaluates fractions 0.00, 0.05, 0.10, 0.18, 0.25, and 0.35.

### 3.2 Readout rules

We compare four deterministic weighted readouts:

- a weighted arithmetic mean;
- a weighted median;
- a 10% weighted trimmed mean;
- a Huber-style readout with delta 0.15.

The arithmetic mean is the principal reference. The robust alternatives limit the influence of extreme observations in different ways. No readout is learned in the frozen precursor.

### 3.3 Evaluation protocol

Mean absolute error is the primary retained metric. The initial screen uses 30 deterministic seeds. The contamination ablation uses 50 deterministic seeds for each contamination fraction. These runs are already frozen and independently reproduced. We do not tune parameters after inspecting the contamination sweep in order to make the effect appear more specific.

The contamination ablation is best understood as a post-result mechanism analysis rather than a preregistered confirmatory test. We therefore report descriptive summaries and avoid treating the sweep as a formal hypothesis test with a predeclared significance procedure.

## 4. Results

### 4.1 Frozen 30-seed screen

Under the retained heavy-tail condition, the weighted arithmetic mean has MAE 0.3615267855 while the weighted median has MAE 0.0165609423. Relative to the arithmetic mean, the median reduces MAE by 95.42%.

The clean Gaussian control is less dramatic but scientifically more important for interpretation. The arithmetic mean has MAE 0.0243549670 and the weighted median has MAE 0.0125939627, corresponding to a 48.29% relative reduction. The robust readout therefore improves even when no Cauchy contamination is introduced.

| Condition | Weighted mean MAE | Weighted median MAE | Median relative reduction |
|---|---:|---:|---:|
| Heavy-tail screen | 0.3615268 | 0.0165609 | 95.42% |
| Clean Gaussian control | 0.0243550 | 0.0125940 | 48.29% |

### 4.2 Fifty-seed contamination sweep

The larger ablation retains all four readout rules across six contamination fractions.

| Cauchy contamination | Mean MAE | Median MAE | 10% trimmed MAE | Huber MAE | Median reduction vs mean |
|---:|---:|---:|---:|---:|---:|
| 0.00 | 0.0246469 | 0.0125699 | 0.0187115 | 0.0190792 | 49.00% |
| 0.05 | 0.1450123 | 0.0133367 | 0.0226237 | 0.0220305 | 90.80% |
| 0.10 | 0.3211625 | 0.0141783 | 0.0300138 | 0.0254792 | 95.59% |
| 0.18 | 0.3494393 | 0.0170025 | 0.0455063 | 0.0309255 | 95.13% |
| 0.25 | 0.4567522 | 0.0223649 | 0.0670628 | 0.0386112 | 95.10% |
| 0.35 | 0.8655903 | 0.0286803 | 0.1009767 | 0.0467106 | 96.69% |

Figure 1 in `figures/figure1_contamination_mae.svg` plots the four retained MAE series on a logarithmic vertical axis. Figure 2 in `figures/figure2_relative_improvement.svg` plots the median's relative reduction compared with the arithmetic mean. Both are generated directly from `raw_metrics/repro-wave-20260812.json`, and the derived values used by Figure 2 are retained in `figures/FIGURE_DATA.json`.

The arithmetic mean deteriorates rapidly once contamination is introduced, whereas the robust readouts increase more gradually. The weighted median is the lowest-MAE readout at each retained contamination fraction. Yet the zero-contamination point remains nontrivial: median MAE is already about half the arithmetic-mean MAE before any Cauchy contamination is added.

### 4.3 What the clean control changes

A narrowly favorable reading of the contaminated rows would be that the experiment isolates a specifically heavy-tail-resistant mechanism. The zero-contamination row prevents that conclusion. If the effect were uniquely driven by Cauchy contamination, a large median advantage would not be expected to persist in the clean condition under the same broad explanation.

The data instead support a more general observation about this synthetic weighted-aggregation procedure. The arithmetic mean is a weaker readout than the robust alternatives across both clean and contaminated conditions. Additional work would be needed to determine which properties of the data-generation process, weighting function, finite-sample geometry, or estimator behavior account for the clean-control gap.

## 5. Discussion

The contaminated-regime result is large and reproducible, but its interpretation is narrower than the effect size alone might suggest. Robust readouts substantially reduce MAE relative to the arithmetic mean in this frozen task. That conclusion is directly supported by retained outputs. A claim about a uniquely non-Gaussian mechanism is not.

This distinction matters for successor research. A learned model could plausibly benefit from a robust retrieval or aggregation operator, but demonstrating that would require an experiment in which the learned architecture, baseline family, training budget, and controls are matched. The present result cannot substitute for such an evaluation.

The clean-control finding is useful rather than merely inconvenient. It identifies a confound before a larger model is built around the wrong story. A successor can now ask a sharper question: after controlling for the broad advantage of robust readout in this synthetic geometry, does a learned mechanism provide an additional benefit under a predeclared contamination shift or memory-specific benchmark?

## 6. Reproducibility and Evidence Lineage

The precursor has an explicit evidence trail. The historical experiment revision recorded by the project is:

`0d2a14e559b0caa9b5b1cbeef0995013594ecf15`

Independent reproduction was merged through PR #311 with merge commit:

`715aea0b632c70493c226a84473d77ff7ca8cfc6`

The retained reproduction commands are:

```bash
node portfolio/project2424/projects/T2424-0025/experiment/run.mjs > screen.json
node portfolio/project2424/projects/T2424-0025/experiment/ablation.mjs > ablation.json
```

The reproduced output digests are:

- screen: `7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1`
- ablation: `f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e`

The retained reproduction environment is Python 3.13.5, Node v22.16.0, Linux x86_64, with no CUDA device used. Machine-readable metrics are checked in at `raw_metrics/repro-wave-20260812.json`. Figure-generation provenance is documented in `figures/FIGURE_AUDIT.md`.

These details establish reproducibility of the frozen precursor outputs. They do not establish that the result transfers to other datasets, neural architectures, or learned-memory systems.

## 7. Limitations

The experiment is synthetic. The aggregation weights are deterministic rather than learned. The signal and noise families are hand specified. The readout comparison does not include a capacity-matched learned Gaussian memory or a learned robust-memory mechanism. The task does not test delayed recall, long-context sequence modeling, likelihood calibration, forecasting on real observations, or downstream decision quality.

The arithmetic-mean outcomes under Cauchy contamination are highly skewed. Descriptive mean and standard deviation summaries can therefore be unstable representations of the full distribution. The current paper does not introduce a preregistered inferential test for the headline contrast.

The contamination sweep was conducted as a mechanism-oriented follow-up rather than as a preregistered confirmatory study. Its strongest scientific value is therefore diagnostic: it demonstrates that the robust-readout advantage survives across the sweep while simultaneously showing that the advantage is already present in the clean control.

Release metadata also remains incomplete. The final author and contribution statement has not been frozen, and an obvious root repository license file was not found during the release audit. Public release rights must be resolved rather than inferred.

## 8. Conclusion

In a frozen synthetic weighted-aggregation experiment, robust readouts substantially outperform an arithmetic weighted mean under Cauchy contamination and remain better under the Gaussian clean control. The strongest contaminated-regime median reduction exceeds 95% in the retained screens, while the zero-contamination control still shows roughly a 49% reduction in the 50-seed sweep. That control rules out the narrow story that the observed gain is uniquely produced by heavy-tailed contamination.

The supported claim is deliberately modest. Robust weighted readouts are effective for this reproducible bounded task. The experiment does not establish a Transformer result, a learned-memory advantage, or a uniquely non-Gaussian memory mechanism. Preserving that boundary gives a successor study a cleaner starting point and keeps the precursor useful as both a positive empirical observation and a negative mechanism test.

## References

[1] Peter J. Huber. “Robust Estimation of a Location Parameter.” *The Annals of Mathematical Statistics*, 35(1):73–101, 1964. DOI: 10.1214/aoms/1177703732.

[2] Olivier Catoni. “Challenging the empirical mean and empirical variance: A deviation study.” *Annales de l’Institut Henri Poincaré, Probabilités et Statistiques*, 48(4):1148–1185, 2012. DOI: 10.1214/11-AIHP454.

[3] Simon Geisler, Daniel Zügner, and Stephan Günnemann. “Reliable Graph Neural Networks via Robust Aggregation.” *Advances in Neural Information Processing Systems 33*, 2020. arXiv:2010.15651.

[4] Hao Cheng, Qingsong Wen, Yang Liu, and Liang Sun. “RobustTSF: Towards Theory and Design of Robust Time Series Forecasting with Anomalies.” *International Conference on Learning Representations*, 2024. arXiv:2402.02032.

[5] Jason Weston, Sumit Chopra, and Antoine Bordes. “Memory Networks.” *International Conference on Learning Representations*, 2015. arXiv:1410.3916.

[6] Alex Graves, Greg Wayne, and Ivo Danihelka. “Neural Turing Machines.” arXiv:1410.5401, 2014.

[7] Zhichao Hou, Weizhi Gao, Yuchen Shen, Feiyi Wang, and Xiaorui Liu. “ProTransformer: Robustify Transformers via Plug-and-Play Paradigm.” *Advances in Neural Information Processing Systems 37*, 2024. DOI: 10.52202/079017-4370.
