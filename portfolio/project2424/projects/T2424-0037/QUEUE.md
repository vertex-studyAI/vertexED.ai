# NeuroCAD — Executable Queue

Queue policy: execute the shortest path to externally usable evidence. Do not broaden CAD scope ahead of pilot evidence.

## P0 — Public Alpha gate

- [ ] Observe a live `https://www.vertexed.app/neurocad/` response that serves the current NeuroCAD artifact identity.
- [ ] Record the served repository revision and artifact revision.
- [ ] Pass the existing production flagship browser smoke without weakening its identity checks.
- [ ] Close/update GitHub issue #431 only after that evidence exists.

## P0 — External pilot gate

- [ ] Capture the first real external engineer run using `EXTERNAL_PILOT.md`.
- [ ] Save exact input, expected behavior, observed behavior, result, severity and artifact/screenshot evidence.
- [ ] Record the first externally discovered reproducible defect.
- [ ] Fix it on a branch with regression coverage.
- [ ] Have the external evaluator or equivalent independent user retest the same workflow.
- [ ] Complete 3 independent engineering-team tests.

## P1 — Product learning

- [ ] After the first 3 pilots, rank requested missing workflows by frequency and severity.
- [ ] Add only the smallest capability that closes the most important repeated workflow gap.
- [ ] Measure whether exported JSON/OpenSCAD is actually useful to evaluators.
- [ ] Record the first point where each evaluator returns to their normal CAD tool.

## P1 — Research successor

Historical result remains `VALIDATION_DOMINANT` and is not eligible for rescue-tuning.

Before any new confirmatory evaluation:

- [ ] recover/recreate the successor protocol from historical PR #430 on current main;
- [ ] materialize and hash the exact benchmark records;
- [ ] freeze the data split before evaluation;
- [ ] freeze model/provider identity and sampling/budget policy;
- [ ] implement matched baselines including direct generation + matched validation;
- [ ] implement at least two contemporary external benchmark adapters where licensing/access permits;
- [ ] freeze all implementation commits/configuration;
- [ ] create the predeclared execution authorization artifact;
- [ ] only then run the untouched confirmatory evaluation;
- [ ] preserve every adverse result and publish the result even if the typed-IR hypothesis fails again.

## P2 — CAD breadth, only after pilot demand

Candidates, not commitments:

- general feature operations;
- general sketch/dimension workflows;
- broader interoperability/export;
- richer assembly relations;
- stronger offline/self-contained rendering.

## Do not do

- do not count invitations as validation;
- do not weaken production identity checks to make CI green;
- do not claim external adoption without completed evidence;
- do not rewrite the `VALIDATION_DOMINANT` result;
- do not run a new research benchmark before its data/model/baseline identities are frozen;
- do not add random geometry classes before real pilot feedback identifies a need.
