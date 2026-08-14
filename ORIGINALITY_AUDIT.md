# ORIGINALITY_AUDIT

**As of:** 2026-08-14  
**Policy:** conservative novelty classification. A new project name, combination of established components, or new application domain is not automatically a novel scientific mechanism.

This audit covers the Tier-S research paper candidates. VertexED and Percy remain product/systems lanes; they require separate systems-prior-art audits only if promoted to papers.

## LAM-JEPA

### Precise current contribution boundary

The strongest defensible contribution is **not** that JEPA, latent actions, quantization, planning, EMA targets, memory, or grokking-oriented training are individually new. Current evidence supports a reproducible falsification/negative-result package for one frozen ARC configuration and its planner/target ablations.

| Related direction | Similarity | Difference | Is the difference scientifically meaningful now? |
|---|---|---|---|
| I-JEPA — Assran et al., arXiv:2301.08243 | Joint-embedding latent prediction without pixel/token reconstruction | LAM-JEPA applies latent prediction to reasoning-style state/action trajectories and adds planning/verification | **Combination/application difference only** until mechanism evidence exists |
| Video/temporal JEPA variants | Predict future/hidden representations rather than reconstruct observations | LAM-JEPA uses reasoning/action trajectories rather than visual blocks/frames | **Not sufficient by itself** for method novelty |
| Latent action world models — e.g. Garrido et al., arXiv:2601.05230 | Learned latent action spaces and world-model planning | LAM-JEPA's discrete reasoning actions are educational/reasoning-oriented and combined with verification/rubric heads | Latent-action concept is established; current difference is **engineering/combination** |
| VQ-VAE — van den Oord et al., arXiv:1711.00937 | Discrete vector-quantized latents/codebooks | LAM-JEPA uses quantization as a reasoning bottleneck | **Established technique** |
| Grokking literature | Delayed generalization on algorithmic tasks and regularization/optimization effects | LAM-JEPA attempted to encourage grokking through a bundle of bottlenecks/regularizers | **Established phenomenon; causal mechanism not established here** |
| Search/world-model planning | Rollout/search in latent state with value/verification scoring | Educational reasoning target and integrated heads | **Engineering combination** unless ablation shows a distinct effect |

**Classification:** **novel empirical negative/reproducibility observation + incremental combination**, not a substantial new JEPA mechanism on current evidence.

**What could strengthen novelty without rescuing the failed result:** a careful failure-mechanism analysis showing *why* prediction support collapses or why planner/target components fail under the frozen ARC setup, if that mechanism is reproducible across tasks. The locked ARC test must remain untouched for the current hypothesis.

## IRIS / current PABIM mechanism

### Precise current contribution boundary

Robust heavy-tail filtering, Student-t state estimation, bounded-influence estimators, and abrupt-change tracking are established research directions. The current PABIM common harness is most defensible as a **well-controlled negative result about a robustness–adaptation tradeoff** rather than a novel robust-filter architecture.

| Related direction | Similarity | Difference | Is the difference scientifically meaningful now? |
|---|---|---|---|
| Robust Bayesian filtering with Student's t — Roth et al., arXiv:1703.02428 | Heavy-tailed observation/process noise; robust state estimation | PABIM uses persistence/bounded-influence adaptation and a common stress harness | Student-t robustness itself is **established** |
| Robust/trend-following Student-t smoothers — Aravkin et al., arXiv:1303.5588 | Joint concern with outliers and sudden state changes | PABIM attempts online persistence-aware adaptation rather than a smoother formulation | The broad robustness-vs-change problem is **established** |
| Huber/robust filtering families | Bounded influence against outliers | PABIM adds persistence/opening logic | Combination may be useful, but current mechanism loses to strong controls on two frozen gates |
| Change-aware robust baselines | Explicit adaptation to persistent shifts | PABIM uses a persistence-triggered mechanism | Confirmed-streak Huber currently provides a dangerous simpler explanation/control |

**Classification:** **useful negative empirical observation / likely incremental mechanism**. The strongest story is that localized heavy-tail gains do not survive a common gate against strong fixed robust controls and persistent-shift adaptation.

**Novelty blocker:** current evidence is synthetic scalar state tracking. A broad mechanism claim would require stronger prior-art closure and either a theoretically distinct mechanism or repeated empirical behavior on real temporal data.

## NeuroCAD / T2424-0037

### Precise current contribution boundary

Natural-language and learned CAD generation are active, established areas. The possible contribution is narrower: whether a **typed, validated intermediate representation and explicit invalid-rejection layer** improves executable correctness relative to a genuinely matched direct-generation baseline, especially under compositional/OOD language.

| Related direction | Similarity | Difference | Is the difference scientifically meaningful now? |
| DeepCAD — Wu et al., arXiv:2105.09492 | CAD as sequential operations generated by Transformer models | NeuroCAD focuses on text-to-typed-IR validation and executable rejection | **Different task/control layer**, not enough alone |
| Text2CAD — Khan et al., arXiv:2409.17106 | Natural language to sequential parametric CAD | NeuroCAD's claim centers typed validation rather than an end-to-end autoregressive CAD sequence model | Potentially meaningful if matched baseline survives |
| Text-to-CadQuery — Xie & Ju, arXiv:2505.06507 | Direct text-to-executable CAD code with pretrained LLMs | NeuroCAD inserts typed IR/validator before backend code | **Dangerous direct-code baseline**; must be compared same-provider/same-budget |
| CAD-Coder — He et al., arXiv:2505.08686 | Text-guided executable/editable CAD script generation | NeuroCAD emphasizes invalid rejection and typed constraints | Could be useful engineering contribution; broader benchmark required |
| CAD-Recode — Rukhovich et al., arXiv:2412.14042 | Executable CAD code representation and LLM decoding | Input is point cloud rather than text | Shows executable-code representation itself is not novel |

**Classification:** **useful engineering contribution with plausible mechanism contribution**, conditional on a same-provider direct-vs-IR comparison and a larger OOD/compositional/invalid benchmark. Current `19/20` vs `12/20` controlled result is promising but too small/authored to establish broad novelty.

## Portfolio novelty decisions

- **LAM-JEPA:** publishability should come from the quality of the negative evidence/provenance, not a claim that the component stack is novel.
- **IRIS:** do not invent a successor merely to recover novelty; the current negative robustness–adaptation result may be more defensible than another renamed filter.
- **NeuroCAD:** this is the only Tier-S research line where a decisive new baseline could plausibly convert the current engineering distinction into a mechanism contribution.
- **APEN (Tier A):** the salience-alignment ablation is scientifically interesting, but originality classification is deferred until matched learned-memory prior art/baselines are closed.

## Citation/review TODO

Before submission, verify final bibliographic metadata from primary papers and add all directly relevant prior work discovered in the manuscript-specific literature review. This audit is a triage map, not a complete related-work section.