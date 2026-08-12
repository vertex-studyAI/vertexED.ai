# Public claims audit — Bu1LD + FinanceMeta

Status vocabulary: `VERIFIED`, `PARTIALLY_VERIFIED`, `REPOSITORY_INFERRED`, `SELF_REPORTED`, `UNVERIFIED`, `REMOVE`.

## FinanceMeta

| Claim | Current public wording | Evidence inspected | Status | Safe public disposition |
|---|---|---|---|---|
| Brand | `Finance 4All` / `Finance4All Meta` | Current code uses legacy names while canonical product work is referred to as FinanceMeta | REPOSITORY_INFERRED | Use `FinanceMeta`; mention legacy name only in a dated history page if useful. |
| Product scope | finance learning + research + opportunities + member portal | Portal routes/components include Finance Debriefed, explainers, Meta Labs, Axiom Pathways, auth/member workflows, saved items/events | VERIFIED | `A platform for finance learning, research workflows, opportunities, and project collaboration.` |
| 25,000+ students impacted | `25,000+ Students Impacted` | No dated metric definition or primary evidence found in inspected source | UNVERIFIED | Remove until evidence ledger defines source, period, deduplication, and meaning of `impacted`. |
| 15+ countries | `15+ Countries` / `Countries Reached` | No primary evidence found in inspected source | UNVERIFIED | Remove until country-level participation/outreach evidence is enumerated. |
| 50+ global members | `50+ Global Members` | No membership-window definition or primary evidence found in inspected source | UNVERIFIED | Remove until active/member definition and source are documented. |
| Worldwide underserved-school outreach | `underserved schools worldwide` / `multiple countries` | Program copy only; no program ledger inspected that supports geography/scope | UNVERIFIED | Replace with a non-geographic platform pathway or publish a dated outreach record first. |
| Economics journal global reach | `Student-run publication with global reach` | No publication inventory or reach evidence inspected | UNVERIFIED | Do not feature as a current public program until artifacts and status are documented. |
| University-mentored research | mentors affiliated with Stanford, MIT, UChicago, etc. | No named mentor/project evidence inspected | REMOVE | Remove institution names. Publish only named, consented mentors tied to concrete projects. |
| Jane Street-backed clubs | curriculum supported by professionals connected to Jane Street | No concrete curriculum review/evidence inspected | REMOVE | Remove brand reference unless there is documented, publishable collaboration evidence. |
| Partner/collaborator list | Jane Street, Colgate, KFC, universities/researchers, etc. | Names appear in source without linked outcomes/contracts/events | REMOVE | No logo/name wall. Add collaborators only with a concrete public activity/outcome. |
| Finance Meta Labs exists as a product surface | Research/labs directory | Dedicated portal routes/components exist | VERIFIED | `Research project directory and application workflows in the member portal.` Do not claim external mentorship quality without evidence. |
| Axiom Pathways exists as a product surface | Opportunity board | Dedicated portal routes/components exist | VERIFIED | `Opportunity and pathway board in the member portal.` |
| Finance Debriefed exists as a product surface | Macro/news/explainers module | Dedicated portal component/routes exist | VERIFIED | `Finance/current-events learning and explainer surface.` Avoid implying daily freshness without operational evidence. |

## The Bu1LD

| Claim | Current public wording | Evidence inspected | Status | Safe public disposition |
|---|---|---|---|---|
| Six labs | `Six labs — published research divisions` | `src/data/landing.ts` enumerates six research directions; no evidence that all six are published research divisions | PARTIALLY_VERIFIED | `Six labs — research divisions in the platform` |
| Programs exist | AI Builder Cohort, Research Fellowship, Startup Incubation | Public program data exists in source | REPOSITORY_INFERRED | Keep program descriptions/statuses only as defined in source. Do not add cohort dates, capacity, mentors, or outcomes without records. |
| Project/evidence system exists | projects, applications, evidence, contribution records | Product registry documents routes, migrations, tests, release scripts and evidence workflow | VERIFIED | Describe the implemented workflow, not live adoption or production usage unless separately verified. |
| Bu1LD release gate passed locally | typecheck/tests/lint/build | `research/VERIFIED_RESULTS_INDEX.yaml` allows claim: local release gate passed with 151 Bun tests | VERIFIED | Keep as repository/release evidence with date and explicitly say local; do not convert to live production verification. |
| Project Genesis research evidence | smoke/continual/ablation artifacts | Registry and verified-results index enumerate E3/E4 artifacts | VERIFIED_WITH_BOUNDARY | Feature as a local/synthetic research artifact; do not claim benchmark superiority or research completion. |
| GenesisE evidence | synthetic portfolio/benchmark + local unit tests | Registry/index document E4 synthetic artifacts and explicit real-market limitation | VERIFIED_WITH_BOUNDARY | Feature as synthetic economic simulation evidence only. |

## Promotion rule

No numeric reach, membership, partner, publication, mentor, country, school, or outcome claim should move above `UNVERIFIED` without a primary evidence source, date, definition, and safe public wording. Repository existence can verify that a product surface or artifact exists; it does not verify real-world adoption or external endorsement.
