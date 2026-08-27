# NeuroCAD — Evidence Ledger

This file is a pointer ledger. It does not replace the underlying raw artifacts, test outputs, PRs or historical result files.

**Truth refresh:** 2026-08-27.

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

The mechanism diagnostic falsifies a typed-parser-specific causal interpretation on the reused 20-case diagnostic. It does not erase the historical v1 system result and must not be retuned to rescue that mechanism claim.

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

Current gate: **G12 NOT VERIFIED**.

Verified deployment/provenance facts:

- deterministic NeuroCAD artifact publication exists on the dedicated `neurocad-public` release path;
- exact source/artifact identity is retained by the release machinery;
- merged PR #520 records the confirmed failure mode of the jsDelivr candidate: HTML is served as `text/plain`, so the immutable CDN is valid artifact transport but not an executable browser host;
- the production browser gate therefore requires an accepted executable canonical host rather than treating artifact visibility as deployment completion.

Still required:

- an executable accepted public NeuroCAD route serving the intended artifact;
- served source/artifact identity evidence;
- unchanged flagship Playwright/browser smoke PASS against that public route;
- only then may issue #431/G12 close.

Do not cite PR-head browser certification or a downloadable CDN artifact as proof of public deployment.

## External validation evidence

Current gate: **G13 NOT VERIFIED**.

- GitHub issue #458 tracks external pilots.
- 15 targeted invitations were sent on 2026-08-23.
- `EXTERNAL_PILOT.md` standardizes the test.
- `PILOT_FEEDBACK_TEMPLATE.md` standardizes evidence capture.
- no completed external engineer/team pilot is currently retained in the public project evidence.

Outreach, interest, methodological advice, or a scheduled walkthrough do not by themselves satisfy G13.

## Successor research evidence

The 150-case successor research gate is now represented on `main`; the old statement that it exists only in closed PR #430 is stale.

Current retained successor evidence:

- `S3_SUCCESSOR_PROTOCOL_20260822.md` — frozen research question, 150-case benchmark shape, H1/H2/H3 thresholds, falsifiers, B0-B3 baseline requirements, ablations, statistics, split/freeze order and authorization gate;
- `benchmark/s3_successor_manifest.json` — machine-readable successor protocol surface;
- `benchmark/generate_s3_execution_authorization.mjs` — authorization-generation surface;
- `benchmark/s3_external_adapter_registry.json` — external benchmark identity registry;
- `benchmark/validate_s3_external_adapter_registry.mjs` and regression tests — fail-closed guards.

### External adapter identity state

Registry status: `IDENTITIES_VERIFIED_NOT_MATERIALIZED`.

- CADTestBench is selected as the primary executable semantic/geometric/topological adapter;
- MUSE is selected as the secondary engineering-design/rubric adapter;
- Text2CAD-Bench is retained as preview/related-work evidence rather than counted as a full materialized adapter;
- AssemCAD remains a code/reference identity until dataset identity/licensing is verified;
- required materialized adapters: 2;
- current materialized adapters: 0;
- confirmatory execution authorized: `false`.

### Successor result state

- no S3 confirmatory performance result exists;
- exact dataset revisions/content hashes are not yet frozen;
- provider/model identity and matched model-based baselines are not yet frozen;
- evaluation split must remain unopened until the authorization contract is satisfied;
- historical v1/v2 results remain immutable.

## Claim rule

A claim may move to VERIFIED only when this ledger can point to the exact version, test/evaluator, observed result and retained evidence. No inference from outreach, source presence, artifact transport, visual plausibility, or an unexecuted protocol is sufficient.
