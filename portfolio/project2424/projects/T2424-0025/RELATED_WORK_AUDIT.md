# T2424-0025 Primary-Source Related-Work Audit

Status: **BOUNDED AUDIT COMPLETE / INTEGRATED INTO CURRENT-MAIN MANUSCRIPT**

This audit restores the verified literature boundary from historical paper PR #567 onto the current-main paper stack. It is intentionally narrower than a generic memory/Transformer literature survey because the frozen precursor is a synthetic robust-readout study with deterministic RBF weights, not a learned-memory experiment.

## Verified sources and allowed use

1. **Peter J. Huber (1964), “Robust Estimation of a Location Parameter,” Annals of Mathematical Statistics 35(1):73–101. DOI `10.1214/aoms/1177703732`.** Appropriate as classical robust-location background. It does not validate this repository's RBF weighting, contamination schedule, neural-memory framing, or effect sizes.
2. **Olivier Catoni (2012), “Challenging the empirical mean and empirical variance: A deviation study,” Annales de l’Institut Henri Poincaré 48(4):1148–1185. DOI `10.1214/11-AIHP454`.** Appropriate background for robust estimation under weak/heavy-tail assumptions. Catoni estimators are not the weighted median, weighted trimmed mean, or exact Huber-style readout implemented here.
3. **Simon Geisler, Daniel Zügner, Stephan Günnemann (NeurIPS 2020), “Reliable Graph Neural Networks via Robust Aggregation,” arXiv `2010.15651`.** Adjacent evidence that robust aggregation can matter inside learned systems. It is a graph-neural-network robustness result, not validation of this deterministic synthetic task.
4. **Hao Cheng, Qingsong Wen, Yang Liu, Liang Sun (ICLR 2024), “RobustTSF: Towards Theory and Design of Robust Time Series Forecasting with Anomalies,” arXiv `2402.02032`.** Appropriate motivation for contamination/anomaly robustness in learned forecasting. T2424-0025 neither reproduces RobustTSF nor evaluates forecasting.
5. **Jason Weston, Sumit Chopra, Antoine Bordes (ICLR 2015), “Memory Networks,” arXiv `1410.3916`.** Contrast for actual learned external-memory systems. The frozen precursor has no learned read/write memory architecture.
6. **Alex Graves, Greg Wayne, Ivo Danihelka (2014), “Neural Turing Machines,” arXiv `1410.5401`.** Contrast for differentiable external memory. The frozen precursor has no trainable external-memory controller.
7. **Zhichao Hou, Weizhi Gao, Yuchen Shen, Feiyi Wang, Xiaorui Liu (NeurIPS 2024), “ProTransformer: Robustify Transformers via Plug-and-Play Paradigm,” DOI `10.52202/079017-4370`.** Adjacent robust-attention literature only. Its architecture/threat model do not license a Transformer-level interpretation of T2424-0025.

## Current manuscript integration check

`MANUSCRIPT.md` cites all seven sources in the Introduction/Related Work and preserves their non-equivalence boundaries. It explicitly states that the precursor has no learned Transformer, no trainable memory controller, and no sequence-model benchmark. The clean-control result remains the central limitation preventing unique attribution to heavy-tailed contamination.

## Forbidden citation jumps

These sources must not be used to claim that T2424-0025:

- implements or validates a Transformer;
- implements or validates a learned memory network;
- establishes a uniquely non-Gaussian memory mechanism;
- reproduces RobustTSF, ProTransformer, Memory Networks, or Neural Turing Machines;
- proves universal superiority of a weighted median or other robust estimator;
- establishes real-data, forecasting, sequence-model, or external-domain robustness;
- inherits theoretical guarantees from Huber or Catoni that were not shown for the exact implemented estimators.

Any new citation or stronger literature-derived claim requires a fresh primary-source audit rather than inference from this list.
