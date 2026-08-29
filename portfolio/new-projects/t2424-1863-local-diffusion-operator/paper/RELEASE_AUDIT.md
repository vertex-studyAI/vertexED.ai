# T2424-1863 paper release audit

Decision: **GO for bounded negative-result manuscript closure; NO-GO for PREPRINT_READY.**

## Related-work audit

Verified primary references currently safe to cite:

- Fourier Neural Operator — Zongyi Li et al., arXiv:2010.08895.
- DeepONet — Lu Lu, Pengzhan Jin, George Em Karniadakis, arXiv:1910.03193.
- Physics-Informed Neural Operator — Zongyi Li et al., arXiv:2111.03794.

Use these references only to define relevant operator-learning families and motivate future matched baselines. The present evidence includes none of those comparator runs.

Citation gaps before release:

- [ ] verify a primary reference for classical finite-difference/local-stencil diffusion discretization if the manuscript makes any historical/methodological priority statement;
- [ ] verify any negative-results/preregistration reference before making general claims about publication bias or threshold discipline;
- [ ] do not add citations merely from memory; every bibliography entry must be checked against a primary publisher/arXiv record.

## Figure and table provenance

Currently authorized numerical source: `experiment_metadata.json` and retained benchmark `--json` output only.

Permitted visuals:

1. per-seed diffusion relative improvement with a horizontal 75% frozen threshold;
2. per-seed zero-diffusion relative improvement around zero;
3. learned coefficient distribution versus planted `0.18`;
4. summary table of mean, sample SD, min/max where retained.

Do not fabricate missing per-seed values from summary statistics. If the raw retained `--json` artifact is not mounted in the paper branch, figures requiring individual points remain BLOCKED even though ranges and summary statistics may be reported textually.

## Reproducibility gate

Evidence retained:

- scientific source commit `7cee0bd4d5cc7a3ac497476d322c6f0e16da9ee6`;
- original hosted reproduction run `31411517815`, attempt 3, job `94262839511`;
- exact-head verification PR #302, head `147ce38bf2d965a4b14fa31844856153e6e18f7b`;
- exact-head dedicated run `31659932936` and repository CI `31659932951`;
- Ubuntu 24.04.4 / Python 3.11.15 / CPU environment record;
- seeds `0..19`, 140 samples/seed, 70/30 split, grid 32, noise SD 0.005;
- four regression tests passed in the hosted reproduction.

## Claim audit stop rules

Release must fail closed if any manuscript sentence implies:

- the >75% gate passed;
- the threshold was revised after observing results;
- FNO, DeepONet, PINO, or another learned operator was beaten;
- statistical significance was established;
- real-PDE, long-horizon, OOD, or mesh-generalization evidence exists;
- this scalar stencil is a neural operator;
- exact-head CI is equivalent to scientific validation.

## Identity/protocol discrepancy

The current README contains an older sentence saying the predeclared claim was evaluated "across 10 deterministic seeds," while retained merged evidence, metadata, reproduction, and the negative result use 20 seeds. This pass does **not** rewrite historical evidence. Before release, provenance must establish whether the 10-seed sentence is stale documentation or evidence of an earlier protocol version. Until resolved, the manuscript must describe only the exact retained 20-seed evidence and explicitly disclose the discrepancy.

## Data/code statement

The current task uses generated synthetic data. Code, tests, protocol metadata, and result summaries live in the repository. Final release metadata must identify an immutable commit/archive and verify the applicable repository/code license; do not claim a data license for generated outputs until release packaging specifies one.

## PREPRINT_READY checklist

- [x] evidence-matched manuscript draft;
- [x] claim-to-evidence matrix;
- [x] limitations and failure analysis;
- [x] reproducibility/environment statement;
- [x] bounded related-work audit with verified primary references;
- [x] data/code statement drafted without overclaim;
- [ ] resolve 10-vs-20 seed provenance wording;
- [ ] obtain raw per-seed retained artifact for evidence-derived figures or explicitly ship table-only manuscript;
- [ ] finalize authorship/contribution statement;
- [ ] verify license/release metadata;
- [ ] compile PDF from exact manuscript commit;
- [ ] visually inspect rendered PDF;
- [ ] rerun sentence-level claim audit against PDF text, captions, tables, and references;
- [ ] archive exact release artifact and digest it.
