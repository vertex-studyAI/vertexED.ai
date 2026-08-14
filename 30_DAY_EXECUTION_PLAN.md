# 30_DAY_EXECUTION_PLAN

**Window:** 14 August → 12 September 2026  
**Objective:** reduce active work while increasing evidence quality, reproducibility, publication readiness and external value.

## Global concurrency caps

- maximum **3** major scientific experiments running at once;
- maximum **2** major paper conversions at once;
- maximum **2** major product validation programmes at once;
- no concurrency increase based on logical Percy identity count;
- every run must have a frozen deliverable, evidence destination, success/failure criterion and stop rule.

## Week 1 — compression, evidence audits, paper freeze

### LAM-JEPA — Paper lane 1

**Deliverable:** submission-ready negative-result evidence package, not a new positive hypothesis.

- reconcile manuscript claims against `CL-LAM-*` claim IDs;
- verify each table/figure has `claim -> processed -> raw -> config -> commit` lineage;
- complete conservative related-work/originality audit;
- run manuscript reviewer attack: novelty, experimental fairness, mechanism confounds;
- close license/authorship/citation/provenance gaps;
- do **not** access the locked ARC test and do not rerun seeds to seek significance.

**Week-1 gate:** either `PAPER_PACKAGE_READY_FOR_EXTERNAL_REVIEW` or an exact blocker list with no new scientific tuning.

### IRIS — Paper lane 2

**Deliverable:** decision whether the current negative/tradeoff result is publication-worthy.

- freeze current common-harness result as final for this version;
- originality/prior-art audit focused on robust adaptation/change-point/online robust statistics;
- trace all current numbers to bundle/protocol hashes;
- simulate three skeptical reviewers;
- write negative-result narrative only if failure mechanism/information value is defensible.

**Week-1 gate:** `NEGATIVE_PAPER_CONTINUE` or `ARCHIVE_AS_HIGH_QUALITY_NEGATIVE_PACKAGE`. No successor experiment inside this decision.

### Portfolio / Percy

- reconcile root ledgers, Project 2424 child IDs, stale closeouts and branch lineage;
- mark old status files historical, not competing authorities;
- recover real-host Percy SQLite/WAL/worker state if host becomes accessible;
- if host remains inaccessible, keep operational counters `UNKNOWN` and finish host-qualification script/runbook instead.

**Week-1 gate:** one canonical source per serious project; no ambiguous duplicate present-tense status.

### Products

**VertexED only** is active product validation in the first half of the week.

- identify canonical Vercel project/domain path;
- require exact immutable revision in `/api/health` body/header;
- rerun public monitor without weakening revision assertion;
- prepare/execute disposable authenticated golden journey only when secure identities are available.

FinanceMeta/The Bu1LD remain blocked until the access surface needed for their actual production gates is available.

---

## Week 2 — strong baseline and ablation attacks

Run no more than three scientific experiments concurrently. Preferred order by expected information gain:

### Experiment lane A — NeuroCAD decisive gate

Freeze before running:

- same-provider learned direct-generation baseline;
- typed-IR generation path using the same provider/model budget;
- retrieval/template control;
- authored held-out compositional/new-part-family split;
- syntax validity, geometry validity, executable success, semantic accuracy, invalid rejection, complexity scaling and failure taxonomy;
- parameter/token/tool-call budget and seeds where stochastic.

**Falsifier:** typed IR fails to improve the predeclared primary reliability metric over the strongest direct baseline after budget matching.

**Outcome:** promote to research paper, retain as product-only system, or negative result.

### Experiment lane B — choose exactly one: APEN or NPMS

**APEN path** if a naturalistic task and matched learned controls can be frozen cheaply.  
**NPMS path** if causal intervention/invariant parameter controls can be implemented more decisively.

Do not run both merely because compute is available.

### Experiment lane C — Darcy only after learned controls are executable

Freeze FNO/DeepONet/U-Net/ROM-style comparison appropriate to the task, parameter/compute matching rule, held-out physical regimes and OOD metrics. If a credible learned baseline cannot be implemented fairly, do not spend the week on surrogate architecture tuning.

### Closed scientific lines

- NGMT v0.1: no rescue run.
- Eigen-JEPA current primary claim: no metric-switch rescue; only provenance reconciliation and preregistered multi-dataset follow-up.
- T2424-1863 current version: no further compute.

---

## Week 3 — manuscripts, external validation, product validation

### Papers

- send LAM-JEPA package for independent reproduction/reviewer attack;
- if IRIS passed Week-1 information-value gate, send negative package to robust-statistics/time-series reviewer;
- convert NeuroCAD to manuscript only if Week-2 learned/OOD gate survives;
- update figures/tables only from frozen artifacts; decorative evidence-looking plots are prohibited.

### External validation

Execute the top entries in `EXTERNAL_VALIDATION_QUEUE.md`; record validator identity/relationship category without fabricating independence, exact artifact sent, requested action, feedback and outcome.

### Products

Run at most two programmes:

1. VertexED exact-deployment + authenticated certification if still open.
2. FinanceMeta **or** The Bu1LD, whichever first has canonical repo + production backend access.

For each, prioritize one golden journey, authorization boundary, reliability and observable activation over new features.

---

## Week 4 — release/submission candidates and next research gates

### Release candidates

For each surviving release candidate require:

- clean canonical repository;
- README/install/quickstart/examples;
- tested reproduction command;
- limitations/non-claims;
- license decision;
- citation metadata when appropriate;
- model/data card when relevant;
- secret/private-data scan;
- evidence provenance;
- external validation status explicitly separated from internal verification.

### Submission candidates

Use `SUBMISSION_MATRIX.md` and only advance packages whose evidence matches the venue class. No prestige-driven target inflation.

### Portfolio re-score

Recompute scores only from new evidence. Promote, kill or archive each active line. The month ends with fewer active projects than it began.

---

## Day-level operating contract

Every execution day:

1. **Recover:** read canonical heads, current ledgers, blockers, failed/stale tasks and external evidence.
2. **Verify:** identify what materially changed since the prior checkpoint.
3. **Prioritize:** rank by information gain × closure probability ÷ remaining cost.
4. **Execute:** smallest decisive experiment/verification first.
5. **Independent check:** verifier must not silently repair failed evidence.
6. **Record:** raw artifact, processed metric, hash, config, commit, environment/runtime.
7. **Update claim:** only the affected claim IDs.
8. **Kill/promote:** no indefinite `IN_PROGRESS` state.
9. **Queue:** dependency-aware tasks only; vague `investigate X` is rejected.

## 30-day success criteria

The plan succeeds only if by 12 September:

- LAM-JEPA is externally reviewable or published/released as a clearly bounded negative package;
- IRIS current version is either a defensible negative paper package or archived as a high-quality negative result;
- NeuroCAD has faced a competent learned/OOD baseline attack and has an unambiguous research-vs-product decision;
- at least one of APEN/NPMS/Darcy receives a decisive stronger-baseline result, not three shallow studies;
- Percy has real-host qualification evidence or one explicit external blocker with a ready qualification bundle;
- VertexED production state is based on exact served revision + authenticated evidence, not CI alone;
- FinanceMeta/The Bu1LD are validated only if real production access exists;
- the Project 2424 active research set is smaller;
- no negative result has been retuned into a positive claim.
