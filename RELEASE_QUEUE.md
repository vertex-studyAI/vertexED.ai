# RELEASE_QUEUE

As of: 2026-08-12 execution pass

## RELEASE NOW

None promoted by this execution pass. A merge, archive, or green source test is not automatically a production/scientific release.

## MERGED / NEEDS NEXT EVIDENCE GATE

### T2424-0037 — controlled NLP-to-CAD / NeuroCAD
- Recovery PR #266 is merged.
- Initial recovery CI exposed one benchmark-evaluator syntax defect with 348/349 tests passing.
- Repair commit `7c79da9a...` corrected the unterminated safety regex and canonical CI run #914 succeeded.
- Current label: `TESTED + MERGED`, **not** `RELEASED` or `RESEARCH_COMPLETE`.
- Next gates: canonical real OpenSCAD/CAD-kernel execution, geometry verification, broader prompt robustness, independent reproduction / same-provider learned comparison if pursuing paper claims.

### T2424-0025 — robust-readout ablation
- Replacement PR #271 rebuilt the exact ablation on current main; exact-head CI #918 was green and it merged as `5ee79ab8...`.
- Current label: `TESTED + MERGED / MECHANISM INCONCLUSIVE`.
- Next gate: redesign the baseline/control because 0% contamination also favors robust readouts; do not claim contamination-specific mechanism yet.

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

### Olympus runtime
- Current evidence class: `O0 DETERMINISTIC RUNTIME EVIDENCE`; current #257 head CI #925 is green.
- Gate: preregistered matched-provider ~100-task O1 comparison.
- Hermes/Prometheus/Perseus/Atlas/Kronos remain runtime-role/speculative-scale names, not trained model evidence.

### Hercules learned architecture
- Gate: matched-budget baseline/proposed/ablation experiments on real hardware with identical data/tokenizer/parameter/optimizer/training/evaluation budgets plus loss/throughput/memory/downstream/stability metrics.

### Project 2424 research candidates
- Gate independently: reproducible setup, baselines, metrics, experiments, analysis, limitations and independent reproduction where required.
- Do not count a numbered project, generated paper, merge, or green unit test as research-complete.

## FRESH LOCAL REPRODUCIBILITY / EXTERNAL GATES OPEN

### Research Atlas V4
- PR #262 records 39/39 tests, 18 flagship reruns, named extensions, 18 manuscript recompiles, validator pass and regenerated 769-file release archives with checksums, followed by re-extract/retest.
- Gate: independent external replication and selective submission/review. The 512 registry is not 512 completed papers.

## NEEDS CONTENT / TARGET APPLICATION

### The Bu1LD
- Exact-SHA truth/proof-density content recovery exists in PR #261.
- Gate: canonical target access, apply-once review, deployment/hydration checks and allowed/denied role journeys.

### FinanceMeta public content
- Exact-SHA truth-first recovery exists in PR #261 and removes/rewrites unsupported impact/partner claims from the audited targets.
- Gate: target write access, isolated application, build/test/security and deployment verification.

## NEEDS SECURITY / PRODUCTION VERIFICATION

### VertexED
- Deployed revision identity, authenticated production journey and owner-controlled Supabase/security checks remain separate gates.

### FinanceMeta
- Normal-member role/privilege escalation denial, notification integrity and persistence remain unverified on the live target backend.

## NOT READY

### Percy production/runtime qualification
- Current #257 has green source/test evidence, but actual Mac crash/restart, provider integration, contention and long-run physical qualification remain blocked.

### Atlas runtime
- No canonical Atlas runtime repository/source is connected on this execution surface; do not confuse the Research Atlas archive with a runtime system named Atlas.

## RESEARCH-ONLY / DO NOT PROMOTE POSITIVE CLAIM

### LAM-JEPA
- Preserve the negative/inconclusive result; no superiority/mechanism claim is supported by the current evidence boundary.
