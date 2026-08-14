# PUBLIC_RELEASE_READINESS

**As of:** 2026-08-14 IST  
**Rule:** this is a readiness audit, not a claim that any release, deployment, publication, DOI, acceptance or independent reproduction occurred.

Legend: `PASS` directly evidenced; `TODO` internally executable; `EXTERNAL` requires outside/deployment evidence; `BLOCK` is release-critical; `N/A` not applicable.

| Gate | LAM-JEPA | IRIS negative package | NeuroCAD | Project 2424 registry | Percy | VertexED |
|---|---|---|---|---|---|---|
| Canonical source | PASS | PASS/retained package; canonical paper path TODO | PASS bounded project path | BLOCK until source reconciliation | EXTERNAL live host | PASS source repo |
| Clean release commit/tag candidate | TODO | TODO | TODO | TODO | EXTERNAL | TODO exact deployment revision |
| Understandable README | TODO final audit | TODO | TODO | TODO | TODO | TODO release audit |
| Installation/environment | TODO fresh checkout | TODO bundle env audit | TODO | child-specific | TODO clean-host install | deployment runbook TODO |
| Exact quickstart/reproduce command | PASS/TODO final wrapper | TODO canonical wrapper | v1 TODO final wrapper; V2 not run | child-specific | host qualification TODO | production-cert command TODO |
| Examples | N/A/paper examples | N/A/paper examples | TODO safe supported examples | N/A | TODO fixture examples | product UI exists; release examples TODO |
| License decision | **BLOCK** until owner/legal audit | **BLOCK** | **BLOCK** | **BLOCK** child-specific | **BLOCK** | **BLOCK** release audit |
| Citation metadata | TODO | TODO | TODO if research release | child-specific | TODO if technical report | N/A unless research artifact |
| Architecture/method overview | TODO final claim scrub | TODO | TODO typed-IR diagram | TODO registry model | TODO control-plane diagram | existing source docs; final release audit TODO |
| Explicit limitations/non-claims | TODO final | TODO manuscript | TODO supported CAD subset + failure modes | TODO child boundaries | TODO real-host/external boundary | TODO public limitations/privacy |
| Tested commands | PASS research | PASS development package | PASS v1 controlled; V2 pending | mixed by child | bounded tests; real host pending | source gates; production identity/auth journey pending |
| Reproducible quantitative experiments | PASS bounded negative | PASS bounded mixed/negative | PASS v1 controlled | selected children only | N/A science; reliability fixtures pending | N/A product |
| Model/data/protocol card where relevant | TODO | TODO protocol/data card | TODO benchmark/provider card | child-specific | N/A | TODO where model/data behavior exposed |
| Security review | N/A | N/A | **BLOCK** sandbox/path/execution review for public tool | secret/private artifact scan TODO | **BLOCK** real-host/runtime review | **BLOCK** exact production + account isolation |
| Secret scan | TODO | TODO | TODO | TODO | EXTERNAL host | TODO exact release tree |
| Private-data scan | TODO | TODO | TODO | TODO | EXTERNAL host | TODO |
| Claim/artifact provenance | TODO final graph | PASS bounded artifacts; manuscript graph TODO | v1 good; V2 TODO | mixed by child | provenance graph TODO | release/deploy provenance TODO |
| External validation | EXTERNAL | EXTERNAL | EXTERNAL | child-specific | EXTERNAL | EXTERNAL |
| Publication/deployment externally verified | **NO** | **NO** | **NO** | **NO** | **NO** | **NO claim from this audit** |

## LAM-JEPA

**Release class:** negative research repository + preprint/technical-report candidate.

Required before public release: remove unsupported positive framing; final claim-to-table/figure provenance; clean-checkout reproduction; license/authorship/citation audit; secret/private-data scan; explicit configuration-specific limitation. Independent reproduction/reviewer evidence is strongly preferred but must be labeled separately if absent. Locked ARC test remains closed for the current frozen hypothesis.

## IRIS

**Release class:** preserved mixed/negative experiment package now; paper only if the failure/tradeoff clears the information-value/originality bar.

Required: canonical negative-package path, prior-art/manuscript framing, license/secret scan, explicit successor closure, and confirmatory-seed non-access statement. A new architecture is not authorized by current evidence.

## NeuroCAD

**Software release and research publication are separate.**

Software blockers: clean install/quickstart, supported CAD subset, syntax/geometry/execution limitations, sandbox/path safety, failure examples, license and secret scan.

Research blockers: frozen same-provider direct/validator/typed-IR factorial; broader OOD/compositional/new-family/invalid benchmark; immutable V2 results; external reproduction. If V2 fails, preserve software usefulness while downgrading the research mechanism claim.

## Project 2424

**Release class:** evidence/registry index, not “2,424 research breakthroughs.”

Expose only canonical child IDs, exact statuses, commands, artifacts, verifiers and non-claims. Long-tail/archive entries may remain visible as preserved evidence but receive no aggregate validation or paper-readiness claim.

## Percy

**Release class:** systems tooling candidate after real-host qualification.

Blockers: canonical Mac state recovery; DB/WAL backup/restore; crash/restart, duplicate-claim and stale-lease fixtures; truthful provider failure; clean install/schema/failure-model docs; measured concurrency/resource report; secret scan; external operator reproduction. The 16,256 logical registry must never be marketed as physical workers or completed tasks.

## VertexED

**Release class:** product deployment.

Blockers: intended source SHA equals served production revision; successful disposable authenticated golden journey; account isolation/security tests; rollback/monitoring evidence; secret/privacy scan. Green Vercel commit statuses are not sufficient because the current production monitor has already shown an exact-revision evidence gap.

## Mandatory package contents

Every public research/system release must contain or link:

1. canonical commit/tag candidate;
2. README and exact environment/install instructions;
3. quickstart/reproduce command;
4. tests with expected output or verifier;
5. raw/processed provenance for quantitative claims;
6. limitations and explicit non-claims;
7. license and third-party data/asset licensing notes;
8. citation metadata when relevant;
9. secret/private-data scan result;
10. external-validation state explicitly labeled, e.g. `NONE`, `REVIEWED`, `INDEPENDENTLY_REPRODUCED`.

Completing this checklist locally does not itself create a publication, release, deployment or external-validation event.