# Project 2424 — Execution Queue

**Updated:** 10 August 2026

This queue starts from current evidence, not from the 2,424-project headline count.

## P2424-RECOVER-001

Project: Project 2424  
Priority: P0  
Expected artifact: verified canonical Git checkout with preserved dirty overlay and captured quality-gate evidence  
Dependencies: user's Mac, mounted PRO-BLADE, authenticated GCP/Inkling access  
Assigned worker: local Percy/Atlas or user-authorized shell  
State: BLOCKED  
Evidence: canonical source is recorded as `/Volumes/PRO-BLADE/Atlas/Project-2024/Project_2424`; the connected GitHub session cannot access that filesystem.

Resolution command already versioned in the portfolio repository:

```bash
bash portfolio/scripts/restore_project2424_to_inkling.sh --verify --keep-local-package
```

## P2424-FIRST100-001

Project: Project 2424 First 100  
Priority: P0  
Expected artifact: first project-specific package with source identity, runnable command, baseline, raw result, ablation/negative result, verdict and QA  
Dependencies: P2424-RECOVER-001 for source-backed entries; cheap falsification-screen entries may proceed independently if their exact research contract is recoverable  
Assigned worker: next available research/software lane  
State: TODO  
Evidence: `FIRST_100_EXECUTION_WAVE.md` and `FIRST_100_QUEUE.ndjson` define the 100-entry wave but do not certify project completion.

## VERTEXED-PROD-001

Project: VertexED  
Priority: P0  
Expected artifact: exact live production SHA proof from `/api/health` and canonical Vercel project identity  
Dependencies: production Vercel access; deployment authorization  
Assigned worker: release lane  
State: BLOCKED  
Evidence: issue #137 and issue #44 retain the production revision-identity gate. Repository status success is not accepted as live deployment proof.

## VERTEXED-AUTH-001

Project: VertexED  
Priority: P1  
Expected artifact: disposable-account authenticated production certification with cleanup evidence  
Dependencies: disposable admin/user accounts and production environment access  
Assigned worker: QA lane  
State: BLOCKED  
Evidence: issue #13 contains the remaining authenticated journey.

## LAMJEPA-NEXT-001

Project: LAM-JEPA  
Priority: P1  
Expected artifact: independently justified next experiment or publication package that preserves the current negative/inconclusive validation boundary  
Dependencies: no confirmatory ARC test access unless a protocol explicitly authorizes it  
Assigned worker: research lane  
State: TODO  
Evidence: PR #52 is merged and preserves `VALID_NEGATIVE_OR_INCONCLUSIVE_VALIDATION` rather than a positive performance claim.

## TTV-NEXT-001

Project: Text-To-Video  
Priority: P1  
Expected artifact: smallest production-oriented step beyond local encoding, preferably durable local job ownership/idempotency before external hosting  
Dependencies: none for a local design/implementation; production storage/hosting remains external  
Assigned worker: product lane  
State: TODO  
Evidence: PR #5 already proves validated external render-job encoding and provenance; current README explicitly stops short of durable production queue/storage/hosting.

## Queue policy

When a task becomes blocked, record the blocker and immediately move to the next executable task. Nothing is marked `DONE` without linked evidence.
