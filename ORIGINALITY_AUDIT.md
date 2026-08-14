# ORIGINALITY_AUDIT

**Audit date:** 2026-08-14  
**Scope:** LAM-JEPA, IRIS v0.2, NeuroCAD and Percy. NeuroCAD is no longer Tier S after its decisive validation-confound ablation.  
**Standard:** conservative. A different name, domain or combination is not a new scientific mechanism. This is a literature/evidence audit, not proof that no uncited prior work exists.

## Executive verdict

| Project | Conservative contribution class | Current originality verdict |
|---|---|---|
| LAM-JEPA | **Novel empirical observation / reproducibility case study; method ingredients substantially established** | The defensible contribution is the frozen negative ARC evaluation and evidence discipline, not “first JEPA for language/reasoning” or a demonstrated new planner/target mechanism. |
| IRIS v0.2 | **Useful negative/tradeoff observation at best; mechanism novelty not established** | Robust online change handling under outliers/heavy tails is established. The residual scientific object is the false-open/recovery/post-change-error frontier, not generic “robust memory.” |
| NeuroCAD | **Useful engineering contribution + informative negative causal ablation** | Text-to-parametric CAD, executable CAD-program generation and geometric validation are established; matched validation closes the entire current bounded gap, so typed-IR/parser-specific causal novelty is unsupported on this diagnostic. |
| Percy | **Potential useful systems engineering contribution; research novelty deferred** | Evidence-native orchestration may be valuable, but scientific novelty requires real-host reliability measurements and matched orchestration/workflow comparisons. |

---

# 1. LAM-JEPA

## Closest directions

| Related direction | Similarity | Current boundary |
|---|---|---|
| I-JEPA — Assran et al., arXiv:2301.08243 | latent target prediction / joint-embedding predictive learning | JEPA mechanics are established; no novelty from the objective name alone. |
| LLM-JEPA — Huang, LeCun & Balestriero, arXiv:2509.14252 / ICLR 2026 | applies JEPA objectives directly to language-model pretraining/fine-tuning and language/reasoning evaluation | **JEPA-for-language itself is established.** LAM's remaining value is configuration-specific falsification/reproducibility. |
| LAPA — Ye et al., arXiv:2410.11758 | vector-quantized/discrete latent actions | domain/application difference does not establish a new latent-action principle. |
| V-JEPA 2 / V-JEPA 2-AC — Assran et al., arXiv:2506.09985 | JEPA representation + action-conditioned latent world model/planning | planning in latent JEPA-style state is established in another domain. |
| Garrido et al., *Learning Latent Action World Models In The Wild*, arXiv:2601.05230 | latent-action world-model family including quantized actions/planning | further narrows architecture novelty. |
| ARC — Clark et al., arXiv:1803.05457 | same benchmark family | current novelty, if any, is the controlled negative/reproducibility case study rather than benchmark choice. |

## Novelty boundary
- **Established:** JEPA latent prediction; target encoders; JEPA in language; latent actions; quantization; world models; planning; verification; memory/retrieval; ARC evaluation.
- **Implementation novelty:** exact integrated stack/evidence plumbing may be locally distinctive; exact source mapping is required for any implementation-level statement.
- **Combination novelty:** plausible but scientifically weak by itself.
- **Mechanism novelty:** **unsupported.** Planner/target contribution gates fail.
- **Theoretical novelty:** none established.
- **Empirical novelty:** a reproducible negative/inconclusive configuration study with matched controls, ablations, adverse-result retention and a locked-test stop rule.

### Classification
**Novel empirical observation / reproducibility contribution; likely incremental/combination architecture.**

---

# 2. IRIS v0.2

## Closest directions

| Related direction | Similarity | Current boundary |
|---|---|---|
| Fearnhead & Rigaill, *Changepoint Detection in the Presence of Outliers*, arXiv:1609.07363 | outlier-robust changepoint detection | robust-change problem is established. |
| Dürre & Fried, *Robust change point tests by bounded transformations*, arXiv:1905.06201 | robust CUSUM/change testing under heavy tails/corruption | robust gating is established. |
| Sankararaman & Narayanaswamy, *Online Heavy-tailed Change-point Detection*, UAI 2023 | online heavy-tailed detection with false-positive control | false-open control is already a formal object. |
| Altamirano, Briol & Knoblauch, *Robust and Scalable Bayesian Online Changepoint Detection*, ICML 2023 | robust online changepoint inference | robust online change inference is established. |
| Duran-Martin et al., BONE, TMLR 2025 | general non-stationary online learning with change processes | detect-and-adapt is established. |
| Tang et al., *Online change point detection under heavy-tailedness and contamination*, arXiv:2606.09737 | directly treats heavy-tailed inliers plus Huber contamination online | very close current prior art; strong novelty threat to generic IRIS framing. |

## Novelty boundary
- **Established:** Huber/robust estimation; CUSUM/change gating; robust online change detection; dual-timescale/change-aware adaptation.
- **Implementation novelty:** exact IRIS development harness, metrics and retained failure taxonomy.
- **Combination novelty:** not enough for a new mechanism claim.
- **Mechanism novelty:** **unsupported** for v0.2/current failed successor.
- **Theoretical novelty:** none established.
- **Empirical novelty:** a bounded failure/tradeoff map showing that faster persistent-change recovery can be purchased by unacceptable false opens under isolated corruption.

### Classification
**Potentially useful negative/tradeoff empirical observation; likely incremental mechanism family.**

No new successor architecture is authorized before the separately frozen simple-baseline frontier can be reproduced from exact source/raw data.

---

# 3. NeuroCAD

## Evidence boundary after the component falsifier

Frozen v1 remains historical evidence (`19/20` typed/validated vs `12/20` original direct; `12/12` valid STL). The later frozen component diagnostic produced:
- current typed+validated `20/20`;
- original direct `12/20`;
- direct + matched fail-closed validation `20/20`;
- validation recovery fraction `1.00`;
- remaining gap `0`;
- interpretation `VALIDATION_DOMINANT`.

Therefore the current bounded result does **not** isolate typed-IR/parser structure as the cause.

## Closest directions

| Related direction | Similarity | Current boundary |
|---|---|---|
| DeepCAD — Wu, Xiao & Zheng, arXiv:2105.09492 | sequential/parametric CAD representation | structured CAD is established. |
| Text2CAD — Khan et al., arXiv:2409.17106 | natural-language → parametric CAD | broad text-to-parametric-CAD is established. |
| CADFusion — Wang et al., ICML 2025 | text-to-CAD with geometry/render feedback | execution/geometry-aware generation is established. |
| CAD-Coder — Guan et al., arXiv:2505.19713 | executable CAD programs with geometric reward/validation | executable program generation/validation are established. |
| CADmium — Govindarajan et al., TMLR 2026 | large-scale text-driven sequential CAD with geometric/topological evaluation | makes scale/generality claims unavailable to the current small compiler diagnostic. |
| CADSmith — Barkley et al., arXiv:2603.26512 | programmatic geometric validation and execution-aware correction | programmatic validation itself is established. |
| Text2CAD-Bench — Wang et al., arXiv:2605.18430 | broader prompt/geometry benchmark | current 20-case plate family is insufficient for generality. |

## Novelty boundary
- **Established:** text-to-CAD; structured CAD; executable CAD programs; geometric validation; repair/constraint checking.
- **Implementation novelty:** bounded fail-closed compiler/validator may remain useful engineering.
- **Combination novelty:** weak scientific claim because matched validation fully explains the current gap.
- **Mechanism novelty:** **falsified for typed-IR/parser-specific causality on the current diagnostic.**
- **Theoretical novelty:** none established.
- **Empirical novelty:** the negative causal ablation itself is informative.

### Classification
**Useful engineering contribution + informative negative causal ablation. Current project should be productized, not sold as a typed-IR research breakthrough.**

Any future broader learned/constrained OOD research question must be separately versioned/frozen and earn its own evidence/state.

---

# 4. Percy

Percy is Tier S as enabling infrastructure, not because scientific novelty is established. Durable queues, leases, artifact hashes, dependency graphs, provider routing, deduplication and reproducibility bundles are individually standard systems ideas.

A legitimate research question would require matched comparative evidence such as:

> Under matched task graphs and provider budgets, does evidence-native orchestration reduce lost work, duplicate execution, unverifiable completion or recovery time after faults relative to a competent orchestration/workflow baseline?

Until `PERCY-STATE-001` and real-host fault/throughput qualification succeed, classify Percy as **useful engineering/product infrastructure**, not a novel agent-systems paper.

---

# Portfolio consequences

1. **LAM-JEPA:** first paper conversion, but strictly as falsification/reproducibility.
2. **IRIS v0.2:** negative/tradeoff closure; no architecture rescue.
3. **NeuroCAD:** current project is productization; typed-IR/parser mechanism is closed negative on the bounded diagnostic.
4. **Percy:** reliability/productization before research publication.
5. Generic **JEPA for time series is not a novelty premise**; the retained programme is a separate focused hidden-state-recovery question against strong matched objectives.

## Primary literature retained in this audit

- Assran et al. — I-JEPA — arXiv:2301.08243.
- Huang, LeCun & Balestriero — LLM-JEPA — arXiv:2509.14252 / ICLR 2026.
- Ye et al. — LAPA — arXiv:2410.11758.
- Assran et al. — V-JEPA 2 — arXiv:2506.09985.
- Garrido et al. — latent-action world models — arXiv:2601.05230.
- Clark et al. — ARC — arXiv:1803.05457.
- Wu, Xiao & Zheng — DeepCAD — arXiv:2105.09492.
- Khan et al. — Text2CAD — arXiv:2409.17106.
- Wang et al. — CADFusion — ICML 2025.
- Guan et al. — CAD-Coder — arXiv:2505.19713.
- Govindarajan et al. — CADmium — TMLR 2026.
- Barkley et al. — CADSmith — arXiv:2603.26512.
- Wang et al. — Text2CAD-Bench — arXiv:2605.18430.
- Fearnhead & Rigaill — robust changepoints with outliers — arXiv:1609.07363.
- Dürre & Fried — robust bounded-transformation changepoint tests — arXiv:1905.06201.
- Sankararaman & Narayanaswamy — online heavy-tailed changepoints — UAI 2023.
- Altamirano, Briol & Knoblauch — robust Bayesian online changepoint detection — ICML 2023.
- Duran-Martin et al. — BONE — TMLR 2025.
- Tang et al. — heavy-tailed/contaminated online changepoints — arXiv:2606.09737.
