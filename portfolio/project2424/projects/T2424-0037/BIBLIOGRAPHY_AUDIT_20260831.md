# NeuroCAD / T2424-0037 — primary-source bibliography audit

Audit date: 2026-08-31

Purpose: reconcile every manuscript reference against its primary arXiv or proceedings record without implying a matched comparison. All six references are contextual only; none was executed under NeuroCAD's frozen historical or reused component-diagnostic protocol.

## Verified references

### 1. DeepCAD

- Authors: Rundi Wu; Chang Xiao; Changxi Zheng.
- Title: *DeepCAD: A Deep Generative Network for Computer-Aided Design Models*.
- Primary arXiv record: https://arxiv.org/abs/2105.09492
- Identifier: arXiv:2105.09492; arXiv-issued DOI `10.48550/arXiv.2105.09492`.
- Dates/venue: submitted 20 May 2021; revised 16 August 2021; accepted to ICCV 2021.
- Verified relevance: the primary record describes CAD shapes as sequences of CAD operations and a Transformer-based generative model.
- NeuroCAD boundary: not executed as a matched baseline; dataset, task, model, and evaluation regimes differ.

### 2. SketchGraphs

- Authors: Ari Seff; Yaniv Ovadia; Wenda Zhou; Ryan P. Adams.
- Title: *SketchGraphs: A Large-Scale Dataset for Modeling Relational Geometry in Computer-Aided Design*.
- Primary arXiv record: https://arxiv.org/abs/2007.08506
- Identifier: arXiv:2007.08506; arXiv-issued DOI `10.48550/arXiv.2007.08506`.
- Date: submitted 16 July 2020.
- Verified relevance: the primary record describes 15 million sketches as geometric constraint graphs and reports generative/constraint benchmarks.
- NeuroCAD boundary: representation context only; it does not establish typed-parser causality in NeuroCAD.

### 3. Text2CAD

- Authors: Mohammad Sadil Khan; Sankalp Sinha; Talha Uddin Sheikh; Didier Stricker; Sk Aziz Ali; Muhammad Zeshan Afzal.
- ArXiv title: *Text2CAD: Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts*.
- Proceedings title: *Text2CAD: Generating Sequential CAD Designs from Beginner-to-Expert Level Text Prompts*.
- Primary arXiv record: https://arxiv.org/abs/2409.17106
- Primary proceedings record: https://proceedings.neurips.cc/paper_files/paper/2024/hash/0e5b96f97c1813bb75f6c28532c2ecc7-Abstract-Conference.html
- Identifiers: arXiv:2409.17106; arXiv-issued DOI `10.48550/arXiv.2409.17106`; proceedings DOI `10.52202/079017-0242`.
- Date/venue: submitted 25 September 2024; NeurIPS 2024, volume 37, Main Conference Track.
- NeuroCAD boundary: not run under a common backend, data distribution, compute budget, or evaluation protocol.

### 4. CAD-Recode

- Authors: Danila Rukhovich; Elona Dupont; Dimitrios Mallis; Kseniya Cherenkova; Anis Kacem; Djamila Aouada.
- Title: *CAD-Recode: Reverse Engineering CAD Code from Point Clouds*.
- Primary arXiv record: https://arxiv.org/abs/2412.14042
- Identifier: arXiv:2412.14042; arXiv-issued DOI `10.48550/arXiv.2412.14042`.
- Dates: submitted 18 December 2024; revised 11 March 2025.
- Verified relevance: the primary record describes point-cloud-to-executable-Python CAD reconstruction.
- NeuroCAD boundary: different input/task regime; executable-representation context only.

### 5. Text2CAD-Bench

- Authors: Liang Wang; Heng Meng; Zekai Xiang; Jin Liu; Pingyi Zhou; Litao Chen; Yongqiang Tang.
- Title: *Text2CAD-Bench: A Benchmark for LLM-based Text-to-Parametric CAD Generation*.
- Primary arXiv record: https://arxiv.org/abs/2605.18430
- Identifier: arXiv:2605.18430; arXiv-issued DOI `10.48550/arXiv.2605.18430`.
- Date: submitted 18 May 2026.
- Verified relevance: the primary record reports 600 human-curated examples across four complexity levels and dual prompt styles.
- NeuroCAD boundary: successor benchmark context only; no S3 adapter or result is materialized.

### 6. ArtisanCAD

- Authors: Yunhan Xu; Qifeng Wu; Xunjin Li; Yuanwei Bin; Qingsong Yao; Jianghang Gu; Guan Wang; Weihao Lv; Huiyu Yang; Wenfa Luo; Jiao Xiang; Yuntian Chen; Shiyi Chen.
- Title: *ArtisanCAD: An Industrial-Level CAD Agent with Expert-Grounded Knowledge Distillation*.
- Primary arXiv record: https://arxiv.org/abs/2607.05750
- Identifier: arXiv:2607.05750; arXiv-issued DOI `10.48550/arXiv.2607.05750`.
- Dates: submitted 7 July 2026; revised 8 July 2026.
- Verified relevance: the primary record describes executable CAD-IR, CATIA-MCP execution, verification rules, and iterative refinement.
- NeuroCAD boundary: contemporary context only; no frozen provider, backend, model, or benchmark comparison was executed.

## Manuscript reconciliation

The six entries in `MANUSCRIPT.md` map one-to-one to the records above by title and arXiv identifier. The manuscript's abbreviated author forms are unambiguous. The Text2CAD title variation between arXiv (“Models”) and proceedings (“Designs”) is recorded rather than silently normalized.

## Prohibited inferences

- No NeuroCAD state-of-the-art or cross-paper superiority claim.
- No claim that typed parsing is novel in CAD generation.
- No claim that a typed intermediate representation caused the retained reliability gain.
- No relabeling of the reused 20-case diagnostic as held-out or OOD.
- No claim that S3, external validation, manufacturing validation, or a contemporary baseline execution occurred.

## Audit outcome

**PASS for bibliography identity and metadata reconciliation.** This closes citation identity only. It does not change `VALIDATION_DOMINANT`, does not rescue typed-parser-specific causality, and does not make the package preprint-ready.
