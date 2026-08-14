# PUBLIC_RELEASE_READINESS

**As of:** 2026-08-14 IST  
**Rule:** this file evaluates release candidates; it does not claim a release, deployment, publication, DOI, acceptance, external reproduction, or user validation occurred.

Legend: `PASS` = directly evidenced, `TODO` = internally executable, `EXTERNAL` = requires outside/deployment evidence, `N/A` = not applicable, `BLOCK` = release blocker.

| Gate | LAM-JEPA | IRIS negative package | NeuroCAD | Project 2424 evidence registry | Percy | VertexED |
|---|---|---|---|---|---|---|
| Canonical source | PASS | TODO — negative branch/bundle must be made canonical without overwriting failure lineage | PASS bounded child path | TODO — child canonicalization | TODO — real host canonical root unavailable here | PASS source repo |
| Clean repository/release commit | TODO | TODO | TODO | TODO | EXTERNAL host | TODO exact release commit |
| README understandable | TODO audit | TODO | TODO audit | TODO | TODO | PASS/TODO release audit |
| Installation / environment | TODO fresh-check | TODO bundle env | TODO | TODO | TODO | TODO deployment runbook |
| Quickstart / exact command | PASS/TODO final paper command | PASS bundle reproduce; TODO canonical wrapper | PASS/TODO V2 | TODO child index | TODO host qualification command | TODO production-cert command |
| Examples | N/A/paper artifacts | N/A/paper artifacts | TODO curated safe examples | N/A | TODO fixture tasks | PASS product UI / TODO release examples |
| License decision | BLOCK until audited | BLOCK until audited | BLOCK until audited | BLOCK until audited | BLOCK until audited | BLOCK until audited |
| Citation information | TODO | TODO | TODO if research release | N/A/child-specific | TODO if technical report | N/A unless research artifact |
| Architecture/method overview | PASS/TODO claim scrub | TODO negative-mechanism diagram | TODO typed-IR diagram | TODO registry model | TODO control-plane diagram | PASS/TODO current architecture overview |
| Limitations / non-claims | PASS/TODO final manuscript | PASS in evidence; TODO manuscript | TODO explicit controlled-boundary page | TODO child-level boundaries | TODO real-host/external boundary | TODO public release limitations |
| Tested commands | PASS research | PASS bundle | PASS v1; V2 not run | mixed by child | bounded tests only; live host TODO | source gates present; production journey EXTERNAL |
| Reproducible experiments | PASS bounded negative | PASS immutable negative bundle | PASS v1 controlled | selected children only | N/A for research; reliability fixtures TODO | N/A product |
| Model/data card | TODO if model/data distributed | N/A or TODO dataset/protocol card | TODO benchmark/model/provider card if released | child-specific | N/A | TODO where AI/model/data behavior is exposed |
| Security review | N/A | N/A | TODO sandbox/execution/path safety | TODO secret/private artifact scan | BLOCK until host/runtime review | BLOCK until exact production/security journey |
| Secret scan | TODO | TODO | TODO | TODO | EXTERNAL host | TODO exact release tree |
| Private data scan | TODO | TODO | TODO | TODO | EXTERNAL host | TODO |
| Artifact hashes/provenance | PASS/TODO final map | PASS bundle | PASS v1; V2 TODO | mixed by child | TODO standardized live artifacts | TODO release/deploy provenance |
| External validation | EXTERNAL | EXTERNAL | EXTERNAL | N/A/child-specific | EXTERNAL | EXTERNAL |
| Publication/deployment verified | NO | NO | NO | NO | NO | **NO claim from this file** |

## Candidate decisions

### LAM-JEPA

**Release class:** negative research repository + preprint/technical report candidate.  
**Blockers before public release:** remove stale unsupported positive claims; final evidence provenance; license/authorship/citation check; secret/private-data scan; fresh-checkout reproduction. External reproduction is strongly preferred but must be labeled separately if absent.

### IRIS

**Release class:** immutable negative experiment bundle now; manuscript only if information-value/originality gate passes.  
**Blockers:** canonicalize branch/bundle while retaining invalid-attempt lineage; prior-art/manuscript decision; license/secret scan. Confirmatory seeds stay untouched.

### NeuroCAD

**Release class:** bounded software/demo may become releasable independently of research paper.  
**Blockers for software:** install/quickstart, sandbox/path/security review, explicit supported CAD subset, failure cases, license.  
**Blockers for research:** V2 same-provider learned/OOD gate and external reproduction.

### Project 2424

**Release class:** evidence index/registry, not “2424 research breakthroughs.”  
**Blockers:** expose only promoted child projects with canonical IDs/status/non-claims; archive long tail without deleting evidence; no aggregate performance/validation claim.

### Percy

**Release class:** systems tooling candidate after real-host qualification.  
**Blockers:** live SQLite/WAL crash-recovery/duplicate/stale-lease/provider/resource tests; clean install; schema docs; failure model; secret scan; external operator reproduction. Do not market logical registry count as workers or scale.

### VertexED

**Release class:** product deployment.  
**Blockers:** exact served revision identity, disposable authenticated golden journey, account-isolation/security checks, rollback/monitoring evidence, privacy/secret scan. A Vercel status context alone cannot satisfy production certification.

## Release packaging law

Every public research/system release must contain or link:

1. canonical commit/tag candidate;
2. README and exact environment/install command;
3. exact quickstart/reproduce command;
4. tests with expected output or verification method;
5. raw/processed artifact provenance where claims are quantitative;
6. limitations and explicit non-claims;
7. license decision and third-party asset/data licensing notes;
8. citation metadata when relevant;
9. secret/private-data scan result;
10. external-validation state separately labeled `NONE`, `REVIEWED`, `INDEPENDENTLY_REPRODUCED`, or another precisely evidenced category.

Do not mint a release, tag, paper status, or deployment label merely because this checklist is complete locally; verify the external action itself.