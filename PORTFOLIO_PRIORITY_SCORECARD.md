# PORTFOLIO PRIORITY SCORECARD

**Date:** 2026-08-14  
**Rule:** scoring follows evidence, not project prestige. Scores are 0–5 and are decision aids, not scientific results.

## Scoring dimensions

`SI` scientific importance · `OR` originality · `EV` evidence strength · `RP` reproducibility · `BL` baseline strength · `RB` result robustness · `IM` implementation quality · `PA` paper potential · `PR` product potential · `XV` external-validation potential · `CF` compute feasibility · `TC` time-to-closure · `NV` negative-result value · `SV` strategic portfolio value.

The closure score is a normalized heuristic implementing the requested principle:

> **impact × evidence × probability of closure ÷ remaining cost**

where impact is driven by `SI`, `OR`, `SV` and the stronger of `PA/PR`; evidence is driven by `EV/RP/BL/RB`; closure probability is driven by `CF/TC`; remaining cost increases as compute feasibility falls. The maximum raw score in this recovered portfolio is normalized to 100. A high closure score can intentionally favor a strong negative result that is cheap to finish.

| Project | SI | OR | EV | RP | BL | RB | IM | PA | PR | XV | CF | TC | NV | SV | Closure score /100 | Tier / action |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|---|
| LAM-JEPA | 5 | 4 | 5 | 5 | 5 | 5 | 5 | 5 | 1 | 4 | 5 | 5 | 5 | 5 | **100.0** | **S — publish negative/repro package** |
| NGMT v0.1 | 4 | 3 | 5 | 5 | 5 | 4 | 4 | 4 | 1 | 3 | 5 | 5 | 5 | 4 | **75.0** | A — close as negative; no v0.1 rescue |
| VertexED | 4 | 2 | 4 | 4 | 4 | 4 | 5 | 1 | 5 | 5 | 5 | 5 | 1 | 5 | **67.4** | **S — production validation** |
| Eigen-JEPA | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 4 | 1 | 3 | 5 | 5 | 5 | 4 | **63.2** | A — negative/boundary package |
| Research Atlas V4 | 3 | 2 | 5 | 5 | 4 | 4 | 5 | 3 | 3 | 3 | 5 | 5 | 4 | 5 | **61.6** | A — productize reproducibility layer |
| Project 2424 consolidation | 4 | 3 | 4 | 4 | 4 | 4 | 4 | 3 | 4 | 4 | 5 | 4 | 4 | 5 | **60.6** | A — canonicalize/productize foundry |
| NeuroCAD | 4 | 4 | 4 | 4 | 3 | 3 | 5 | 4 | 4 | 4 | 5 | 4 | 2 | 5 | **56.4** | **S — decisive baseline/OOD attack** |
| IRIS | 5 | 4 | 3 | 3 | 4 | 3 | 4 | 4 | 1 | 4 | 5 | 4 | 5 | 5 | **55.4** | **S — close current negative; one frozen successor max** |
| T2424-1863 | 3 | 2 | 5 | 5 | 4 | 4 | 4 | 3 | 1 | 2 | 5 | 5 | 5 | 3 | **52.1** | B — negative result, no significant compute |
| APEN | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 2 | 3 | 5 | 4 | 4 | 4 | **49.7** | A — one learned/naturalistic gate |
| Percy | 5 | 4 | 3 | 3 | 3 | 3 | 4 | 3 | 5 | 5 | 5 | 3 | 3 | 5 | **48.0** | **S — reliability/productization; science stays gated** |
| Darcy T2424-0050 | 4 | 3 | 4 | 4 | 2 | 3 | 4 | 4 | 2 | 3 | 5 | 4 | 3 | 4 | **46.2** | A — learned-operator/OOD gate |
| NPMS | 4 | 3 | 4 | 4 | 3 | 3 | 4 | 4 | 2 | 3 | 5 | 3 | 3 | 4 | **44.2** | A — learned/OOD gate |
| T2424-0027 | 3 | 3 | 4 | 4 | 4 | 3 | 4 | 3 | 1 | 3 | 5 | 4 | 3 | 3 | **42.6** | A — real-encoder gate |
| The Bu1LD | 3 | 2 | 3 | 3 | 3 | 3 | 4 | 1 | 5 | 5 | 4 | 2 | 1 | 5 | **14.2** | A — externally blocked product validation |
| PEN | 3 | 2 | 2 | 1 | 2 | 2 | 2 | 2 | 1 | 2 | 5 | 2 | 2 | 2 | **11.6** | B — source recovery only; archive if not distinct |
| FinanceMeta | 3 | 2 | 2 | 2 | 2 | 2 | 3 | 1 | 5 | 5 | 4 | 2 | 1 | 4 | **8.8** | A — externally blocked security/validation |
| Text-to-Video | 2 | 2 | 1 | 1 | 1 | 1 | 2 | 1 | 2 | 2 | 4 | 2 | 1 | 1 | **2.2** | Archive/untriaged |
| Hercules | 4 | 3 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 2 | 1 | 2 | 2 | **0.9** | Archive this month |
| Olympus | 3 | 2 | 1 | 1 | 1 | 1 | 2 | 2 | 2 | 2 | 2 | 1 | 1 | 2 | **0.7** | Archive this month |

## Tier constraints

The numerical score does **not** mechanically assign Tier S. Tier S is capped at five and must balance publication closure, decisive science, production value and portfolio infrastructure. Therefore the active flagship set remains:

1. LAM-JEPA
2. NeuroCAD
3. Percy
4. VertexED
5. IRIS

NGMT and Eigen score highly because their negative results are evidence-rich and cheap to close; that makes them excellent closure tasks, not reasons to displace a flagship or launch new experiments.

## Promotion rule

A project moves up only when the next missing evidence gate closes. A project moves down immediately when a strong baseline, reproduction, external test or provenance audit fails. Naming, agent count, manuscript length and implementation volume do not affect promotion.
