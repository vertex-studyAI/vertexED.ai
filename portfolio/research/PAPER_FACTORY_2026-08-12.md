# Research Paper Factory — evidence audit

**Evidence cutoff:** 12 August 2026  
**Rule:** only connected evidence is counted; no publication/acceptance claims are made.

## Ranked candidates

### 1. LAM-JEPA — strongest current manuscript candidate

**Why ranked first:** real external ARC-Challenge integration; fixed train/validation protocol; matched-capacity supervised comparator; strong pretrained comparator path; five-seed validation; controls/ablations; retained adverse results; independent recomputation; explicit stop rule preventing confirmatory-test rescue.

**Scientific result:** negative/inconclusive for the current ARC superiority/mechanism hypothesis. This is still manuscript-worthy as a careful negative-result/reproducibility report if provenance and related-work requirements are completed.

**Current blocker:** publication provenance/license/authorship package remains owner-controlled and unresolved. The locked ARC test must not be used to rescue the failed hypothesis.

### 2. T2424-0025 — Non-Gaussian Memory mechanism screen

**Why ranked second:** deterministic implementation, 30-seed synthetic benchmark, explicit clean Gaussian control, predeclared gate, and a strong reproducible heavy-tail robustness effect.

**Claim boundary:** evidence supports only a robust weighted-median memory aggregation screen under synthetic heavy-tailed contamination. It does not support a full Transformer, learned-memory superiority, long-context language modeling, or real-world robustness.

**Before submission:** learned sequence task; no-memory/learned-memory/Gaussian-reference/proposed baselines; more readout baselines (Huber/trimmed/other robust estimators); multiple contamination families; held-out splits; compute/parameter accounting; ablations and retained raw outputs.

### 3. T2424-0037 — NLP-to-CAD / NeuroCAD

**Why ranked third:** working controlled-language compiler, explicit structured intermediate representation, fail-closed validation, OpenSCAD/SVG output, regression suite, browser demo, and a deterministic 20-prompt benchmark.

**Claim boundary:** currently a demo, not comparative research. No evidence yet establishes that the structured IR improves over direct code generation.

**Before submission:** implement direct-code and IR+CAD-kernel baselines, add multiple part families, held-out compositional prompts, real CAD-kernel geometry validation, raw-output retention, and comparative statistics.

---

# Strongest manuscript skeleton — LAM-JEPA negative-result report

## Working title

**A Reproducible Evaluation of LAM-JEPA on ARC-Challenge: Matched-Capacity Controls, Mechanism Ablations, and a Negative Superiority Result**

The title is intentionally descriptive and does not claim a positive result.

## Abstract — draft

We evaluate LAM-JEPA under a preregistered ARC-Challenge train/validation protocol with retained raw evidence, capacity-matched supervised comparison, a pinned pretrained comparator path, five-seed validation, and mechanism ablations. Under the frozen validation budget, LAM-JEPA does not outperform the matched-capacity supervised baseline. Ablations likewise do not provide evidence that the planner or target mechanism improves ARC validation performance. A bounded train-only repair restores a predeclared trainability criterion for a quantized latent path, but subsequent repaired validation remains negative or inconclusive for the declared generalization and quantization-benefit gates. We report these adverse results without using the locked confirmatory test to rescue the failed hypothesis. The contribution is therefore a reproducible evaluation and failure analysis rather than a superiority claim. **[Related-work positioning and citation-complete novelty statement still required.]**

## 1. Introduction

### Motivation

Architectural proposals often accumulate claims faster than matched baselines, frozen evaluation protocols, and adverse-result retention. LAM-JEPA provides a useful case study for evaluating an architecture under explicit evidence gates.

### Research questions

1. Does LAM-JEPA outperform a capacity-matched supervised baseline on frozen ARC validation?
2. Do the planner and target mechanisms show positive contribution under frozen ablations?
3. Does the trainability repair for the quantized latent path translate into the predeclared validation benefits?
4. What can be concluded when trainability improves but generalization gates remain unsupported?

### Contributions

- reproducible ARC-Challenge train/validation integration with preserved eligibility/exclusion evidence;
- matched gradient-active parameter comparison;
- multi-seed mechanism controls/ablations;
- a bounded trainability repair evaluated under a separate frozen protocol;
- explicit preservation and interpretation of negative/inconclusive outcomes.

Do not add a novelty claim until related work is audited.

## 2. Related Work

**Status: incomplete.** Add verified references for:

- JEPA-family representation learning;
- ARC/AI2 Reasoning Challenge benchmark methodology;
- latent/quantized representation learning;
- EMA/target-network methods where relevant;
- matched-capacity model comparison and negative-result reporting.

No citations should be inserted from memory without source verification.

## 3. Method

Describe the actual LAM-JEPA implementation only from canonical source. Separate:

- encoder/predictive components;
- planner mechanism;
- target/EMA mechanism;
- quantized latent path;
- ARC-v5 stable EMA residual repair.

Include a parameter-accounting table distinguishing total from gradient-active parameters.

## 4. Experimental Setup

### Data

ARC-Challenge external benchmark integration under the frozen eligibility rule.

Observed eligible counts in the retained protocol:

- train: 1,117 / 1,119;
- validation: 295 / 299.

The locked ARC test is not used for the failed superiority hypothesis.

### Matched-capacity comparison

- LAM-JEPA gradient-active parameters: 86,372;
- matched supervised gradient-active parameters: 86,644;
- ratio: 1.0031491687.

### Frozen validation budget

Five seeds, 20 epochs, batch size 32, learning rate 0.0003, one model step, all eligible train rows, and all eligible validation rows for the full-controls run.

### Metrics and statistics

Report mean accuracy and across-seed dispersion exactly as retained. For paired mechanism effects, report the existing bootstrap intervals and clearly describe the bootstrap procedure from source before submission.

## 5. Results

### Capacity-matched result

- LAM-JEPA: 0.2549152542 ± 0.0129968064;
- matched supervised: 0.2664406780 ± 0.0154600058;
- paired LAM minus matched: -0.0115254237 ± 0.0140994131.

**Interpretation:** no superiority is supported.

### Mechanism controls

- full LAM-JEPA: 0.2549152542 ± 0.0129968064;
- no planner: 0.2501694915 ± 0.0129968064;
- no target: 0.2616949153 ± 0.0203954020;
- deterministic shuffled-label control: 0.2630508475 ± 0.0145011862.

Paired effects:

- full minus no-planner: +0.0047457627, 95% bootstrap CI [0.0, 0.0142372881];
- full minus no-target: -0.0067796610, 95% bootstrap CI [-0.0135593220, 0.0].

**Interpretation:** the frozen criteria do not establish planner or target-mechanism benefit.

### Pretrained comparator characterization

A bounded development comparison records LAM-JEPA 0.15625 versus pinned DeBERTa 0.21875, paired difference -0.0625. Present this only as characterization evidence under the repository's existing limitation, not as a standalone final inferiority claim.

### Repaired validation

The v5 train-only repair satisfies its bounded trainability gate, but independently recomputed repaired validation remains `VALID_NEGATIVE_OR_INCONCLUSIVE_VALIDATION` for the declared generalization/quantization-benefit gates.

## 6. Ablations

Document the frozen `no_planner` and `no_target` runs, shuffled-label control, and the trainability repair. Do not add post-hoc ablations to imply the original hypothesis passed.

## 7. Limitations

- current main scientific conclusion is specific to the frozen ARC line;
- the superiority/mechanism hypothesis is unsupported;
- test-set confirmation is intentionally not used for rescue;
- pretrained comparator evidence is bounded characterization rather than a full final comparison;
- publication provenance/license/authorship remains unresolved;
- broader tasks and architectures may behave differently;
- all architecture descriptions must be checked against canonical code before submission.

## 8. Discussion

Focus on the distinction between **trainability repair** and **validated generalization benefit**. A repair can restore optimization behavior without establishing the scientific mechanism claim. Discuss why retaining a negative result and stop rule reduces confirmation bias.

## 9. Conclusion

LAM-JEPA has a reproducible external-benchmark pipeline, but the frozen ARC evidence does not support superiority over the matched-capacity baseline or the declared mechanism benefits. The current result is a disciplined negative/inconclusive evaluation rather than a successful architecture claim.

## References

**Not populated here. Source-verified citations required.**

## Appendix

Include exact environment, commit/revision identifiers, seeds, configs, eligibility records, commands, raw outputs, verifier commands, and hardware notes from retained evidence.

---

# Reproducibility package audit

| Requirement | LAM-JEPA | Non-Gaussian Memory | NLP-to-CAD |
|---|---|---|---|
| environment | present in repo, final manuscript snapshot still needed | Node runtime implicit; freeze exact version | Node/browser runtime; freeze exact version |
| seeds | five-seed ARC validation recorded | 30 deterministic seeds | deterministic / no seed |
| configs | frozen ARC protocols exist | parameters embedded in code | grammar/limits embedded in code |
| commands | present across status/protocol artifacts | run/test command present | test/demo + benchmark commands present |
| data access | external ARC integration exists; provenance instructions must be finalized | synthetic generator | prompt fixtures embedded |
| evaluation script | present | present | present; comparative evaluator not yet present |
| output table | retained status aggregates exist | benchmark output reproducible; retain machine-readable sweep output next | 20-prompt output should be retained in CI/artifacts next |
| hardware notes | must be consolidated for paper package | missing/not material for cheap screen, still record | missing/not material for cheap demo, still record |

# Missing-evidence checklist before submission

1. Resolve LAM-JEPA licensing, authorship/citation metadata, and artifact provenance.
2. Verify every architecture statement in the manuscript directly against canonical implementation.
3. Build a citation-complete related-work section from source-verified references.
4. Consolidate exact environment lockfiles, hardware notes, commands, seeds, configs, and raw-output locations into one reproduction README.
5. Do not unlock the ARC confirmatory test for the failed hypothesis.
6. For Non-Gaussian Memory, run a learned sequence-memory comparison with the required baselines before calling it a Transformer result.
7. For NLP-to-CAD, run B0/B1/B2 comparative experiments on held-out compositional prompts and a real CAD kernel.

# Venue class, not acceptance prediction

- **LAM-JEPA:** technical report/preprint now; reproducibility, evaluation, or negative-results workshop class after provenance/citations are complete. A broader main-track claim would require a clearer contribution than unsupported superiority.
- **Non-Gaussian Memory:** workshop/short-paper class only after learned-task baseline evidence; currently a mechanism note/demo.
- **NLP-to-CAD:** HCI/CAD/ML workshop or demo/short-paper class after comparative experiments and CAD-kernel validation; currently a tested prototype.
