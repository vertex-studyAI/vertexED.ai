# Protocol — T2424-0054 Theory-Manifold Experiment Planner

**PROJECT:** T2424-0054 — Theory-Manifold Experiment Planner  
**CLAIM:** Deterministic planning mechanics respect cost, dependencies, diversity and evidence-update rules.  
**PRIMARY METRIC:** exact ranked/selected candidate IDs and budget use on frozen fixtures.  
**BASELINE:** same-benefit cost comparison and hard dependency block.  
**SEEDS:** none; deterministic.  
**DATA:** fixed candidate objects in the regression suite and demo.  
**SUCCESS THRESHOLD:** all five frozen planning invariants pass.  
**FAILURE THRESHOLD:** blocked experiment selected, budget exceeded, non-deterministic ranking, diversity control ineffective on its fixture, or evidence update violates direction/uncertainty contraction.  
**NEGATIVE CONTROL:** candidate with maximal illustrative benefit but incomplete dependencies.  
**ABLATION:** repeat-family penalty disabled/enabled through test fixtures.  
**EXPECTED COST:** seconds; no external compute, API, or spending.

## Reproduce

```bash
node portfolio/project2424/projects/T2424-0054/experiment/run.mjs
node --test tests/theoryManifoldExperimentPlanner.test.mjs
```

## Interpretation

The sample candidate priors are illustrative inputs. The planner output is a deterministic consequence of those inputs and weights, not evidence that any research hypothesis is scientifically promising.
