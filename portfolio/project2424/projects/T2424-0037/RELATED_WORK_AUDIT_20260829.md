# NeuroCAD / T2424-0037 — Related-Work Audit

Audit date: 2026-08-29

Purpose: bound the historical/diagnostic NeuroCAD manuscript against verified primary literature without implying matched comparison where none exists.

## Citation policy

Only sources whose primary paper/proceedings identity was verified are listed as manuscript-ready references. These papers are **context only** unless NeuroCAD actually ran a frozen matched baseline against them. No current NeuroCAD evidence supports a state-of-the-art or superiority claim against any item below.

## Verified primary references

### Structured and parametric CAD representations

1. **Wu, Xiao, Zheng. “DeepCAD: A Deep Generative Network for Computer-Aided Design Models.” ICCV 2021.**
   - Primary paper: https://arxiv.org/abs/2105.09492
   - Relevance: models CAD as sequences of structured CAD operations and demonstrates a Transformer-based generative representation.
   - NeuroCAD boundary: DeepCAD is not a matched baseline in the retained 20-case NeuroCAD study. Its dataset/task/model regime differs materially from NeuroCAD’s bounded text-to-parametric/OpenSCAD pipeline.

2. **Seff, Ovadia, Zhou, Adams. “SketchGraphs: A Large-Scale Dataset for Modeling Relational Geometry in Computer-Aided Design.” 2020.**
   - Primary paper: https://arxiv.org/abs/2007.08506
   - Relevance: treats parametric sketches as relational geometric/constraint graphs and establishes generative/constraint benchmarks.
   - NeuroCAD boundary: useful context for explicit structure and constraints, not evidence that NeuroCAD’s typed parser is causally necessary.

### Text-to-parametric-CAD generation

3. **Khan et al. “Text2CAD: Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts.” NeurIPS 2024.**
   - Primary paper: https://arxiv.org/abs/2409.17106
   - Proceedings: https://proceedings.neurips.cc/paper_files/paper/2024/hash/0e5b96f97c1813bb75f6c28532c2ecc7-Abstract-Conference.html
   - Relevance: direct text-to-parametric-CAD generation from natural-language descriptions at multiple specificity levels.
   - NeuroCAD boundary: Text2CAD was not executed under the frozen historical/component protocol; no cross-paper metric comparison is admissible.

4. **Rukhovich et al. “CAD-Recode: Reverse Engineering CAD Code from Point Clouds.” 2024.**
   - Primary paper: https://arxiv.org/abs/2412.14042
   - Relevance: executable Python CAD-code generation and the use of code representations for editable CAD reconstruction.
   - NeuroCAD boundary: point-cloud-to-code reverse engineering is a different input/task regime; this is representation/executability context only.

### Current benchmark / agent context for successor work

5. **Wang et al. “Text2CAD-Bench: A Benchmark for LLM-based Text-to-Parametric CAD Generation.” 2026.**
   - Primary paper: https://arxiv.org/abs/2605.18430
   - Relevance: contemporary text-to-CAD benchmark spanning increasing geometric complexity and application diversity.
   - NeuroCAD boundary: retained as successor/benchmark context. It is not materialized as a frozen NeuroCAD S3 adapter and therefore provides no current performance evidence.

6. **Xu et al. “ArtisanCAD: An Industrial-Level CAD Agent with Expert-Grounded Knowledge Distillation.” 2026.**
   - Primary paper: https://arxiv.org/abs/2607.05750
   - Relevance: contemporary executable/procedural CAD-agent framing with an intermediate representation and verification rules.
   - NeuroCAD boundary: contemporary context only. NeuroCAD has no frozen matched provider/model comparison against ArtisanCAD.

## Manuscript-safe synthesis

The literature supports three broad observations relevant to NeuroCAD: structured CAD representations are an established design choice; text-to-parametric-CAD systems now evaluate natural-language-to-editable-model generation directly; and contemporary work increasingly emphasizes executable representations, verification, and harder benchmarks. None of those observations rescues the typed-parser-specific NeuroCAD mechanism claim. The retained matched-validation diagnostic directly shows that direct extraction plus the same fail-closed validation reaches the typed+validated score on the reused cases.

## Claims explicitly prohibited by this audit

- “NeuroCAD is state of the art.”
- “NeuroCAD outperforms DeepCAD/Text2CAD/CAD-Recode/ArtisanCAD.”
- “Typed parsing is novel in CAD generation.”
- “The typed intermediate representation is causally responsible for the retained reliability gain.”
- “The historical 20-case benchmark is comparable to current public text-to-CAD benchmarks.”

## Remaining citation gaps

- If the manuscript discusses **program repair / execution-guided synthesis** as a general methodological lineage, add a verified primary program-synthesis reference rather than relying on analogy.
- If the manuscript discusses **manufacturability** beyond syntax/geometry execution, add primary CAD/manufacturing-validation literature and execute a corresponding frozen evaluation; citation alone is not evidence.
- If S3 executes, freeze exact versions and licenses for every external benchmark/provider used and cite the corresponding primary dataset/method papers in the S3 report.

## Audit outcome

**PASS for a bounded historical/diagnostic manuscript.** Related work is sufficiently verified for contextual framing, provided the manuscript keeps all modern systems as non-matched context and makes no superiority claim.