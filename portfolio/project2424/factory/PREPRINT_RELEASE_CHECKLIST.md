# Project 2424 Preprint Release Checklist

A manuscript may be called **preprint-ready** only when every required item below is evidenced. Checkboxes are evidence gates, not aspirations.

## Scientific identity
- [ ] Canonical `T2424-XXXX` identity is resolved and locked.
- [ ] Duplicate/lineage review is complete.
- [ ] One research question is explicit.
- [ ] One falsifiable hypothesis and falsifier are explicit.
- [ ] Closest prior work has been checked against current literature.

## Protocol
- [ ] Dataset/environment and provenance are fixed.
- [ ] Train/validation/test or equivalent evaluation separation is fixed.
- [ ] Dangerous/credible baseline(s) are included.
- [ ] Primary metric is defined before confirmatory analysis.
- [ ] Seeds/determinism/statistical procedure are defined.
- [ ] Success and falsification thresholds are defined.
- [ ] Compute budget and stop rule are defined.
- [ ] Confirmatory data or seeds have not been used to rescue a failed development result.

## Implementation and evidence
- [ ] One clean reproduction command works.
- [ ] Tests pass from a clean environment.
- [ ] Exact commit/config/environment identities are retained.
- [ ] Raw artifacts are preserved and checksum-addressed.
- [ ] Main result, ablations, failure analysis, and robustness are recorded.
- [ ] Negative/mixed/inconclusive outcomes are preserved.
- [ ] Independent reproduction of the headline result succeeds.

## Manuscript
- [ ] Abstract matches the frozen result.
- [ ] Introduction states a narrow contribution.
- [ ] Related work contains verified references.
- [ ] Methods mirror the implementation/protocol.
- [ ] Experimental setup reports all relevant controls.
- [ ] Results match frozen artifacts exactly.
- [ ] Discussion does not convert correlation into causality.
- [ ] Limitations include scope and external-validity boundaries.
- [ ] Claim ledger has no unsupported allowed claims.
- [ ] Tables/figures can be regenerated from preserved evidence.

## Release
- [ ] Authorship and contributor roles are resolved.
- [ ] Code/data/model licenses are compatible and stated.
- [ ] Data availability statement is accurate.
- [ ] Ethics/safety statement is included when relevant.
- [ ] Repository README contains exact reproduction instructions.
- [ ] PDF compiles cleanly.
- [ ] Final independent paper review is complete.
- [ ] `EVIDENCE.json.preprint_gate == true` only after all checks above pass.
