# ORIGINALITY_AUDIT

**Audit date:** 2026-08-14  
**Scope:** LAM-JEPA, NeuroCAD, IRIS, and Percy as the current Tier-S set.  
**Standard:** conservative. Similarity to prior work is not reduced merely because this portfolio uses a different project name. This is a literature-and-evidence audit, not a patentability opinion and not proof that no uncited prior work exists.

## Executive verdict

| Project | Conservative contribution class | Current originality verdict |
|---|---|---|
| LAM-JEPA | **Novel empirical observation / reproducibility case study; architecture is primarily a combination of established directions** | The current defensible paper is the frozen negative ARC evaluation, not a claim that latent-action JEPA planning is a new mechanism. |
| NeuroCAD | **Useful engineering contribution + bounded empirical benchmark** | Text-to-parametric CAD, CAD-program generation, and programmatic geometry validation are established. The present value is a tightly scoped typed/validated compiler and falsifiable execution/rejection evidence. A mechanism paper needs a much stronger learned/direct baseline and broader OOD set. |
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
| LAPA — Ye et al., *Latent Action Pretraining from Videos*, arXiv:2410.11758 | Learns discrete latent actions using vector quantization and uses them for action-model pretraining | Different domain and supervision; LAM-JEPA names reasoning operations as latent actions rather than robot/video transitions | **Likely combination/application difference, not a new latent-action principle.** |
| V-JEPA 2 / V-JEPA 2-AC — Assran et al., *Self-Supervised Video Models Enable Understanding, Prediction and Planning*, arXiv:2506.09985 | JEPA representation learning followed by an action-conditioned latent world model used for planning | LAM-JEPA targets educational multiple-choice/reasoning rather than physical control | **Domain difference only unless the reasoning-action mechanism produces independent evidence.** |
| Garrido et al., *Learning Latent Action World Models In The Wild*, arXiv:2601.05230 | Explicit latent-action world models; studies continuous/constrained versus quantized latent actions and planning | LAM-JEPA combines latent actions with an educational reasoning stack | **Weak novelty for the architecture claim.** By 2026 latent-action world models are an established research direction. |
| ARC — Clark et al., *Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge*, arXiv:1803.05457 | Same benchmark family used to test reasoning/question answering | Current work contributes a frozen small-model evaluation protocol, matched control, ablations and retained adverse evidence | **Potentially meaningful as a reproducibility/negative-result case study, not benchmark novelty.** |

## Novelty boundary

- **Established technique:** JEPA-style latent prediction; EMA/target encoders; vector quantization; world models; latent actions; search/planning; verification heads; memory/retrieval; ARC evaluation.
- **Implementation novelty:** one integrated small educational reasoning stack and its exact evidence/reproducibility plumbing.
- **Combination novelty:** plausible but scientifically weak by itself; the architecture combines established families.
- **Mechanism novelty:** **not supported by current evidence.** Planner and target ablations do not pass their frozen contribution criteria.
- **Theoretical novelty:** none established in the frozen ARC package.
- **Empirical novelty:** a reproducible, explicitly retained negative/inconclusive result with capacity matching, mechanism ablations, shuffled-label control, trainability-repair separation, and a locked-test stop rule.

## Conservative classification

**Novel empirical observation / reproducibility case study.** The architecture itself is **likely incremental/combination-based** under the evidence currently available.

## Publication implication

The negative ARC manuscript should avoid “we introduce a novel latent-action JEPA mechanism” language. Its stronger claim is methodological and empirical: this frozen implementation did not survive matched controls, and the artifact chain demonstrates how engineering recovery was kept separate from scientific rescue.

---

# 2. NeuroCAD

## Current question that evidence actually answers

On a frozen, bounded rectangular-plate language family, does a typed/validated compiler improve exact valid execution and invalid-input rejection over the retained direct flat-extraction baseline?

Current evidence: **19/20 versus 12/20 overall; 12/12 valid cases generated non-empty STL**, with one retained negative-width parser failure. This does not establish arbitrary text-to-CAD capability.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| DeepCAD — Wu, Xiao & Zheng, *A Deep Generative Network for Computer-Aided Design Models*, arXiv:2105.09492 | Represents CAD as sequences of parametric operations rather than only meshes/voxels | NeuroCAD is a deterministic bounded natural-language compiler, not a learned unconditional CAD generator | **Distinct engineering formulation, but not enough for general CAD-generation novelty.** |
| Text2CAD — Khan et al., *Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts*, arXiv:2409.17106 | Natural-language to parametric CAD generation with geometric/parametric evaluation | NeuroCAD uses a typed validated intermediary and fails closed for a narrow grammar instead of an end-to-end learned transformer over broad CAD data | **Potential reliability/safety distinction, but current benchmark is far narrower.** |
| CAD-Coder — Guan et al., *Text-to-CAD Generation with Chain-of-Thought and Geometric Reward*, arXiv:2505.19713 | Generates executable parametric CAD programs (CadQuery) from text and uses geometric rewards/validation | NeuroCAD is grammar/IR/compiler driven; it does not train an LLM and can explicitly reject unsupported inputs | **Useful systems contrast; not evidence of a superior scientific mechanism until compared directly.** |
| CADSmith — Barkley et al., *Multi-Agent CAD Generation with Programmatic Geometric Validation*, arXiv:2603.26512 | Uses programmatic geometric validation and execution-aware correction for text-to-CAD | NeuroCAD validates a typed deterministic representation before generating OpenSCAD and does not rely on iterative LLM repair | **Programmatic validation itself is not novel. Typed fail-closed compilation may be useful if it wins reliability/coverage tradeoffs under matched prompts.** |
| Text2CAD-Bench — Wang et al., *A Benchmark for LLM-based Text-to-Parametric CAD Generation*, arXiv:2605.18430 | Evaluates text-to-CAD across geometric complexity and prompt styles | NeuroCAD's frozen v1 benchmark is only 20 held-out linguistic-template cases in one plate family | **Current benchmark breadth is insufficient for a general research claim.** |

## Novelty boundary

- **Established technique:** text-to-CAD; sequential/parametric CAD representations; executable CAD code generation; geometric validation; program repair/constraint checking.
- **Implementation novelty:** bounded grammar → typed parametric specification → validation → SVG/OpenSCAD/STL pipeline with explicit unsupported-input rejection.
- **Combination novelty:** plausible as a reliability-first compiler formulation.
- **Mechanism novelty:** not established. Current gain may be due simply to hand-coded grammar/validation on a narrow family.
- **Theoretical novelty:** none established.
- **Empirical novelty:** a frozen valid-versus-invalid rejection test with an intentionally retained parser failure and real kernel execution.

## Conservative classification

**Useful engineering contribution + bounded empirical benchmark.** It is **not yet a strong general text-to-CAD research contribution.**

## Promotion criterion

A paper claim becomes interesting only if the typed/validated route is compared against a dangerous model-based direct/program-generation baseline under the **same prompts, backend, execution/semantic criteria and compute/provider budget**, and if the evaluation expands beyond one part family. The decisive question is reliability/coverage tradeoff, not whether a hand-written grammar can beat a weak extractor on its own grammar.

---

# 3. IRIS

## Current question that evidence actually answers

Can a robust adaptive state/memory estimator distinguish **persistent state change** from **isolated heavy-tailed corruption** well enough to improve transition recovery without unacceptable false openings or clean/heavy-tail regression?

The current v0.2/successor evidence does not pass its promotion gate. A robust CUSUM-style switch recovers abrupt changes faster but false-opens aggressively under Student-t, contamination and spike conditions; simple confirmed-change Huber improves regime tracking without universally winning. This makes the tradeoff itself the defensible scientific object.

## Related-direction map

| Related direction | Similarity | Difference in current project | Is the difference scientifically meaningful now? |
|---|---|---|---|
| Fearnhead & Rigaill, *Changepoint Detection in the Presence of Outliers*, arXiv:1609.07363 | Explicitly addresses changepoint detection when outliers/heavy tails create spurious changes; uses robust bounded losses | IRIS is framed as online adaptive memory/state estimation and tracks estimation quality/recovery, not only segmentation | **Problem overlap is substantial. Estimation/tracking may be a distinct evaluation target, but generic robust-change novelty is not available.** |
| Dürre & Fried, *Robust change point tests by bounded transformations*, arXiv:1905.06201 | Robustifies CUSUM-style changepoint testing for heavy-tailed/corrupted data | IRIS couples robustness, persistent adaptation, memory state and false-open diagnostics | **Again, robust change detection is established; the burden is on an estimator-level tradeoff/mechanism.** |
| Tang et al., *Online change point detection under heavy-tailedness and contamination*, arXiv:2606.09737 | Directly studies online mean-change detection under Huber contamination and heavy-tailed inliers, including detection-delay guarantees | IRIS evaluates state-estimation/recovery and gate behavior in a synthetic filtering harness, with learned/current mechanisms and false-open diagnostics | **Very high relevance and a serious novelty threat. A successor must compare against or clearly distinguish itself from this current robust-online-detection literature.** |
| Standard Huber/static robust filtering and confirmed-change switching | Robust local estimation and explicit change adaptation | IRIS seeks one mechanism that remains robust to isolated corruption while adapting to persistent shifts | **This tradeoff is scientifically meaningful, but the current mechanism has not solved it.** |

## Novelty boundary

- **Established technique:** Huber/robust estimation; CUSUM/changepoint switching; robust change detection under outliers/heavy tails; dual-timescale adaptation; recurrent state estimation.
- **Implementation novelty:** the exact HTAM/PABIM/PGR development harness and frozen false-open/recovery/transition metrics.
- **Combination novelty:** possible, but not enough to claim a new robust-memory mechanism.
- **Mechanism novelty:** **unsupported for the current family.** The stronger baselines show that adaptation can be bought by opening the gate more often, while current learned/scalar transfer is mixed/negative.
- **Theoretical novelty:** none established; current 2026 literature already contains theory for online change detection under contamination/heavy tails.
- **Empirical novelty:** a useful failure taxonomy connecting transition recovery, false openings and robust-state error across corruption versus persistent-shift regimes.

## Conservative classification

**Novel empirical failure/tradeoff observation at best; likely incremental mechanism family.**

## Successor implication

Do **not** authorize a new named memory architecture merely to preserve IRIS as a flagship. The next scientific gate should first answer whether a simple robust detector + robust estimator can trace a better false-open/recovery/error Pareto frontier. Only if a residual failure remains should a learned successor mechanism be frozen. Any successor must explicitly cite and distinguish current robust-online-change literature, especially heavy-tail/contamination work.

---

# 4. Percy

Percy is currently Tier S because it is enabling infrastructure, not because a scientific novelty claim is established. Evidence-native task/claim/experiment graphs, artifact hashes, lease recovery, provider routing and reproducibility bundles are individually familiar systems ideas. A research contribution would require a precise systems question and comparative evidence, for example:

> Under matched task graphs and provider budgets, does evidence-native orchestration reduce lost work, duplicate execution, unverifiable completion or recovery time after faults relative to a competent workflow/agent-orchestration baseline?

Until real-host qualification and matched-system comparison exist, classify Percy as **useful engineering contribution / product infrastructure**, not a novel agent-systems paper.

---

# Portfolio originality consequences

1. **LAM-JEPA remains the first paper conversion**, but as a falsification/reproducibility paper, not an architecture-superiority paper.
2. **NeuroCAD remains the strongest positive bounded result**, but its dangerous baseline is now more demanding: contemporary text-to-CAD/CAD-program systems and programmatic validators make the current flat-extraction comparator insufficient for a broad paper claim.
3. **IRIS should not consume successor compute yet.** The robust-change problem is established and has very recent theory; the next gate is a sharper matched Pareto comparison, not another architecture name.
4. **Percy research publication is deferred** until live reliability evidence and a comparative systems protocol exist.
5. Originality claims must remain narrower than implementation ambition. A new combination, domain or name is not a new scientific mechanism.

## Verified primary literature used in this audit

- Assran et al. — *Self-Supervised Learning from Images with a Joint-Embedding Predictive Architecture* — arXiv:2301.08243.
- Ye et al. — *Latent Action Pretraining from Videos* — arXiv:2410.11758.
- Assran et al. — *V-JEPA 2: Self-Supervised Video Models Enable Understanding, Prediction and Planning* — arXiv:2506.09985.
- Garrido et al. — *Learning Latent Action World Models In The Wild* — arXiv:2601.05230.
- Clark et al. — *Think you have Solved Question Answering? Try ARC, the AI2 Reasoning Challenge* — arXiv:1803.05457.
- Wu, Xiao & Zheng — *DeepCAD: A Deep Generative Network for Computer-Aided Design Models* — arXiv:2105.09492.
- Khan et al. — *Text2CAD: Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts* — arXiv:2409.17106.
- Guan et al. — *CAD-Coder: Text-to-CAD Generation with Chain-of-Thought and Geometric Reward* — arXiv:2505.19713.
- Barkley et al. — *CADSmith: Multi-Agent CAD Generation with Programmatic Geometric Validation* — arXiv:2603.26512.
- Wang et al. — *Text2CAD-Bench: A Benchmark for LLM-based Text-to-Parametric CAD Generation* — arXiv:2605.18430.
- Fearnhead & Rigaill — *Changepoint Detection in the Presence of Outliers* — arXiv:1609.07363.
- Dürre & Fried — *Robust change point tests by bounded transformations* — arXiv:1905.06201.
- Tang et al. — *Online change point detection under heavy-tailedness and contamination* — arXiv:2606.09737.
