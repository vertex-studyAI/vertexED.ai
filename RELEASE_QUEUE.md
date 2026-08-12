# RELEASE_QUEUE

As of: 2026-08-12 18:02 IST

## RELEASE NOW

None promoted by this execution pass. Source/test evidence is not treated as production release evidence.

## RELEASE AFTER FIX / MANUAL REVIEW

### T2424-0037 — controlled NLP-to-CAD / NeuroCAD
- Recovery: draft PR #266, head `48f1cbb9035547ec498a0ea09cd0d57453caa916`.
- Gate: exact-head CI must be green; refresh against latest main if necessary; manual research/release review remains required.
- Current label: `IMPLEMENTED, NOT YET VERIFIED ON NEW HEAD`.

### VertexED source
- Current main contains production-identity/build revision and account-scoped learner handoff improvements.
- Gate: exact deployed SHA + authenticated persisted-artifact golden journey + owner-controlled backend/security proof.
- Do not call production-ready from source CI alone.

## NEEDS EXPERIMENT

### Olympus / Hercules architecture line
- Current evidence class: `TESTED_NOT_SCALED` on the inspected research-gate branch.
- Gate: matched-budget O2 baseline/proposed/ablation experiment on real hardware with declared metrics.

### Project 2424 research candidates
- Gate each candidate independently: reproducible setup, baselines, metrics, experiment, analysis, limitations and independent reproduction where required.
- Do not count a numbered project, generated paper or green unit test as research-complete.

## NEEDS CONTENT / TARGET APPLICATION

### FinanceMeta
- Recovery scripts exist and passed recorded validations in PR #261.
- Gate: authorized canonical target application plus product/content QA and role/security verification.

### The Bu1LD
- Portable content recovery exists in PR #261.
- Gate: canonical target access, apply-once review, deployment/hydration checks and allowed/denied role journeys.

## NEEDS SECURITY / PRODUCTION VERIFICATION

### VertexED
- Deployed revision identity, authenticated production journey and owner-controlled Supabase/security checks remain separate gates.

### FinanceMeta
- Normal-member role/privilege escalation denial and persistence remain unverified on live target backend.

## NOT READY

### Percy production/runtime qualification
- Test/qualification artifacts are not enough; canonical live source/state and physical runtime evidence are still blocked.

### Atlas runtime
- No canonical Atlas runtime repository/source is connected on this execution surface.

## RESEARCH-ONLY / DO NOT PROMOTE POSITIVE CLAIM

### LAM-JEPA
- Preserve the negative/inconclusive result; no superiority/mechanism claim is supported by the current evidence boundary.
