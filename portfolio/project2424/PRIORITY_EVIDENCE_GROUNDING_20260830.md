# Project 2424 priority evidence grounding — 2026-08-30

Purpose: replace summary-only readiness assumptions with exact branch/source/result anchors for the six highest-priority evidence lanes. This document records repository evidence only. It does **not** assign readiness credit that has not been audited dimension-by-dimension, and it does not promote any lane to submission-ready.

## Grounding rule

- Exact source/result identities are recorded by commit, PR, workflow, artifact, or retained file.
- Open paper branches are treated as branch evidence, not as merged canonical-main state.
- Negative, mixed, falsified, and blocked outcomes remain unchanged.
- Release polish never overrides a failed scientific gate.
- T/P identity mappings are never inferred from numeric suffix alone.

## 1. T2424-0027 — synthetic parent + real-encoder v3 successor

### Synthetic parent paper lane

Paper branch PR: `#568`

Exact paper head: `48687df1a7c5bf265524876a82442a810849ce5f`

Exact-head canonical CI: run `33256565985` — `SUCCESS`.

Retained parent result remains a deterministic synthetic language-leakage mechanics result:

- raw concept accuracy: `1.0`
- raw language accuracy: `1.0`
- centered concept accuracy: `1.0`
- centered language accuracy: `0.3611111111111111`
- chance language accuracy: `0.3333333333333333`
- normalized excess leakage reduction: `0.9583333333333334`
- global-centering language accuracy: `1.0`
- verdict: `PASS_CONTROLLED_LANGUAGE_LEAKAGE_MECHANICS`
- independent output SHA-256: `0eac35dd7b8af1488efab0392c2e82dab8f9a90332af7c6ad54633263fa13605`

Boundary: synthetic mechanics only; no linguistic-relativity, cognition, translation-quality, real multilingual encoder, or broad representation-learning claim.

### Real-encoder v3 successor

Outcome-bearing branch PR: `#580`

Current exact head: `2271e867200783c810ef94d8b9129d0b9f61dd9b`.

Frozen preregistration commit: `a3fc8fb13c600ec5a7b5a3bc4379b88c80a11c7a`.

First authorized outcome-bearing execution source: `0e9d7c9ad4abd61b8996303fdcd45579b898f327`.

Execution evidence:

- execution run: `33307308534`
- retained artifact: `9730910606`
- artifact ZIP SHA-256: `5bebd21c4e0b763a68c100c58bdea10d1822550d08fcda505ed65c84eb44a757`
- retained exact result file: `portfolio/project2424/projects/T2424-0027/real_encoder/retained_v3_primary/RESULT.md`
- retained per-seed metrics, summary, verdict, descriptive uncertainty and SHA-256 manifest live beside the result file

Exact-head integrity workflows:

- `T2424-0027 v3 Authorization Lock` run `33311129800` — `SUCCESS`
- `T2424-0027 v3 Result Integrity` run `33311129853` — `SUCCESS`

Frozen primary verdict: **`FAIL_PREDECLARED_REAL_ENCODER_GATE`**.

Primary means versus frozen gate:

| Metric | Observed | Frozen gate | Result |
|---|---:|---:|---|
| Raw language accuracy | 0.49236 | >= 0.75 | FAIL |
| Effect retention | 0.87133 | >= 0.70 | pass |
| Intent drop | -0.00249 | <= 0.02 | pass |
| Specificity margin | 0.81686 | >= 0.15 | pass |
| Seed passes | 0 / 5 | >= 4 / 5 | FAIL |

All five frozen seeds missed the raw-language-accuracy floor. This verdict is terminal for v3. The strong/specific centering effect does not convert the failed preregistered gate into a success. Any successor must be a new preregistration.

Current evidence decision: **GROUND RESULT AS NEGATIVE; UPDATE PAPER/READINESS STATE BEFORE ANY SCORE INCREASE.**

## 2. T2424-0025 — bounded robust-readout precursor

Paper branch PR: `#567`.

Exact head: `6e83abb43f16309ce15ec873cdfd46a4671169d7`.

Exact-head CI: run `33292160578` — `SUCCESS`.

Independent reproduction anchor recorded by the paper branch: merge `715aea0b632c70493c226a84473d77ff7ca8cfc6`.

Frozen experiment source recorded by the project: `0d2a14e559b0caa9b5b1cbeef0995013594ecf15`.

Reproduced output digests:

- screen: `7b26bfcf82444b1de868092c8391a3772bd4e6acc5d64468839f9af6290a3db1`
- ablation: `f61dd31562ce2f5638535a90ab2d700aed494790e9aca515797595158ee9ee4e`

Critical negative control remains mandatory: at 0% Cauchy contamination, weighted-median MAE `0.0125699` versus arithmetic-mean MAE `0.0246469`, approximately 49% relative reduction. Therefore the observed effect does not isolate a uniquely heavy-tail/non-Gaussian mechanism.

Paper branch contains manuscript, related-work audit, evidence-derived figures, figure provenance and release checklist.

Current public-release verdict on the branch: **`NO-GO / NOT PREPRINT_READY`**.

Remaining explicit release blockers: authorship/contributions, license/release decision, clean PDF compilation/visual audit, final sentence-level claim review.

Current evidence decision: **PAPER CLOSURE LANE; DO NOT CLAIM UNIQUE NGMT/TRANSFORMER/LEARNED-MEMORY MECHANISM.**

## 3. T2424-1863 — frozen negative local diffusion operator

Paper branch PR: `#575`.

Current exact head: `dc12815f0fd84b58d06ed29979d8c82995070e0e`.

Exact-head verification:

- CI run `33294975723` — `SUCCESS`
- dedicated `Project 2424 T2424-1863 local diffusion operator` run `33294975754` — `SUCCESS`

Frozen scientific verdict remains negative: the bounded synthetic local operator recovered the planted coefficient and reduced one-step error but failed the preregistered `>75%` improvement gate.

Seed provenance is explicitly split rather than rewritten:

- literal preregistered primary test: seeds `0..9`
- retained expanded execution/reproduction: 20 seeds
- 10-seed primary mean relative improvement: `67.88187868646336%`
- retained 20-seed mean relative improvement: `67.7766211132474%`

The branch explicitly prohibits FNO/DeepONet/PINO superiority claims because those baselines were not run.

Current release state: **`NOT PREPRINT_READY`**.

Remaining explicit gates: authorship/contributions, authorized license/release metadata, clean PDF/render audit, sentence-level rendered-claim audit, immutable manuscript/evidence/PDF digests, archive/DOI choice.

Current evidence decision: **RIGOROUS NEGATIVE PAPER CANDIDATE; NEVER RESCUE-TUNE OR REFRAME AS POSITIVE.**

## 4. T2424-0050 — Darcy Latent Operator

Paper branch PR: `#576`.

Exact head: `2e208c0da05978b771bb162888136966ecfe6b86`.

Exact-head CI: run `33263182158` — `SUCCESS`.

Scientific state remains **`HOLD / MIXED_ROBUSTNESS`**.

Required retained limitations include:

- rho=0 harder-audit miss
- seed-6 reversal
- no learned-operator/FNO/DeepONet/PINN/POD comparator claim
- no SOTA, 2D/3D, real porous-media, or broad-generalization claim

The current paper branch is a bounded manuscript closure package only. It does not authorize a new Darcy successor run.

Current public-release gate remains blocked on release metadata, independent sentence-level claim audit, clean PDF/render audit, immutable artifact digests and novelty decision.

Current evidence decision: **KEEP PARENT HOLD/MIXED. ANY 2D SUCCESSOR MUST REMAIN A SEPARATE FROZEN PROTOCOL.**

## 5. T2424-0037 — NeuroCAD scientific lineage

Evidence/paper branch PR: `#571`.

Exact head: `895f347a5a47e25e19fb3f63e562763897973bf5`.

Exact-head workflows all green:

- CI `33265974224`
- NeuroCAD held-out template benchmark `33265974244`
- NeuroCAD component ablation diagnostic `33265974229`
- NeuroCAD Alpha OpenSCAD certification `33265974231`
- NeuroCAD Alpha browser certification `33265974243`

Scientific boundary remains unchanged:

- historical v1 retained `19/20` typed+validated versus original direct `12/20`
- matched-validation diagnostic remains **`VALIDATION_DOMINANT`**
- direct+validation matching typed+validated reaches `1.00`
- `validation_recovery_fraction = 1.00`
- typed-parser-specific causal interpretation remains falsified on the reused 20-case diagnostic
- reused component cases are not relabeled as held-out/OOD
- S3 is a separate unexecuted confirmatory lineage unless and until separately authorized
- unresolved `T2424-0007` / `T2424-0037` identity conflict must not be solved by suffix inference

Product QA and deployment evidence are not scientific validation.

Current evidence decision: **GROUND AS MECHANISM FALSIFICATION / VALIDATION-DOMINANT. KEEP IDENTITY AND S3 GATES OPEN.**

## 6. NGMT v0.1 — frozen learned B0-B3 Transformer line

NGMT v0.1 is distinct from the bounded T2424-0025 precursor even where older portfolio records conflate naming.

Canonical execution evidence from merged PR `#314`:

- four-arm B0/B1/B2/B3 tiny Transformer experiment
- all arms: 6,049 trainable parameters
- B1/B2/B3: equal 18-scalar runtime-memory capacity
- 3 paired seeds x 4 arms = 12 scientific runs
- first valid scientific run: `31661313386`
- first valid artifact: `9166307730`
- artifact digest: `ec7d88d342271ad28b6f9ae485338985a219b7d43d55dd45350a4611c585ce76`
- raw `results.json` SHA-256: `f8feeccc6ca864efc6389c9e8b9b952698d349251d332f81735c542913f33b14`
- unchanged-protocol replay run: `31661621771`
- replay artifact: `9166406618`
- replay artifact digest: `5a34b13b54761e894b5cd3de2941c44121ea39705f8588e83aaf8a18dd2d7d06`

Frozen verdict: **`NEGATIVE_OR_INCONCLUSIVE_NGMT_V01`**.

Primary retained effects:

- B3 adverse MSE improvement over B2: `+0.4946% +/- 1.5472%` sample SD, n=3; required `>=5%`
- B3 adverse MSE improvement over B1: `+0.4393% +/- 1.1529%`; required `>=3%`
- B3 clean-Gaussian regression vs B2: `+0.9600% +/- 2.7060%`; inside the `<=2%` guardrail

Thus fairness/execution gates pass while both scientific-effect gates fail.

Merged PR `#562` freezes a separate clean-room independent reproduction protocol at merge `875d1a182d9d7e58a3d19c6fcf5e04b97d3d6faa`. Issue `#563` remains the execution gate for that genuinely separate reproduction.

Current evidence decision: **NEGATIVE/INCONCLUSIVE LEARNED RESULT IS REAL AND REPLAYED; INDEPENDENT CLEAN-ROOM REPRODUCTION REMAINS OPEN. DO NOT MERGE THIS IDENTITY WITH T2424-0025 BY NAME OR SUFFIX.**

## Readiness-score consequence

This grounding pass is evidence-changing but not score-inflating. Do not populate or raise the conference-readiness score for a lane until each scoring dimension is checked against the exact retained artifacts above and the hard caps in `CONFERENCE_READINESS_SCORING_20260830.md` are applied.

Immediate next scoring work:

1. update T2424-0027 to reflect the retained **negative v3 real-encoder result** rather than an authorization-only state;
2. score T2424-0025, 1863, 0050 and 0037 only from their exact paper/result branches;
3. keep NGMT v0.1 separate from T2424-0025 and score the learned line from PR #314 + replay + independent-reproduction status;
4. leave authorship/license/PDF/identity/external-validation gates at zero where they remain unresolved.
