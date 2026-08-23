# Outreach — Current State

**As of:** 2026-08-23 17:02 IST

## Executive truth

Outreach is active, but portfolio readiness is uneven. The immediate job is conversion and evidence, not another undifferentiated volume blast.

| Lane | State | Current truth | Green exit gate |
|---|---|---|---|
| NeuroCAD product core | VERIFIED | 125-case QA and flagship browser certification succeed on current release workflow | Maintain clean product/browser certification |
| NeuroCAD production route | FAILED | production-smoke did not observe the expected artifact at `https://www.vertexed.app/neurocad/` | Exact production artifact/revision observed and browser smoke passes |
| NeuroCAD outbound | VERIFIED | targeted engineering outreach sent to 12 identified firms on 2026-08-23 | Replies converted into evidence-backed external tests |
| NeuroCAD design partners | UNKNOWN | no external completed pilot/test is verified yet | 3 completed evidence-backed design-partner tests, 2 repeat tests, 1 bounded org pilot |
| NeuroCAD dedicated repo | BLOCKED | canonical implementation remains embedded in `vertex-studyAI/vertexED.ai`; connected GitHub surface has no repository-create action | Dedicated repo exists, migration provenance preserved, CI passes there |
| VertexED user/school GTM | LIKELY | school/user outreach is strategically required; current production health has had failures | Verified user journey plus measured student/teacher/school pilots |
| FinanceMeta partnerships | VERIFIED | active institutional/data outreach exists, including RV University, Tiingo, Alpha Vantage | Concrete commitments/calls/material support recorded |
| The Bu1LD | LIKELY | professor/lab/compute/sponsor lanes are appropriate | Warm conversations converted into technical/program outcomes |
| Research outreach | VERIFIED strategy | recipients should be reviewers/replicators/collaborators, not customers | Paper-specific external reviews/replications recorded |
| ObscuredRecords sponsors | BLOCKED | current analytics not re-verified in this execution | Current analytics verified before sponsor claims/outreach |
| Cove / Shopify | LIKELY | buyer acquisition is a separate funnel | Genuine traffic → cart → checkout → order evidence |
| Percy/Olympus/Ultron selling | BLOCKED | validation/build gates precede selling | Relevant reliability/scientific validation gates green |

## NeuroCAD exact CI truth

Workflow run `32629667112` at main commit `7a69adc78126df3dcbead3a6175bb3f3c7539aaf`:

- `browser-certification`: **SUCCESS**
  - dependency install: success
  - 125-case product QA: success
  - deploy-shaped build: success
  - local artifact/repository provenance check: success
  - flagship Playwright browser certification: success
- `production-smoke`: **FAILURE**
  - failure occurs before browser smoke
  - expected artifact `sha256:aa1aa53d82c6d8aa1bbef4eddde4d205ec80f77d08ccae42d7e29984a93605cb` was not observed at `/neurocad/` after 10 checks

This is a deployment/provenance failure, not evidence that the local/current-main NeuroCAD browser workflow is broken.

## Priority allocation until conversion data changes it

- NeuroCAD design partners: 25%
- VertexED users/schools: 20%
- FinanceMeta institutional partnerships: 15%
- Research reviewers/collaborators: 10%
- The Bu1LD labs/compute/sponsors: 10%
- Cove buyer acquisition: 10%
- Obscured sponsor readiness/outreach: 5%
- Founder/investor/program opportunities: 5%

Re-rank from verified outcomes, not send counts.
