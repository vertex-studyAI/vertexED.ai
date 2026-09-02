# T2424-0038 Status

**Project:** Obscured Records Agent  
**Queue rank:** 31  
**Track:** C — Existing work → minimum experiment  
**State:** VERIFYING  
**Claim level:** deterministic evidence-gated editorial triage tool

## Implemented

- [x] structured lead/source validation
- [x] independent-publisher accounting
- [x] source-type diversity and primary-source coverage
- [x] transparent prioritization score
- [x] freshness decay
- [x] high-risk corroboration blockers
- [x] deterministic decision ledger
- [x] runnable synthetic example
- [x] focused regression suite
- [x] limitations and next evidence gate

## Current-main truth (2026-09-02)

The publisher-alias implementation and its focused regression test are already present on canonical `main`. The previously referenced repair branch `fix/obscured-publisher-alias-current-main-20260823` is still a distinct historical commit, but direct blob comparison shows the project core implementation and focused Obscured Records test on that branch are byte-identical to current `main`.

This closes only the stale **alias-merge/source-integration** blocker. It does **not** promote the project to `TESTED_TOOL`, authorize a historical evaluation, or establish newsroom/product effectiveness.

## Verification gate

Promote to `TESTED_TOOL` only after canonical GitHub Actions succeeds on the exact branch head with the required Obscured Records smoke/proof/full regression/integrity checks explicitly positive. A generic green build is not enough if those project-specific checks are absent or ambiguous.

## Historical-evaluation gate

A historical-lead evaluation remains independently blocked until the current candidate is frozen together with the evaluation corpus, blinded labels, baseline, metrics, thresholds, evaluator/environment identity, and raw-output destinations **before** outcome-bearing execution. Do not reuse a pre-change freeze or inspect outcomes first and backfill the freeze.

## Not claimed

- factual verification
- legal or defamation safety
- autonomous journalism
- superior editorial decisions
- newsroom productivity gains
- production deployment
- historical-evaluation success
- external validation

## Next artifact

First: exact-head canonical tool certification with explicit project-specific evidence.  
Then, separately: a newly frozen historical-lead evaluation set with blinded editor labels, baseline ranking comparison, error analysis, and independent review of publisher-independence assumptions.
