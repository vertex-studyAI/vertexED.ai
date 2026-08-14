# ORIGINALITY_AUDIT

**Audit date:** 2026-08-14  
**Scope:** LAM-JEPA, IRIS, NeuroCAD and Percy, with NeuroCAD now Tier A after the component falsifier.  
**Standard:** conservative. Similarity to prior work is not reduced because this portfolio uses a different project name. This is a literature-and-evidence audit, not a patentability opinion and not proof that no uncited prior work exists.

## Executive verdict

| Project | Conservative contribution class | Current originality verdict |
|---|---|---|
| LAM-JEPA | **Novel empirical observation / reproducibility case study; architecture is primarily a combination of established directions** | The defensible paper is the frozen negative ARC evaluation, not a claim that latent-action JEPA planning or JEPA-for-language is a new mechanism. |
| IRIS | **Novel empirical failure/tradeoff observation at best; current mechanism family not established as novel** | Robust change handling under outliers/heavy tails is established. The useful residual question is false-open versus persistent-change adaptation under a matched state-estimation harness, not generic “robust memory.” |
| NeuroCAD | **Useful engineering contribution + informative negative causal ablation; broad research novelty not established** | Text-to-parametric CAD, executable CAD-program generation and programmatic geometry validation are established. The frozen v2 diagnostic shows matched validation alone closes the entire current 20-case gap, falsifying the typed-IR/parser-specific causal story on this benchmark. |
| Percy | **Potential useful systems engineering contribution; research novelty deferred** | Evidence-native orchestration may be practically valuable, but scientific novelty requires real-host fault/recovery evidence and a matched comparison against competent workflow/agent-orchestration systems. |

---

# 1. LAM-JEPA

## Current question that evidence actually answers

Under the frozen ARC-Challenge validation protocol, does the tested LAM-JEPA configuration beat a gradient-active-parameter-matched supervised model, and do the planner and target pathways contribute under the preregistered criteria?

Current answer: **no support for superiority or those mechanism claims.** The manuscript therefore has a negative/falsification-first contribution boundary.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| I-JEPA — Assran et al., *Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture*, arXiv:2301.08243 | Predict target representations in latent space rather than reconstructing raw observations | LAM-JEPA applies latent prediction to a small educational/reasoning configuration with additional planner/action/memory components | **No method novelty by itself.** JEPA mechanics are established. |
| LLM-JEPA — Huang, LeCun & Balestriero, *Large Language Models Meet Joint Embedding Predictive Architectures*, arXiv:2509.14252 / ICLR 2026 | JEPA objectives are applied directly to language-model pretraining/fine-tuning and evaluated on language/reasoning tasks | LAM-JEPA is a different small ARC configuration with planner/target/quantization controls and a negative result | **Critical novelty boundary. JEPA-for-language itself cannot be claimed as new.** |
| LAPA — Ye et al., *Latent Action Pretraining from Videos*, arXiv:2410.11758 | Learns discrete latent actions with vector quantization for action-model pretraining | Different domain/supervision; LAM-JEPA names reasoning operations as latent actions | **Likely combination/application difference, not a new latent-action principle.** |
| V-JEPA 2 / V-JEPA 2-AC — Assran et al., *Self-Supervised Video Models Enable Understanding, Prediction and Planning*, arXiv:2506.09985 | JEPA representations plus an action-conditioned latent world model used for planning | LAM-JEPA targets educational reasoning rather than physical control | **Domain difference only unless the reasoning-action mechanism produces independent evidence.** |
| Garrido et al., *Learning Latent Action World Models In The Wild*, arXiv:2601.05230 | Explicit latent-action world models; continuous/constrained vs quantized latent actions and planning | LAM-JEPA combines latent actions with an educational reasoning stack | **Weak architecture novelty. Latent-action world models are established.** |
| ARC — Clark et al., *Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge*, arXiv:1803.05457 | Same benchmark family | Current work contributes a frozen small-model evaluation, matched control, ablations and preserved adverse evidence | **Potentially meaningful as a reproducibility/negative-result case study, not benchmark novelty.** |

## Novelty boundary

- **Established technique:** JEPA-style latent prediction; target encoders; JEPA objectives in language; vector quantization; world models; latent actions; planning; verification; memory/retrieval; ARC evaluation.
- **Implementation novelty:** the exact integrated small educational-reasoning stack and evidence/reproducibility plumbing; exact module-level novelty must be mapped from source.
- **Combination novelty:** plausible but scientifically weak by itself.
- **Mechanism novelty:** **not supported.** Planner and target ablations do not pass frozen contribution criteria.
- **Theoretical novelty:** none established.
- **Empirical novelty:** reproducible negative/inconclusive evidence with capacity matching, mechanism ablations, negative control, repair-vs-science separation and a locked-test stop rule.

## Conservative classification

**Novel empirical observation / reproducibility case study.** The architecture itself is **likely incremental/combination-based** under current evidence.

## Publication implication

Avoid “first JEPA for language/reasoning” and “novel latent-action JEPA mechanism” language. The stronger contribution is falsification and reproducibility: this frozen implementation did not survive matched controls, and engineering recovery was kept separate from scientific rescue.

---

# 2. IRIS

## Current question that evidence actually answers

Can a robust adaptive estimator distinguish **persistent state change** from **isolated heavy-tailed corruption** well enough to improve recovery without unacceptable false openings or robust-state regression?

The current v0.2/successor evidence does not pass its promotion gate. Faster robust-CUSUM-style recovery can be bought with high false-open behavior, while simple confirmed-change Huber improves regime tracking without universally winning. The tradeoff—not a new architecture name—is the defensible scientific object.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| Fearnhead & Rigaill, *Changepoint Detection in the Presence of Outliers*, arXiv:1609.07363 | changepoint detection with outliers/heavy tails and bounded robust losses | IRIS emphasizes online state estimation/recovery as well as change detection | **Substantial problem overlap; generic robust-change novelty unavailable.** |
| Dürre & Fried, *Robust change point tests by bounded transformations*, arXiv:1905.06201 | robust CUSUM-style changepoint testing under heavy tails/corruption | IRIS couples robustness, adaptation, memory state and false-open diagnostics | **Raises baseline bar; robust change detection is established.** |
| Sankararaman & Narayanaswamy, *Online Heavy-tailed Change-point Detection*, UAI 2023, PMLR 216 | online detection under heavy-tailed observations with false-positive control | IRIS tracks estimation/recovery in addition to detection-like gating | **False-open control is already a formal research object.** |
| Altamirano, Briol & Knoblauch, *Robust and Scalable Bayesian Online Changepoint Detection*, ICML 2023, PMLR 202 | robust scalable online changepoint inference | different inference machinery; IRIS is a specific robust-state-estimation line | **Direct robust-online-change novelty is unavailable.** |
| Tang et al., *Online change point detection under heavy-tailedness and contamination*, arXiv:2606.09737 | directly studies online mean-change detection under Huber contamination and heavy-tailed inliers with detection-delay guarantees | IRIS evaluates state-estimation/recovery and gate behavior in a filtering harness | **Very high relevance and a serious novelty threat.** |
| Duran-Martin et al., *A unifying framework for generalised Bayesian online learning in non-stationary environments (BONE)*, TMLR 2025 | general non-stationary online learning with auxiliary changepoint processes | IRIS asks for a specific robust estimator/memory tradeoff | **Detect-and-adapt is established; residual novelty must be estimator-level and isolated.** |

## Novelty boundary

- **Established:** Huber/robust estimation; CUSUM/changepoint switching; robust change detection under outliers/heavy tails; dual-timescale adaptation; recurrent state estimation; change-aware online learning.
- **Implementation novelty:** exact HTAM/PABIM/PGR harness and false-open/recovery/transition metrics.
- **Combination novelty:** possible, but insufficient for a new robust-memory claim.
- **Mechanism novelty:** **unsupported.** Stronger baselines show adaptation can be purchased by opening more often.
- **Theoretical novelty:** none established.
- **Empirical novelty:** a useful failure taxonomy joining recovery, false openings and robust-state error across corruption versus persistent shifts.

## Conservative classification

**Novel empirical failure/tradeoff observation at best; likely incremental mechanism family.**

## Successor implication

No new named architecture is authorized. First determine whether a simple robust detector + robust estimator traces a better false-open/recovery/error frontier. Only a residual failure from a separately frozen study could justify a future learned successor.

---

# 3. NeuroCAD

## Evidence after the decisive component ablation

Frozen v1 showed `19/20` for the typed/validated route versus `12/20` for the original direct flat extractor, with `12/12` valid cases producing non-empty STL and one retained negative-width failure.

A second protocol was frozen **before first execution** to test the validation confound. On the reused 20-case plate diagnostic:

- current typed+validated implementation: `20/20`;
- original direct flat extraction: `12/20`;
- direct extraction + matched fail-closed validation: `20/20`;
- original gap: `0.40`;
- remaining gap: `0.00`;
- validation recovery fraction: `1.00`;
- frozen interpretation: `VALIDATION_DOMINANT`.

Therefore the claim that the current bounded advantage specifically demonstrates a **typed-IR/parser mechanism is falsified on this diagnostic**. This is a successful scientific ablation and does not erase the software result.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| DeepCAD — Wu, Xiao & Zheng, arXiv:2105.09492 | structured parametric CAD sequences | NeuroCAD is a deterministic bounded language compiler rather than a learned generator | **Engineering difference, not general CAD-generation novelty.** |
| Text2CAD — Khan et al., arXiv:2409.17106 | natural-language → parametric CAD with geometric/parametric evaluation | NeuroCAD uses a bounded compiler/validator | **Potential reliability distinction, but far narrower breadth.** |
| CADFusion — Wang et al., ICML 2025, PMLR 267 | text-conditioned CAD generation with rendered geometry feedback | NeuroCAD is deterministic/fail-closed | **Generation + geometry feedback is established.** |
| CAD-Coder — Guan et al., arXiv:2505.19713 | executable parametric CAD programs from text with geometric rewards/validation | NeuroCAD is grammar/compiler-driven and rejects unsupported inputs | **Useful systems contrast, not mechanism superiority.** |
| CADmium — Govindarajan et al., TMLR 2026 | code-LLMs generate sequential CAD JSON with geometric/topological evaluation at much larger scale | NeuroCAD is a tiny deterministic compiler benchmark | **Scale/generality novelty unavailable; only reliability/coverage may remain distinctive.** |
| CADSmith — Barkley et al., arXiv:2603.26512 | programmatic geometric validation and execution-aware correction | NeuroCAD validates before generation without iterative LLM repair | **Programmatic validation itself is established.** |
| Text2CAD-Bench — Wang et al., arXiv:2605.18430 | prompt-style and geometric-complexity benchmark | NeuroCAD current diagnostic is 20 plate-family cases | **Current breadth cannot support a broad research claim.** |

## Novelty boundary after falsification

- **Established:** text-to-CAD; sequential/parametric CAD; executable CAD code generation; geometric validation; repair/constraint checking.
- **Implementation novelty:** bounded grammar → parametric specification → fail-closed validation → SVG/OpenSCAD/STL may remain useful engineering.
- **Combination novelty:** weak as a scientific claim because matched validation fully explains the current gap.
- **Mechanism novelty:** **falsified for the typed-IR/parser-specific claim on this diagnostic.**
- **Theoretical novelty:** none established.
- **Empirical novelty:** the strongest research result is now the negative causal diagnostic itself.

## Conservative classification

**Useful engineering contribution + informative negative causal ablation.** Broad text-to-CAD research novelty is **not established**.

Any future learned/constrained + broader-OOD reliability/coverage question must be a separately versioned/frozen research effort. It does not give current NeuroCAD a second portfolio state.

---

# 4. Percy

Percy remains Tier S because it is enabling infrastructure, not because scientific novelty is established. Evidence-native task/claim/experiment graphs, artifact hashes, leases, provider routing and reproducibility bundles are individually familiar systems ideas.

A research question would require matched comparative evidence, for example:

> Under matched task graphs and provider budgets, does evidence-native orchestration reduce lost work, duplicate execution, unverifiable completion or recovery time after faults relative to a competent workflow/agent-orchestration baseline?

Until real-host qualification and matched-system comparison exist, classify Percy as **useful engineering/product infrastructure**, not a novel agent-systems paper.

---

# Reviewer attack

## Reviewer 1 — scientific skeptic

| Project | Strongest criticism | Severity | Evidence required | Cheapest decisive action | Acceptance threat? |
|---|---|---:|---|---|---|
| LAM-JEPA | JEPA-for-language and latent-action/world-model ideas already exist; architecture contribution is unsupported | High for method paper | source-level method map; LLM-JEPA/latent-action comparison; narrow negative claim | finish related work + method map; **no rescue run** | **Yes** unless framed as falsification/reproducibility |
| IRIS | robust heavy-tail change detection/adaptation is established | High | matched robust detector/estimator frontier at controlled false-open budget | freeze/run development-only frontier if information gain justifies it | **Yes** to positive mechanism paper |
| NeuroCAD | broad text-to-CAD/validation is established and the bounded typed mechanism was defeated by matched validation | **Critical for mechanism paper** | only fresh broader learned/constrained reliability/coverage evidence could reopen research priority | new version only; otherwise productize software | **Current typed-IR mechanism paper is dead** |

## Reviewer 2 — experimental skeptic

| Project | Strongest criticism | Severity | Evidence required | Cheapest decisive action | Acceptance threat? |
|---|---|---:|---|---|---|
| LAM-JEPA | one benchmark and five seeds are too narrow for broad conclusions | Moderate | exact provenance, uncertainty, environment/hardware, bounded claims | independent table/figure recomputation | only if claims broaden |
| IRIS | synthetic/development-heavy evidence and prior candidate selection can overfit development | High | frozen frontier, external data only if a residual survives, untouched confirmatory block | kill line if simple frontier dominates | **Yes** for positive paper |
| NeuroCAD | reused 20 plate cases are too small/narrow for broad CAD claims | Critical | fresh frozen part families, semantic/execution metrics, competent learned baselines, independent replay | one fresh benchmark protocol or stop | **Yes** |

## Reviewer 3 — mechanism skeptic

| Project | Strongest criticism | Severity | Evidence required | Cheapest decisive action | Acceptance threat? |
|---|---|---:|---|---|---|
| LAM-JEPA | planner/target may be inactive or confounded by quantization/trainability | Moderate | source-level gradient/module audit; implementation-specific limitation | audit graph/gradients; keep claim local | Low for bounded negative paper |
| IRIS | faster recovery may simply reflect a more permissive gate | Critical | matched false-open constraint or preregistered Pareto frontier | threshold-matched simple detector + estimator | **Yes, critical** |
| NeuroCAD | observed gain may be entirely validation, not typed IR | **Resolved against the mechanism** | frozen v2 already supplies decisive control | **Done:** matched validation closes 100% of gap | **Typed-IR causal claim rejected** |

Reviewer outputs determine experiments. If the cheapest decisive experiment defeats a contribution, downgrade it rather than expanding the suite to search for a favorable narrative.

---

# Portfolio originality consequences

1. **LAM-JEPA remains the first paper conversion**, as a falsification/reproducibility paper.
2. **IRIS remains a negative scientific closure**, not an architecture-search program.
3. **NeuroCAD is productized as software; the current typed-IR mechanism claim is falsified.** A future broader research question must be separately versioned and earn its own state.
4. **Percy research publication is deferred** until live reliability evidence and comparative systems evaluation exist.
5. A new combination, domain or name is not a new scientific mechanism.

## Verified primary literature used in this audit

- Assran et al. — *Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture* — arXiv:2301.08243.
- Huang, LeCun & Balestriero — *LLM-JEPA: Large Language Models Meet Joint Embedding Predictive Architectures* — arXiv:2509.14252 / ICLR 2026.
- Ye et al. — *Latent Action Pretraining from Videos* — arXiv:2410.11758.
- Assran et al. — *V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning* — arXiv:2506.09985.
- Garrido et al. — *Learning Latent Action World Models In The Wild* — arXiv:2601.05230.
- Clark et al. — *Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge* — arXiv:1803.05457.
- Wu, Xiao & Zheng — *DeepCAD: A Deep Generative Network for Computer-Aided Design Models* — arXiv:2105.09492.
- Khan et al. — *Text2CAD: Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts* — arXiv:2409.17106.
- Wang et al. — *Text-to-CAD Generation Through Infusing Visual Feedback in Large Language Models (CADFusion)* — ICML 2025, PMLR 267.
- Guan et al. — *CAD-Coder: Text-to-CAD Generation with Chain-of-Thought and Geometric Reward* — arXiv:2505.19713.
- Govindarajan et al. — *CADmium: Fine-Tuning Code Language Models for Text-Driven Sequential CAD Design* — TMLR 2026.
- Barkley et al. — *CADSmith: Multi-Agent CAD Generation with Programmatic Geometric Validation* — arXiv:2603.26512.
- Wang et al. — *Text2CAD-Bench: A Benchmark for LLM-based Text-to-Parametric CAD Generation* — arXiv:2605.18430.
- Fearnhead & Rigaill — *Changepoint Detection in the Presence of Outliers* — arXiv:1609.07363.
- Dürre & Fried — *Robust change point tests by bounded transformations* — arXiv:1905.06201.
- Sankararaman & Narayanaswamy — *Online Heavy-tailed Change-point Detection* — UAI 2023, PMLR 216.
- Altamirano, Briol & Knoblauch — *Robust and Scalable Bayesian Online Changepoint Detection* — ICML 2023, PMLR 202.
- Tang et al. — *Online change point detection under heavy-tailedness and contamination* — arXiv:2606.09737.
- Duran-Martin et al. — *A unifying framework for generalised Bayesian online learning in non-stationary environments (BONE)* — TMLR 2025.
