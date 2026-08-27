# NeuroCAD — Executable Queue

Queue policy: execute the shortest path to externally usable evidence. Do not broaden CAD scope ahead of pilot evidence, and do not run confirmatory research before the frozen authorization gate is satisfied.

## P0 — Public Alpha gate

- [ ] Serve the current NeuroCAD artifact from an accepted executable public host (`https://www.vertexed.app/neurocad/` or another explicitly accepted executable canonical route).
- [ ] Do not use jsDelivr HTML as the browser host; merged PR #520 established it as artifact/provenance transport only.
- [ ] Observe and record the served repository revision and artifact revision.
- [ ] Pass the existing production flagship browser smoke without weakening identity checks.
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

Already completed:

- [x] recover the successor protocol onto current `main`;
- [x] freeze the 150-case benchmark shape, hypotheses, falsifiers, metrics, baseline families, ablations and statistics contract;
- [x] freeze external adapter identities for CADTestBench and MUSE without falsely claiming materialization;
- [x] keep confirmatory execution authorization fail-closed.

Before any new confirmatory evaluation:

- [ ] materialize the selected external benchmark assets through an allowed network path;
- [ ] resolve full immutable revisions and compute content/record hashes for at least two required adapters;
- [ ] materialize and hash the exact 150-case benchmark records;
- [ ] freeze the data split before evaluation;
- [ ] freeze model/provider identity and sampling/budget policy;
- [ ] implement and freeze M0 plus matched B0-B3 baselines, including direct generation + matched validation;
- [ ] validate adapter and baseline code on development-only records without opening the confirmatory evaluation split;
- [ ] freeze all implementation commits/configuration;
- [ ] generate `EXECUTION_AUTHORIZATION.json` only when every required hash/identity precondition is satisfied;
- [ ] only then run the untouched confirmatory evaluation;
- [ ] retain every raw output, adverse result and failure;
- [ ] compute the predeclared paired statistics and mechanism ablations without threshold changes;
- [ ] publish the successor result even if the typed-IR hypothesis fails again.

## P2 — CAD breadth, only after pilot demand

Candidates, not commitments:

- general feature operations;
- general sketch/dimension workflows;
- broader interoperability/export;
- richer assembly relations;
- stronger offline/self-contained rendering.

## Do not do

- do not count invitations, interest or methodological advice as validation;
- do not weaken production identity checks to make CI green;
- do not claim external adoption without completed evidence;
- do not rewrite the `VALIDATION_DOMINANT` result;
- do not rerun/tune the old 20-case diagnostic to rescue a typed-IR story;
- do not run the S3 confirmatory benchmark before data/model/baseline identities are frozen and authorization is generated;
- do not add random geometry classes before real pilot feedback identifies a need.
