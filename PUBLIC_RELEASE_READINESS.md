# PUBLIC_RELEASE_READINESS

**As of:** 2026-08-14 IST  
**Rule:** readiness is not release. This file does not claim publication, deployment, DOI, acceptance, external reproduction or user validation.

Legend: `PASS` directly evidenced; `TODO` internally executable; `EXTERNAL` outside/deployment evidence; `BLOCK` release-critical.

| Gate | LAM-JEPA | IRIS negative package | NeuroCAD | Project 2424 registry | Percy | VertexED |
|---|---|---|---|---|---|---|
| Canonical source | PASS | PASS preserved package | PASS bounded source | BLOCK source reconciliation | EXTERNAL live host | PASS source |
| Clean release revision | TODO | TODO | TODO | TODO | EXTERNAL | TODO exact deployment revision |
| README / installation / quickstart | TODO final audit | TODO | TODO | child-specific | TODO clean-host | TODO production-cert runbook |
| License decision | **BLOCK** | **BLOCK** | **BLOCK** | **BLOCK** child-specific | **BLOCK** | **BLOCK** release audit |
| Citation metadata where relevant | TODO | TODO | TODO | child-specific | TODO if report | N/A unless research artifact |
| Architecture/method overview | TODO final claim scrub | TODO | TODO | TODO registry model | TODO control-plane diagram | TODO final release audit |
| Explicit limitations/non-claims | TODO final | TODO | TODO supported subset + mechanism falsification | TODO child boundaries | TODO real-host boundary | TODO public/privacy limitations |
| Tested commands | PASS research | PASS development package | PASS v1/v2 component evidence | mixed | bounded tests; host pending | source gates; production pending |
| Reproducible quantitative experiment | PASS bounded negative | PASS mixed/negative | PASS v1 + v2 component diagnostic | selected children | N/A science; reliability fixtures pending | N/A product |
| Model/data/protocol card | TODO as relevant | TODO | TODO benchmark/provider card | child-specific | N/A | TODO as relevant |
| Security review | N/A | N/A | **BLOCK** sandbox/path/execution for public tool | secret/private scan TODO | **BLOCK** host/runtime review | **BLOCK** exact production/account isolation |
| Secret/private-data scan | TODO | TODO | TODO | TODO | EXTERNAL host | TODO exact release tree |
| Claim/artifact provenance | TODO final graph | TODO paper graph | strong bounded artifacts; future fresh benchmark TODO | mixed | provenance graph TODO | deploy provenance TODO |
| External validation | EXTERNAL | EXTERNAL | EXTERNAL | child-specific | EXTERNAL | EXTERNAL |
| Publication/deployment verified by this audit | **NO** | **NO** | **NO** | **NO** | **NO** | **NO** |

## LAM-JEPA

**Release class:** negative research repository + preprint/technical-report candidate.

Before public release: remove unsupported positive framing; finish claim→figure/table→processed→raw→config→commit provenance; clean-checkout reproduction; license/authorship/citation audit; secret/private scan; explicit configuration-specific limitation. Locked ARC test remains untouched for the frozen hypothesis.

## IRIS

**Release class:** preserved mixed/negative package; paper only if the robustness–adaptation failure/tradeoff clears the information-value/originality bar.

Before release: canonical package path; related-work/manuscript framing; license/secret scan; explicit successor-closure record; confirmatory-seed non-access statement. No new architecture is currently authorized.

## NeuroCAD

**Software utility and scientific mechanism are separate.** Frozen v1 remains `19/20` vs original direct `12/20` with executable valid STL, but frozen component v2 shows direct+matched validation reaches `1.00`, exactly matching the current compiler, recovery fraction `1.00`, interpretation **`VALIDATION_DOMINANT`**. This falsifies the typed-IR/parser-specific causal advantage on the reused diagnostic; it does not erase the software.

Software-release blockers: clean install/quickstart; explicit supported CAD subset; safe failure examples; sandbox/path/process review; license/secret scan.

Research-release blockers: a genuinely **fresh** broader benchmark with new part families/OOD/compositional tasks and a competent contemporary direct/program-generation baseline. Do not reuse the old 20 cases as a new generalization gate or rescue the parser mechanism on them.

## Project 2424

**Release class:** evidence/registry index, not “2,424 breakthroughs.” Expose canonical child IDs, statuses, commands, artifacts, verifiers and non-claims. Preserved archive entries may remain visible but cannot inherit aggregate paper/external-validation status.

## Percy

**Release class:** systems tooling candidate only after real-host qualification.

Blockers: canonical Mac state recovery; DB/WAL backup/restore; crash/restart, duplicate-claim and stale-lease fixtures; truthful provider failure; clean install/schema/failure-model docs; measured concurrency/resource report; secret scan; external operator reproduction. The 16,256 logical registry cannot be described as physical workers or completed tasks.

## VertexED

**Release class:** product deployment.

Blockers: intended source SHA equals served production revision; disposable authenticated golden journey; account-isolation/security checks; rollback/monitoring evidence; secret/privacy scan. Green commit/Vercel statuses alone are not production certification because the production monitor has already exposed a revision-identity gap.

## Mandatory package contents

Every public research/system release must contain or link:

1. canonical commit/tag candidate;
2. README + exact environment/install instructions;
3. quickstart/reproduce command;
4. tests with expected output/verifier;
5. raw/processed provenance for quantitative claims;
6. limitations/non-claims;
7. license + third-party data/asset licensing notes;
8. citation metadata where relevant;
9. secret/private-data scan result;
10. external-validation state labeled precisely, e.g. `NONE`, `REVIEWED`, `INDEPENDENTLY_REPRODUCED`.

Completing these locally does not itself create a publication, release, deployment or external-validation event.