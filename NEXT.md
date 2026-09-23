# Next

## Current engineering release boundary

Snapshot date: **2026-09-23**.

Canonical repository source is `main@2ca208c8ffd10c83005f3afe65057bc847277d5f`, the verified merge of PR #1057. Do not infer deployment state from repository source alone.

The newest scheduled production evidence on that exact source is:

- Production Health Monitor `35824818620`: **FAILURE**;
- Production Transport Diagnostics `35824877967`: **SUCCESS** as evidence collection;
- retained health artifact `10734722999`, digest `sha256:57da9cb72dcb5cb5257942fa593d2cbf7ea0e68a0092a5d30f925c4f0ed0d489`;
- retained transport artifact `10734513262`, digest `sha256:9c42548422355f3f5134f5ced28a559eb0362bc673d7f2bfd722bfaad4292d6c`.

Both artifacts are bound to exact `main@2ca208c8ffd10c83005f3afe65057bc847277d5f`; the health artifact was created at `2026-09-23T06:01:32Z` and the transport artifact at `2026-09-23T06:01:57Z`.

The scheduled health job verified its source binding and production-health contracts, collected public evidence, uploaded the probe artifact, and updated the production incident before the final `Enforce production health gate` step failed. The paired transport workflow completed successfully as evidence collection on the same immutable source.

Treat this as a demonstrated serving/routing failure, not proof of which provider project owns the domain or of the DNS/certificate/backend value that should replace the current route. Issue #44 owns authoritative serving-project identity and provider-side correction; issue #652 is the auto-updated scheduled health incident.

Do not create a sentinel/no-op commit, weaken immutable revision/readiness checks, guess a project-specific DNS target, or rewrite unrelated product code to probe this failure.

## Current reviewable engineering surfaces

- #1066 — fail-honest exam-practice subject routing. Exact head `e6c02f02df292a081f9649a99ee0df7db865dfe6`; exact-head CI `35615592970` succeeded. Integrate this before reconstructing #1061 because both touch `ExamPracticeLab.tsx`.
- #1069 — held/unreviewed study-guide publication boundary. Exact head `7a8ac7f368e894c2b235a4792093e9ef6ec5517f`; exact-head CI `35625175172` succeeded.
- #1072 — direct onboarding routing for incomplete signed-in learners. Exact head `0d24b5345750f2ba5831d03cc6bc756e0ed73d4c`; exact-head CI `35635484070` succeeded.

These are ordinary independent-review surfaces. Repository-green is not deployment authorization.

## Intentionally Draft engineering / provenance surfaces

- #1067 — member-authorization reconstruction. Keep Draft for independent security review and historical-account/access reconciliation.
- #1070 — complete database-readiness contract. Keep Draft behind #913/#916 migration/provenance review; do not weaken readiness to make production green.
- #1071 — production-repair provenance. Keep Draft; repository provenance does not authorize migration replay or production mutation.
- #1073 — professor-study reproducibility infrastructure. Keep Draft for scientific-method review; engineering green does not authorize study execution or outcome access.
- #1061 — historical optional-baseline branch. Do not restack until #1066 integrates; then reconstruct once on resulting main and require fresh whole-head CI.

## Next engineering gates

1. Obtain genuine independent review on #1066, #1069 and #1072.
2. After #1066 integrates normally, reconstruct #1061 once on resulting main while preserving fail-honest subject routing, then require fresh exact-head whole-repository CI.
3. Complete independent security review of #1067 without weakening the member-authorization boundary.
4. Complete #913/#916 database/provenance review before considering #1070/#1071 for integration or production action.
5. Prove which provider project intentionally owns the `www.vertexed.app` production alias.
6. Obtain that project's exact custom-domain DNS/certificate/backend state and one attributable exact-SHA deployment receipt before changing infrastructure.
7. Correct only the demonstrated serving/routing defect, then rerun the unchanged production health, transport, smoke, browser and readiness contracts on one served revision.
8. Separately remediate authorized platform-security warnings and only then perform approved disposable-account authenticated journeys.

## Scientific boundary

Learner-study execution and interpretation remain outside engineering automation. Repository tooling may be repaired without changing frozen protocols or claims, but no study, worker, participant analysis, held-out evaluation or scientific outcome should be run from this lane.
