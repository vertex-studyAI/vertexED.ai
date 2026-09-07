# NeuroCAD / T2424-0037 Preprint Readiness — Evidence-Bounded Gate

Status: **NO-GO / NOT PREPRINT_READY**

This document freezes the current paper boundary for the evidence-bearing NeuroCAD scientific lineage. Publication accounting uses `T2424-0037` exactly once while `T2424-0007` remains identity-conflict blocked under issue #527. This file does not infer an alias from shared naming or numeric suffixes.

## Canonical scientific boundary

The strongest defensible story is **validation-dominant reliability in a bounded text-to-parametric-CAD system**, not a typed-parser causal breakthrough.

Retained findings that must appear together:

- Historical v1 held-out system result: typed + validated `19/20` (`0.95`) versus the original direct baseline `12/20` (`0.60`).
- Historical valid held-out OpenSCAD execution: `12/12` valid cases produced non-empty STL.
- Historical failure O018 remains retained.
- Later matched-validation component diagnostic on the reused 20 cases:
  - typed + validated: `1.00`;
  - direct + matched fail-closed validation: `1.00`;
  - original direct: `0.60`;
  - `validation_recovery_fraction = 1.00`;
  - frozen interpretation: `VALIDATION_DOMINANT`.

The matched diagnostic falsifies a typed-parser-specific causal interpretation on the reused cases. It does not erase the historical v1 system result.

## Exact retained mechanism evidence

Component-ablation source/protocol commit: `2cd90f30b4299acf52b110b8a5bc5784fa9fc8b8`.

Workflow: `31777954088` (`SUCCESS`).

Artifact: `9210587354`.

Artifact SHA-256: `b05facbec0ef17b81d618e604ffa120a1f75ba3ae9579bcd1b4d7b9500985d5c`.

Environment retained by the workflow: Node `v22.23.1`, npm `10.9.8`, Ubuntu/Azure Linux kernel `6.17.0-1020-azure`.

## Claim-to-evidence matrix

| Candidate claim | Current evidence | Verdict |
|---|---|---|
| Explicit fail-closed validation improves reliability over the original direct extractor on the reused diagnostic. | B0 `0.60`; B1 direct + matched validation `1.00`. | **SUPPORTED, BOUNDED** |
| The typed/structured path uniquely causes the diagnostic advantage. | B1 direct + matched validation matches M2 typed + validated at `1.00`; recovery fraction `1.00`. | **FALSIFIED ON REUSED DIAGNOSTIC** |
| The historical frozen v1 system outperformed the original direct baseline on its retained held-out benchmark. | `19/20` versus `12/20`. | **SUPPORTED AS HISTORICAL SYSTEM RESULT** |
| NeuroCAD generalizes to new part families / OOD prompts. | Existing component diagnostic is explicitly reused; S3 confirmatory benchmark is not executed. | **UNSUPPORTED** |
| NeuroCAD is superior to contemporary LLM/CAD-program generators. | Required matched provider/model baselines are not frozen/executed. | **UNSUPPORTED** |
| NeuroCAD is manufacturing-correct. | No completed confirmatory manufacturability study or external engineer validation. | **UNSUPPORTED** |
| NeuroCAD has external expert validation. | Pilot kit exists; no completed external engineer/team pilot is retained. | **UNSUPPORTED / OPEN** |
| Public deployment is verified. | Artifact transport exists, but executable accepted public route/browser gate remains unverified. | **UNSUPPORTED / G12 OPEN** |

## Manuscript structure that can be assembled now

### Methods — bounded historical + diagnostic sections

The paper can document the historical system pipeline, direct baseline, fail-closed validation behavior, exact 20-case component-diagnostic protocol, execution/geometry criteria, and frozen interpretation thresholds.

### Results — historical result plus mechanism falsification

Both result generations must be shown. The `19/20` versus `12/20` historical comparison cannot be presented without the later finding that matched validation closes the gap on the reused diagnostic.

### Failure analysis — required

The paper must state that the later diagnostic falsifies the typed-parser-specific causal story on those reused cases. It must retain O018 and any other frozen failures instead of replacing them with repaired current-version behavior.

### Product evidence — separate from scientific evidence

The 125-case alpha QA, Chromium/WebGL certification, stateful edit/regeneration behavior, OpenSCAD backend checks, and release machinery may be discussed as engineering evidence. They must not be counted as held-out research validation, external validation, or public deployment proof.

## S3 successor boundary

The S3 successor protocol is a **new confirmatory lineage**, not a license to reinterpret v1/v2. Current state:

- protocol exists on `main`;
- external adapter identities selected but not materialized;
- exact dataset revisions/content hashes not frozen;
- provider/model identities and matched model baselines not frozen;
- confirmatory execution authorization is `false`;
- no S3 confirmatory performance result exists.

Do not access/open the confirmatory evaluation split until the authorization contract is satisfied.

## Release gate

`PREPRINT_READY` requires all of the following:

- [x] evidence-bearing scientific lineage is counted once under `T2424-0037` pending authoritative identity crosswalk;
- [x] historical v1 result is retained;
- [x] matched-validation causal falsification is retained;
- [x] exact component-ablation source/workflow/artifact identity is documented;
- [x] reused diagnostic is explicitly not relabeled held-out/OOD;
- [ ] genuinely new held-out/OOD prompt benchmark is frozen and executed, or manuscript is explicitly scoped as historical/diagnostic only;
- [ ] matched contemporary direct/program-generation baselines are executed if broader capability claims are desired;
- [ ] exact geometry/topology/dimension/constraint/editability/manufacturability criteria are finalized for any successor evaluation;
- [ ] completed external expert walkthrough/stress evidence is retained if external-validation language is desired;
- [ ] current primary-source related-work audit is complete;
- [ ] final evidence-derived tables/figures and failure taxonomy are assembled;
- [ ] authorship/contribution and license/code/data statements are complete;
- [ ] clean manuscript/PDF is compiled and visually audited;
- [ ] sentence-level claim audit confirms no typed-parser causal claim survives the matched-validation falsifier.

## Stop rules

Do not tune on the reused 20-case component diagnostic to recover a typed-IR advantage. Do not count product QA as scientific OOD validation. Do not count outreach as external validation. Do not count artifact hosting as executable public deployment. A negative S3 result is a valid terminal outcome and must remain visible.
