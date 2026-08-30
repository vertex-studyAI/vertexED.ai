# T2424-1863 paper release audit

Decision: **GO for bounded negative-result manuscript closure; NO-GO for PREPRINT_READY.**

## Related-work audit

Primary records re-verified for the current manuscript boundary:

- Fourier Neural Operator — Zongyi Li et al., *Fourier Neural Operator for Parametric Partial Differential Equations*, arXiv:2010.08895.
- DeepONet — Lu Lu, Pengzhan Jin, George Em Karniadakis, *DeepONet: Learning nonlinear operators for identifying differential equations based on the universal approximation theorem of operators*, arXiv:1910.03193.
- Physics-Informed Neural Operator — Zongyi Li et al., *Physics-Informed Neural Operator for Learning Partial Differential Equations*, arXiv:2111.03794.

Use these references only to define relevant operator-learning comparator families and motivate future matched baselines. The present evidence includes none of those comparator runs. No FNO/DeepONet/PINO superiority claim is supported.

Citation stop rules:

- do not make historical or methodological priority claims about finite-difference/local-stencil diffusion without a separately verified primary source;
- do not make general publication-bias or preregistration-effect claims without separately verified primary sources;
- do not add bibliography entries from memory; every release bibliography entry must resolve to a checked primary publisher/arXiv record.

## Figure and table provenance

**Current release choice: table-only.**

Authorized numerical sources are the exact retained scientific source/metadata, exact-source 10-seed calculation, retained 20-seed benchmark summaries, and reproduction records cited below.

Permitted release content:

1. the primary 10-seed aggregate table already present in the manuscript;
2. the expanded retained 20-seed aggregate table already present in the manuscript;
3. textual reporting of retained ranges and sample standard deviations where evidenced.

Blocked unless an immutable raw per-seed artifact is recovered and checksummed:

- per-seed scatter plots;
- violin/distribution plots;
- per-seed error-bar plots;
- any reconstructed point-level visualization.

Do not fabricate missing per-seed values from summary statistics. A future figure-bearing release requires recovered raw evidence or a separately labeled reproduction artifact with provenance and digest.

## Reproducibility gate

Evidence retained:

- scientific source commit `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`;
- original hosted reproduction run `31411517815`, attempt 3, job `94262839511`;
- exact-head verification PR #302, head `147ce38bf2d965a4b14fa31844856153e6e18f7b`;
- exact-head dedicated run `31659932936` and repository CI `31659932951`;
- paper-branch exact-head canonical CI run `33273832338`: SUCCESS;
- paper-branch exact-head dedicated T2424-1863 run `33273832236`: SUCCESS;
- Ubuntu 24.04.4 / Python 3.11.15 / CPU environment record;
- generated synthetic task with 140 samples/seed, 70/30 split, grid 32, noise SD 0.005;
- four regression tests passed in the hosted reproduction.

These infrastructure/reproduction passes preserve the scientific failure; they do not turn it into a positive result.

## Frozen seed/protocol accounting

The source lineage contains two preserved execution scopes:

- the README predeclares the primary hypothesis across **10 deterministic seeds**;
- the recorded benchmark/default, retained metadata, PR evidence, and reproduction execute **20 deterministic seeds**.

Release accounting is now frozen as follows:

- seeds `0..9` are the literal primary preregistered test;
- the retained 20-seed run is an expanded execution/reproduction under the same >75% gate;
- historical source files remain unchanged;
- neither execution passes the frozen threshold.

Exact-source primary values:

- learned coefficient mean: `0.17950753587054252`;
- persistence RMSE mean: `0.015649163991132017`;
- local-operator RMSE mean: `0.005021982408139878`;
- relative improvement mean: `67.88187868646336%`;
- relative improvement range: `66.69998212218728%–69.58569386836451%`;
- zero-diffusion mean relative improvement: `-0.042850715586669554%`.

Retained expanded 20-seed mean relative improvement: `67.7766211132474%`.

The provenance split is therefore a reporting distinction, not a verdict ambiguity.

## Claim audit stop rules

Release must fail closed if any manuscript sentence implies:

- the >75% gate passed;
- the threshold was revised after observing results;
- FNO, DeepONet, PINO, or another learned operator was beaten;
- statistical significance was established;
- real-PDE, long-horizon, OOD, or mesh-generalization evidence exists;
- this scalar stencil is a neural operator;
- exact-head CI is equivalent to scientific validation;
- the 20-seed expansion replaces or rewrites the literal 10-seed preregistration.

## Failure analysis boundary

The supported failure statement is narrow: the experiment is a **scientific negative under the frozen effect-size criterion**, not an infrastructure failure. The local scalar stencil recovers the planted coefficient and improves one-step RMSE relative to persistence, but the measured improvement remains below >75% in both the literal primary and expanded retained executions.

Possible causes such as observation noise, one-step evaluation, restricted scalar capacity, or persistence strength remain hypotheses only. They must not be presented as experimentally isolated causes.

## Data/code statement

The task uses generated synthetic states and requires no external dataset download. Source, tests, protocol metadata, reproduction instructions, and summarized results are retained under `portfolio/new-projects/t2424-1863-local-diffusion-operator/`.

Release language must point to an immutable commit/archive. Repository inspection has not established an authorized repository-level code/manuscript license, so license applicability remains **SOURCE_BLOCKED for release purposes**. Public GitHub visibility does not imply a release license. Do not claim a data license for generated outputs unless release packaging explicitly provides one.

## PREPRINT_READY checklist

- [x] evidence-matched manuscript draft;
- [x] claim-to-evidence matrix;
- [x] limitations and failure analysis;
- [x] reproducibility/environment statement;
- [x] bounded related-work audit with primary references re-verified;
- [x] data/code statement drafted without overclaim;
- [x] resolve 10-vs-20 seed provenance wording while preserving history;
- [x] explicit table-only release decision given missing immutable raw per-seed artifact;
- [ ] finalize authorship/contribution statement;
- [ ] record authorized license/release metadata;
- [ ] compile PDF from exact manuscript commit;
- [ ] visually inspect rendered PDF;
- [ ] rerun sentence-level claim audit against PDF text, captions, tables, and references;
- [ ] archive exact release artifact and record manuscript/evidence/PDF digests;
- [ ] select final archive/DOI target.

Until every unchecked item is evidenced, status remains **NOT PREPRINT_READY**.
