# RELEASE_QUEUE

As of: 2026-08-12 execution pass

## RELEASE NOW

None promoted by this execution pass. A merge or green source test is not automatically a production/scientific release.

## MERGED / NEEDS NEXT EVIDENCE GATE

### T2424-0037 — controlled NLP-to-CAD / NeuroCAD
- Recovery PR #266 is merged.
- Initial recovery CI exposed one benchmark-evaluator syntax defect with 348/349 tests passing.
- Repair commit `7c79da9a...` corrected the unterminated safety regex and canonical CI run #914 succeeded.
- Current label: `TESTED + MERGED`, **not** `RELEASED` or `RESEARCH_COMPLETE`.
- Next gates: real OpenSCAD/CAD-kernel execution, geometry verification, broader prompt robustness, independent reproduction.

### FinanceMeta authorization/notification-integrity overlay
- Latest observed control-repo `main` commit `ceedf60ba...` integrates the additive recovery overlay.
- Current label: `CONTROL-REPO INTEGRATED`, not target-applied or live-verified.
- Next gates: authorized target migration application + live role/notification denial-path and persistence proof.

## RELEASE AFTER PRODUCTION VERIFICATION

### VertexED source
- Source includes production-identity/build-revision and account-scoped learner-handoff improvements.
- Gate: exact deployed SHA + authenticated persisted-artifact golden journey + owner-controlled backend/security proof.
- Do not call production-ready from source CI alone.

## NEEDS EXPERIMENT

### Olympus / Hercules architecture line
- Current evidence class: `TESTED_NOT_SCALED` on inspected research-gate work.
- Gate: matched-budget O2 baseline/proposed/ablation experiment on real hardware with declared metrics.

### Project 2424 research candidates
- Gate independently: reproducible setup, baselines, metrics, experiments, analysis, limitations and independent reproduction where required.
- Do not count a numbered project, generated paper, merge, or green unit test as research-complete.

## NEEDS CONTENT / TARGET APPLICATION

### The Bu1LD
- Portable content recovery exists in PR #261.
- Gate: canonical target access, apply-once review, deployment/hydration checks and allowed/denied role journeys.

## NEEDS SECURITY / PRODUCTION VERIFICATION

### VertexED
- Deployed revision identity, authenticated production journey and owner-controlled Supabase/security checks remain separate gates.

### FinanceMeta
- Normal-member role/privilege escalation denial, notification integrity and persistence remain unverified on the live target backend.

## NOT READY

### Percy production/runtime qualification
- Test/qualification artifacts are not enough; canonical live source/state and physical runtime evidence are still blocked.

### Atlas runtime
- No canonical Atlas runtime repository/source is connected on this execution surface.

## RESEARCH-ONLY / DO NOT PROMOTE POSITIVE CLAIM

### LAM-JEPA
- Preserve the negative/inconclusive result; no superiority/mechanism claim is supported by the current evidence boundary.
