# MASTER_STATUS

**As of:** 2026-08-15 08:54 IST — final convergence controller  
**Truth rule:** only `VERIFIED`, `PARTIAL`, `BLOCKED`, `UNKNOWN`, `FAILED`, `INCONCLUSIVE`, `STALE`, `ARCHIVED` are state labels. Source, execution, scientific support, deployment and external validation remain separate evidence classes.

| System | State | Direct evidence / boundary |
|---|---|---|
| Percy | **UNKNOWN** | This execution runtime has no `/Volumes` mount, so `/Volumes/PRO-BLADE/Atlas/Percy` live SQLite/WAL/SHM/checkpoint/process/worktree state is not directly observable. Preserve host; snapshot/hash/integrity/schema/recount before any upgrade. |
| Project 2424 | **PARTIAL** | Historical Wave-001 is checksum-recovered: bundle SHA-256 `4c685af70d84052c026602ff7336a522c741d91fb480038e980c21f0bbc63ece`, `wave-001-push-ready@ff609f335f91297357b430a2531633fe111cd5a9`, 2,424 registry rows, 24 source-backed packages, 0 independent reproductions, retained `RELEASE_REJECTED`. Later dirty overlay and P2424↔T2424 migration provenance remain inaccessible without the preserved SSD/byte-identical archive; never map by numeric suffix alone. |
| VertexED source | **VERIFIED** | `main@d52308aed22ccc3dcefa7d4e3dd90aa731bc5f5a` makes production health fail closed when immutable revision identity is missing and retains exact body/header revision reporting when present. CI `31861346546` succeeded. |
| VertexED production | **BLOCKED** | Latest direct main-production evidence remains monitor `31860931665`, artifact `9240538693`, SHA-256 `205b0d17ba3c1899addd558f2c0615ab32148af43a5f8fb6a55a510f4eb66394`: three bounded attempts saw live `/api/health` omit revision while public/security smoke passed. No post-`d52308a` served-revision proof or authenticated disposable-account certification exists. |
| FinanceMeta source | **BLOCKED** | Preserved hardening branch `cursor/membership-security-supabase-fix@6dcc03710bb6adf9b4b722b308c40a0720bea61f` is 41 commits ahead / 0 behind `main@fbdd503223edc5b1780509720391083f485a4a85`. Workflow blob `5df3a10c74ede1445f9008e99852278488ceeb91` duplicates exactly `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_URL` in the E2E env mapping. Minimal duplicate removal parses locally, but connector writes return 403; no corrected exact-head CI is claimed. |
| FinanceMeta production | **BLOCKED** | Preview/source evidence does not prove live production migrations, RLS, exact served revision, isolation or authenticated journeys. |
| The Bu1LD source | **VERIFIED** | `ryangomez010/bu1ld-landing@daa80c1124b2a6d7d09b7669e04d29e50cffcbbe`; exact-head CI evidence retained. Existing Cloudflare workflow requires only the observed GitHub Actions names `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`; values remain owner-held. |
| The Bu1LD production | **BLOCKED** | Public-route availability is partial evidence only. Exact Cloudflare deployment identity/served revision, production DB/Auth identity and seven-role journey with cross-role denials remain unverified. |
| IRIS v0.2 | **BLOCKED** | Mixed/negative result remains preserved. Frozen metric spec blob `6f4d6a47e3727596b21714bc269cd8ba5844d2fa`; recovered source archive SHA-256 `5d689ade164d80216d0ab6d4376b8acf53b8e0ba13d4bd5e909a94f00ec86b56`; common-harness archive SHA-256 `5643b59e9272099e54f04491aa63906d0d186a1a2c525a574f960008e5f19b90`; executable `run.py` SHA-256 `b9e35eb2ed1fc945e99ce76f935f36a816eb3d61b99b109bd092e99a731a6de3` implements the frozen TWMSE25/recovery/POST_MSE50PLUS definitions. Executable metric provenance is therefore recovered; exact canonical development-trajectory identity or pre-existing authoritative deterministic-equivalence evidence remains missing. Seeds `1000–1029` forbidden; no frontier run. |
| LAM-JEPA | **PARTIAL** | Frozen negative result and immutable reproduction/review packet are VERIFIED internally. Public metadata boundary is now explicit in PR `vertex-studyAI/LAM-JEPA#88`: license/redistribution, author order and `CITATION.cff` remain owner-controlled; external validation state remains none returned. |
| Darcy T2424-0050 v2 | **BLOCKED** | Pre-outcome freeze remains intact with `training_authorized=false`; split manifest SHA-256 `4211d11da7d40f0991bd963c04fb118f34d9fe923e7664da301122b29b0bef85`; B2 unit-verified. B3 FNO, B4 DeepONet, exact learned environment/hardware and covariance/OOD-D interpretation approvals remain unresolved. No training or outcome metrics authorized. |
| NeuroCAD typed-parser mechanism | **FAILED** | Falsified on retained component diagnostic; preserve `VALIDATION_DOMINANT`; no rescue on old cases. |
| NGMT v0.1 | **FAILED** | Frozen negative result; no in-place rescue. |
| Eigen-JEPA primary | **INCONCLUSIVE** | Frozen mixed/negative primary evidence; no metric shopping or in-place rescue. |
| NPMS current result | **INCONCLUSIVE** | Controlled result remains parameter-confounded/non-unique; preserve current result and require a new frozen successor protocol for any continuation. |
| Hercules / Olympus active compute | **ARCHIVED** | No significant compute until a decisive matched protocol is frozen. |

## Scheduling guard

**Zero new major scientific outcome runs are authorized.** Recovery, exact-target certification, owner decisions and external review outrank new compute.
