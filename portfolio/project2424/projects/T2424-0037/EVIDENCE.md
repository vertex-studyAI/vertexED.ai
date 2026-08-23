# NeuroCAD — Evidence Ledger

This file is a pointer ledger. It does not replace the underlying raw artifacts, test outputs, PRs or historical result files.

## Historical research evidence

### Frozen v1

- controlled deterministic benchmark: 20/20 on controlled set;
- frozen held-out result: typed + validated 19/20 (`0.95`);
- original direct baseline: 12/20 (`0.60`);
- O018 signed-negative failure retained;
- historical valid held-out OpenSCAD execution: 12/12 non-empty STL.

Primary repository evidence:

- `STATUS.md`
- `CLAIM.md`
- held-out benchmark files/workflow
- historical independent artifact audit

### Matched-validation mechanism diagnostic

- typed + validated: `1.00`;
- direct + matched validation: `1.00`;
- original direct: `0.60`;
- `validation_recovery_fraction = 1.00`;
- verdict: `VALIDATION_DOMINANT`.

Primary repository evidence:

- `NEUROCAD_COMPONENT_ABLATION_PROTOCOL_20260814.md`
- `NEUROCAD_COMPONENT_ABLATION_RESULT_20260814.md`
- `benchmark/component_ablation_evaluate.mjs`
- component-ablation GitHub Actions workflow.

## Alpha product evidence

Recorded release evidence includes:

- deterministic 125-case product QA;
- real Chromium/WebGL source certification;
- interactive viewport operations;
- stateful parameter regeneration;
- fail-closed invalid edits preserving the last valid document;
- CADSpec JSON and OpenSCAD downloads;
- OpenSCAD backend certification;
- explicit release/scope documentation.

Primary repository evidence:

- `NEUROCAD_ALPHA_PRODUCT_VALIDATION_20260822.md`
- `DEMO.md`
- `SAFETY_AND_SCOPE.md`
- `e2e/neurocad-alpha.spec.ts`
- `.github/workflows/neurocad-alpha-browser.yml`
- OpenSCAD certification workflow.

## Recent product changes

### PR #454 — flanged-tube edit/regeneration

Merged. Adds stateful bounded parameter regeneration and fail-closed edit regressions.

### PR #459 — external pilot kit

Merged. Adds `EXTERNAL_PILOT.md` and `PILOT_FEEDBACK_TEMPLATE.md`.

### PR #460 — engineering OD shorthand

Merged. Adds bounded `OD` / `flange OD` interpretation with create/edit regressions. Exact PR-head workflows passed canonical CI, browser certification, OpenSCAD certification, held-out benchmark and component-ablation diagnostic.

## Deployment evidence

Current gate: **NOT VERIFIED**.

- GitHub issue #431 tracks G12.
- The production job checks the live `https://www.vertexed.app/neurocad/` artifact identity before running the production browser smoke.
- Recent main-branch failure notifications are consistent with this intentionally strict production gate.
- Do not cite PR-head browser certification as proof of live deployment.

## External validation evidence

Current gate: **NOT VERIFIED**.

- GitHub issue #458 tracks external pilots.
- 15 targeted invitations were sent on 2026-08-23.
- `EXTERNAL_PILOT.md` standardizes the test.
- `PILOT_FEEDBACK_TEMPLATE.md` standardizes evidence capture.
- As of this ledger update, no external engineer/team has completed a recorded pilot.

## Successor research evidence

Historical PR #430 proposed a stronger 150-case successor protocol with matched baselines, predeclared falsifiers, mechanism ablations and external benchmark adapters.

Current truth:

- PR #430 was closed unmerged;
- no successor performance result exists;
- the proposed protocol explicitly remained `DATASET_AND_MODEL_IDENTITY_BLOCKED`;
- historical v1/v2 results remain immutable.

## Claim rule

A claim may move to VERIFIED only when this ledger can point to the exact version, test/evaluator, observed result and retained evidence. No inference from outreach, source presence, or visual plausibility is sufficient.
