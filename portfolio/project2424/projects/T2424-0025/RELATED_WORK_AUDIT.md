# T2424-0025 Primary-Source Related-Work Audit

Status: **BOUNDED AUDIT COMPLETE; MANUSCRIPT CITATION INTEGRATION OPEN**

This audit is intentionally narrower than a generic "NGMT" literature survey. The frozen precursor is a synthetic robust-readout study with deterministic RBF weights. It is not a learned Transformer-memory experiment. Sources below are included only when their original publication or official proceedings record was verified.

## 1. Classical robust location estimation

### Huber (1964)

**Reference:** Peter J. Huber, “Robust Estimation of a Location Parameter,” *The Annals of Mathematical Statistics*, 35(1):73–101, 1964. DOI: `10.1214/aoms/1177703732`.

**Why relevant:** establishes the classical robust-location setting for contaminated distributions and estimators between the sample mean and median. This is appropriate background for the precursor's Huber-style robust readout and contamination framing.

**What it does not support:** it does not validate the repository's neural-memory framing, RBF weighting scheme, contamination schedule, or empirical effect sizes.

### Catoni (2012)

**Reference:** Olivier Catoni, “Challenging the empirical mean and empirical variance: A deviation study,” *Annales de l’Institut Henri Poincaré, Probabilités et Statistiques*, 48(4):1148–1185, 2012. DOI: `10.1214/11-AIHP454`.

**Why relevant:** provides a modern theoretical example of robust mean/variance estimation under weak assumptions that allow heavy-tailed distributions, and directly motivates skepticism about the ordinary empirical mean under heavy tails.

**What it does not support:** Catoni estimators are not the weighted median, trimmed mean, or exact Huber routine used in T2424-0025. The manuscript must not imply equivalence.

## 2. Robust aggregation inside learned systems

### Geisler, Zügner & Günnemann (NeurIPS 2020)

**Reference:** Simon Geisler, Daniel Zügner, Stephan Günnemann, “Reliable Graph Neural Networks via Robust Aggregation,” *NeurIPS 2020*.

**Primary record:** official NeurIPS proceedings, paper hash `99e314b1b43706773153e7ef375fc68c`; arXiv `2010.15651`.

**Why relevant:** demonstrates an adjacent learned-system setting where conventional mean/sum neighborhood aggregation is sensitive to outliers and a robust statistic-inspired differentiable aggregator is substituted.

**What it does not support:** it is a graph-neural-network robustness result under graph perturbations, not evidence for T2424-0025's deterministic RBF aggregation or a Transformer memory mechanism.

## 3. Robustness of forecasting under contaminated data

### Cheng et al. (ICLR 2024)

**Reference:** Hao Cheng, Qingsong Wen, Yang Liu, Liang Sun, “RobustTSF: Towards Theory and Design of Robust Time Series Forecasting with Anomalies,” *ICLR 2024*.

**Primary record:** official ICLR 2024 proceedings, paper hash `179f5dcdeedc149443ebd3ba70811dbd`; arXiv `2402.02032`.

**Why relevant:** establishes that contamination/anomalies in training time series are a current robustness problem and studies robust forecasting under several anomaly types, including additional heavy-tailed evaluations in the paper appendix.

**What it does not support:** T2424-0025 does not perform time-series forecasting, train a forecasting model, or evaluate RobustTSF. This source belongs in motivation/contrast, not in a direct baseline claim.

## 4. Learned external memory: contrast, not evidence

### Weston, Chopra & Bordes (ICLR 2015)

**Reference:** Jason Weston, Sumit Chopra, Antoine Bordes, “Memory Networks,” *ICLR 2015*. arXiv `1410.3916`.

**Why relevant:** a foundational example of a learned architecture combining inference components with a long-term memory component that can be read and written.

**What it does not support:** T2424-0025 contains no learned read/write memory architecture. It should be cited only to distinguish the precursor from actual learned-memory systems.

### Graves, Wayne & Danihelka (2014)

**Reference:** Alex Graves, Greg Wayne, Ivo Danihelka, “Neural Turing Machines,” arXiv `1410.5401`, 2014.

**Why relevant:** another foundational differentiable external-memory architecture using attentional memory interactions.

**What it does not support:** the frozen precursor has no trainable external-memory controller and cannot claim NTM-style memory behavior.

## 5. Robust attention: adjacent Transformer literature

### Hou et al. (NeurIPS 2024)

**Reference:** Zhichao Hou, Weizhi Gao, Yuchen Shen, Feiyi Wang, Xiaorui Liu, “ProTransformer: Robustify Transformers via Plug-and-Play Paradigm,” *NeurIPS 2024*. DOI: `10.52202/079017-4370`.

**Why relevant:** provides a primary-source example where the robustness of Transformer attention itself is modified explicitly.

**What it does not support:** its threat model, learned Transformer architecture, and robust-attention mechanism differ from T2424-0025. The precursor cannot borrow its Transformer-level interpretation.

## Manuscript-safe synthesis

A bounded related-work section can make the following sequence without upgrading the claim:

1. robust statistics has long studied location estimation under contamination and heavy tails;
2. robust aggregation has also been incorporated into learned systems when ordinary mean/sum aggregation is vulnerable to outliers;
3. contaminated observations are an active robustness problem in modern forecasting and related learning settings;
4. learned memory and robust Transformer attention are separate architectural literatures;
5. T2424-0025 is deliberately more modest: it isolates a synthetic weighted-aggregation readout comparison and finds a large robust-readout advantage, but its clean-control result prevents unique attribution to heavy-tailed contamination.

## Forbidden citation jumps

Do not write any sentence that uses these citations to imply that T2424-0025:

- implements a Transformer;
- implements a learned memory network;
- establishes a non-Gaussian memory mechanism;
- reproduces RobustTSF, ProTransformer, Memory Networks, or Neural Turing Machines;
- proves the weighted median is universally superior to the mean;
- establishes real-data or sequence-modeling robustness.

## Remaining citation work

- Integrate these verified sources into the actual Introduction/Related Work prose.
- Check every final bibliography entry against the primary record during manuscript assembly.
- Add any direct weighted-median / weighted-trimmed-estimator citation only after verifying that its assumptions and estimator match the manuscript statement.
- Do not cite secondary surveys when the original source is available.
