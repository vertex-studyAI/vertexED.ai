# ORIGINALITY_AUDIT

**Audit date:** 2026-08-14  
**Scope:** LAM-JEPA, NeuroCAD, IRIS, and Percy as the scientific priority set audited during this wave. NeuroCAD was subsequently demoted from Tier S to Tier A after its frozen validation-confound ablation falsified the typed-IR/parser-specific explanation on the bounded benchmark.  
**Standard:** conservative. Similarity to prior work is not reduced merely because this portfolio uses a different project name. This is a literature-and-evidence audit, not a patentability opinion and not proof that no uncited prior work exists.

## Executive verdict

| Project | Conservative contribution class | Current originality verdict |
|---|---|---|
| LAM-JEPA | **Novel empirical observation / reproducibility case study; architecture is primarily a combination of established directions** | The current defensible paper is the frozen negative ARC evaluation, not a claim that latent-action JEPA planning or JEPA-for-language is a new mechanism. |
| NeuroCAD | **Useful engineering contribution + negative causal diagnostic; broad research novelty not established** | Text-to-parametric CAD, CAD-program generation, structured CAD sequences, and programmatic geometry validation are established. The frozen component ablation now shows matched validation alone closes the entire current 20-case gap, so the typed-IR/parser-specific causal claim is falsified on this diagnostic. Only a broader reliability/coverage question versus contemporary learned/constrained generation remains scientifically open. |
| IRIS | **Novel empirical failure/tradeoff observation at best; current mechanism family not established as novel** | Robust changepoint handling under outliers/heavy tails is established, including current 2026 work. The useful research question is the false-open versus persistent-change adaptation tradeoff under a matched state-estimation harness, not generic “robust memory.” |
| Percy | **Potential useful systems engineering contribution; research novelty deferred** | Evidence-native orchestration may be practically valuable, but scientific novelty cannot be claimed before real-host crash/recovery/provider/lease/soak evidence and a comparison against established workflow/agent orchestration systems. |

---

# 1. LAM-JEPA

## Current question that evidence actually answers

Under the frozen ARC-Challenge validation protocol, does the tested LAM-JEPA configuration beat a gradient-active-parameter-matched supervised model, and do the planner and target pathways contribute under the preregistered criteria?

Current answer: **no support for superiority or those mechanism claims.** The manuscript therefore has a negative/falsification-first contribution boundary.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| I-JEPA — Assran et al., *Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture*, arXiv:2301.08243 | Predict target representations in latent space rather than reconstructing raw observations; target/context encoder pattern | LAM-JEPA applies latent prediction to a small educational/reasoning configuration with additional planner, discrete action, memory and verification components | **Not yet as mechanism novelty.** The ARC evidence does not show planner/target benefit. |
| LLM-JEPA — Huang, LeCun & Balestriero, *Large Language Models Meet Joint Embedding Predictive Architectures*, arXiv:2509.14252 / ICLR 2026 | JEPA objectives are applied directly to language-model pretraining/fine-tuning and evaluated across multiple language/reasoning datasets | LAM-JEPA is a different small ARC configuration with planner/target/quantization controls and a negative result | **Critical novelty boundary.** LAM-JEPA cannot claim that JEPA-for-language itself is new. Its distinction is the bounded configuration and falsification/reproducibility evidence. |
| LAPA — Ye et al., *Latent Action Pretraining from Videos*, arXiv:2410.11758 | Learns discrete latent actions using vector quantization and uses them for action-model pretraining | Different domain and supervision; LAM-JEPA names reasoning operations as latent actions rather than robot/video transitions | **Likely combination/application difference, not a new latent-action principle.** |
| V-JEPA 2 / V-JEPA 2-AC — Assran et al., *Self-Supervised Video Models Enable Understanding, Prediction and Planning*, arXiv:2506.09985 | JEPA representation learning followed by an action-conditioned latent world model used for planning | LAM-JEPA targets educational multiple-choice/reasoning rather than physical control | **Domain difference only unless the reasoning-action mechanism produces independent evidence.** |
| Garrido et al., *Learning Latent Action World Models In The Wild*, arXiv:2601.05230 | Explicit latent-action world models; studies continuous/constrained versus quantized latent actions and planning | LAM-JEPA combines latent actions with an educational reasoning stack | **Weak novelty for the architecture claim.** By 2026 latent-action world models are an established research direction. |
| ARC — Clark et al., *Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge*, arXiv:1803.05457 | Same benchmark family used to test reasoning/question answering | Current work contributes a frozen small-model evaluation protocol, matched control, ablations and retained adverse evidence | **Potentially meaningful as a reproducibility/negative-result case study, not benchmark novelty.** |

## Novelty boundary

- **Established technique:** JEPA-style latent prediction; EMA/target encoders; JEPA objectives in language; vector quantization; world models; latent actions; search/planning; verification heads; memory/retrieval; ARC evaluation.
- **Implementation novelty:** one integrated small educational reasoning stack and its exact evidence/reproducibility plumbing; exact module-level novelty remains unresolved until the manuscript maps the implementation directly from source.
- **Combination novelty:** plausible but scientifically weak by itself; the architecture combines established families.
- **Mechanism novelty:** **not supported by current evidence.** Planner and target ablations do not pass their frozen contribution criteria.
- **Theoretical novelty:** none established in the frozen ARC package.
- **Empirical novelty:** a reproducible, explicitly retained negative/inconclusive result with capacity matching, mechanism ablations, shuffled-label control, trainability-repair separation, and a locked-test stop rule.

## Conservative classification

**Novel empirical observation / reproducibility case study.** The architecture itself is **likely incremental/combination-based** under the evidence currently available.

## Publication implication

The negative ARC manuscript should avoid “we introduce a novel latent-action JEPA mechanism” and “first JEPA for language/reasoning” language. Its stronger claim is methodological and empirical: this frozen implementation did not survive matched controls, and the artifact chain demonstrates how engineering recovery was kept separate from scientific rescue.

---

# 2. NeuroCAD

## What the evidence now answers

Frozen v1 showed `19/20` for the typed/validated route versus `12/20` for the original direct flat extractor, with `12/12` valid cases producing non-empty STL and one retained negative-width failure. That established a **bounded software/reliability gap**, not a typed-IR mechanism.

A second protocol was then frozen **before first execution** specifically to test the validation confound. On the same reused 20-case plate set:

- current typed+validated implementation: `20/20`;
- original direct flat extraction: `12/20`;
- direct extraction + matched fail-closed validation: `20/20`;
- original gap: `0.4`;
- remaining gap after matched validation: `0`;
- validation recovery fraction: `1.0`;
- frozen interpretation: `VALIDATION_DOMINANT`.

Therefore the claim that the current bounded advantage specifically demonstrates a **typed-IR/parser mechanism is falsified on this diagnostic**. This is not a failure of the software product; it is a successful causal attack on the research story.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| DeepCAD — Wu, Xiao & Zheng, *A Deep Generative Network for Computer-Aided Design Models*, arXiv:2105.09492 | Represents CAD as sequences of parametric operations rather than only meshes/voxels | NeuroCAD is a deterministic bounded natural-language compiler, not a learned unconditional CAD generator | **Distinct engineering formulation, but not general CAD-generation novelty.** |
| Text2CAD — Khan et al., *Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts*, arXiv:2409.17106 | Natural-language to parametric CAD generation with geometric/parametric evaluation | NeuroCAD uses a bounded compiler/validator rather than a learned transformer over broad CAD data | **Potential reliability/safety distinction, but benchmark breadth remains far narrower.** |
| CADFusion — Wang et al., *Text-to-CAD Generation Through Infusing Visual Feedback in Large Language Models*, ICML 2025, PMLR 267 | Text-conditioned parametric-sequence generation with rendered visual feedback | NeuroCAD is deterministic/fail-closed rather than learned with visual feedback | **Generation plus geometry feedback is established; validation itself is not a novel mechanism.** |
| CAD-Coder — Guan et al., *Text-to-CAD Generation with Chain-of-Thought and Geometric Reward*, arXiv:2505.19713 | Generates executable parametric CAD programs from text and uses geometric rewards/validation | NeuroCAD is grammar/compiler driven and can reject unsupported inputs | **Useful systems contrast, not evidence of a superior mechanism.** |
| CADmium — Govindarajan et al., *Fine-Tuning Code Language Models for Text-Driven Sequential CAD Design*, TMLR 2026 | Code-LLMs generate sequential CAD JSON from text at much larger scale with geometric/topological metrics | NeuroCAD is a tiny deterministic compiler benchmark | **Makes scale/generality novelty unavailable; only reliability/coverage may remain distinctive.** |
| CADSmith — Barkley et al., *Multi-Agent CAD Generation with Programmatic Geometric Validation*, arXiv:2603.26512 | Uses programmatic geometric validation and execution-aware correction | NeuroCAD validates before generation without iterative LLM repair | **Programmatic validation is established.** |
| Text2CAD-Bench — Wang et al., *A Benchmark for LLM-based Text-to-Parametric CAD Generation*, arXiv:2605.18430 | Evaluates prompt styles and geometric complexity | NeuroCAD v1/v2 use only a 20-case plate-family diagnostic | **Current breadth is insufficient for a broad research claim.** |

## Novelty boundary after falsification

- **Established technique:** text-to-CAD; sequential/parametric CAD representations; executable CAD code generation; geometric validation; program repair/constraint checking.
- **Implementation novelty:** bounded grammar → parametric specification → fail-closed validation → SVG/OpenSCAD/STL pipeline may remain useful engineering.
- **Combination novelty:** weak as a scientific claim because validation fully explains the current benchmark gap against the original extractor.
- **Mechanism novelty:** **falsified for the typed-IR/parser-specific claim on the current diagnostic.**
- **Theoretical novelty:** none established.
- **Empirical novelty:** the strongest current research contribution is now a **negative causal diagnostic** showing that a simpler matched-validation control fully explains the observed bounded gap.

## Conservative classification

**Useful engineering contribution + informative negative causal ablation.**  
Current broad text-to-CAD research novelty: **not established**.

## Residual promotion criterion

NeuroCAD remains `C — CONTINUE EXPERIMENTATION` only because a distinct question remains important:

> Under the same prompts/backend/provider/compute budget, does a reliability-first compiler/validator achieve a better executable-correctness / semantic-correctness / fail-closed coverage frontier than contemporary learned direct/program generation or constrained generation on genuinely broader OOD geometry?

This must be a separately frozen experiment. If that residual reliability/coverage advantage disappears, stop the research line and retain the system as engineering/product work rather than naming another mechanism.

---

# 3. IRIS

## Current question that evidence actually answers

Can a robust adaptive state/memory estimator distinguish **persistent state change** from **isolated heavy-tailed corruption** well enough to improve transition recovery without unacceptable false openings or clean/heavy-tail regression?

The current v0.2/successor evidence does not pass its promotion gate. A robust CUSUM-style switch recovers abrupt changes faster but false-opens aggressively under Student-t, contamination and spike conditions; simple confirmed-change Huber improves regime tracking without universally winning. This makes the tradeoff itself the defensible scientific object.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| Fearnhead & Rigaill, *Changepoint Detection in the Presence of Outliers*, arXiv:1609.07363 | Explicitly addresses changepoint detection when outliers/heavy tails create spurious changes; uses robust bounded losses | IRIS is framed as online adaptive memory/state estimation and tracks estimation quality/recovery, not only segmentation | **Problem overlap is substantial. Estimation/tracking may be a distinct evaluation target, but generic robust-change novelty is not available.** |
| Dürre & Fried, *Robust change point tests by bounded transformations*, arXiv:1905.06201 | Robustifies CUSUM-style changepoint testing for heavy-tailed/corrupted data | IRIS couples robustness, persistent adaptation, memory state and false-open diagnostics | **Robust change detection is established; burden is on an estimator-level tradeoff/mechanism.** |
| Sankararaman & Narayanaswamy, *Online Heavy-tailed Change-point Detection*, UAI 2023, PMLR 216 | Online detection under heavy-tailed observations with explicit false-positive guarantees | IRIS emphasizes estimation/recovery as well as detection-like gating | **Raises the baseline bar; false-open control is already a formal object in the literature.** |
| Altamirano, Briol & Knoblauch, *Robust and Scalable Bayesian Online Changepoint Detection*, ICML 2023, PMLR 202 | Robust scalable online changepoint inference | Different inference machinery; IRIS is a specific robust-memory/state-estimation line | **Direct robust-online-change novelty is unavailable without a more specific residual question.** |
| Tang et al., *Online change point detection under heavy-tailedness and contamination*, arXiv:2606.09737 | Directly studies online mean-change detection under Huber contamination and heavy-tailed inliers, including detection-delay guarantees | IRIS evaluates state-estimation/recovery and gate behavior in a synthetic filtering harness | **Very high relevance and a serious novelty threat.** |
| Duran-Martin et al., *A unifying framework for generalised Bayesian online learning in non-stationary environments (BONE)*, TMLR 2025 | General non-stationary online learning with an auxiliary changepoint process and adaptation | IRIS asks for a particular robust estimator/memory tradeoff | **Detect-and-adapt is established; residual novelty would need to be estimator-level and empirically isolated.** |

## Novelty boundary

- **Established technique:** Huber/robust estimation; CUSUM/changepoint switching; robust change detection under outliers/heavy tails; dual-timescale adaptation; recurrent state estimation; general change-aware online learning.
- **Implementation novelty:** the exact HTAM/PABIM/PGR development harness and frozen false-open/recovery/transition metrics.
- **Combination novelty:** possible, but not enough to claim a new robust-memory mechanism.
- **Mechanism novelty:** **unsupported for the current family.** Stronger baselines show that adaptation can be bought by opening the gate more often.
- **Theoretical novelty:** none established; current literature already contains robust online-change theory under heavy-tail/contamination.
- **Empirical novelty:** a useful failure taxonomy connecting transition recovery, false openings and robust-state error across corruption versus persistent-shift regimes.

## Conservative classification

**Novel empirical failure/tradeoff observation at best; likely incremental mechanism family.**

## Successor implication

Do **not** authorize a new named memory architecture merely to preserve IRIS as a flagship. The next scientific gate should first answer whether a simple robust detector + robust estimator can trace a better false-open/recovery/error Pareto frontier. Only if a residual failure remains should a learned successor mechanism be frozen.

---

# 4. Percy

Percy is currently Tier S because it is enabling infrastructure, not because a scientific novelty claim is established. Evidence-native task/claim/experiment graphs, artifact hashes, lease recovery, provider routing and reproducibility bundles are individually familiar systems ideas. A research contribution would require a precise systems question and comparative evidence, for example:

> Under matched task graphs and provider budgets, does evidence-native orchestration reduce lost work, duplicate execution, unverifiable completion or recovery time after faults relative to a competent workflow/agent-orchestration baseline?

Until real-host qualification and matched-system comparison exist, classify Percy as **useful engineering contribution / product infrastructure**, not a novel agent-systems paper.

---

# Reviewer attack — updated after decisive NeuroCAD ablation

## Reviewer 1 — scientific skeptic

| Project | Strongest criticism | Severity | Evidence required | Cheapest decisive action | Acceptance threat? |
|---|---|---:|---|---|---|
| LAM-JEPA | JEPA-for-language and latent-action/world-model ideas already exist; architecture is not shown to contribute | High for method paper | exact source-level method map; LLM-JEPA/latent-action comparison; narrow negative-result claim | finish related work + implementation map; **no rescue run** | **Yes** unless framed as falsification/reproducibility |
| NeuroCAD | text-to-CAD/program generation/validation are established; current bounded mechanism was already defeated by matched validation | **Critical for mechanism paper** | only a broader learned/constrained reliability/coverage comparison can justify continued research | freeze one broader OOD/provider-matched protocol; stop if no residual advantage | **Yes — current typed-IR mechanism paper is dead** |
| IRIS | robust heavy-tail change detection/adaptation is established; current mechanism may be renamed known ingredients | High | baseline frontier against robust change-aware estimators at matched false-open budget | run frozen development-only frontier before any successor | **Yes** |

## Reviewer 2 — experimental skeptic

| Project | Strongest criticism | Severity | Evidence required | Cheapest decisive action | Acceptance threat? |
|---|---|---:|---|---|---|
| LAM-JEPA | one benchmark and five seeds are too narrow for a broad conclusion | Moderate | full provenance, uncertainty, exact environment/hardware, carefully bounded conclusion | independent table/figure recomputation from retained artifacts | Only if claims broaden |
| NeuroCAD | 20 reused plate cases cannot support broad text-to-CAD conclusions | Critical | larger frozen OOD/compositional set, new geometry families, semantic/execution metrics, independent replay | pre-freeze broader benchmark and run once | **Yes, critical** |
| IRIS | synthetic/development-heavy evidence and successor selection can overfit development | High | external temporal data, frozen metric hierarchy, untouched confirmatory block, matched compute/statistics | first determine whether simple baseline frontier kills the direction | **Yes** for positive paper |

## Reviewer 3 — mechanism skeptic

| Project | Strongest criticism | Severity | Evidence required | Cheapest decisive action | Acceptance threat? |
|---|---|---:|---|---|---|
| LAM-JEPA | planner/target may be inactive or confounded by quantization/trainability rather than conceptually useless | Moderate | source-level gradient/module audit; implementation-specific limitation | audit graph/gradients; keep negative claim local | Low for bounded negative claim |
| NeuroCAD | the gain may come solely from fail-closed validation rather than typed IR | **Resolved against the mechanism** | frozen v2 already supplied the decisive control | **Done:** direct+matched validation fully closed the gap (`recovery=1.0`, `remaining_gap=0`) | **Current typed-IR causal claim rejected** |
| IRIS | faster recovery may simply reflect a more permissive gate/false-open rate | Critical | matched false-open constraint or preregistered recovery-vs-false-open Pareto analysis | threshold-matched robust detector + estimator on current dev conditions | **Yes, critical** |

Reviewer results determine experiments. They are not rhetorical exercises. When a cheapest decisive experiment defeats the contribution, the portfolio must downgrade the claim and priority rather than expand the experiment suite to search for a favorable narrative.

---

# Portfolio originality consequences

1. **LAM-JEPA remains the first paper conversion**, as a falsification/reproducibility paper rather than an architecture-superiority paper.
2. **NeuroCAD is demoted from Tier S to Tier A.** The typed-IR/parser-specific mechanism claim is falsified on the bounded validation-confound diagnostic. One separately frozen learned/constrained + broader-OOD reliability/coverage test remains eligible; failure should end the research line while preserving software utility.
3. **IRIS should not consume successor-architecture compute.** The next gate is a matched robust baseline frontier, not another architecture name.
4. **Percy research publication is deferred** until live reliability evidence and a comparative systems protocol exist.
5. Originality claims must remain narrower than implementation ambition. A new combination, domain or name is not a new scientific mechanism.

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
- Govindarajan et al. — *CADmium: Fine-Tuning Code Language Models for Text-Driven Sequential CAD Design* — TMLR 2026, OpenReview `lExqWvQht8`.
- Barkley et al. — *CADSmith: Multi-Agent CAD Generation with Programmatic Geometric Validation* — arXiv:2603.26512.
- Wang et al. — *Text2CAD-Bench: A Benchmark for LLM-based Text-to-Parametric CAD Generation* — arXiv:2605.18430.
- Fearnhead & Rigaill — *Changepoint Detection in the Presence of Outliers* — arXiv:1609.07363.
- Dürre & Fried — *Robust change point tests by bounded transformations* — arXiv:1905.06201.
- Sankararaman & Narayanaswamy — *Online Heavy-tailed Change-point Detection* — UAI 2023, PMLR 216.
- Altamirano, Briol & Knoblauch — *Robust and Scalable Bayesian Online Changepoint Detection* — ICML 2023, PMLR 202.
- Tang et al. — *Online change point detection under heavy-tailedness and contamination* — arXiv:2606.09737.
- Duran-Martin et al. — *A unifying framework for generalised Bayesian online learning in non-stationary environments (BONE)* — TMLR 2025, OpenReview `osesw2V10u`.
