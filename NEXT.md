# Next

## Current engineering release boundary

Snapshot date: **2026-09-22**.

Canonical repository source is `main@2ca208c8ffd10c83005f3afe65057bc847277d5f`, the verified merge of PR #1057. Do not infer deployment state from repository source alone.

The newest scheduled production evidence on that exact source is:

- Production Health Monitor `35770517386`: **FAILURE**;
- Production Transport Diagnostics `35770591345`: **SUCCESS** as evidence collection;
- retained transport artifact `10713628257`, digest `sha256:0742620938e322f804fd42def7d509d6a79910e4a95f7a8bf15f425c83f68ba1`.

The retained transport artifact at `2026-09-22T18:57:30.090Z` localizes the current custom-domain failure after DNS and TCP but before application HTTP semantics:

- DNS succeeds for `www.vertexed.app`;
- there is no CNAME chain and the name terminates at IPv4 `2.59.170.20` and `104.219.250.37`;
- TCP/443 succeeds;
- TLS fails with `ECONNRESET` before secure establishment;
- HTTPS fails at the same pre-handshake boundary;
- both observed IPv4 addresses reproduce TCP success followed by TLS/HTTPS reset.

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
