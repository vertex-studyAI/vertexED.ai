# Project 2424 — Literature Pressure Test for Top Six Paper Lanes

Verified against current primary/official literature on 2026-08-30. This is a novelty-risk audit, not a novelty claim.

## T2424-0027 — language leakage / centering

### Closest established work

1. Libovický, Rosa & Fraser (Findings EMNLP 2020), **On the Language Neutrality of Pre-trained Multilingual Representations** — directly proposes unsupervised per-language centering and projection to increase language neutrality.
2. Yang et al. (EMNLP 2021), **A Simple and Effective Method To Eliminate the Self Language Bias in Multilingual Representations** — removes language identity via linear operations/projection.
3. Zhao et al. (*SEM 2021), **Inducing Language-Agnostic Multilingual Representations** — removes language identity signals including mean/variance normalization.
4. Xie et al. (EMNLP 2022), **Discovering Low-rank Subspaces for Language-agnostic Multilingual Representations** — projects away low-rank language-specific factors.
5. Nonomura et al. (ACL 2026 Student Research Workshop), **Disentangling Meaning and Language Components in Diverse Multilingual Sentence Embeddings** — current work on language-dependent vs language-agnostic components across modern embedding families.
6. FitzGerald et al. (ACL 2023), **MASSIVE** — primary dataset paper for the real-model successor's multilingual intent data.

### Pressure-test verdict

**Novelty risk: HIGH for the existing synthetic centering result.** Language-centering and language-information removal are established ideas. The synthetic result remains useful as controlled mechanics/reproducibility evidence, but by itself it should not be marketed as a new multilingual-representation method.

### What could still be new/useful

A real-encoder successor can become scientifically useful if it asks a sharper question than 'does centering remove language identity?': for example, whether a frozen, extremely simple language-centering intervention preserves intent information across multiple languages while outperforming global-centering/random-group/random-subspace controls under strict no-tuning conditions, and where it fails.

### Reviewer-demand experiment

The already frozen MASSIVE + multilingual MiniLM successor is exactly the right direction, provided it remains outcome-free until all manifest/authorization gates are verified. Compare against established language-removal baselines where feasible; do not treat nearest-centroid probe changes alone as proof of semantic universality.

---

## T2424-0025 — robust readout precursor

### Closest established work

Robust statistics already provides a deep literature on median/median-of-means/Huber-style estimators under contamination and heavy tails. Relevant examples include Lerasle et al. (ICML 2019) on median-of-means robust mean embeddings, Hopkins & Li (COLT 2019) on robust mean estimation, and Humbert et al. (ICML 2022) on median-of-means robust density estimation.

### Pressure-test verdict

**Novelty risk: HIGH if framed as 'median/robust aggregation beats the mean under heavy tails.'** That is not new enough. The retained zero-contamination advantage is scientifically important because it prevents a uniquely heavy-tail explanation.

### Strongest defensible contribution

A controlled **mechanism non-uniqueness / readout robustness** study: a robust readout can outperform arithmetic mean under contamination, but a substantial advantage already exists at zero contamination, so the experiment does not isolate the claimed heavy-tail mechanism.

### Reviewer-demand experiment

If a successor is pursued, compare matched-capacity online-memory/readout schemes across contamination families and clean controls, with predeclared thresholds and multiple seeds. Do not rescue the current precursor by adding post-hoc conditions.

---

## T2424-1863 — local diffusion operator negative result

### Pressure-test verdict

**Novelty risk: VERY HIGH as a standalone algorithm paper.** The bounded synthetic operator recovered the planted coefficient and reduced one-step error but failed its preregistered >75% improvement gate. Without a stronger connection to a published operator-learning claim, broader benchmark, or general negative insight, this is better treated as a rigorous negative technical report than forced into a flagship conference narrative.

### Strongest defensible contribution

Reproducible negative-result methodology: preserve the exact 10-seed primary / 20-seed expanded accounting, failed gate, and non-superiority boundaries.

### Reviewer-demand experiment

Do not rescue-tune. Any broader scientific successor must be separately preregistered and compare against credible numerical/operator baselines on a recognized task.

---

## T2424-0050 — Darcy harmonic compression

### Closest established work

- Lu et al., **DeepONet** (Nature Machine Intelligence 2021) establishes neural operator learning across multiple operator/PDE families.
- Fourier Neural Operator is a standard dangerous baseline for data-driven PDE operator learning and Darcy-style benchmarks.
- Modern operator-learning benchmarking makes learned and reduced-order comparators essential for any broad operator-learning claim.

### Pressure-test verdict

**Novelty risk: HIGH if framed as a learned/operator-learning advance.** The current retained evidence is an explicit, interpretable 1D resistance-preserving compression rule—not a learned neural operator. The harder rho=0 miss and adverse seed make the present evidence mixed rather than broadly robust.

### What could still be new/useful

An interpretable physics-preserving coarse representation may be valuable as a **dangerous simple baseline** and as a robustness study under misalignment/distribution shift. That is a different and potentially stronger story than pretending it is a neural operator.

### Reviewer-demand experiment

The frozen stronger successor should compare harmonic compression against arithmetic/log-mean ablations, PCA+ridge, FNO-1D, and DeepONet under ID and frozen OOD families. A serious operator-learning paper should then move to a properly frozen 2D benchmark before making multidimensional claims.

---

## T2424-0037 — NeuroCAD

### Closest current work / benchmarks

1. **Text2CAD-Bench** (2026) — 600 human-curated examples across complexity levels and application diversity; directly pressures narrow template-only evaluation.
2. **CADTests / CADTestBench** (2026) — executable software tests for geometric/topological prompt requirements and test-guided generation baselines.
3. **MUSE** (2026) — manufacturability, functionality, assemblability evaluation for text-to-CAD beyond shape similarity.
4. **AssemCAD** (2026) — axiom-grounded natural-language CAD assembly generation with deterministic geometric execution/validation.

### Pressure-test verdict

**Historical typed-parser novelty is obsolete/insufficient for a current broad Text-to-CAD claim.** The matched-validation diagnostic is therefore more scientifically interesting than the old 19/20 headline: it shows the apparent advantage was validation-dominant rather than evidence for the typed-parser mechanism.

### Strongest defensible contribution

A **mechanism-falsification and evaluation-methodology paper** showing why matched validation baselines are necessary before attributing gains to typed intermediate representations.

### Reviewer-demand experiment

S3 should use new, truly held-out cases and adapters to contemporary benchmarks such as Text2CAD-Bench/CADTests, with exact model/provider identities and matched-validation baselines frozen before evaluation. Do not relabel reused cases as held-out/OOD.

---

## NGMT v0.1 — robust online memory Transformer

### Closest established work

- Graves, Wayne & Danihelka, **Neural Turing Machines** — differentiable external memory.
- Dai et al., **Transformer-XL** (ACL 2019) — segment recurrence for long-term dependency.
- Rae et al., **Compressive Transformer** (ICLR 2020) — compressed long-range memory.
- Wu et al., **Memorizing Transformers** (ICLR 2022) — large non-differentiable kNN memory of past internal representations.
- Token Turing Machines (CVPR 2023) — token memory controlled by Transformer operations for sequential tasks.

### Pressure-test verdict

**Novelty risk: MEDIUM-HIGH for 'a Transformer with memory'; HIGH if robust-memory contribution is not isolated.** Memory-augmented Transformers are established. The current v0.1 result is negative/inconclusive and therefore cannot support a superiority claim.

### Strongest defensible contribution

A controlled negative result: under the frozen matched-capacity setup, the robust B3 memory distribution/read-write rule did not clear the preregistered improvement gates versus B1/B2, while respecting the clean-regression guardrail. Exact replay strengthens reproducibility of that failure.

### Reviewer-demand experiment

A successor must be a new freeze and should test whether the absence of gain is stable across contamination severity, sequence lengths, and at least one realistic long-context task, with memory capacity and parameter count controlled. The current thresholds/seeds must not be moved.

---

# Flagship ranking after literature pressure

For **ICLR/major-conference potential**, the ranking is not the same as 'easiest manuscript to finish':

1. **T2424-0027 real-encoder successor** — highest upside, but only if the real-model result survives the frozen controls; synthetic centering alone has substantial prior-art overlap.
2. **NeuroCAD S3 / mechanism-falsification line** — current 2026 CAD benchmarks create a strong, falsifiable evaluation story, but S3 identity/benchmark gates must close first.
3. **Darcy stronger successor** — potentially useful as a simple physics-preserving baseline/robustness study; broad operator claims require learned comparators and stronger dimensionality.
4. **NGMT successor / negative study** — potentially valuable if the negative result generalizes and explains failure modes rather than just missing two thresholds on a tiny setup.
5. **T2424-0025 bounded precursor** — scientifically clean, but robust aggregation itself is old and the zero-contamination control blocks the intended unique mechanism.
6. **T2424-1863 negative screen** — excellent integrity/reproducibility package but presently weakest flagship novelty story.

This ranking must change if new evidence changes the scientific story.