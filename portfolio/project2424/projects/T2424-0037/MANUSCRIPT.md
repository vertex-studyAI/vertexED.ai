# Validation-Dominant Reliability in a Bounded Text-to-Parametric-CAD Pipeline

## Abstract

We report a bounded historical and mechanism-diagnostic study of NeuroCAD, a controlled-language text-to-parametric-CAD pipeline. In a frozen historical system evaluation, the typed-and-validated pipeline succeeded on 19 of 20 retained held-out cases (0.95), compared with 12 of 20 (0.60) for the original direct extractor; 12 of 12 valid held-out OpenSCAD cases produced non-empty STL, while the retained O018 failure remained visible. We subsequently tested whether the historical performance gap specifically supported a causal advantage for the typed/parser path. On a reused 20-case component diagnostic, direct extraction equipped with the same fail-closed validation reached 1.00 overall success, exactly matching typed+validated at 1.00, while the original direct extractor remained at 0.60. The preregistered diagnostic therefore yielded `validation_recovery_fraction = 1.00` and the frozen interpretation `VALIDATION_DOMINANT`. This falsifies a typed-parser-specific causal explanation on the reused diagnostic while preserving the historical system result. We make no claim of out-of-distribution generalization, manufacturing correctness, external validation, or superiority to contemporary text-to-CAD systems. The study is best read as a negative mechanism result showing why matched validation controls are necessary when attributing reliability gains in executable CAD pipelines.

## 1. Introduction

Text-to-CAD systems sit at the intersection of natural-language interpretation, structured geometric representation, executable program generation, and fail-safe engineering. These layers make attribution difficult. When a structured pipeline outperforms a direct generator, the observed gain may come from representation, parsing, validation, execution constraints, or interactions among them.

NeuroCAD was developed as a bounded controlled-language compiler for rectangular plates, panels, brackets, and related parametric geometry. Its historical frozen evaluation showed a substantial system-level gap between a typed+validated pipeline and an original direct extractor. That result was real within its retained benchmark, but it did not by itself identify which component caused the difference.

This report joins two evidence generations that must be interpreted together. First, we retain the historical 19/20 versus 12/20 system result. Second, we report a later matched-validation component diagnostic, frozen before execution, that asks whether adding the same fail-closed validation to direct extraction recovers the gap. It does: direct+matched-validation and typed+validated both reach 1.00 on the reused diagnostic. The result narrows the contribution from a possible typed-parser mechanism to bounded engineering reliability associated with explicit validation under the tested grammar.

## 2. Related Work

Structured CAD sequence modeling predates this study. DeepCAD models CAD objects as sequences of operations and uses a Transformer-based generative architecture (Wu, Xiao, and Zheng, ICCV 2021; arXiv:2105.09492). SketchGraphs represents parametric sketches as relational geometric constraint graphs and provides large-scale benchmarks for generative and constraint modeling (Seff et al., 2020; arXiv:2007.08506).

Text-conditioned parametric CAD generation has advanced substantially. Text2CAD generates sequential parametric CAD models from natural-language prompts and was published at NeurIPS 2024 (Khan et al.; arXiv:2409.17106). CAD-Recode represents reconstructed CAD sequences as executable Python code for point-cloud-to-CAD reverse engineering (Rukhovich et al.; arXiv:2412.14042). More recent benchmark and agent work, including Text2CAD-Bench (Wang et al.; arXiv:2605.18430) and ArtisanCAD (Xu et al.; arXiv:2607.05750), reflects a broader move toward harder text-to-CAD evaluation, executable procedural representations, and verification.

These systems are contextual references, not matched NeuroCAD baselines. The retained NeuroCAD experiments did not execute them under a common backend, data distribution, compute budget, or evaluation protocol. We therefore make no cross-paper superiority claim.

## 3. System Boundary

The retained NeuroCAD claim is deliberately narrow. For prompts inside a frozen controlled grammar, the compiler is intended to produce expected numeric parametric geometry and bounded OpenSCAD source while rejecting unsupported or unsafe geometry. The project claim explicitly excludes arbitrary natural-language understanding, arbitrary CAD generation, CAD-kernel correctness, manufacturing validity, production readiness, publication novelty, and broad research completion.

The historical typed+validated path uses a structured interpretation before bounded geometry generation and fail-closed checks. The original direct extractor serves as the historical comparison. The later mechanism diagnostic adds matched fail-closed validation to direct extraction to isolate whether validation alone explains the observed gap.

## 4. Evidence and Methods

### 4.1 Historical frozen system result

The retained historical evaluation contains 20 held-out cases. The typed+validated system passes 19/20 (0.95), while the original direct extractor passes 12/20 (0.60). The historical failure O018 is retained rather than repaired away. Among the 12 valid held-out OpenSCAD cases recorded by the evidence ledger, all 12 generated non-empty STL.

This result is treated as a historical system comparison. The present paper does not reconstruct missing trial-level detail beyond what the retained evidence supports.

### 4.2 Matched-validation mechanism diagnostic

The later component diagnostic asks a narrower causal question: how much of the current performance gap on the existing 20-case plate diagnostic is explained by fail-closed validation rather than the parser/typed path itself?

The protocol and interpretation thresholds were committed before first execution at source/protocol commit `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`. The 20 cases are explicitly reused component-diagnostic cases, not a new held-out or OOD set.

Three systems are compared:

| System | Valid exact geometry | Invalid rejection | Overall success | Accepted invalid |
|---|---:|---:|---:|---:|
| Typed + validated (M2) | 1.00 | 1.00 | 1.00 | 0 |
| Original direct (B0) | 1.00 | 0.00 | 0.60 | 8 |
| Direct + matched fail-closed validation (B1) | 1.00 | 1.00 | 1.00 | 0 |

The retained derived diagnostics are `original_gap = 0.40`, `remaining_gap = 0.00`, and `validation_recovery_fraction = 1.00`. The frozen interpretation is `VALIDATION_DOMINANT`.

### 4.3 Reproducibility record

The component diagnostic executed successfully in workflow `31777954088`. Retained artifact ID is `9210587354`, with SHA-256 `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`. The workflow retained Node `v22.23.1`, npm `10.9.8`, and Ubuntu/Azure Linux kernel `6.17.0-1020-azure`; its contract test passed 1/1.

Machine-readable manuscript table values are retained in `TABLE_DATA_20260829.json`. The paper-facing claim constraints are separately retained in `CLAIM_AUDIT_20260829.md`.

## 5. Results

### 5.1 Historical system-level gain

The frozen historical typed+validated pipeline achieved 0.95 success versus 0.60 for the original direct extractor, an absolute difference of 0.35 on the retained 20-case benchmark. This establishes a bounded historical system result only.

### 5.2 Matched validation closes the diagnostic gap

On the reused component diagnostic, original direct extraction succeeds on valid geometry but fails to reject invalid cases, accepting eight invalid examples and scoring 0.60 overall. Adding matched fail-closed validation eliminates those accepted-invalid cases and raises overall success to 1.00. Typed+validated also scores 1.00.

Because B1 and M2 tie under matched validation, the remaining typed-path gap is zero on this diagnostic. The validation recovery fraction is 1.00. Under the preregistered interpretation, the result is `VALIDATION_DOMINANT`.

## 6. Failure Analysis

The most important failure in this study is a **mechanism attribution failure**, not a software crash. The historical system gap was compatible with a typed-parser advantage, but a matched validation control recovered the entire gap on the reused cases. The typed-parser-specific causal interpretation is therefore falsified on this diagnostic.

A second failure mode is visible in the original direct extractor: it accepts eight invalid cases in the component diagnostic. This is precisely the behavior corrected by the fail-closed validation layer.

Historical failure O018 remains part of the evidence and is not overwritten by later safety repairs. Later product behavior cannot be back-projected into the frozen historical result.

Finally, the study has an evaluation-scope limitation: the component cases are reused. They cannot support OOD or new-family generalization claims, regardless of perfect diagnostic scores.

## 7. Discussion

The retained evidence supports a modest but useful conclusion. Explicit fail-closed validation can dominate observed reliability gains in a bounded text-to-CAD pipeline. Without a matched validation baseline, a structured parser or intermediate representation can receive causal credit that the experiment does not isolate.

This result does not imply that typed representations are useless. They may contribute maintainability, safety, compositionality, or performance on harder distributions. Those hypotheses simply remain untested here. A genuinely new benchmark with broader part families, compositional prompts, matched contemporary generators, frozen semantic/geometric criteria, and untouched evaluation data is required before making a broader mechanism or capability claim.

## 8. Limitations

The historical evaluation is small and bounded. The component diagnostic reuses 20 cases and is not held-out/OOD. Contemporary text-to-CAD systems were not executed as matched baselines. No completed confirmatory manufacturability study is retained. No completed external engineer validation is retained. Public artifact transport and product/browser QA are engineering evidence, not scientific deployment or external validation. The S3 successor protocol remains unexecuted and unauthorized for confirmatory outcome access.

The study therefore cannot establish state-of-the-art performance, arbitrary language understanding, new-family generalization, manufacturing correctness, or broad CAD-agent capability.

## 9. Data, Code, and Artifact Statement

The scientific evidence referenced here is retained in the connected repository under `portfolio/project2424/projects/T2424-0037/`, including the evidence ledger, frozen component protocol/result, claim audit, and paper-readiness gate. The exact component diagnostic is tied to source/protocol commit `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`, workflow `31777954088`, artifact `9210587354`, and the artifact digest above.

No external public benchmark is claimed as part of the current historical/component result. External datasets/adapters mentioned by the S3 successor are not counted as materialized evidence here. Repository/code release licensing remains a publication metadata gate and must be resolved before public preprint release.

## 10. Conclusion

NeuroCAD’s retained historical typed+validated system result is stronger than its original direct baseline on a bounded 20-case evaluation. A later preregistered component diagnostic, however, shows that adding matched fail-closed validation to direct extraction recovers the entire observed diagnostic gap and ties the typed+validated path. The correct evidence-backed conclusion is therefore validation-dominant reliability on the reused diagnostic, not a typed-parser causal breakthrough. Preserving that negative mechanism result is more informative than tuning the old benchmark to restore the original narrative.

## References

- Wu, R., Xiao, C., Zheng, C. *DeepCAD: A Deep Generative Network for Computer-Aided Design Models.* ICCV 2021. arXiv:2105.09492.
- Seff, A., Ovadia, Y., Zhou, W., Adams, R. P. *SketchGraphs: A Large-Scale Dataset for Modeling Relational Geometry in Computer-Aided Design.* arXiv:2007.08506, 2020.
- Khan, M. S., et al. *Text2CAD: Generating Sequential CAD Models from Beginner-to-Expert Level Text Prompts.* NeurIPS 2024. arXiv:2409.17106.
- Rukhovich, D., et al. *CAD-Recode: Reverse Engineering CAD Code from Point Clouds.* arXiv:2412.14042, 2024.
- Wang, L., et al. *Text2CAD-Bench: A Benchmark for LLM-based Text-to-Parametric CAD Generation.* arXiv:2605.18430, 2026.
- Xu, Y., et al. *ArtisanCAD: An Industrial-Level CAD Agent with Expert-Grounded Knowledge Distillation.* arXiv:2607.05750, 2026.
