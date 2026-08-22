# NeuroCAD: Typed Intermediate Representation and Validation for Controlled Text-to-CAD Generation

**Status:** internally complete technical-report manuscript from retained evidence; not externally validated.  
**Claim boundary:** the frozen controlled/held-out evaluation supports an accuracy and executability gain over a direct extraction baseline. The earlier typed-parser causal story is not claimed as established beyond the frozen comparison.

## Abstract

We evaluate a typed and validated intermediate-representation pipeline for converting constrained natural-language CAD requests into executable OpenSCAD geometry. On a frozen held-out set of 20 prompts comprising 12 valid and 8 invalid cases, the v1 pipeline achieved 19/20 overall correctness versus 12/20 for the frozen direct baseline, a 35 percentage-point difference. All 12 valid cases produced non-empty STL outputs. The result is narrow: the benchmark is small and authored, the direct comparator is not a full same-provider learned-generation baseline, and one negative-width validation defect was discovered after the frozen result and repaired separately. The strongest supported conclusion is therefore that typed structure plus validation improved controlled benchmark reliability in the tested setting, not that NeuroCAD solves arbitrary CAD generation or establishes a general causal mechanism.

## 1. Introduction

Text-to-CAD systems combine language interpretation with strict geometric and syntactic constraints. A generation path can appear semantically plausible while still producing malformed, non-executable, or invalid geometry. NeuroCAD tests whether forcing requests through a typed representation and explicit validation can improve reliability in a bounded CAD task family.

The frozen v1 study compares a typed/validated pipeline with a direct extraction baseline on held-out prompts. The retained result is strong on this narrow benchmark, but the project also preserves a later causal-audit failure: validation coverage, rather than a uniquely typed-parser mechanism, explains much of the observed advantage. This paper therefore reports the empirical system result while keeping the mechanism claim conservative.

## 2. System

The tested pipeline has four stages:

1. parse a constrained CAD request into a structured representation;
2. enforce typed fields and parameter constraints;
3. validate the specification before code generation;
4. emit OpenSCAD and execute the result to verify non-empty geometry.

The direct baseline bypasses part of this structure and validation path.

## 3. Frozen Evaluation

The held-out benchmark contains 20 prompts: 12 valid requests and 8 invalid requests. Evaluation considers exact adherence to the benchmark specification, rejection of invalid cases, overall correctness, and executable geometry for valid cases.

The frozen result is:

| System | Overall correctness |
|---|---:|
| Typed/validated NeuroCAD v1 | `19/20` |
| Direct baseline | `12/20` |

For valid cases, the typed/validated pipeline produced non-empty STL geometry in `12/12` cases.

The absolute overall difference is 7 cases, or 35 percentage points.

## 4. Failure and Mechanism Audit

A negative-width case was incorrectly accepted in frozen v1. The defect was identified after the result and hardened in a separate engineering change; it must not be retroactively folded into the frozen benchmark score.

More importantly, subsequent analysis falsified the stronger claim that the typed parser alone caused the performance gap. The defensible interpretation is that structured representation and validation jointly improved reliability in this controlled setting. The experiment does not isolate a universal causal benefit of a typed intermediate representation independent of validation quality.

## 5. Reproducibility

The retained focused reproduction status is `6/6` for the controlled NeuroCAD evidence package. The current paper should preserve the frozen benchmark, direct-baseline result, and post-result hardening boundary. Any broader study must be versioned separately.

## 6. Limitations

The dataset is small, authored, and limited in part families and language variation. The direct comparator is not yet a same-provider learned direct-generation system under a fully matched inference budget. OpenSCAD is only one backend. Manufacturing validity, geometric optimality, and arbitrary free-form CAD are outside the evidence boundary. External reproduction is absent.

## 7. Next Scientific Gate

The next legitimate study is not a rerun of the frozen 20 examples. It is a broader OOD/compositional benchmark with a competent same-provider learned direct baseline, explicit matched budgets, independent execution checks, and preregistered failure categories.

## 8. Discussion

The study illustrates a useful engineering-science distinction. Validation-oriented structure can materially improve controlled system reliability even when a stronger causal story about the parser itself does not survive scrutiny. Preserving both facts produces a more credible result than collapsing them into a single architecture claim.

## 9. Conclusion

On the frozen 20-prompt benchmark, NeuroCAD's typed/validated v1 pipeline achieved 19/20 overall correctness versus 12/20 for the direct baseline, with 12/12 valid cases producing non-empty STL outputs. This supports a bounded controlled reliability advantage. It does not establish arbitrary CAD competence, SOTA status, or a unique typed-parser causal mechanism. A larger OOD study with a matched learned direct baseline is required for broader claims.
